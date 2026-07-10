import React, { useState, useEffect } from 'react';
import { subscriptionApi } from '../../services/api';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await subscriptionApi.getPaymentHistory();
        setHistory(data);
      } catch (err) {
        setError(err.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="history-container"><div className="spinner">⏳ Loading...</div></div>;
  if (error) return <div className="history-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Payment History</h1>
        <p>View your past subscription upgrades and their approval statuses.</p>
      </div>

      {history.length === 0 ? (
        <div className="no-history-card">
          <h3>No Payments Found</h3>
          <p>You haven't made any upgrade requests yet.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((payment) => (
            <div key={payment.id} className="history-card">
              <div className="history-card-left">
                <h4>{payment.plan_id === 'paid_6m' ? 'Pro (6 Months)' : 'Elite (1 Year)'}</h4>
                <p className="history-date">
                  Requested on: {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="history-card-right">
                <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                  {payment.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
