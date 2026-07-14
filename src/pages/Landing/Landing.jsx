import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <div className="landing-container">
      {/* Dynamic Background Elements */}
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      <div className="bg-glow glow-3"></div>

      {/* Header */}
      <header className="landing-header glass-nav">
        <div className="logo">
          <span className="logo-text">b4interview</span>
        </div>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button className="btn-secondary" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section fade-in-up">
          <div className="hero-badge">✨ AI-Powered Interview Prep</div>
          <h1 className="hero-title">
            Land Your Dream Job with <br/>
            <span className="gradient-text">Unbreakable Confidence</span>
          </h1>
          <p className="hero-subtitle">
            Upload your CV. Get grilled by our brutal, hyper-realistic AI recruiter. <br/>
            Identify your blind spots before the real interview.
          </p>
          <div className="hero-cta">
            <button className="btn-primary btn-large glow-effect" onClick={() => navigate('/login')}>
              Start Practicing Now 🚀
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon">📄</div>
              <h3>Hyper-Personalized</h3>
              <p>We analyze your CV to generate highly-specific questions that real hiring managers would ask about your unique experience.</p>
            </div>
            
            <div className="feature-card glass-panel">
              <div className="feature-icon">📈</div>
              <h3>Actionable Feedback</h3>
              <p>Get a detailed scorecard highlighting your blind spots, complete with "perfect answer" suggestions from the AI.</p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon">📱</div>
              <h3>WhatsApp Reminders</h3>
              <p>Opt-in to daily practice reminders sent straight to your phone so you stay sharp leading up to the big day.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <h4>Upload CV</h4>
              <p>Drop your PDF or DOCX. Our AI extracts your key claims.</p>
            </div>
            <div className="step-line"></div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h4>Generate Questions</h4>
              <p>We build a custom question bank tailored exactly to you.</p>
            </div>
            <div className="step-line"></div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h4>Practice & Master</h4>
              <p>Answer questions, get graded, and improve instantly.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="glass-panel cta-box">
            <h2>Ready to ace your next interview?</h2>
            <p>Join professionals who are landing top-tier jobs with b4interview.</p>
            <button className="btn-primary btn-large glow-effect" onClick={() => navigate('/login')}>
              Get Started for Free
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} b4interview. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
