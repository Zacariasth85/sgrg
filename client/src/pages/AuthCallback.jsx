import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // In a real implementation, you might want to decode the JWT to get user info
      // For now, we'll just store the token and let the AuthContext handle user fetching
      login(token, null);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="loading">
      Processando autenticação...
    </div>
  );
};

export default AuthCallback;

