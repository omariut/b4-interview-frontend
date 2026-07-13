import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewApi } from '../../services/api';
import './AnswersList.css';

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

const AnswersList = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generatingId, setGeneratingId] = useState(null);

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

  const handleGenerateIdealAnswer = async (e, qId) => {
    e.stopPropagation();
    setGeneratingId(qId);
    try {
      const response = await interviewApi.generateIdealAnswer(qId);
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === qId 
            ? { ...q, ideal_answer: response.ideal_answer }
            : q
        )
      );
    } catch (err) {
      alert(err.message || "Failed to generate ideal answer");
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="answers-list-container">
        <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading Answers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="answers-list-container">
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
          {error}
        </div>
      </div>
    );
  }

  const groupedQuestions = questions.reduce((acc, q) => {
    const claim = q.claim_text || 'General Questions';
    if (!acc[claim]) acc[claim] = [];
    acc[claim].push(q);
    return acc;
  }, {});

  return (
    <div className="answers-list-container">
      <div className="answers-list-header">
        <h1>Ideal Answers Reference</h1>
        <p>Review the claims, interview questions, and AI-generated ideal answers side-by-side.</p>
      </div>

      <div className="answers-table-wrapper">
        <table className="answers-table">
          <thead>
            <tr>
              <th className="question-col">Question</th>
              <th className="answer-col">AI Ideal Answer</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedQuestions).map(([claim, qs]) => (
              <React.Fragment key={claim}>
                <tr className="claim-header-row">
                  <td colSpan="2">
                    <div className="claim-group-badge">{claim}</div>
                  </td>
                </tr>
                {qs.map((q) => (
                  <tr key={q.id} onClick={() => navigate(`/questions/${q.id}`)}>
                    <td className="question-col">
                      <p className="question-text-bold">{q.text}</p>
                    </td>
                    <td className="answer-col">
                      {q.ideal_answer ? (
                        <div className="ideal-answer-text">
                          {renderWithBold(typeof q.ideal_answer === 'object' ? JSON.stringify(q.ideal_answer) : q.ideal_answer)}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
                          <span className="no-answer-placeholder">No ideal answer generated yet.</span>
                          <button 
                            className="btn-secondary" 
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                            onClick={(e) => handleGenerateIdealAnswer(e, q.id)}
                            disabled={generatingId === q.id}
                          >
                            {generatingId === q.id ? 'Loading...' : 'Show Answer'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No questions found. Upload a CV to generate questions!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnswersList;
