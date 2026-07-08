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
  
  // Voice Transcription State
  const [isRecording, setIsRecording] = useState(false);
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
        alert("Your browser doesn't support speech recognition. Try Chrome or Safari.");
        return;
      }
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
    } catch (err) {
      alert(`Failed to submit answer: ${err.message}`);
    } finally {
      setIsSubmitting(false);
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
          <p>ID: {questionData.id} • {questionData.cv_name}</p>
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
            <h3 className="qd-card-title">Context (From your CV)</h3>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="qd-card-title" style={{ margin: 0 }}>Submit Your Answer</h3>
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
              className="qd-textarea" 
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

        {/* Right Column: History */}
        <div className="qd-sidebar-col">
          <div className="qd-card">
            <h3 className="qd-card-title">Answer History</h3>
            
            {questionData.answers.length > 0 ? (
              <div className="qd-history-list">
                {questionData.answers.map((attempt, idx) => (
                  <div key={idx} className="qd-history-item">
                    <div className="qd-history-header">
                      <span className="qd-history-meta">Attempt {idx + 1} • {attempt.date}</span>
                      <span className="qd-history-score" style={{ color: getScoreColor(attempt.score) }}>
                        Score: {attempt.score}/10
                      </span>
                    </div>
                    
                    <div className="qd-history-block">
                      <strong>Your Answer:</strong>
                      <p>{attempt.answer}</p>
                    </div>
                    
                    {attempt.feedback && (
                      <div className="qd-feedback-block">
                        <strong>Feedback:</strong>
                        <p>{attempt.feedback}</p>
                      </div>
                    )}
                    
                    {attempt.suggested_answer && (
                      <div className="qd-ideal-block">
                        <strong>Ideal Answer:</strong>
                        <p>{attempt.suggested_answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="qd-empty-history">
                <p>No attempts yet. Answer the question to see your score and AI feedback!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;
