import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CVList.css';

const CVList = () => {
  const navigate = useNavigate();

  // Mock data representing uploaded CVs
  const cvs = [
    {
      id: 1,
      name: 'Frontend_Developer_Resume.pdf',
      dateUploaded: '2023-10-27',
      totalClaims: 15,
      totalQuestions: 8,
    },
    {
      id: 2,
      name: 'Software_Engineer_2023.pdf',
      dateUploaded: '2023-10-25',
      totalClaims: 17,
      totalQuestions: 10,
    },
    {
      id: 3,
      name: 'Backend_Dev_Omar.docx',
      dateUploaded: '2023-10-20',
      totalClaims: 12,
      totalQuestions: 6,
    }
  ];

  return (
    <div className="cv-list-container">
      <div className="cv-list-header">
        <div>
          <h1>My CVs</h1>
          <p>View and manage your uploaded resumes and interview preparation.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/upload-cv')}>
          + Upload CV
        </button>
      </div>

      <div className="table-container">
        <table className="cv-table">
          <thead>
            <tr>
              <th>CV Name</th>
              <th>Date Uploaded</th>
              <th>Total Claims</th>
              <th>Generated Questions</th>
            </tr>
          </thead>
          <tbody>
            {cvs.map(cv => (
              <tr key={cv.id} onClick={() => navigate(`/cvs/${cv.id}`)}>
                <td>
                  <div className="cv-name">
                    <span className="cv-icon">📄</span>
                    {cv.name}
                  </div>
                </td>
                <td>{cv.dateUploaded}</td>
                <td><span className="badge">{cv.totalClaims} Claims</span></td>
                <td><span className="badge">{cv.totalQuestions} Questions</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CVList;
