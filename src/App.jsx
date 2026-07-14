import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Layout/Sidebar';
import Landing from './pages/Landing/Landing';

// New Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import CVUpload from './pages/CVUpload/CVUpload';
import CVList from './pages/CVList/CVList';
import CVDetails from './pages/CVDetails/CVDetails';
import QuestionsList from './pages/QuestionsList/QuestionsList';
import QuestionDetails from './pages/QuestionDetails/QuestionDetails';
import AnswersList from './pages/AnswersList/AnswersList';
import Feedback from './pages/Feedback/Feedback';
import Subscription from './pages/Subscription/Subscription';
import PaymentHistory from './pages/PaymentHistory/PaymentHistory';
import PrivacyPolicy from './pages/PrivacyPolicy/PrivacyPolicy';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* Protected/Main App Routes wrapped in Sidebar Layout */}
        <Route element={<Sidebar theme={theme} toggleTheme={toggleTheme} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/upload-cv" element={<CVUpload />} />
          <Route path="/cvs" element={<CVList />} />
          <Route path="/cvs/:id" element={<CVDetails />} />
          <Route path="/questions" element={<QuestionsList />} />
          <Route path="/answers" element={<AnswersList />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
