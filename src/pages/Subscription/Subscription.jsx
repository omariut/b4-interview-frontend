import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../../services/api';
import './Subscription.css';

const Subscription = () => {
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');

  const fetchSub = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getSubscription();
      setSubData(data);
    } catch (err) {
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSub();
  }, []);

  const handleUpgrade = async (plan_id) => {
    try {
      setUpgrading(true);
      await subscriptionApi.upgrade(plan_id);
      await fetchSub();
    } catch (err) {
      setError(err.message || 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) return <div className="sub-container"><div className="spinner">⏳ Loading...</div></div>;
  if (error) return <div className="sub-container"><div className="error-message">{error}</div></div>;
  if (!subData) return null;

  const isFree = subData.plan === 'free';
  const is6m = subData.plan === 'paid_6m';
  const is1y = subData.plan === 'paid_1y';

  return (
    <div className="sub-container">
      <div className="sub-header">
        <h1>Your Subscription</h1>
        <p>Manage your b4interview plan and limits.</p>
      </div>

      <div className="sub-status-card">
        <h3>Current Plan: <span>{subData.plan === 'free' ? 'Free Plan' : (subData.plan === 'paid_6m' ? 'Pro (6 Months)' : 'Elite (1 Year)')}</span></h3>
        {subData.end_date && <p>Expires: {new Date(subData.end_date).toLocaleDateString()}</p>}
      </div>

      <h2 className="sub-plans-title">Available Plans</h2>
      
      <div className="sub-plans-grid">
        {/* Free Plan */}
        <div className={`sub-plan-card ${isFree ? 'current' : ''}`}>
          <div className="plan-name">Free</div>
          <div className="plan-price">0 tk</div>
          <ul className="plan-features">
            <li>1 Month Access</li>
            <li>1 CV Analysis</li>
            <li>Basic Support</li>
          </ul>
          {isFree ? (
            <button className="plan-btn current" disabled>Current Plan</button>
          ) : (
            <button className="plan-btn" disabled>Included</button>
          )}
        </div>

        {/* 6 Month Plan */}
        <div className={`sub-plan-card ${is6m ? 'current' : ''} popular`}>
          <div className="popular-badge">Most Popular</div>
          <div className="plan-name">Pro</div>
          <div className="plan-price">499 tk <span>/ 6 mo</span></div>
          <ul className="plan-features">
            <li>6 Months Access</li>
            <li>3 CV Analyses</li>
            <li>Priority Support</li>
          </ul>
          {is6m ? (
            <button className="plan-btn current" disabled>Current Plan</button>
          ) : (
            <button 
              className="plan-btn upgrade" 
              onClick={() => handleUpgrade('paid_6m')}
              disabled={upgrading}
            >
              {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
            </button>
          )}
        </div>

        {/* 1 Year Plan */}
        <div className={`sub-plan-card ${is1y ? 'current' : ''} elite`}>
          <div className="plan-name">Elite</div>
          <div className="plan-price">999 tk <span>/ 1 yr</span></div>
          <ul className="plan-features">
            <li>1 Year Access</li>
            <li>10 CV Analyses</li>
            <li>24/7 Premium Support</li>
          </ul>
          {is1y ? (
            <button className="plan-btn current" disabled>Current Plan</button>
          ) : (
            <button 
              className="plan-btn upgrade" 
              onClick={() => handleUpgrade('paid_1y')}
              disabled={upgrading}
            >
              {upgrading ? 'Upgrading...' : 'Upgrade to Elite'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
