import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Sidebar from './components/Layout/Sidebar';

// New Pages
import Dashboard from './pages/Dashboard/Dashboard';
import CVUpload from './pages/CVUpload/CVUpload';
import CVList from './pages/CVList/CVList';
import CVDetails from './pages/CVDetails/CVDetails';
import QuestionsList from './pages/QuestionsList/QuestionsList';
import QuestionDetails from './pages/QuestionDetails/QuestionDetails';
import Subscription from './pages/Subscription/Subscription';
import PaymentHistory from './pages/PaymentHistory/PaymentHistory';

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
        <Route path="/login" element={<Login />} />

        {/* Protected/Main App Routes wrapped in Sidebar Layout */}
        <Route element={<Sidebar theme={theme} toggleTheme={toggleTheme} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload-cv" element={<CVUpload />} />
          <Route path="/cvs" element={<CVList />} />
          <Route path="/cvs/:id" element={<CVDetails />} />
          <Route path="/questions" element={<QuestionsList />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
