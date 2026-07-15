import { useState } from 'react';

export default function LoginModal({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <input 
            type="password" 
            placeholder="Enter Admin Password" 
            className="date-picker" 
            style={{ width: '100%' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
}
