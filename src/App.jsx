import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Sidebar from './components/Layout/Sidebar';

// New Pages
import Dashboard from './pages/Dashboard/Dashboard';
import CVUpload from './pages/CVUpload/CVUpload';
import CVList from './pages/CVList/CVList';
import CVDetails from './pages/CVDetails/CVDetails';
import QuestionsList from './pages/QuestionsList/QuestionsList';
import QuestionDetails from './pages/QuestionDetails/QuestionDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected/Main App Routes wrapped in Sidebar Layout */}
        <Route element={<Sidebar />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-cv" element={<CVUpload />} />
          <Route path="/cvs" element={<CVList />} />
          <Route path="/cvs/:id" element={<CVDetails />} />
          <Route path="/questions" element={<QuestionsList />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
