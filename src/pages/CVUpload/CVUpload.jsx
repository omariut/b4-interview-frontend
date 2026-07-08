import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CVUpload.css';

const CVUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', 'uploading', null
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type.includes('word'))) {
      setFile(selectedFile);
      setUploadStatus('uploading');
      
      // Mock upload process
      setTimeout(() => {
        setUploadStatus('success');
        // Navigate to CV details page or list after short delay
        setTimeout(() => navigate('/cvs'), 1500);
      }, 2000);
    } else {
      setUploadStatus('error');
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
        <p>Supports PDF and DOCX (Max size: 5MB)</p>
        <button className="btn-primary" onClick={(e) => {
          e.stopPropagation(); // prevent double click firing
          onButtonClick();
        }}>
          Browse Files
        </button>
        <input 
          ref={inputRef}
          type="file" 
          className="file-input" 
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
        />
      </div>

      {uploadStatus === 'uploading' && (
        <div className="upload-status" style={{ color: 'var(--text-primary)', borderColor: 'var(--accent-primary)', background: 'rgba(56, 189, 248, 0.1)' }}>
          <span className="spinner">⏳</span> Uploading {file?.name}...
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="upload-status">
          ✅ Upload successful! Redirecting...
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="upload-status error">
          ❌ Invalid file format. Please upload a PDF or DOCX file.
        </div>
      )}
    </div>
  );
};

export default CVUpload;
