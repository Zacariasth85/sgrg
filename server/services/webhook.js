const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class WebhookService {
  constructor() {
    this.secret = process.env.GITHUB_WEBHOOK_SECRET;
  }

  verifySignature(payload, signature) {
    if (!this.secret) {
      console.warn('GitHub webhook secret not configured');
      return true; // Allow webhook if secret is not configured
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payload, 'utf8')
      .digest('hex');

    const actualSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(actualSignature, 'hex')
    );
  }

  async handleWebhook(event, payload) {
    try {
      switch (event) {
        case 'repository':
          await this.handleRepositoryEvent(payload);
          break;
        case 'push':
          await this.handlePushEvent(payload);
          break;
        case 'star':
          await this.handleStarEvent(payload);
          break;
        case 'fork':
          await this.handleForkEvent(payload);
          break;
        case 'member':
          await this.handleMemberEvent(payload);
          break;
        default:
          console.log(`Unhandled webhook event: ${event}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async handleRepositoryEvent(payload) {
    const { action, repository, sender } = payload;
    
    // Find user by GitHub ID
    const user = await prisma.user.findFirst({
      where: { githubId: sender.id.toString() }
    });

    if (!user) return;

    switch (action) {
      case 'created':
        await this.syncRepository(repository, user.id);
        await this.logActivity(user.id, 'CREATE_REPOSITORY', `Created repository: ${repository.name}`);
        break;
      case 'deleted':
        await this.removeRepository(repository.id.toString());
        await this.logActivity(user.id, 'DELETE_REPOSITORY', `Deleted repository: ${repository.name}`);
        break;
      case 'edited':
        await this.syncRepository(repository, user.id);
        await this.logActivity(user.id, 'UPDATE_REPOSITORY', `Updated repository: ${repository.name}`);
        break;
    }
  }

  async handlePushEvent(payload) {
    const { repository, pusher } = payload;
    
    const user = await prisma.user.findFirst({
      where: { username: pusher.name }
    });

    if (!user) return;

    await this.syncRepository(repository, user.id);
    await this.logActivity(user.id, 'PUSH_REPOSITORY', `Pushed to repository: ${repository.name}`);
  }

  async handleStarEvent(payload) {
    const { action, repository, sender } = payload;
    
    const user = await prisma.user.findFirst({
      where: { githubId: sender.id.toString() }
    });

    if (!user) return;

    await this.syncRepository(repository, user.id);
    
    const actionText = action === 'created' ? 'Starred' : 'Unstarred';
    await this.logActivity(user.id, 'STAR_REPOSITORY', `${actionText} repository: ${repository.name}`);
  }

  async handleForkEvent(payload) {
    const { forkee, repository } = payload;
    
    const user = await prisma.user.findFirst({
      where: { githubId: forkee.owner.id.toString() }
    });

    if (!user) return;

    await this.syncRepository(forkee, user.id);
    await this.logActivity(user.id, 'FORK_REPOSITORY', `Forked repository: ${repository.name}`);
  }

  async handleMemberEvent(payload) {
    const { action, repository, member, sender } = payload;
    
    const user = await prisma.user.findFirst({
      where: { githubId: sender.id.toString() }
    });

    if (!user) return;

    const actionText = action === 'added' ? 'Added' : 'Removed';
    await this.logActivity(
      user.id, 
      action === 'added' ? 'ADD_COLLABORATOR' : 'REMOVE_COLLABORATOR',
      `${actionText} collaborator ${member.login} to repository: ${repository.name}`
    );
  }

  async syncRepository(repository, userId) {
    try {
      await prisma.repository.upsert({
        where: { githubId: repository.id.toString() },
        update: {
          name: repository.name,
          description: repository.description,
          language: repository.language,
          forks: repository.forks_count,
          stars: repository.stargazers_count
        },
        create: {
          githubId: repository.id.toString(),
          name: repository.name,
          description: repository.description,
          language: repository.language,
          forks: repository.forks_count,
          stars: repository.stargazers_count,
          ownerId: userId
        }
      });
    } catch (error) {
      console.error('Error syncing repository:', error);
    }
  }

  async removeRepository(githubId) {
    try {
      await prisma.repository.deleteMany({
        where: { githubId }
      });
    } catch (error) {
      console.error('Error removing repository:', error);
    }
  }

  async logActivity(userId, action, details) {
    try {
      await prisma.activity.create({
        data: {
          userId,
          action,
          details
        }
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}

module.exports = WebhookService;

