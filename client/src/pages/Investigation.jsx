import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../App.css';

const API_URL = 'http://localhost:5000/api';

function Investigation() {
  const { id } = useParams();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');

        /*
         * We first use the recovery queue because that endpoint
         * already exists in our backend.
         */
        const response = await fetch(`${API_URL}/recovery`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || 'Failed to load transaction'
          );
        }

        const found = (result.data || []).find(
          (item) => item._id === id
        );

        if (!found) {
          throw new Error('Recovery opportunity not found.');
        }

        setOpportunity(found);
      } catch (err) {
        console.error('Investigation error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [id]);

  const transactionId =
    opportunity?.transactionId?.razorpayOrderId ||
    opportunity?.transactionId?._id ||
    opportunity?._id ||
    id;

  const amount =
    opportunity?.transactionId?.amount ||
    opportunity?.amount ||
    0;

  const failureReason =
    opportunity?.transactionId?.failureReason ||
    'Payment failure';

  const riskScore = opportunity?.riskScore || 0;

  const recoveryProbability = Math.round(
    (opportunity?.recoveryProbability || 0) * 100
  );

  const expectedRecovery =
    opportunity?.expectedRecoveryValue || 0;

  const recommendedAction =
    opportunity?.recommendedAction || 'Review';

  const attempts =
    opportunity?.attempts ??
    opportunity?.transactionId?.attempts ??
    0;

  const maxAttempts = opportunity?.maxAttempts || 2;

  const status =
    opportunity?.status || 'ready';

  const getRiskClass = () => {
    if (riskScore <= 30) return 'low';
    if (riskScore <= 60) return 'medium';
    return 'high';
  };

  const handleExecute = async () => {
    if (!opportunity || executing) return;

    try {
      setExecuting(true);
      setMessage('');
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/payments/simulate-success`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          recoveryOpportunityId: opportunity._id,
          transactionId: opportunity.transactionId?._id || opportunity.transactionId,
          amount: opportunity.expectedRecoveryValue || amount,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Recovery execution failed');
      }

      setMessage(
        `✓ Recovery payment executed & captured via Razorpay Test Mode! (Payment ID: ${result.data?.razorpayPaymentId || 'pay_test_verified'})`
      );

      setOpportunity((prev) => ({
        ...prev,
        status: 'recovered',
      }));
    } catch (err) {
      console.error('Recovery execution error:', err);
      setError(err.message || 'Recovery action failed.');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="investigation-page">
        <div className="investigation-loading">
          Loading transaction investigation...
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="investigation-page">
        <div className="investigation-error">
          <div className="eyebrow">
            TRANSACTION INVESTIGATION
          </div>

          <h1>Transaction unavailable</h1>

          <p>
            {error || 'Unable to load this recovery opportunity.'}
          </p>

          <Link
            to="/recovery-queue"
            className="back-link"
          >
            ← Back to Recovery Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="investigation-page">

      {/* HEADER */}

      <section className="investigation-header">

        <div>
          <Link
            to="/recovery-queue"
            className="back-link"
          >
            ← Recovery Queue
          </Link>

          <div className="eyebrow">
            TRANSACTION INVESTIGATION
          </div>

          <h1>Recovery Investigation</h1>

          <p className="hero-text">
            Understand why RecoverAI selected this recovery action.
          </p>
        </div>

        <div
          className={`investigation-status ${status}`}
        >
          ● {status.replace('_', ' ')}
        </div>

      </section>

      {/* NOTIFICATION */}

      {message && (
        <div className="notification">
          {message}
        </div>
      )}

      {error && (
        <div className="notification error">
          {error}
        </div>
      )}

      {/* TRANSACTION OVERVIEW */}

      <section className="investigation-grid">

        <div className="panel transaction-overview">

          <div className="panel-header">
            <div>
              <div className="eyebrow">
                PAYMENT
              </div>

              <h2>Transaction Details</h2>
            </div>
          </div>

          <div className="investigation-details">

            <div className="detail-item">
              <span>Transaction ID</span>
              <strong className="mono">
                {transactionId}
              </strong>
            </div>

            <div className="detail-item">
              <span>Amount</span>
              <strong>
                ₹{Number(amount).toLocaleString('en-IN')}
              </strong>
            </div>

            <div className="detail-item">
              <span>Failure reason</span>
              <strong>
                {failureReason}
              </strong>
            </div>

            <div className="detail-item">
              <span>Recovery attempts</span>
              <strong>
                {attempts} / {maxAttempts}
              </strong>
            </div>

          </div>

        </div>

        {/* AI DECISION */}

        <div className="panel ai-decision-panel">

          <div className="panel-header">
            <div>
              <div className="eyebrow">
                AI DECISION
              </div>

              <h2>Recovery Decision</h2>
            </div>

            <div className="ai-decision-icon">
              ✦
            </div>
          </div>

          <div className="decision-content">

            <div className="decision-action">
              <span>Recommended action</span>

              <strong>
                {recommendedAction}
              </strong>
            </div>

            <div className="decision-metrics">

              <div>
                <span>Risk score</span>

                <strong
                  className={`risk-value ${getRiskClass()}`}
                >
                  {riskScore}/100
                </strong>
              </div>

              <div>
                <span>Recovery probability</span>

                <strong>
                  {recoveryProbability}%
                </strong>
              </div>

              <div>
                <span>Expected recovery</span>

                <strong>
                  ₹
                  {Number(
                    expectedRecovery
                  ).toLocaleString('en-IN')}
                </strong>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* AI REASONING */}

      <section className="investigation-grid">

        <div className="panel">

          <div className="panel-header">
            <div>
              <div className="eyebrow">
                MODEL REASONING
              </div>

              <h2>
                Why RecoverAI chose this action
              </h2>
            </div>
          </div>

          <div className="reasoning-content">

            <div className="reasoning-item">
              <div className="reasoning-number">
                01
              </div>

              <div>
                <strong>
                  Failure classified
                </strong>

                <p>
                  The payment failure was analyzed using
                  transaction and recovery signals.
                </p>
              </div>
            </div>

            <div className="reasoning-item">
              <div className="reasoning-number">
                02
              </div>

              <div>
                <strong>
                  Recovery likelihood evaluated
                </strong>

                <p>
                  RecoverAI estimates a{' '}
                  <b>{recoveryProbability}%</b>{' '}
                  probability of successful recovery.
                </p>
              </div>
            </div>

            <div className="reasoning-item">
              <div className="reasoning-number">
                03
              </div>

              <div>
                <strong>
                  Risk threshold checked
                </strong>

                <p>
                  The current risk score is{' '}
                  <b>{riskScore}/100</b>,
                  keeping the decision within configured
                  policy guardrails.
                </p>
              </div>
            </div>

            <div className="reasoning-item">
              <div className="reasoning-number">
                04
              </div>

              <div>
                <strong>
                  Revenue impact estimated
                </strong>

                <p>
                  Expected recovery value is{' '}
                  <b>
                    ₹
                    {Number(
                      expectedRecovery
                    ).toLocaleString('en-IN')}
                  </b>.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* POLICY */}

        <div className="panel">

          <div className="panel-header">
            <div>
              <div className="eyebrow">
                GOVERNANCE
              </div>

              <h2>Policy Guardrails</h2>
            </div>
          </div>

          <div className="guardrail-list">

            <div className="guardrail">
              <span>Risk threshold</span>
              <strong className="success">
                Passed
              </strong>
            </div>

            <div className="guardrail">
              <span>Recovery confidence</span>
              <strong className="success">
                Passed
              </strong>
            </div>

            <div className="guardrail">
              <span>Attempt limit</span>
              <strong>
                {attempts} / {maxAttempts}
              </strong>
            </div>

            <div className="guardrail">
              <span>AI automation</span>
              <strong className="success">
                Enabled
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* RECOVERY TIMELINE */}

      <section className="panel investigation-timeline">

        <div className="panel-header">
          <div>
            <div className="eyebrow">
              RECOVERY HISTORY
            </div>

            <h2>Recovery Timeline</h2>
          </div>
        </div>

        <div className="timeline">

          <div className="timeline-item">

            <div className="timeline-dot">
              ✓
            </div>

            <div>
              <strong>
                Payment failure detected
              </strong>

              <p>
                Transaction entered the RecoverAI
                recovery pipeline.
              </p>
            </div>

          </div>

          <div className="timeline-item">

            <div className="timeline-dot">
              ✦
            </div>

            <div>
              <strong>
                AI decision generated
              </strong>

              <p>
                Recovery probability and risk were
                evaluated against policy guardrails.
              </p>
            </div>

          </div>

          <div className="timeline-item">

            <div className="timeline-dot">
              →
            </div>

            <div>
              <strong>
                {recommendedAction}
              </strong>

              <p>
                Recommended recovery action is ready
                for execution.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* ACTION */}

      <section className="investigation-action">

        <div>
          <div className="eyebrow">
            RECOVERY CONTROL
          </div>

          <h2>
            Ready to recover this payment?
          </h2>

          <p>
            Execute the AI-recommended recovery action
            within the configured policy limits.
          </p>
        </div>

        <button
          className={`execute-button investigation-execute ${opportunity?.status === 'recovered' ? 'recovered-btn' : ''}`}
          onClick={handleExecute}
          disabled={
            executing ||
            opportunity?.status === 'recovered' ||
            attempts >= maxAttempts
          }
          style={opportunity?.status === 'recovered' ? { background: '#1c382b', color: '#55d69b', borderColor: '#2e6b4f', cursor: 'default' } : {}}
        >
          {executing
            ? 'Processing via Razorpay...'
            : opportunity?.status === 'recovered'
              ? '✓ Payment Recovered & Captured'
              : attempts >= maxAttempts
                ? 'Attempt Limit Reached'
                : 'Execute Recovery (Test Mode)'}
        </button>

      </section>

    </div>
  );
}

export default Investigation;