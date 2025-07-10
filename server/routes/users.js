const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/auth');
const { decryptToken } = require('../utils/auth');
const GitHubService = require('../services/github');

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to decrypt access token
const getDecryptedToken = async (user) => {
  try {
    return decryptToken(user.accessToken);
  } catch (error) {
    console.error('Failed to decrypt token for user:', user.id);
    throw new Error('Invalid access token');
  }
};

// Get user dashboard stats
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    const stats = await github.getUserStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get user activities
router.get('/activities', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const activities = await prisma.activity.findMany({
      where: { userId: req.user.id },
      orderBy: { timestamp: 'desc' },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.activity.count({
      where: { userId: req.user.id }
    });

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        githubId: true,
        repositories: {
          select: {
            id: true,
            name: true,
            description: true,
            language: true,
            forks: true,
            stars: true
          }
        },
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 5,
          select: {
            action: true,
            details: true,
            timestamp: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { email },
      select: {
        id: true,
        username: true,
        email: true,
        githubId: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_PROFILE',
        details: 'Updated profile information'
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

module.exports = router;

