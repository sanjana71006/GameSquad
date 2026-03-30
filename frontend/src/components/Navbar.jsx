import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Gamepad2, User as UserIcon, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('theme') === 'light') {
      setIsLight(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isLight) {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      setIsLight(false);
    } else {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      setIsLight(true);
    }
  };

  if (!user) return null;

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 30px',
      margin: '20px auto',
      width: '95%',
      maxWidth: '1200px',
      background: 'var(--bg-panel)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRadius: '20px',
      border: '1px solid var(--border-light)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: '20px',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Gamepad2 color="var(--accent-blue)" size={32} />
        <h1 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>PuzzlePlay Arena</h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.3s' }}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '20px', borderLeft: '1px solid var(--border-light)', paddingLeft: '20px' }}>
          <UserIcon size={20} />
          <span>{user.name}</span>
        </div>
        
        <button onClick={toggleTheme} className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', border: 'none', background: 'transparent' }}>
          {isLight ? <Sun size={20} color="#eab308" /> : <Moon size={20} color="#60a5fa" />}
        </button>

        <button onClick={logout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
