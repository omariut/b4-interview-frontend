import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvApi } from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await cvApi.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius-md)' }}>
          {error}
        </div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Claims Extracted', value: stats.total_claims, icon: '✨', onClick: () => navigate('/cvs') },
    { title: 'Avg. Interview Score', value: stats.avg_score, icon: '🎯' },
    { title: 'Answered Questions', value: stats.total_answered, icon: '✅', onClick: () => navigate('/questions?filter=answered') },
    { title: 'Unanswered Questions', value: stats.total_unanswered, icon: '⏳', onClick: () => navigate('/questions?filter=unanswered') }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome Back</h1>
        <p>Here is an overview of your interview preparations.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div 
            className={`stat-card ${stat.onClick ? 'clickable' : ''}`} 
            key={index} 
            onClick={stat.onClick}
            style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
          >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
        <button className="btn-primary" onClick={() => navigate('/upload-cv')}>
          + Upload New CV
        </button>
        <button className="btn-secondary" onClick={() => navigate('/cvs')}>
          View All CVs
        </button>
      </div>

      <div className="recent-activity">
        <h2>Recent Interviews</h2>
        <div className="activity-list">
          {stats.recent_activities.length > 0 ? (
            stats.recent_activities.map(activity => (
              <div 
                className="activity-item clickable-activity" 
                key={activity.id}
                onClick={() => navigate(`/cvs/${activity.id}`)}
              >
                <div className="activity-info">
                  <h4>{activity.cvName}</h4>
                  <p>Uploaded {new Date(activity.date).toLocaleDateString()}</p>
                </div>
                <div className="activity-score">Score: {activity.score}</div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No recent activity yet. Upload a CV to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
