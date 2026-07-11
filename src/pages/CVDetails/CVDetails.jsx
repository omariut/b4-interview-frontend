import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cvApi, interviewApi } from '../../services/api';
import CVThumbnail from '../../components/CVThumbnail';
import './CVDetails.css';

const CLAIMS_PER_PAGE = 3;

const CVDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    const fetchCVDetails = async () => {
      try {
        const data = await cvApi.getById(id);
        setCvData(data);
        
        // History logic removed
      } catch (err) {
        setError(err.message || 'Failed to fetch CV details');
      } finally {
        setLoading(false);
      }
    };
    fetchCVDetails();
  }, [id]);

  // Speech recognition logic removed

  if (loading) {
    return (
      <div className="cv-details-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Loading CV Details...</p>
      </div>
    );
  }

  if (error || !cvData) {
    return (
      <div className="cv-details-container">
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius-md)' }}>
          {error || 'CV not found'}
        </div>
      </div>
    );
  }

  // Pagination Logic
  const totalClaims = cvData.claims.length;
  const totalPages = Math.ceil(totalClaims / CLAIMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * CLAIMS_PER_PAGE;
  const currentClaims = cvData.claims.slice(startIndex, startIndex + CLAIMS_PER_PAGE);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const totalQuestions = cvData.claims.reduce((acc, claim) => acc + claim.questions.length, 0);

  const handleQuestionClick = (qId) => {
    navigate(`/questions/${qId}`);
  };

  const openPreviewModal = async () => {
    setShowPreviewModal(true);
    if (!pdfUrl && !pdfError) {
      try {
        const blob = await cvApi.getPDFBlob(id);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (err) {
        console.error('Failed to load PDF preview:', err);
        setPdfError(true);
      }
    }
  };

  const getScoreColor = (score) => {
    if (score == null) return 'var(--text-secondary)';
    if (score >= 8) return 'var(--success)';
    if (score >= 5) return 'var(--warning)';
    return 'var(--error)';
  };

  return (
    <div className="cv-details-container">
      {/* Header Section */}
      <div className="cv-header">
        <div className="cv-title-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ transform: 'scale(1.2)' }}>
              <CVThumbnail cvId={id} />
            </div>
            <h1>{cvData.name}</h1>
          </div>

          <p style={{marginTop:'10px'}}>Uploaded on {new Date(cvData.uploadDate).toLocaleDateString()}</p>

          <p>Uploaded on {new Date(cvData.uploadDate).toLocaleDateString()}</p>
          
          {cvData.experience_level && (
            <div style={{ marginTop: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Experience Level:</strong> 
                <span style={{ textTransform: 'capitalize', color: 'var(--accent-primary)', fontWeight: '600' }}>
                  {cvData.experience_level}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  (~{cvData.detected_years} years)
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {cvData.detection_reasoning}
              </p>
            </div>
          )}
        </div>
        <div className="cv-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" onClick={openPreviewModal}>
            Preview CV
          </button>
          <button className="btn-secondary" onClick={() => navigate('/cvs')}>
            Back to Overview
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="section-container" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="section-header" style={{ padding: '32px 32px 16px 32px', marginBottom: 0 }}>
          <h2>Extracted Claims & Questions</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge">{totalClaims} Claims</span>
            <span className="badge">{totalQuestions} Questions</span>
          </div>
        </div>
        
        <div className="claims-list-container">
          {totalClaims > 0 ? (
            <div className="claims-stack">
              {currentClaims.map((claim) => (
                <div key={claim.id} className="claim-card-clean">
                  <div className="claim-card-header">
                    <span className="claim-icon" style={{ fontSize: '1.2rem' }}>✨</span>
                    <h3 style={{ margin: 0, fontWeight: '500', fontSize: '1.15rem', lineHeight: '1.5', color: 'var(--text-primary)',textAlign:'start' }}>
                      {claim.text}
                    </h3>
                  </div>
                  
                  <div className="claim-questions-list">
                    {claim.questions.map((q) => {
                      const globalQIndex = cvData.claims.flatMap(c => c.questions).findIndex(quest => quest.id === q.id);
                      const attempts = q.answers || [];
                      const lastScore = attempts.length > 0 ? attempts[attempts.length - 1].score : null;

                      return (
                        <div 
                          key={q.id} 
                          className="question-item-clean"
                          onClick={() => handleQuestionClick(q.id)}
                        >
                          <div className="question-number-clean">
                            Q{globalQIndex + 1}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '1rem' ,textAlign:'start' }}>
                              {q.text}
                            </div>
                            {attempts.length > 0 && (
                              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                                <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '2px 8px', borderRadius: '12px', fontWeight: '500' }}>
                                  ✓ Answered ({attempts.length})
                                </span>
                                <span style={{ color: getScoreColor(lastScore), fontWeight: '600' }}>
                                  Score: {lastScore}/10
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="question-arrow-clean">
                            →
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No claims extracted from this CV.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px 32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'var(--bg-surface)'
          }}>
            <button 
              className="btn-secondary" 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <div style={{ color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </div>
            <button 
              className="btn-secondary" 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal removed */}

      {/* CV Preview Modal */}
      {showPreviewModal && (
        <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
          <div className="modal-content" style={{ maxWidth: '900px', width: '90%', height: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0, color: 'var(--accent-primary)' }}>CV Preview</h2>
              <button className="modal-close" onClick={() => setShowPreviewModal(false)}>×</button>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--border-radius-md)', padding: '8px' }}>
              {pdfUrl ? (
                <iframe 
                  src={pdfUrl} 
                  title="CV PDF Preview"
                  style={{ flex: 1, width: '100%', border: 'none', borderRadius: '4px', background: '#fff' }} 
                />
              ) : pdfError ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <p>Could not load the original PDF file.</p>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Showing extracted text fallback instead:</p>
                  <div style={{
                    whiteSpace: 'pre-wrap', 
                    textAlign: 'left',
                    marginTop: '1rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    maxHeight: '40vh',
                    overflowY: 'auto'
                  }}>
                    {cvData.raw_text}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  Loading PDF...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVDetails;
