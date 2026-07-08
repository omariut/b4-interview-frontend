import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CVDetails.css';

const CLAIMS_PER_PAGE = 3;

const CVDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // History of answers per question id. 
  // Format: { qId: [ { answer: string, score: number, feedback: string, date: string } ] }
  const [history, setHistory] = useState({
    'q1': [{
      answer: "I used React's virtual DOM to avoid heavy re-renders that AngularJS was suffering from.",
      score: 75,
      feedback: "Good point on virtual DOM, but could elaborate more on how state changes triggered those re-renders in the legacy app.",
      date: new Date().toLocaleString()
    }]
  });

  // Mock Data
  const cvData = {
    name: 'Frontend_Developer_Resume.pdf',
    uploadDate: '2023-10-27',
    claims: [
      {
        id: 'c1',
        text: "Led the migration of a legacy Angular app to React, improving performance by 40%.",
        questions: [
          { id: 'q1', text: "Can you detail the specific performance bottlenecks you identified in the legacy Angular app and how React addressed them to achieve the 40% improvement?" },
          { id: 'q2', text: "What tools did you use to measure the performance before and after the migration?" }
        ]
      },
      {
        id: 'c2',
        text: "Developed a custom design system used across 5 internal applications.",
        questions: [
          { id: 'q3', text: "When developing the custom design system, how did you ensure consistent adoption and handle versioning across the 5 internal applications?" },
          { id: 'q4', text: "How did you balance the need for flexibility with maintaining brand consistency across different apps?" }
        ]
      },
      {
        id: 'c3',
        text: "Implemented complex state management using Redux and Context API.",
        questions: [
          { id: 'q5', text: "Could you describe a scenario where you chose Redux over Context API (or vice versa) and the reasoning behind that architectural decision?" }
        ]
      },
      {
        id: 'c4',
        text: "Integrated CI/CD pipelines using GitHub Actions to automate testing and deployment.",
        questions: [
          { id: 'q6', text: "What specific challenges did you face when setting up the CI/CD pipeline and how did you resolve them?" }
        ]
      }
    ]
  };

  // Pagination Logic
  const totalClaims = cvData.claims.length;
  const totalPages = Math.ceil(totalClaims / CLAIMS_PER_PAGE);
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
  };

  const closeQuestionModal = () => {
    setSelectedQuestion(null);
  };

  const handleSubmitAnswer = () => {
    if (!currentAnswer.trim()) return;
    
    const newAttempt = {
      answer: currentAnswer,
      score: Math.floor(Math.random() * (100 - 60 + 1)) + 60, // Mock score between 60-100
      feedback: "This is a simulated feedback response. Your answer hits the main points but could use a bit more specific technical detail.",
      date: new Date().toLocaleString()
    };

    setHistory(prev => ({
      ...prev,
      [selectedQuestion.id]: [...(prev[selectedQuestion.id] || []), newAttempt]
    }));
    
    setCurrentAnswer('');
  };

  return (
    <div className="cv-details-container">
      {/* Header Section */}
      <div className="cv-header">
        <div className="cv-title-section">
          <h1><span className="cv-icon">📄</span> {cvData.name}</h1>
          <p>Uploaded on {cvData.uploadDate} • CV ID: {id}</p>
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
                                <div style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--success)', fontWeight: '600' }}>
                                  ✓ Answered ({attempts.length} attempts) - Last Score: {lastScore}/100
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
              <button className="modal-close" onClick={closeQuestionModal}>×</button>
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
                      <span style={{ fontWeight: 'bold', color: attempt.score >= 80 ? 'var(--success)' : 'var(--warning)' }}>Score: {attempt.score}/100</span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <strong>Your Answer:</strong>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>{attempt.answer}</p>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '4px', borderLeft: '3px solid var(--success)' }}>
                      <strong>Feedback:</strong>
                      <p style={{ margin: '4px 0 0 0' }}>{attempt.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Answer Input */}
            <div>
              <h3>Submit New Answer</h3>
              <textarea 
                className="answer-textarea" 
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn-primary" onClick={handleSubmitAnswer} disabled={!currentAnswer.trim()}>
                  Submit Answer
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
