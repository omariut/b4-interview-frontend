import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvApi } from '../../services/api';
import './CVList.css';

const CVList = () => {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCVs = async () => {
      try {
        const data = await cvApi.getAll();
        setCvs(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch CVs');
      } finally {
        setLoading(false);
      }
    };
    fetchCVs();
  }, []);

  const totalClaims = cvs.reduce((acc, cv) => acc + cv.totalClaims, 0);
  const totalQuestions = cvs.reduce((acc, cv) => acc + cv.totalQuestions, 0);

  if (loading) {
    return (
      <div className="cv-list-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Loading CVs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cv-list-container">
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius-md)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="cv-list-container">
      <div className="cv-list-header">
        <div className="header-title">
          <h1>My CVs</h1>
          <p>Manage and review your uploaded resumes.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/upload-cv')}>
          + Upload CV
        </button>
      </div>

      <div className="cv-stats-banner">
        <div className="stat-item">
          <span className="stat-label">Total Uploads</span>
          <span className="stat-val">{cvs.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Claims Extracted</span>
          <span className="stat-val">{totalClaims}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Questions Generated</span>
          <span className="stat-val">{totalQuestions}</span>
        </div>
      </div>

      <div className="cv-table-container">
        {cvs.length > 0 ? (
          <table className="cv-table">
            <thead>
              <tr>
                <th>CV Name</th>
                <th>Upload Date</th>
                <th>Claims</th>
                <th>Questions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cvs.map((cv) => (
                <tr key={cv.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--accent-primary)' }}>📄</span>
                      {cv.name}
                    </div>
                  </td>
                  <td>{new Date(cv.dateUploaded).toLocaleDateString()}</td>
                  <td><span className="badge">{cv.totalClaims}</span></td>
                  <td><span className="badge">{cv.totalQuestions}</span></td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.875rem' }}
                      onClick={() => navigate(`/cvs/${cv.id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No CVs uploaded yet. Click the "Upload CV" button to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default CVList;
