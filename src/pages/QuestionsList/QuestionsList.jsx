import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { interviewApi } from '../../services/api';
import './QuestionsList.css';

const renderWithBold = (text) => {
  if (typeof text !== 'string') return text;
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    let content;
    const bulletMatch = line.match(/^(\s*-\s+)([^:]+)(:\s+)(.*)$/);
    
    if (bulletMatch && !line.includes('**')) {
      content = (
        <React.Fragment>
          {bulletMatch[1]}
          <strong>{bulletMatch[2]}:</strong>
          {' '}
          {bulletMatch[4]}
        </React.Fragment>
      );
    } else {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      content = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return part;
      });
    }

    return (
      <React.Fragment key={lineIndex}>
        {content}
        {lineIndex < lines.length - 1 ? '\n' : null}
      </React.Fragment>
    );
  });
};

const QuestionsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'answered', 'unanswered'
  const [selectedCV, setSelectedCV] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState('all');
  
  // Modal state
  const [modalQuestion, setModalQuestion] = useState(null);
  const [isGeneratingIdeal, setIsGeneratingIdeal] = useState(false);

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

  const handleGenerateIdealAnswer = async () => {
    if (!modalQuestion) return;
    setIsGeneratingIdeal(true);
    try {
      const response = await interviewApi.generateIdealAnswer(modalQuestion.id);
      
      setModalQuestion(prev => ({
        ...prev,
        ideal_answer: response.ideal_answer
      }));
      
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === modalQuestion.id 
            ? { ...q, ideal_answer: response.ideal_answer }
            : q
        )
      );
      
    } catch (err) {
      alert(err.message || "Failed to generate ideal answer");
    } finally {
      setIsGeneratingIdeal(false);
    }
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
                  <button 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '4px 8px', margin: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalQuestion(q);
                    }}
                  >
                    ✨ View Ideal Answer
                  </button>
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

      {modalQuestion && (
        <div className="qd-modal-overlay" onClick={() => setModalQuestion(null)}>
          <div className="qd-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="qd-modal-header">
              <h2>✨ AI Ideal Answer</h2>
              <button className="qd-modal-close" onClick={() => setModalQuestion(null)}>×</button>
            </div>
            
            <div className="qd-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}><strong>Question:</strong> {modalQuestion.text}</p>
              </div>
              
              {modalQuestion.ideal_answer ? (
                <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {renderWithBold(typeof modalQuestion.ideal_answer === 'object' ? JSON.stringify(modalQuestion.ideal_answer) : modalQuestion.ideal_answer)}
                </p>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <p style={{ color: 'var(--warning)', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                    <strong>⚠️ Warning:</strong> The AI uses your specific attempt as context to tailor its ideal answer. Generating it now without answering first might cause it to miss some nuances and context.
                  </p>
                  <button 
                    className="btn-primary" 
                    onClick={handleGenerateIdealAnswer}
                    disabled={isGeneratingIdeal}
                    style={{ background: 'var(--warning)', color: '#000' }}
                  >
                    {isGeneratingIdeal ? 'Generating...' : 'Show Answer Now'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="qd-modal-footer">
              <button className="btn-primary" onClick={() => setModalQuestion(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsList;
