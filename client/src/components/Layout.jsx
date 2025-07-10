import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  FolderGit2, 
  User, 
  Activity, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Repositórios', href: '/repositories', icon: FolderGit2 },
    { name: 'Perfil', href: '/profile', icon: User },
    { name: 'Atividades', href: '/activities', icon: Activity },
  ];

  const isActive = (href) => {
    return location.pathname === href;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="layout">
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-gray-800 text-white rounded-md"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo">
          <img src="/logo.png" alt="SGRG Logo" />
          <div>
            <h1>SGRG</h1>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              Sistema de Gerenciamento de Repositórios no GitHub
            </p>
          </div>
        </div>

        <nav>
          <ul className="nav-menu">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="nav-item">
                  <Link
                    to={item.href}
                    className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #334155' }}>
          <div style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
            <p>Logado como:</p>
            <p style={{ fontWeight: '500', color: 'white' }}>{user?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="nav-link"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

