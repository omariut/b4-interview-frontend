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

  const filteredQuestions = questions.filter(q => {
    if (filter === 'answered') return q.answered;
    if (filter === 'unanswered') return !q.answered;
    return true;
  });

  const answeredCount = questions.filter(q => q.answered).length;
  const unansweredCount = questions.filter(q => !q.answered).length;

  if (loading) {
    return (
      <div className="questions-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Loading Questions...</p>
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

      <div className="questions-list-container">
        {filteredQuestions.length > 0 ? (
          <div className="questions-grid">
            {filteredQuestions.map((q) => (
              <div 
                key={q.id} 
                className="question-card"
                onClick={() => navigate(`/cvs/${q.cv_id}`)}
              >
                <div className="question-card-header">
                  <span className="cv-badge">{q.cv_name}</span>
                  <span className={`status-badge ${q.answered ? 'status-answered' : 'status-unanswered'}`}>
                    {q.answered ? '✅ Answered' : '⏳ Unanswered'}
                  </span>
                </div>
                
                <div className="question-text">
                  {q.text}
                </div>
                
                <div className="question-claim">
                  <span className="claim-icon">✨</span>
                  <span>{q.claim_text}</span>
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
