const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { generateToken, encryptToken } = require('../utils/auth');
const GitHubService = require('../services/github');
const EmailService = require('../services/email');

const router = express.Router();
const prisma = new PrismaClient();
const emailService = new EmailService();

// OAuth2 GitHub - Redirect to GitHub
router.get('/github', (req, res) => {
  const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,user,admin:repo_hook`;
  res.redirect(githubAuthURL);
});

// OAuth2 GitHub - Callback
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }, {
      headers: { 'Accept': 'application/json' }
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Get user info from GitHub
    const github = new GitHubService(access_token);
    const githubUser = await github.getUser();

    // Encrypt the access token before storing
    const encryptedToken = await encryptToken(access_token);

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { githubId: githubUser.id.toString() },
      update: {
        username: githubUser.login,
        email: githubUser.email,
        accessToken: encryptedToken
      },
      create: {
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email,
        accessToken: encryptedToken
      }
    });

    // Send welcome email for new users
    if (user && githubUser.email) {
      await emailService.sendWelcomeEmail(user);
    }

    // Generate JWT token
    const jwtToken = generateToken({ userId: user.id, username: user.username });

    // Redirect to frontend with token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendURL}/auth/callback?token=${jwtToken}`);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Login with personal access token
router.post('/token', async (req, res) => {
  const { username, token } = req.body;

  if (!username || !token) {
    return res.status(400).json({ error: 'Username and token are required' });
  }

  try {
    // Validate token with GitHub API
    const github = new GitHubService(token);
    const githubUser = await github.getUser();

    if (githubUser.login !== username) {
      return res.status(400).json({ error: 'Username does not match token owner' });
    }

    // Encrypt the access token before storing
    const encryptedToken = await encryptToken(token);

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { username },
      update: {
        githubId: githubUser.id.toString(),
        email: githubUser.email,
        accessToken: encryptedToken
      },
      create: {
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        email: githubUser.email,
        accessToken: encryptedToken
      }
    });

    // Send welcome email for new users
    if (user && githubUser.email) {
      await emailService.sendWelcomeEmail(user);
    }

    // Generate JWT token
    const jwtToken = generateToken({ userId: user.id, username: user.username });

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Token authentication error:', error);
    res.status(401).json({ error: 'Invalid token or username' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { verifyToken } = require('../utils/auth');
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, githubId: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;

