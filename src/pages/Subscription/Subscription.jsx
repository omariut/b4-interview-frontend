import React, { useState, useEffect, useRef } from 'react';
import { subscriptionApi } from '../../services/api';
import './Subscription.css';

const Subscription = () => {
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState('');
  
  // Checkout State
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);
  const [voucherFile, setVoucherFile] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!voucherFile) {
      setError('Please upload your payment voucher screenshot.');
      return;
    }
    
    try {
      setUpgrading(true);
      setError('');
      await subscriptionApi.uploadVoucher(checkoutPlanId, voucherFile);
      setCheckoutPlanId(null);
      setVoucherFile(null);
      await fetchSub();
    } catch (err) {
      setError(err.message || 'Failed to submit payment voucher');
    } finally {
      setUpgrading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVoucherFile(e.target.files[0]);
    }
  };

  if (loading) return <div className="sub-container"><div className="spinner">⏳ Loading...</div></div>;
  if (error && !checkoutPlanId) return <div className="sub-container"><div className="error-message">{error}</div></div>;
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
      
      {subData.has_pending_payment && (
        <div className="pending-banner">
          ⏳ You have a pending payment request for the {subData.pending_plan === 'paid_6m' ? 'Pro' : 'Elite'} plan. Our admins are reviewing your voucher and will approve it shortly!
        </div>
      )}

      {checkoutPlanId ? (
        <div className="checkout-container">
          <button className="back-btn" onClick={() => setCheckoutPlanId(null)}>← Back to Plans</button>
          <h2>Complete Your Upgrade</h2>
          <p>You have selected the <strong>{checkoutPlanId === 'paid_6m' ? 'Pro (499 tk)' : 'Elite (999 tk)'}</strong> plan.</p>
          
          <div className="bank-details-card">
            <h3>Bank Details</h3>
            <p>Please transfer the exact amount to the following account:</p>
            <ul>
              <li><strong>Bank Name:</strong> Dutch-Bangla Bank Ltd. (DBBL)</li>
              <li><strong>Account Name:</strong> b4interview Technologies</li>
              <li><strong>Account Number:</strong> 123-456-7890123</li>
              <li><strong>bKash / Nagad:</strong> 01712345678 (Personal)</li>
            </ul>
          </div>

          <form className="voucher-form" onSubmit={handleCheckoutSubmit}>
            <h3>Upload Payment Voucher</h3>
            <p>After transferring the money, please take a screenshot of the successful transaction and upload it below.</p>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="voucher-input"
            />
            
            {error && <div className="error-message" style={{marginTop: '16px'}}>{error}</div>}

            <button 
              type="submit" 
              className="plan-btn upgrade submit-voucher"
              disabled={upgrading || !voucherFile}
            >
              {upgrading ? 'Submitting...' : 'Submit Payment Voucher'}
            </button>
          </form>
        </div>
      ) : (
        <>
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
                  onClick={() => setCheckoutPlanId('paid_6m')}
                  disabled={subData.has_pending_payment}
                >
                  {subData.has_pending_payment ? 'Pending...' : 'Select Pro'}
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
                  onClick={() => setCheckoutPlanId('paid_1y')}
                  disabled={subData.has_pending_payment}
                >
                  {subData.has_pending_payment ? 'Pending...' : 'Select Elite'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Subscription;
