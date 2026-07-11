import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../../services/api';
import './QuestionDetails.css';

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

const QuestionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Structured Feedback Component
  const StructuredFeedback = ({ feedback }) => {
    if (!feedback || typeof feedback !== 'object') return null;

    return (
      <div className="structured-feedback">
        {feedback.what_is_good && (
          <div className="feedback-section">
            <h4 style={{ color: 'var(--success)', margin: '0 0 8px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✅</span> What is Good
            </h4>
            <p style={{ margin: 0, paddingLeft: '24px' }}>{typeof feedback.what_is_good === 'object' ? JSON.stringify(feedback.what_is_good) : feedback.what_is_good}</p>
          </div>
        )}

        {feedback.areas_for_growth && (
          <div className="feedback-section" style={{ marginTop: '24px' }}>
            <h4 style={{ color: 'var(--warning)', margin: '0 0 8px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📈</span> Areas for Growth
            </h4>
            <p style={{ margin: 0, paddingLeft: '24px' }}>{typeof feedback.areas_for_growth === 'object' ? JSON.stringify(feedback.areas_for_growth) : feedback.areas_for_growth}</p>
          </div>
        )}

        {feedback.scoring_details && (
          <div className="feedback-section" style={{ marginTop: '24px' }}>
            <h4 style={{ color: 'var(--accent-primary)', margin: '0 0 12px 0', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span> Scoring Details
            </h4>
            <div className="scoring-grid" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontStyle: 'italic' }}>{typeof feedback.scoring_details === 'object' ? JSON.stringify(feedback.scoring_details) : feedback.scoring_details}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isIdealAnswerOpen, setIsIdealAnswerOpen] = useState(window.innerWidth >= 900);
  
  // Report Modal State
  const [reportModalData, setReportModalData] = useState(null); // { answerId: number }
  const [reportText, setReportText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');
  
  // Voice Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const data = await interviewApi.getQuestionById(id);
        setQuestionData(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch question details');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionDetails();
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
        setSubmitError("Your browser doesn't support speech recognition. Try Chrome or Safari.");
        return;
      }
      setSubmitError('');
      recognitionRef.current.start();
      setIsRecording(true);
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
    setSubmitError('');
    try {
      const response = await interviewApi.submitAnswer(questionData.id, currentAnswer);
      
      const newAttempt = {
        id: response.answer_id,
        answer: currentAnswer,
        score: response.score,
        feedback: response.feedback,
        suggested_answer: response.suggested_answer,
        date: new Date().toLocaleString() // Rough local approximation until refresh
      };

      setQuestionData(prev => ({
        ...prev,
        answers: [...prev.answers, newAttempt]
      }));
      
      setCurrentAnswer('');
      
      // Show Modal
      setModalData({
        score: response.score,
        feedback: response.feedback,
        suggested_answer: response.suggested_answer
      });
    } catch (err) {
      setSubmitError(err.message || "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLimitReached = questionData?.answers?.length >= 3;

  const handleReportSubmit = async () => {
    if (!reportText.trim() || !reportModalData) return;
    setIsSubmittingReport(true);
    try {
      await interviewApi.reportAnswer(reportModalData.answerId, reportText);
      setReportSuccess('Thank you. Your report has been submitted.');
      setTimeout(() => {
        setReportModalData(null);
        setReportText('');
        setReportSuccess('');
      }, 2500);
    } catch (err) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="qd-container">
        {/* Skeleton Header */}
        <div className="qd-header">
          <div className="qd-title-section">
            <div className="skeleton skeleton-title" style={{ width: '250px' }}></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
          <div className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '8px' }}></div>
        </div>

        <div className="qd-content-grid">
          {/* Skeleton Main Col */}
          <div className="qd-main-col">
            <div className="skeleton-card">
              <div className="skeleton skeleton-title" style={{ width: '150px' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '8px' }}></div>
            </div>
            
            <div className="skeleton-card">
              <div className="skeleton skeleton-title" style={{ width: '180px' }}></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>

            <div className="skeleton-card">
              <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '8px' }}></div>
            </div>
          </div>

          {/* Skeleton Sidebar Col */}
          <div className="qd-sidebar-col">
            <div className="skeleton-card">
              <div className="skeleton skeleton-title" style={{ width: '120px' }}></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text short"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !questionData) {
    return (
      <div className="qd-container">
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: 'var(--border-radius-md)' }}>
          {error || 'Question not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="qd-container">
      {/* Header Section */}
      <div className="qd-header">
        <div className="qd-title-section">
          <h1><span className="qd-icon">💬</span> Question Details</h1>
          <p>ID: {questionData.id}</p>
        </div>
        <div className="qd-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
        </div>
      </div>

      <div className="qd-content-grid">
        {/* Left Column: Context and Question */}
        <div className="qd-main-col">
          <div className="qd-card">
            <h3 className="qd-card-title">Context (CV: {questionData.cv_name})</h3>
            <div className="qd-claim-box">
              <span className="claim-icon">✨</span>
              <span>{questionData.claim_text}</span>
            </div>
          </div>

          <div className="qd-card question-highlight">
            <h3 className="qd-card-title">Interview Question</h3>
            <div className="qd-question-text">
              {questionData.text}
            </div>
          </div>

          {/* New Answer Input */}
          <div className="qd-card">
            <div className="qd-submit-header">
              <h3 className="qd-card-title" style={{ margin: 0 }}>
                Submit Your Answer
                {isLimitReached && <span className="qd-limit-badge">Max 3 attempts reached</span>}
              </h3>
              <button 
                className={`btn-voice ${isRecording ? 'recording' : ''}`}
                onClick={toggleRecording}
                disabled={isSubmitting || isLimitReached}
                title="Answer with Voice"
              >
                {isRecording ? (
                  <><span className="pulsing-dot"></span> Recording...</>
                ) : '🎤 Voice'}
              </button>
            </div>
            
            <textarea 
              className="qd-textarea" 
              placeholder={isLimitReached ? "You have reached the maximum limit of 3 attempts." : "Type your answer here or click Voice to speak..."}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={isSubmitting || isLimitReached}
            />
            
            {submitError && (
              <div style={{ color: 'var(--error)', marginTop: '8px', fontSize: '0.9rem' }}>
                {submitError}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                className="btn-primary" 
                onClick={handleSubmitAnswer} 
                disabled={!currentAnswer.trim() || isSubmitting || isLimitReached}
              >
                {isSubmitting ? (
                   <span>Grading with AI... <span className="spinner">⏳</span></span>
                ) : 'Submit Answer'}
              </button>
            </div>
          </div>

        </div> {/* End of qd-main-col */}

        {/* Right Column: Ideal Answer */}
        <div className="qd-sidebar-col">
          <div className="qd-card" style={{ position: 'sticky', top: '24px' }}>
            <div 
              onClick={() => setIsIdealAnswerOpen(!isIdealAnswerOpen)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isIdealAnswerOpen ? '16px' : '0' }}
            >
              <h3 className="qd-card-title" style={{ margin: 0, borderBottom: 'none', paddingBottom: 0 }}>Ideal Answer</h3>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', transition: 'transform 0.2s' }}>
                {isIdealAnswerOpen ? '▲' : '▼'}
              </span>
            </div>
            
            {isIdealAnswerOpen && (
              <div style={{ marginTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
                {questionData.ideal_answer ? (
                  <div className="qd-ideal-block" style={{ marginTop: '0' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>✨ AI Ideal Answer:</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                      <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                        {renderWithBold(typeof questionData.ideal_answer === 'object' ? JSON.stringify(questionData.ideal_answer) : questionData.ideal_answer)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="qd-empty-history" style={{ padding: '24px' }}>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>The AI will generate an ideal answer after you submit your first attempt.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Answer History Table (Full Width) */}
      <div className="qd-card" style={{ marginTop: '24px' }}>
        <h3 className="qd-card-title">Answer History</h3>
        
        {questionData.answers.length > 0 ? (
          <div className="qd-history-table-container">
            <table className="qd-history-table">
              <thead>
                <tr>
                  <th style={{ width: '50%' }}>Your Answer</th>
                  <th style={{ width: '50%' }}>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {[...questionData.answers].reverse().map((attempt, reverseIdx) => {
                  const idx = questionData.answers.length - 1 - reverseIdx;
                  return (
                    <tr key={idx}>
                      <td className="qd-history-answer-cell">
                        <div className="qd-history-meta">
                          Attempt {idx + 1} • {attempt.date}
                        </div>
                        <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                          <span className="qd-history-score" style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', color: getScoreColor(attempt.score), display: 'inline-block' }}>
                            Score: {attempt.score}/10
                          </span>
                        </div>
                        <div className="qd-history-text">{attempt.answer}</div>
                      </td>
                        <td className="qd-history-feedback-cell">
                        {attempt.feedback ? (
                          <>
                            <div className="qd-feedback-desktop">
                              <div className="qd-feedback-text">
                                <StructuredFeedback feedback={attempt.feedback} />
                              </div>
                            </div>
                            <div className="qd-feedback-mobile">
                              <details className="qd-feedback-details">
                                <summary className="qd-feedback-summary">
                                  <span>ℹ️</span> View AI Feedback
                                </summary>
                                <div className="qd-feedback-text" style={{ marginTop: '12px' }}>
                                  <StructuredFeedback feedback={attempt.feedback} />
                                </div>
                              </details>
                            </div>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>No feedback</span>
                        )}
                        <div style={{ marginTop: '12px', textAlign: 'right' }}>
                          <button 
                            className="btn-report" 
                            onClick={() => setReportModalData({ answerId: attempt.id })}
                          >
                            <span style={{marginRight: '4px'}}>🚩</span> Report Issue
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="qd-empty-history">
            <p>No attempts yet. Answer the question to see your score and AI feedback!</p>
          </div>
        )}
      </div>
      
      {/* Post-Submission Modal */}
      {modalData && (
        <div className="qd-modal-overlay" onClick={() => setModalData(null)}>
          <div className="qd-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="qd-modal-header">
              <h2>Answer Graded!</h2>
              <button className="qd-modal-close" onClick={() => setModalData(null)}>×</button>
            </div>
            
            <div className="qd-modal-body">
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <span className="qd-history-score" style={{ padding: '8px 16px', borderRadius: '16px', background: 'rgba(0,0,0,0.2)', color: getScoreColor(modalData.score), fontSize: '1.25rem', display: 'inline-block' }}>
                  Score: {modalData.score}/10
                </span>
              </div>
              
              <div className="qd-feedback-block" style={{ marginBottom: '24px' }}>
                <div className="qd-feedback-text">
                  <StructuredFeedback feedback={modalData.feedback} />
                </div>
              </div>
            </div>
            
            <div className="qd-modal-footer">
              <button className="btn-primary" onClick={() => setModalData(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModalData && (
        <div className="qd-modal-overlay" onClick={() => !isSubmittingReport && setReportModalData(null)}>
          <div className="qd-modal-content report-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qd-modal-header">
              <h2>Report Issue</h2>
              <button className="qd-modal-close" onClick={() => !isSubmittingReport && setReportModalData(null)}>×</button>
            </div>
            
            <div className="qd-modal-body">
              {reportSuccess ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--success)' }}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>✅</span>
                  {reportSuccess}
                </div>
              ) : (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Please let us know what went wrong with the AI's grading, feedback, or suggested answer.
                  </p>
                  <textarea 
                    className="qd-textarea" 
                    placeholder="E.g., The score is unfairly low, or the feedback missed my point about React hooks..."
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    rows={4}
                    disabled={isSubmittingReport}
                  />
                </>
              )}
            </div>
            
            {!reportSuccess && (
              <div className="qd-modal-footer" style={{ justifyContent: 'space-between' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setReportModalData(null)}
                  disabled={isSubmittingReport}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleReportSubmit}
                  disabled={!reportText.trim() || isSubmittingReport}
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetails;
