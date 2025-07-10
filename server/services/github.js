const axios = require('axios');

class GitHubService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.github.com';
    this.headers = {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SGRG-Platform'
    };
  }

  async getUser() {
    try {
      const response = await axios.get(`${this.baseURL}/user`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  async getRepositories(type = 'all', sort = 'updated', per_page = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/user/repos`, {
        headers: this.headers,
        params: { type, sort, per_page }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get repositories: ${error.message}`);
    }
  }

  async getRepository(owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get repository: ${error.message}`);
    }
  }

  async createRepository(data) {
    try {
      const response = await axios.post(`${this.baseURL}/user/repos`, data, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create repository: ${error.message}`);
    }
  }

  async updateRepository(owner, repo, data) {
    try {
      const response = await axios.patch(`${this.baseURL}/repos/${owner}/${repo}`, data, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update repository: ${error.message}`);
    }
  }

  async deleteRepository(owner, repo) {
    try {
      await axios.delete(`${this.baseURL}/repos/${owner}/${repo}`, {
        headers: this.headers
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to delete repository: ${error.message}`);
    }
  }

  async getCollaborators(owner, repo) {
    try {
      const response = await axios.get(`${this.baseURL}/repos/${owner}/${repo}/collaborators`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get collaborators: ${error.message}`);
    }
  }

  async addCollaborator(owner, repo, username, permission = 'push') {
    try {
      await axios.put(`${this.baseURL}/repos/${owner}/${repo}/collaborators/${username}`, 
        { permission }, 
        { headers: this.headers }
      );
      return true;
    } catch (error) {
      throw new Error(`Failed to add collaborator: ${error.message}`);
    }
  }

  async removeCollaborator(owner, repo, username) {
    try {
      await axios.delete(`${this.baseURL}/repos/${owner}/${repo}/collaborators/${username}`, {
        headers: this.headers
      });
      return true;
    } catch (error) {
      throw new Error(`Failed to remove collaborator: ${error.message}`);
    }
  }

  async getUserStats() {
    try {
      const repos = await this.getRepositories();
      const totalRepos = repos.length;
      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const languages = {};
      
      repos.forEach(repo => {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      });

      return {
        totalRepos,
        totalStars,
        languages,
        repos
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }
}

module.exports = GitHubService;

