import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvApi } from '../../services/api';
import './CVUpload.css';

const CVUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', 'uploading', null
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timers = [];
    if (uploadStatus === 'uploading') {
      const messages = [
        "Uploading document... 📤",
        "Analyzing CV structure... 🔍",
        "Extracting claims... ✨",
        "Generating questions per claim... 🤖",
        "Finalizing results... 📝"
      ];
      
      setProgressMessage(messages[0]);
      
      // Cycle through messages every 3 seconds to keep user engaged
      messages.forEach((msg, index) => {
        if (index === 0) return;
        const timer = setTimeout(() => {
          setProgressMessage(msg);
        }, index * 3000);
        timers.push(timer);
      });
    }
    
    return () => {
      timers.forEach(t => clearTimeout(t));
    };
  }, [uploadStatus]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setUploadStatus('uploading');
      setErrorMessage('');
      
      try {
        const response = await cvApi.upload(selectedFile);
        setUploadStatus('success');
        // Navigate to CV details page after short delay to show success state
        setTimeout(() => navigate(`/cvs/${response.cv_id}`), 1000);
      } catch (err) {
        setUploadStatus('error');
        setErrorMessage(err.message || 'Failed to upload and process CV.');
      }
    } else {
      setUploadStatus('error');
      setErrorMessage('Invalid file format. Please upload a PDF file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  return (
    <div className="cv-upload-container">
      <div className="cv-upload-header">
        <h1>Upload CV</h1>
        <p>Upload your resume to extract claims and generate interview questions.</p>
      </div>

      {uploadStatus !== 'uploading' && uploadStatus !== 'success' && (
        <div 
          className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <div className="upload-icon">📤</div>
          <h3>Drag & Drop your CV here</h3>
          <p>Supports PDF (Max size: 5MB)</p>
          <button 
            className="btn-primary" 
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick();
            }}
          >
            Browse Files
          </button>
          <input 
            ref={inputRef}
            type="file" 
            className="file-input" 
            accept=".pdf,application/pdf"
            onChange={handleChange}
          />
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="processing-container uploading-pulse">
          <div className="processing-spinner"></div>
          <h2 className="processing-text">{progressMessage}</h2>
          <p className="processing-subtext">Please do not close this window while AI is analyzing.</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="processing-container">
          <div className="processing-icon">✅</div>
          <h2 className="processing-text">Analysis Complete!</h2>
          <p className="processing-subtext">Redirecting you to the interactive results...</p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="upload-status error" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
          ❌ {errorMessage}
        </div>
      )}
    </div>
  );
};

export default CVUpload;
