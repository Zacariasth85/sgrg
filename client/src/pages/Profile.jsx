import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Github, Calendar, Save } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/profile`);
      setProfile(response.data);
      setFormData({
        email: response.data.email || ''
      });
    } catch (error) {
      setError('Erro ao carregar perfil');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.patch(`${API_BASE_URL}/api/users/profile`, formData);
      setSuccess('Perfil atualizado com sucesso!');
      fetchProfile();
    } catch (error) {
      setError('Erro ao atualizar perfil');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="loading">Carregando perfil...</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="dashboard-header">
        <h1>Perfil</h1>
        <p>Gerencie suas informações pessoais</p>
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

      {success && (
        <div style={{ 
          background: '#d1fae5', 
          color: '#065f46', 
          padding: '0.75rem', 
          borderRadius: '0.5rem', 
          marginBottom: '1rem' 
        }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Info */}
        <div className="stat-card">
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} />
            Informações do GitHub
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.25rem' 
              }}>
                Nome de usuário
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.75rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}>
                <Github size={16} style={{ color: '#6b7280' }} />
                {profile?.username}
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                marginBottom: '0.25rem' 
              }}>
                ID do GitHub
              </label>
              <div style={{ 
                padding: '0.75rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                color: '#6b7280'
              }}>
                {profile?.githubId}
              </div>
            </div>
          </div>
        </div>

        {/* Editable Profile */}
        <div className="stat-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Informações Editáveis</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">
                <Mail size={16} style={{ marginRight: '0.5rem' }} />
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%' }}
            >
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>

      {/* Repository Stats */}
      <div className="stat-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Estatísticas dos Repositórios</h3>
        
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {profile?.repositories?.length || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Total de Repositórios
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {profile?.repositories?.reduce((sum, repo) => sum + repo.stars, 0) || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Total de Stars
            </div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {profile?.repositories?.reduce((sum, repo) => sum + repo.forks, 0) || 0}
            </div>
            <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Total de Forks
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="stat-card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} />
          Atividades Recentes
        </h3>
        
        {profile?.activities?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {profile.activities.map((activity, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  background: '#f8fafc',
                  borderRadius: '0.5rem',
                  borderLeft: '3px solid #3b82f6'
                }}
              >
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                  {activity.action.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {activity.details}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(activity.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem', 
            color: '#6b7280' 
          }}>
            Nenhuma atividade recente
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

