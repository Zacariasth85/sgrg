import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FolderGit2, Star, GitFork, Code } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/dashboard`);
      setStats(response.data);
    } catch (error) {
      setError('Erro ao carregar estatísticas');
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageChartData = () => {
    if (!stats?.languages) return [];
    
    return Object.entries(stats.languages)
      .map(([language, count]) => ({
        name: language,
        value: count
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 languages
  };

  const getRecentReposData = () => {
    if (!stats?.repos) return [];
    
    return stats.repos
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 10)
      .map(repo => ({
        name: repo.name.length > 15 ? repo.name.substring(0, 15) + '...' : repo.name,
        stars: repo.stargazers_count,
        forks: repo.forks_count
      }));
  };

  const COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  if (loading) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ 
        background: '#fee2e2', 
        color: '#dc2626', 
        padding: '1rem', 
        borderRadius: '0.5rem' 
      }}>
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral dos seus repositórios no GitHub</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>Total de Repositórios</h3>
              <div className="value">{stats?.totalRepos || 0}</div>
            </div>
            <FolderGit2 size={32} style={{ color: '#3b82f6' }} />
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>Total de Estrelas</h3>
              <div className="value">{stats?.totalStars || 0}</div>
            </div>
            <Star size={32} style={{ color: '#f59e0b' }} />
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>Linguagens Usadas</h3>
              <div className="value">{Object.keys(stats?.languages || {}).length}</div>
            </div>
            <Code size={32} style={{ color: '#10b981' }} />
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>Repositórios Públicos</h3>
              <div className="value">
                {stats?.repos?.filter(repo => !repo.private).length || 0}
              </div>
            </div>
            <GitFork size={32} style={{ color: '#8b5cf6' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Languages Chart */}
        <div className="chart-container">
          <h3>Linguagens Mais Usadas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getLanguageChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {getLanguageChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Repositories Chart */}
        <div className="chart-container">
          <h3>Repositórios Recentes (Stars & Forks)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getRecentReposData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stars" fill="#f59e0b" name="Stars" />
              <Bar dataKey="forks" fill="#3b82f6" name="Forks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Repositories List */}
      <div className="chart-container">
        <h3>Repositórios Atualizados Recentemente</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Descrição</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Linguagem</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Stars</th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Forks</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {stats?.repos
                ?.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .slice(0, 10)
                .map((repo) => (
                  <tr key={repo.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#3b82f6', 
                          textDecoration: 'none',
                          fontWeight: '500'
                        }}
                      >
                        {repo.name}
                      </a>
                    </td>
                    <td style={{ 
                      padding: '0.75rem', 
                      color: '#6b7280',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {repo.description || '-'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {repo.language && (
                        <span className="language-badge">
                          {repo.language}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {repo.stargazers_count}
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      {repo.forks_count}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(repo.updated_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

