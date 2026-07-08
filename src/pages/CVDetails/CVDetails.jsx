import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cvApi, interviewApi } from '../../services/api';
import './CVDetails.css';

const CLAIMS_PER_PAGE = 3;

const CVDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Voice Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  // Format: { qId: [ { answer: string, score: number, feedback: string, date: string } ] }
  const [history, setHistory] = useState({});

  useEffect(() => {
    const fetchCVDetails = async () => {
      try {
        const data = await cvApi.getById(id);
        setCvData(data);
        
        // Initialize history from backend data
        const initialHistory = {};
        data.claims.forEach(claim => {
          claim.questions.forEach(q => {
            initialHistory[q.id] = q.answers || [];
          });
        });
        setHistory(initialHistory);
      } catch (err) {
        setError(err.message || 'Failed to fetch CV details');
      } finally {
        setLoading(false);
      }
    };
    fetchCVDetails();
  }, [id]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setCurrentAnswer(prev => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + finalTranscript;
          });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        alert("Your browser doesn't support speech recognition. Try Chrome or Safari.");
        return;
      }
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

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

  // Modal actions
  const openQuestionModal = (question, index) => {
    setSelectedQuestion({ ...question, displayIndex: index + 1 });
    setCurrentAnswer('');
    setIsRecording(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const closeQuestionModal = () => {
    if (!isSubmitting) {
      setSelectedQuestion(null);
      if (isRecording && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  const getScoreColor = (score) => {
    if (score == null) return 'var(--text-secondary)';
    if (score >= 8) return 'var(--success)';
    if (score >= 5) return 'var(--warning)';
    return 'var(--error)';
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await interviewApi.submitAnswer(selectedQuestion.id, currentAnswer);
      
      const newAttempt = {
        answer: currentAnswer,
        score: response.score,
        feedback: response.feedback,
        suggested_answer: response.suggested_answer,
        date: new Date().toLocaleString()
      };

      setHistory(prev => ({
        ...prev,
        [selectedQuestion.id]: [...(prev[selectedQuestion.id] || []), newAttempt]
      }));
      
      setCurrentAnswer('');
    } catch (err) {
      alert(`Failed to submit answer: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cv-details-container">
      {/* Header Section */}
      <div className="cv-header">
        <div className="cv-title-section">
          <h1><span className="cv-icon">📄</span> {cvData.name}</h1>
          <p>Uploaded on {new Date(cvData.uploadDate).toLocaleDateString()} • CV ID: {id}</p>
        </div>
        <div className="cv-actions">
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
        
        <div className="table-container" style={{ border: 'none', boxShadow: 'none', borderRadius: 0 }}>
          {totalClaims > 0 ? (
            <table className="cv-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Claim</th>
                  <th>Questions (Click to Answer)</th>
                </tr>
              </thead>
              <tbody>
                {currentClaims.map((claim) => (
                  <tr key={claim.id} style={{ verticalAlign: 'top', cursor: 'default' }}>
                    <td style={{ fontWeight: '500' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="claim-icon">✨</span>
                        <span>{claim.text}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {claim.questions.map((q) => {
                          const globalQIndex = cvData.claims.flatMap(c => c.questions).findIndex(quest => quest.id === q.id);
                          const attempts = history[q.id] || [];
                          const lastScore = attempts.length > 0 ? attempts[attempts.length - 1].score : null;

                          return (
                            <div 
                              key={q.id} 
                              className="question-clickable"
                              onClick={() => openQuestionModal(q, globalQIndex)}
                            >
                              <div style={{ color: 'var(--accent-secondary)', fontWeight: 'bold', minWidth: '24px' }}>
                                Q{globalQIndex + 1}.
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ color: 'var(--text-primary)', lineHeight: '1.5' }}>
                                  {q.text}
                                </div>
                                {attempts.length > 0 && (
                                  <div style={{ marginTop: '8px', fontSize: '0.875rem', color: getScoreColor(lastScore), fontWeight: '600' }}>
                                    ✓ Answered ({attempts.length} attempts) - Last Score: {lastScore}/10
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="modal-overlay" onClick={closeQuestionModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ margin: 0, color: 'var(--accent-primary)' }}>Q{selectedQuestion.displayIndex}</h2>
              <button className="modal-close" onClick={closeQuestionModal} disabled={isSubmitting}>×</button>
            </div>
            
            <div style={{ fontSize: '1.25rem', marginBottom: '24px', lineHeight: '1.5' }}>
              {selectedQuestion.text}
            </div>

            {/* Previous Attempts History */}
            {history[selectedQuestion.id] && history[selectedQuestion.id].length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Previous Attempts</h3>
                {history[selectedQuestion.id].map((attempt, idx) => (
                  <div key={idx} className="history-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Attempt {idx + 1} • {attempt.date}</span>
                      <span style={{ fontWeight: 'bold', color: getScoreColor(attempt.score) }}>Score: {attempt.score}/10</span>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <strong>Your Answer:</strong>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>{attempt.answer}</p>
                    </div>
                    {attempt.feedback && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '4px', borderLeft: '3px solid var(--success)', marginBottom: '12px' }}>
                        <strong>Feedback:</strong>
                        <p style={{ margin: '4px 0 0 0' }}>{attempt.feedback}</p>
                      </div>
                    )}
                    {attempt.suggested_answer && (
                      <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '12px', borderRadius: '4px', borderLeft: '3px solid var(--accent-primary)' }}>
                        <strong>Ideal Answer:</strong>
                        <p style={{ margin: '4px 0 0 0' }}>{attempt.suggested_answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New Answer Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>Submit New Answer</h3>
                <button 
                  className={`btn-voice ${isRecording ? 'recording' : ''}`}
                  onClick={toggleRecording}
                  disabled={isSubmitting}
                  title="Answer with Voice"
                >
                  {isRecording ? (
                    <><span className="pulsing-dot"></span> Recording...</>
                  ) : '🎤 Voice'}
                </button>
              </div>
              <textarea 
                className="answer-textarea" 
                placeholder="Type your answer here or click Voice to speak..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={isSubmitting}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleSubmitAnswer} 
                  disabled={!currentAnswer.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                     <span>Grading with AI... <span className="spinner">⏳</span></span>
                  ) : 'Submit Answer'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CVDetails;
