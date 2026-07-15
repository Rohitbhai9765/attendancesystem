import { useState } from 'react';
import AttendanceTable from './AttendanceTable';
import StatisticsPanel from './StatisticsPanel';
import ViewerPanel from './ViewerPanel';
import LoginModal from './LoginModal';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('viewer'); // 'viewer', 'stats', 'mark'
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = (token) => {
    setIsAdmin(true);
    setShowLogin(false);
    setActiveTab('mark');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setActiveTab('viewer');
  };

  if (showLogin) {
    return (
      <div className="app-container">
        <header className="header">
          <h1>Attendance System</h1>
          <p>Prestressed Concrete Structures</p>
        </header>
        <LoginModal onLogin={handleLogin} />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setShowLogin(false)}>Back to Viewer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header" style={{ position: 'relative' }}>
        <div className="admin-btn-container">
          {isAdmin ? (
            <button className="btn btn-outline" onClick={handleLogout}>Log Out</button>
          ) : (
            <button className="btn btn-outline" onClick={() => setShowLogin(true)}>Admin Login</button>
          )}
        </div>
        <h1>Attendance System</h1>
        <p>Prestressed Concrete Structures</p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
          Professor: Dr. Ashish Akhare
        </p>
      </header>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'viewer' ? 'active' : ''}`}
          onClick={() => setActiveTab('viewer')}
        >
          Daily Records
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        {isAdmin && (
          <button 
            className={`tab-btn ${activeTab === 'mark' ? 'active' : ''}`}
            onClick={() => setActiveTab('mark')}
          >
            Mark Attendance (Admin)
          </button>
        )}
      </div>

      <main>
        {activeTab === 'viewer' && <ViewerPanel />}
        {activeTab === 'stats' && <StatisticsPanel />}
        {activeTab === 'mark' && isAdmin && <AttendanceTable />}
      </main>
    </div>
  );
}
