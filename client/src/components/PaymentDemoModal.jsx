import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

function PaymentDemoModal({ isOpen, onClose, onPaymentTriggered }) {
  const [activeTab, setActiveTab] = useState('fail'); // 'fail' | 'order'
  const [amount, setAmount] = useState('42500');
  const [failureType, setFailureType] = useState('temporary_failure');
  const [failureReason, setFailureReason] = useState('Temporary payment processing failure');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFailureTypeChange = (e) => {
    const type = e.target.value;
    setFailureType(type);
    const reasonMap = {
      temporary_failure: 'Temporary payment processing failure',
      network_failure: 'Gateway connection timed out',
      authentication_failure: 'Customer 3D Secure authentication failed',
      insufficient_funds: 'Card issuer returned insufficient funds',
      hard_decline: 'Do not honor - card permanently declined',
    };
    setFailureReason(reasonMap[type] || 'Payment failed');
  };

  const handleSimulateFailure = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/simulate-failure`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: Number(amount),
          failureType,
          failureReason,
          paymentMethod: 'card',
        }),
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Failed to simulate payment failure');
      }

      setResult(res.data);
      if (onPaymentTriggered) onPaymentTriggered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError('');
      setResult(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency: 'INR',
        }),
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Failed to create order');
      }

      setResult({
        ...res.data,
        isOrder: true,
      });
      if (onPaymentTriggered) onPaymentTriggered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOrderPayment = async (orderId) => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const paymentId = `pay_test_${Date.now().toString(36)}`;
      const response = await fetch(`${API_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: 'simulated_valid_signature',
          amount: Number(amount),
        }),
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.message || 'Verification failed');
      }

      setResult({
        verified: true,
        paymentId,
        orderId,
      });
      if (onPaymentTriggered) onPaymentTriggered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(4, 7, 12, 0.82)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#0d1118',
          border: '1px solid #283344',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '520px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #1e2634',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div className="eyebrow" style={{ color: '#56dce8', marginBottom: '2px' }}>
              RAZORPAY TEST MODE
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#f5f7fa' }}>Payment Flow Simulator</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8493ab',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* TAB TOGGLE */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1e2634' }}>
          <button
            onClick={() => {
              setActiveTab('fail');
              setResult(null);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'fail' ? '#141b27' : '#0a0e15',
              border: 'none',
              borderBottom: activeTab === 'fail' ? '2px solid #ed7379' : '2px solid transparent',
              color: activeTab === 'fail' ? '#f5f7fa' : '#738299',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ● Simulate Failed Payment
          </button>
          <button
            onClick={() => {
              setActiveTab('order');
              setResult(null);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'order' ? '#141b27' : '#0a0e15',
              border: 'none',
              borderBottom: activeTab === 'order' ? '2px solid #56dce8' : '2px solid transparent',
              color: activeTab === 'order' ? '#f5f7fa' : '#738299',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ● Test Razorpay Order Creation
          </button>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div className="notification error" style={{ marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {activeTab === 'fail' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#7a8ba3', marginBottom: '6px' }}>
                  Transaction Amount (INR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: '#090d14',
                    border: '1px solid #232d3d',
                    borderRadius: '6px',
                    color: '#f5f7fa',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#7a8ba3', marginBottom: '6px' }}>
                  Failure Reason / Type
                </label>
                <select
                  value={failureType}
                  onChange={handleFailureTypeChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: '#090d14',
                    border: '1px solid #232d3d',
                    borderRadius: '6px',
                    color: '#f5f7fa',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                >
                  <option value="temporary_failure">Temporary payment processing failure (High Recovery %)</option>
                  <option value="network_failure">Network Gateway Timeout (High Recovery %)</option>
                  <option value="authentication_failure">3D Secure / Authentication Failure</option>
                  <option value="insufficient_funds">Insufficient Funds (Re-engage)</option>
                  <option value="hard_decline">Hard Decline / Permanent Bank Rejection</option>
                </select>
              </div>

              <div style={{ padding: '12px', background: '#111722', borderRadius: '6px', fontSize: '11px', color: '#8898af', border: '1px solid #1e293b' }}>
                <span style={{ color: '#56dce8', fontWeight: 600 }}>Expected RecoverAI behavior:</span> Ingest failure into pipeline, evaluate ML recovery probability, enforce merchant policy, generate audit timeline, and queue for retry.
              </div>

              <button
                className="primary-button"
                onClick={handleSimulateFailure}
                disabled={loading}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(90deg, #ed7379, #e0535a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  marginTop: '8px',
                }}
              >
                {loading ? 'Processing via Razorpay Test Mode...' : 'Trigger Payment Failure →'}
              </button>
            </div>
          )}

          {activeTab === 'order' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#7a8ba3', marginBottom: '6px' }}>
                  Order Amount (INR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: '#090d14',
                    border: '1px solid #232d3d',
                    borderRadius: '6px',
                    color: '#f5f7fa',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ padding: '12px', background: '#111722', borderRadius: '6px', fontSize: '11px', color: '#8898af', border: '1px solid #1e293b' }}>
                Generates a valid Razorpay Test Mode Order ID (`order_test_...`) and verifies checkout signatures via HMAC-SHA256.
              </div>

              <button
                className="primary-button"
                onClick={handleCreateOrder}
                disabled={loading}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(90deg, #4f6be8, #56dce8)',
                  color: '#080b10',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  marginTop: '8px',
                }}
              >
                {loading ? 'Creating Razorpay Order...' : 'Create Razorpay Order (Test Mode) →'}
              </button>
            </div>
          )}

          {/* RESULT CARD */}
          {result && (
            <div
              style={{
                marginTop: '18px',
                padding: '16px',
                background: '#0a1018',
                border: '1px solid #2a3c54',
                borderRadius: '8px',
              }}
            >
              {result.opportunityId ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="status-badge ready">● Opportunity Ingested</span>
                    <span style={{ fontSize: '11px', color: '#55d69b' }}>Order: {result.orderId}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#eef2f9', lineHeight: 1.5 }}>
                    <strong>Action: {result.recommendedAction?.toUpperCase()}</strong> · Risk: {result.riskScore}/100 · Prob: {Math.round(result.recoveryProbability * 100)}%
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      className="primary-button"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => {
                        onClose();
                        navigate(`/investigation/${result.opportunityId}`);
                      }}
                    >
                      Inspect in Investigation →
                    </button>
                    <button
                      className="secondary-button"
                      style={{ padding: '6px 12px', fontSize: '11px', margin: 0, width: 'auto' }}
                      onClick={() => {
                        onClose();
                        navigate('/audit-log');
                      }}
                    >
                      View Audit Log
                    </button>
                  </div>
                </div>
              ) : result.isOrder ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="status-badge active">● Order Created</span>
                    <span style={{ fontSize: '11px', color: '#56dce8' }}>{result.orderId}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#8aa0bf', marginBottom: '12px' }}>
                    Key ID: {result.keyId} · Amount: ₹{Number(result.amount) / 100}
                  </div>
                  <button
                    className="primary-button"
                    style={{ padding: '8px 14px', fontSize: '11px', background: '#55d69b', color: '#091510' }}
                    onClick={() => handleVerifyOrderPayment(result.orderId)}
                    disabled={loading}
                  >
                    Simulate Payment Success & Verify Signature →
                  </button>
                </div>
              ) : result.verified ? (
                <div>
                  <span className="status-badge active" style={{ color: '#55d69b' }}>
                    ✓ Signature Verified & Payment Captured!
                  </span>
                  <div style={{ fontSize: '11px', color: '#8aa0bf', marginTop: '6px' }}>
                    Payment ID: {result.paymentId} · Order: {result.orderId}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentDemoModal;
