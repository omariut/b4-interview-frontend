import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock data for initial design
  const stats = [
    { title: 'Total CVs', value: '4', icon: '📄' },
    { title: 'Total Claims Extracted', value: '32', icon: '✨' },
    { title: 'Avg. Interview Score', value: '85%', icon: '🎯' },
  ];

  const recentActivities = [
    { id: 1, cvName: 'Frontend_Developer_Resume.pdf', date: '2 hours ago', score: '88%' },
    { id: 2, cvName: 'Software_Engineer_2023.pdf', date: '1 day ago', score: '82%' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome Back, Omar</h1>
        <p>Here is an overview of your interview preparations.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div 
            className="stat-card clickable" 
            key={index} 
            onClick={() => navigate('/cvs')}
            style={{ cursor: 'pointer' }}
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
          {recentActivities.length > 0 ? (
            recentActivities.map(activity => (
              <div 
                className="activity-item clickable-activity" 
                key={activity.id}
                onClick={() => navigate(`/cvs/${activity.id}`)}
              >
                <div className="activity-info">
                  <h4>{activity.cvName}</h4>
                  <p>Analyzed {activity.date}</p>
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
