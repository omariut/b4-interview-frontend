import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewApi } from '../../services/api';
import './QuestionsList.css';

const QuestionsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'answered', 'unanswered'
  const [selectedCV, setSelectedCV] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState('all');

  // Read URL query params to set initial filter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && ['all', 'answered', 'unanswered'].includes(filterParam)) {
      setFilter(filterParam);
    }
  }, [location]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const data = await interviewApi.getAllQuestions();
        setQuestions(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    navigate(`/questions?filter=${newFilter}`, { replace: true });
  };

  const cvNames = Array.from(new Set(questions.map(q => q.cv_name))).filter(Boolean);
  
  const availableClaims = Array.from(new Set(
    questions
      .filter(q => selectedCV === 'all' || q.cv_name === selectedCV)
      .map(q => q.claim_text)
  )).filter(Boolean);

  const filteredQuestions = questions.filter(q => {
    if (filter === 'answered' && !q.answered) return false;
    if (filter === 'unanswered' && q.answered) return false;
    if (selectedCV !== 'all' && q.cv_name !== selectedCV) return false;
    if (selectedClaim !== 'all' && q.claim_text !== selectedClaim) return false;
    return true;
  });

  const answeredCount = questions.filter(q => q.answered).length;
  const unansweredCount = questions.filter(q => !q.answered).length;

  if (loading) {
    return (
      <div className="questions-container">
        <div className="questions-header">
          <div className="header-title">
            <div className="skeleton skeleton-title" style={{ width: '300px' }}></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        </div>
        <div className="questions-list-container">
          <div className="questions-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div>
                  <div className="skeleton" style={{ width: '100px', height: '24px', borderRadius: '12px' }}></div>
                </div>
                <div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questions-container">
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius-md)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="questions-container">
      <div className="questions-header">
        <div className="header-title">
          <h1>All Interview Questions</h1>
          <p>Review and answer AI-generated questions from all your CVs.</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All ({questions.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'answered' ? 'active' : ''}`}
            onClick={() => handleFilterChange('answered')}
          >
            Answered ({answeredCount})
          </button>
          <button 
            className={`filter-btn ${filter === 'unanswered' ? 'active' : ''}`}
            onClick={() => handleFilterChange('unanswered')}
          >
            Unanswered ({unansweredCount})
          </button>
        </div>
        
        <div className="filter-group">
          {cvNames.length > 0 && (
            <select 
              className="filter-select"
              value={selectedCV}
              onChange={(e) => {
                setSelectedCV(e.target.value);
                setSelectedClaim('all'); // Reset claim when CV changes
              }}
            >
              <option value="all">All CVs</option>
              {cvNames.map(cv => (
                <option key={cv} value={cv}>{cv}</option>
              ))}
            </select>
          )}

          {availableClaims.length > 0 && (
            <select 
              className="filter-select"
              style={{ maxWidth: '200px' }}
              value={selectedClaim}
              onChange={(e) => setSelectedClaim(e.target.value)}
            >
              <option value="all">All Claims</option>
              {availableClaims.map(claim => (
                <option key={claim} value={claim}>
                  {claim.length > 40 ? claim.substring(0, 40) + '...' : claim}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="questions-list-container">
        {filteredQuestions.length > 0 ? (
          <div className="questions-grid">
            {filteredQuestions.map((q) => (
              <div 
                key={q.id} 
                className="question-card"
                onClick={() => navigate(`/questions/${q.id}`)}
              >
                <div className="question-card-header">
                  <span className={`status-badge ${q.answered ? 'status-answered' : 'status-unanswered'}`}>
                    {q.answered ? '✅ Answered' : '⏳ Unanswered'}
                  </span>
                </div>
                
                <div className="question-text">
                  {q.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No questions found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsList;
