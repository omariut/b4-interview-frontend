import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvApi } from '../../services/api';
import CVThumbnail from '../../components/CVThumbnail';
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
    { title: 'Unanswered Questions', value: stats.total_unanswered, icon: '⏳', onClick: () => navigate('/questions?filter=unanswered') },
    { title: 'Answered Questions', value: stats.total_answered, icon: '✅', onClick: () => navigate('/questions?filter=answered') },
    { title: 'Total Claims Extracted', value: stats.total_claims, icon: '✨', onClick: () => navigate('/cvs') },
    { title: 'Avg. Interview Score', value: stats.avg_score, icon: '🎯' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome Back</h1>
        <p>Here is an overview of your interview preparations.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '16px' }}>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/upload-cv')}
          style={{ padding: '16px 40px', fontSize: '1.25rem', boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4)', borderRadius: '30px' }}
        >
          ✨ Upload New CV
        </button>
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



      <div className="recent-activity">
        <h2>Your CVs</h2>
        <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {stats.cv_stats && stats.cv_stats.length > 0 ? (
            stats.cv_stats.map(cv => (
              <div 
                className="activity-item clickable-activity" 
                key={cv.id}
                onClick={() => navigate(`/cvs/${cv.id}`)}
                style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CVThumbnail cvId={cv.id} />
                </div>
                <div className="activity-info" style={{ flex: 1, minWidth: '200px' }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{cv.cvName}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Uploaded {new Date(cv.date).toLocaleDateString()}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', flex: 2, justifyContent: 'flex-start' }}>
                  <div style={{ background: 'var(--background)', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', flex: 1, minWidth: '100px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Claims</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>{cv.total_claims}</div>
                  </div>
                  <div style={{ background: 'var(--background)', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', flex: 1, minWidth: '100px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Answered</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--success)' }}>{cv.answered}</div>
                  </div>
                  <div style={{ background: 'var(--background)', padding: '12px 16px', borderRadius: '8px', textAlign: 'center', flex: 1, minWidth: '100px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Unanswered</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--warning)' }}>{cv.unanswered}</div>
                  </div>
                </div>

                <div className="activity-score" style={{ fontSize: '1.4rem', padding: '12px 24px', marginLeft: 'auto', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', borderRadius: '12px', fontWeight: 'bold' }}>
                  Score: {cv.score}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No CVs found. Upload a CV to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
