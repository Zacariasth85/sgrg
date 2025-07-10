import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Plus, 
  Star, 
  GitFork, 
  Eye, 
  Lock, 
  Unlock,
  Edit,
  Trash2,
  Users,
  ExternalLink
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRepo, setNewRepo] = useState({
    name: '',
    description: '',
    private: false
  });

  useEffect(() => {
    fetchRepositories();
  }, [sortBy, typeFilter, searchTerm]);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/repositories`, {
        params: {
          type: typeFilter,
          sort: sortBy,
          search: searchTerm
        }
      });
      setRepositories(response.data);
    } catch (error) {
      setError('Erro ao carregar repositórios');
      console.error('Error fetching repositories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepository = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/repositories`, newRepo);
      setShowCreateModal(false);
      setNewRepo({ name: '', description: '', private: false });
      fetchRepositories();
    } catch (error) {
      setError('Erro ao criar repositório');
      console.error('Error creating repository:', error);
    }
  };

  const handleDeleteRepository = async (owner, repo) => {
    if (window.confirm(`Tem certeza que deseja excluir o repositório ${repo}?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/repositories/${owner}/${repo}`);
        fetchRepositories();
      } catch (error) {
        setError('Erro ao excluir repositório');
        console.error('Error deleting repository:', error);
      }
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      JavaScript: '#f1e05a',
      TypeScript: '#2b7489',
      Python: '#3572A5',
      Java: '#b07219',
      'C++': '#f34b7d',
      C: '#555555',
      'C#': '#239120',
      PHP: '#4F5D95',
      Ruby: '#701516',
      Go: '#00ADD8',
      Rust: '#dea584',
      Swift: '#ffac45',
      Kotlin: '#F18E33',
      Dart: '#00B4AB',
      HTML: '#e34c26',
      CSS: '#1572B6',
      Shell: '#89e051'
    };
    return colors[language] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Carregando repositórios...</div>;
  }

  return (
    <div className="repositories">
      <div className="repositories-header">
        <div>
          <h1>Repositórios</h1>
          <p>Gerencie seus repositórios do GitHub</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Novo Repositório
        </button>
      </div>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626', 
          padding: '0.75rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem' 
        }}>
          {error}
        </div>
      )}

      <div className="search-filters">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#6b7280' 
            }} 
          />
          <input
            type="text"
            placeholder="Buscar repositórios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todos</option>
          <option value="public">Públicos</option>
          <option value="private">Privados</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="updated">Atualizado</option>
          <option value="created">Criado</option>
          <option value="pushed">Push</option>
          <option value="full_name">Nome</option>
        </select>
      </div>

      <div className="repositories-grid">
        {repositories.map((repo) => (
          <div key={repo.id} className="repo-card">
            <div className="repo-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 className="repo-name">{repo.name}</h3>
                  {repo.private ? (
                    <Lock size={16} style={{ color: '#6b7280' }} />
                  ) : (
                    <Unlock size={16} style={{ color: '#6b7280' }} />
                  )}
                </div>
                {repo.description && (
                  <p className="repo-description">{repo.description}</p>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    padding: '0.5rem', 
                    color: '#6b7280', 
                    textDecoration: 'none',
                    borderRadius: '0.25rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => handleDeleteRepository(repo.owner.login, repo.name)}
                  style={{ 
                    padding: '0.5rem', 
                    background: 'none', 
                    border: 'none', 
                    color: '#dc2626', 
                    cursor: 'pointer',
                    borderRadius: '0.25rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fee2e2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="repo-stats">
              {repo.language && (
                <div className="repo-stat">
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: getLanguageColor(repo.language)
                    }}
                  />
                  {repo.language}
                </div>
              )}
              
              <div className="repo-stat">
                <Star size={16} />
                {repo.stargazers_count}
              </div>
              
              <div className="repo-stat">
                <GitFork size={16} />
                {repo.forks_count}
              </div>
              
              {repo.watchers_count > 0 && (
                <div className="repo-stat">
                  <Eye size={16} />
                  {repo.watchers_count}
                </div>
              )}
            </div>

            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '1rem' 
            }}>
              Atualizado em {new Date(repo.updated_at).toLocaleDateString('pt-BR')}
            </div>
          </div>
        ))}
      </div>

      {repositories.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280' 
        }}>
          <FolderGit2 size={48} style={{ margin: '0 auto 1rem' }} />
          <p>Nenhum repositório encontrado</p>
        </div>
      )}

      {/* Create Repository Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            width: '100%',
            maxWidth: '500px',
            margin: '1rem'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Criar Novo Repositório</h2>
            
            <form onSubmit={handleCreateRepository}>
              <div className="form-group">
                <label htmlFor="repoName">Nome do Repositório</label>
                <input
                  type="text"
                  id="repoName"
                  value={newRepo.name}
                  onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="repoDescription">Descrição (opcional)</label>
                <textarea
                  id="repoDescription"
                  value={newRepo.description}
                  onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                  rows={3}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '0.5rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newRepo.private}
                    onChange={(e) => setNewRepo({ ...newRepo, private: e.target.checked })}
                  />
                  Repositório privado
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Repositório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Repositories;

