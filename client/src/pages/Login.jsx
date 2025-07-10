import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Github, Key } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Login = () => {
  const { loginWithToken } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    token: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTokenLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.username || !formData.token) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    const result = await loginWithToken(formData.username, formData.token);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGitHubLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/github`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.png" alt="SGRG Logo" />
          <h1>SGRG</h1>
          <p>Sistema de Gerenciamento de Repositórios no GitHub</p>
        </div>

        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '0.75rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGitHubLogin}
          className="btn btn-github"
          style={{ width: '100%', marginBottom: '1.5rem' }}
        >
          <Github size={20} />
          Entrar com GitHub OAuth
        </button>

        <div className="divider">
          <span>ou</span>
        </div>

        <form onSubmit={handleTokenLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Nome de usuário do GitHub</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="seu-usuario-github"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">Token de Acesso Pessoal</label>
            <input
              type="password"
              id="token"
              name="token"
              value={formData.token}
              onChange={handleChange}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              disabled={loading}
            />
            <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Gere seu token em: 
              <a 
                href="https://github.com/settings/tokens" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#3b82f6', marginLeft: '0.25rem' }}
              >
                github.com/settings/tokens
              </a>
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={loading}
          >
            <Key size={20} />
            {loading ? 'Entrando...' : 'Entrar com Token'}
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f1f5f9', 
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#475569'
        }}>
          <p><strong>Permissões necessárias para o token:</strong></p>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
            <li>repo (acesso completo aos repositórios)</li>
            <li>user (informações do usuário)</li>
            <li>admin:repo_hook (webhooks)</li>
          </ul>
        </div>

        <div style={{ 
          marginTop: '1rem', 
          textAlign: 'center', 
          fontSize: '0.75rem', 
          color: '#6b7280' 
        }}>
          Desenvolvido por Zacarias Thequimo
        </div>
      </div>
    </div>
  );
};

export default Login;

