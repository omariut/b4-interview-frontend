import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewApi } from '../../services/api';
import './QuestionDetails.css';

const QuestionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isIdealAnswerOpen, setIsIdealAnswerOpen] = useState(window.innerWidth >= 900);
  
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
      <div className="qd-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Loading Question Details...</p>
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
                {questionData.answers.find(a => a.suggested_answer) ? (
                  <div className="qd-ideal-block" style={{ marginTop: '0' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>✨ AI Suggested Response:</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                      <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                        {questionData.answers.find(a => a.suggested_answer).suggested_answer}
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
                              <div className="qd-feedback-text">{attempt.feedback}</div>
                            </div>
                            <div className="qd-feedback-mobile">
                              <details className="qd-feedback-details">
                                <summary className="qd-feedback-summary">
                                  <span>ℹ️</span> View AI Feedback
                                </summary>
                                <div className="qd-feedback-text" style={{ marginTop: '12px' }}>{attempt.feedback}</div>
                              </details>
                            </div>
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>No feedback</span>
                        )}
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
                <h4 style={{ margin: '0 0 8px 0' }}>AI Feedback</h4>
                <p>{modalData.feedback}</p>
              </div>

              <div className="qd-ideal-block">
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>✨ AI Suggested Response</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }}>
                  <p>{modalData.suggested_answer}</p>
                </div>
              </div>
            </div>
            
            <div className="qd-modal-footer">
              <button className="btn-primary" onClick={() => setModalData(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionDetails;
