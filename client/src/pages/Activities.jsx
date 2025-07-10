import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchActivities();
  }, [pagination.page]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/users/activities`, {
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      setActivities(response.data.activities);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Erro ao carregar atividades');
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    const icons = {
      CREATE_REPOSITORY: '📁',
      UPDATE_REPOSITORY: '✏️',
      DELETE_REPOSITORY: '🗑️',
      ADD_COLLABORATOR: '👥',
      REMOVE_COLLABORATOR: '👤',
      UPDATE_PROFILE: '👤'
    };
    return icons[action] || '📝';
  };

  const getActivityColor = (action) => {
    const colors = {
      CREATE_REPOSITORY: '#10b981',
      UPDATE_REPOSITORY: '#3b82f6',
      DELETE_REPOSITORY: '#ef4444',
      ADD_COLLABORATOR: '#8b5cf6',
      REMOVE_COLLABORATOR: '#f59e0b',
      UPDATE_PROFILE: '#06b6d4'
    };
    return colors[action] || '#6b7280';
  };

  const formatActionName = (action) => {
    const names = {
      CREATE_REPOSITORY: 'Repositório Criado',
      UPDATE_REPOSITORY: 'Repositório Atualizado',
      DELETE_REPOSITORY: 'Repositório Excluído',
      ADD_COLLABORATOR: 'Colaborador Adicionado',
      REMOVE_COLLABORATOR: 'Colaborador Removido',
      UPDATE_PROFILE: 'Perfil Atualizado'
    };
    return names[action] || action.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && activities.length === 0) {
    return <div className="loading">Carregando atividades...</div>;
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="dashboard-header">
        <h1>Histórico de Atividades</h1>
        <p>Acompanhe todas as suas ações na plataforma</p>
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

      <div className="stat-card">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} />
            Atividades Recentes
          </h3>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Total: {pagination.total} atividades
          </div>
        </div>

        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((activity) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: getActivityColor(activity.action),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0
                  }}
                >
                  {getActivityIcon(activity.action)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#1e293b',
                    marginBottom: '0.25rem'
                  }}>
                    {formatActionName(activity.action)}
                  </div>
                  
                  {activity.details && (
                    <div style={{ 
                      color: '#64748b',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem'
                    }}>
                      {activity.details}
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: '#9ca3af',
                    fontSize: '0.75rem'
                  }}>
                    <Calendar size={12} />
                    {new Date(activity.timestamp).toLocaleString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#6b7280' 
          }}>
            <Activity size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>Nenhuma atividade encontrada</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="btn btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                opacity: pagination.page === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              Página {pagination.page} de {pagination.pages}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
              className="btn btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                opacity: pagination.page === pagination.pages ? 0.5 : 1
              }}
            >
              Próxima
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;

