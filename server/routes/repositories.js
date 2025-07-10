const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middlewares/auth');
const { decryptToken } = require('../utils/auth');
const GitHubService = require('../services/github');
const bcrypt = require('bcryptjs');

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

// Get all repositories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type = 'all', sort = 'updated', search = '' } = req.query;
    
    // Get user's GitHub token (decrypt if needed)
    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    // Get repositories from GitHub
    const repos = await github.getRepositories(type, sort);
    
    // Filter by search term if provided
    const filteredRepos = search 
      ? repos.filter(repo => 
          repo.name.toLowerCase().includes(search.toLowerCase()) ||
          (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()))
        )
      : repos;

    // Sync with local database
    for (const repo of filteredRepos) {
      await prisma.repository.upsert({
        where: { githubId: repo.id.toString() },
        update: {
          name: repo.name,
          description: repo.description,
          language: repo.language,
          forks: repo.forks_count,
          stars: repo.stargazers_count
        },
        create: {
          githubId: repo.id.toString(),
          name: repo.name,
          description: repo.description,
          language: repo.language,
          forks: repo.forks_count,
          stars: repo.stargazers_count,
          ownerId: req.user.id
        }
      });
    }

    res.json(filteredRepos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get repository details
router.get('/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    const repository = await github.getRepository(owner, repo);
    
    res.json(repository);
  } catch (error) {
    console.error('Error fetching repository details:', error);
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});

// Create repository
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, private: isPrivate = false } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Repository name is required' });
    }

    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    const newRepo = await github.createRepository({
      name,
      description,
      private: isPrivate
    });

    // Save to local database
    await prisma.repository.create({
      data: {
        githubId: newRepo.id.toString(),
        name: newRepo.name,
        description: newRepo.description,
        language: newRepo.language,
        forks: newRepo.forks_count,
        stars: newRepo.stargazers_count,
        ownerId: req.user.id
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_REPOSITORY',
        details: `Created repository: ${name}`
      }
    });

    res.status(201).json(newRepo);
  } catch (error) {
    console.error('Error creating repository:', error);
    res.status(500).json({ error: 'Failed to create repository' });
  }
});

// Update repository
router.patch('/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const updateData = req.body;
    
    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    const updatedRepo = await github.updateRepository(owner, repo, updateData);

    // Update local database
    await prisma.repository.updateMany({
      where: { 
        githubId: updatedRepo.id.toString(),
        ownerId: req.user.id
      },
      data: {
        name: updatedRepo.name,
        description: updatedRepo.description,
        language: updatedRepo.language,
        forks: updatedRepo.forks_count,
        stars: updatedRepo.stargazers_count
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_REPOSITORY',
        details: `Updated repository: ${repo}`
      }
    });

    res.json(updatedRepo);
  } catch (error) {
    console.error('Error updating repository:', error);
    res.status(500).json({ error: 'Failed to update repository' });
  }
});

// Delete repository
router.delete('/:owner/:repo', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    await github.deleteRepository(owner, repo);

    // Remove from local database
    await prisma.repository.deleteMany({
      where: { 
        name: repo,
        ownerId: req.user.id
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_REPOSITORY',
        details: `Deleted repository: ${repo}`
      }
    });

    res.json({ message: 'Repository deleted successfully' });
  } catch (error) {
    console.error('Error deleting repository:', error);
    res.status(500).json({ error: 'Failed to delete repository' });
  }
});

// Get repository collaborators
router.get('/:owner/:repo/collaborators', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    const collaborators = await github.getCollaborators(owner, repo);
    
    res.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// Add collaborator
router.post('/:owner/:repo/collaborators', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { username, permission = 'push' } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    await github.addCollaborator(owner, repo, username, permission);

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'ADD_COLLABORATOR',
        details: `Added collaborator ${username} to repository: ${repo}`
      }
    });

    res.json({ message: 'Collaborator added successfully' });
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// Remove collaborator
router.delete('/:owner/:repo/collaborators/:username', authenticateToken, async (req, res) => {
  try {
    const { owner, repo, username } = req.params;
    
    const accessToken = await getDecryptedToken(req.user);
    const github = new GitHubService(accessToken);
    
    await github.removeCollaborator(owner, repo, username);

    // Log activity
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        action: 'REMOVE_COLLABORATOR',
        details: `Removed collaborator ${username} from repository: ${repo}`
      }
    });

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

module.exports = router;

