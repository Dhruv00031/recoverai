import { useEffect, useState, useMemo } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import RecoveryQueue from './pages/RecoveryQueue';
import AuditLog from './pages/AuditLog';
import Investigation from './pages/Investigation';
import RecoveryAnalytics from './pages/RecoveryAnalytics';
import PaymentDemoModal from './components/PaymentDemoModal';
import './App.css';

const API_URL = 'http://localhost:5000/api';


function App() {
  const [page, setPage] = useState('overview');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const fetchRecoveryData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/recovery`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to fetch recovery data'
        );
      }

      setOpportunities(result.data || []);
    } catch (err) {
      console.error('Recovery data error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecoveryData();
  }, []);

  const filteredOpportunities = useMemo(() => {
    let data = [...opportunities];

    if (search.trim()) {
      const query = search.toLowerCase();

      data = data.filter((item) => {
        const transaction =
          item.transactionId?.razorpayOrderId ||
          item.transactionId?._id ||
          '';

        const failure =
          item.transactionId?.failureReason || '';

        const action =
          item.recommendedAction || '';

        return (
          transaction.toLowerCase().includes(query) ||
          failure.toLowerCase().includes(query) ||
          action.toLowerCase().includes(query)
        );
      });
    }

    if (filter === 'ready') {
      data = data.filter(
        (item) =>
          item.status === 'ready' ||
          item.status === 'pending'
      );
    }

    if (filter === 'recovered') {
      data = data.filter(
        (item) => item.status === 'recovered'
      );
    }

    if (filter === 'manual') {
      data = data.filter((item) =>
        String(item.recommendedAction || '')
          .toLowerCase()
          .includes('manual')
      );
    }

    if (filter === 'risk') {
      data = data.filter(
        (item) => Number(item.riskScore || 0) >= 60
      );
    }

    if (filter === 'high-value') {
      data = data.filter(
        (item) =>
          Number(item.expectedRecoveryValue || 0) >= 10000
      );
    }

    return data;
  }, [opportunities, search, filter]);

  const stats = useMemo(() => {
    const recovered = opportunities.filter(
      (item) => item.status === 'recovered'
    ).length;

    const recoveryRate =
      opportunities.length > 0
        ? Math.round(
            (recovered / opportunities.length) * 100
          )
        : 0;

    const expectedRecovery = opportunities.reduce(
      (total, item) =>
        total + Number(item.expectedRecoveryValue || 0),
      0
    );

    return {
      opportunities: opportunities.length,
      recovered,
      recoveryRate,
      expectedRecovery,
    };
  }, [opportunities]);

  const openInvestigation = (item) => {
    console.log('CLICKED QUEUE ITEM:', item);
    setSelectedTransaction(item);
    setPage('investigation');
  };

  const getTransactionId = (item) =>
    item.transactionId?.razorpayOrderId ||
    item.transactionId?._id ||
    'Unknown Transaction';

  const getFailureReason = (item) =>
    item.transactionId?.failureReason ||
    'Payment failure';

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN')}`;

  const getRiskLevel = (score) => {
    const value = Number(score || 0);

    if (value >= 60) return 'high';
    if (value >= 30) return 'medium';
    return 'low';
  };

  const renderNavbar = () => (
    <header className="topbar">
      <div className="brand-section">
        <div className="brand">
          <span className="brand-mark">✦</span>
          RecoverAI
        </div>

        <div className="nav-links">
          <button
            className={page === 'overview' ? 'active' : ''}
            onClick={() => {
              setPage('overview');
              navigate('/');
            }}
          >
            Overview
          </button>

          <button
            className={
              page === 'queue' ||
              page === 'investigation'
                ? 'active'
                : ''
            }
            onClick={() => {
              setPage('queue');
              navigate('/');
            }}
          >
            Recovery Queue
          </button>

          <button
            className={page === 'analytics' ? 'active' : ''}
            onClick={() => {
              setPage('analytics');
              navigate('/analytics');
            }}
          >
            Analytics
          </button>

          <button
            className={page === 'policies' ? 'active' : ''}
            onClick={() => {
              setPage('policies');
              navigate('/');
            }}
          >
            Policies
          </button>

          <button
            className={page === 'audit' ? 'active' : ''}
            onClick={() => {
              setPage('audit');
              navigate('/audit-log');
            }}
          >
            Audit Log
          </button>
        </div>
      </div>

      <div className="header-right">
        <button
          className="refresh-button"
          style={{
            padding: '5px 11px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderColor: '#304868',
            color: '#56dce8',
            background: 'rgba(86, 220, 232, 0.08)',
            cursor: 'pointer',
          }}
          onClick={() => setShowPaymentModal(true)}
        >
          <span>⚡</span>
          <span>Test Payment Flow</span>
        </button>

        <div className="system-status">
          <span className="status-dot" />
          AI Engine Online
        </div>

        <span className="header-icon">⚙</span>
        <span className="header-icon">◉</span>
      </div>
    </header>
  );

  const renderQueue = () => (
    <main className="dashboard">
      <section className="queue-hero">
        <div>
          <div className="eyebrow">
            RECOVERY OPERATIONS
          </div>

          <h1>Recovery Queue</h1>

          <p className="hero-text">
            Prioritize the revenue opportunities most worth
            recovering.
          </p>
        </div>

        <div className="priority-card">
          <div className="priority-title">
            ✦ AI PRIORITY INSIGHT
          </div>

          <strong>
            {opportunities.length} opportunities represent{' '}
            {formatCurrency(stats.expectedRecovery)}
          </strong>

          <p>
            Recommended focus: low-risk failures with
            recovery probability above 80%.
          </p>

          <button
            onClick={() => setPage('analytics')}
            className="text-button"
          >
            View analysis →
          </button>
        </div>
      </section>

      <section className="queue-metrics">
        <div>
          <strong>
            {formatCurrency(stats.expectedRecovery)}
          </strong>
          <span>RECOVERABLE</span>
        </div>

        <div>
          <strong>{stats.opportunities}</strong>
          <span>OPPORTUNITIES</span>
        </div>

        <div>
          <strong>{stats.recovered}</strong>
          <span>HIGH-CONFIDENCE</span>
        </div>

        <div>
          <strong>{stats.recoveryRate}%</strong>
          <span>RECOVERY RATE</span>
        </div>
      </section>

      <section className="queue-toolbar">
        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'selected' : ''}
            onClick={() => setFilter('all')}
          >
            ALL {opportunities.length}
          </button>

          <button
            className={filter === 'ready' ? 'selected' : ''}
            onClick={() => setFilter('ready')}
          >
            READY
          </button>

          <button
            className={filter === 'risk' ? 'selected' : ''}
            onClick={() => setFilter('risk')}
          >
            AT RISK
          </button>

          <button
            className={
              filter === 'high-value' ? 'selected' : ''
            }
            onClick={() => setFilter('high-value')}
          >
            HIGH VALUE
          </button>

          <button
            className={filter === 'manual' ? 'selected' : ''}
            onClick={() => setFilter('manual')}
          >
            MANUAL REVIEW
          </button>

          <button
            className={
              filter === 'recovered' ? 'selected' : ''
            }
            onClick={() => setFilter('recovered')}
          >
            RECOVERED
          </button>
        </div>

        <div className="queue-actions">
          <input
            type="text"
            placeholder="Search transaction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="toolbar-button"
            onClick={() => setFilter('all')}
          >
            Filter
          </button>

          <button
            className="toolbar-button"
            onClick={() =>
              setOpportunities([
                ...opportunities,
              ].sort(
                (a, b) =>
                  Number(
                    b.expectedRecoveryValue || 0
                  ) -
                  Number(
                    a.expectedRecoveryValue || 0
                  )
              ))
            }
          >
            Sort
          </button>
        </div>
      </section>

      {error && (
        <div className="notification error">
          {error}
        </div>
      )}

      <section className="panel queue-panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Transaction</th>
                <th>Amount</th>
                <th>Failure</th>
                <th>Risk</th>
                <th>Recovery</th>
                <th>Expected Recovery</th>
                <th>AI Recommendation</th>
                <th>Attempts</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="10"
                    className="empty-state"
                  >
                    Loading recovery opportunities...
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="empty-state"
                  >
                    No recovery opportunities found.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((item, index) => {
                  const risk = getRiskLevel(
                    item.riskScore
                  );

                  const probability = Math.round(
                    Number(
                      item.recoveryProbability || 0
                    ) * 100
                  );

                  const amount =
                    item.transactionId?.amount ||
                    item.amount ||
                    0;

                  const attempts =
                    item.attempts ??
                    item.retryCount ??
                    0;

                  return (
                    <tr
                      key={item._id || index}
                      onClick={() =>
                        openInvestigation(item)
                      }
                      className="clickable-row"
                    >
                      <td>
                        <span className="priority-number">
                          {index + 1}
                        </span>
                      </td>

                      <td>
                        <div className="transaction-cell">
                          <span className="transaction-id">
                            {getTransactionId(item)}
                          </span>

                          <span className="failure-reason">
                            {getFailureReason(item)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(amount)}
                        </strong>
                      </td>

                      <td>
                        {getFailureReason(item)}
                      </td>

                      <td>
                        <span className={`risk ${risk}`}>
                          {item.riskScore}/100
                        </span>
                      </td>

                      <td>
                        <div className="recovery-value">
                          <strong>
                            {probability}%
                          </strong>

                          <div className="progress">
                            <span
                              style={{
                                width: `${probability}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(
                            item.expectedRecoveryValue
                          )}
                        </strong>
                      </td>

                      <td>
                        <span className="action-badge">
                          {item.recommendedAction ||
                            'Review'}
                        </span>
                      </td>

                      <td>
                        {attempts}/
                        {item.maxAttempts || 2}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            item.status || 'ready'
                          }`}
                        >
                          ● {item.status || 'Ready'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Showing 1-{filteredOpportunities.length} of{' '}
            {opportunities.length} opportunities
          </span>

          <div>
            <button disabled>Previous</button>
            <button disabled>Next</button>
          </div>
        </div>
      </section>
    </main>
  );

  const renderOverview = () => (
    <main className="dashboard">
      <section className="hero-section">
        <div>
          <div className="eyebrow">
            MERCHANT OVERVIEW
          </div>

          <h1>Recovery Dashboard</h1>

          <p className="hero-text">
            AI-powered recovery decisions with policy
            guardrails.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchRecoveryData}
          disabled={loading}
        >
          ↻ {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </section>

      {error && (
        <div className="notification error">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">↘</div>
          <div>
            <p>Failed Payments</p>
            <h2>{loading ? '...' : opportunities.length}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">◎</div>
          <div>
            <p>Recovery Opportunities</p>
            <h2>
              {loading ? '...' : opportunities.length}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">↗</div>
          <div>
            <p>Recovery Rate</p>
            <h2>
              {loading
                ? '...'
                : `${stats.recoveryRate}%`}
            </h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">₹</div>
          <div>
            <p>Expected Recovery</p>
            <h2>
              {loading
                ? '...'
                : formatCurrency(
                    stats.expectedRecovery
                  )}
            </h2>
          </div>
        </div>
      </section>

      <section className="overview-actions">
        <div className="overview-card">
          <div className="eyebrow">AI RECOVERY ENGINE</div>
          <h2>Revenue intelligence, in motion.</h2>
          <p>
            RecoverAI continuously evaluates failed
            transactions against risk, recovery probability
            and merchant policy.
          </p>

          <button
            className="primary-button"
            onClick={() => setPage('queue')}
          >
            Open Recovery Queue →
          </button>
        </div>

        <div className="overview-card">
          <div className="eyebrow">SYSTEM STATUS</div>

          <div className="system-large">
            <span className="status-dot" />
            AI Engine Online
          </div>

          <p>Recovery model: recovery-v1</p>

          <div className="metric-row">
            <span>Active opportunities</span>
            <strong>{opportunities.length}</strong>
          </div>

          <div className="metric-row">
            <span>Policy guardrails</span>
            <strong className="enabled">
              Enabled
            </strong>
          </div>

          <div className="metric-row">
            <span>Automation</span>
            <strong className="enabled">
              Active
            </strong>
          </div>
        </div>
      </section>
    </main>
  );

  const handleManualReview = () => {
    if (!selectedTransaction) return;

    const updated = {
      ...selectedTransaction,
      status: 'manual_review',
      recommendedAction: 'manual_review',
    };

    setSelectedTransaction(updated);

    setOpportunities((prev) =>
      prev.map((item) =>
        item._id === updated._id ? updated : item
      )
    );
  };

  const handleStopRecovery = async () => {
    if (!selectedTransaction) return;

    try {
      const token = localStorage.getItem('token');

      const transactionId =
        selectedTransaction.transactionId?._id ||
        selectedTransaction.transactionId;

      const recoveryOpportunityId =
        selectedTransaction._id;

      console.log('STOPPING RECOVERY:', {
        transactionId,
        recoveryOpportunityId,
      });

      if (!transactionId || !recoveryOpportunityId) {
        throw new Error(
          'Transaction ID or Recovery Opportunity ID is missing'
        );
      }

      const response = await fetch(
        `${API_URL}/recovery/stop`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transactionId,
            recoveryOpportunityId,
          }),
        }
      );

      const result = await response.json();

      console.log('STOP RECOVERY RESULT:', result);

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Stop recovery failed'
        );
      }

      console.log('RECOVERY STOPPED SUCCESSFULLY');

      await fetchRecoveryData();

      setSelectedTransaction(null);
      setPage('queue');

    } catch (err) {
      console.error('STOP RECOVERY ERROR:', err);
      alert(err.message);
    }
  };

  const handleExecuteRecovery = async () => {
    if (!selectedTransaction) return;

    try {
      const token = localStorage.getItem('token');

      console.log(
        'EXECUTING RECOVERY:',
        selectedTransaction
      );

      const transactionId =
        selectedTransaction.transactionId?._id;

      const recoveryOpportunityId =
        selectedTransaction._id;

      // 1. Execute recovery
      const executeResponse = await fetch(
        `${API_URL}/recovery/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transactionId,
            recoveryOpportunityId,
          }),
        }
      );

      const executeResult =
        await executeResponse.json();

      console.log(
        'EXECUTE RESULT:',
        executeResult
      );

      if (
        !executeResponse.ok ||
        !executeResult.success
      ) {
        throw new Error(
          executeResult.message ||
            'Recovery execution failed'
        );
      }

      // 2. Simulate successful payment
      const successResponse = await fetch(
        `${API_URL}/payments/simulate-success`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transactionId,
            recoveryOpportunityId,
            amount:
              selectedTransaction.transactionId?.amount ||
              selectedTransaction.amount ||
              0,
          }),
        }
      );

      const successResult =
        await successResponse.json();

      console.log(
        'SUCCESS RESULT:',
        successResult
      );

      if (
        !successResponse.ok ||
        !successResult.success
      ) {
        throw new Error(
          successResult.message ||
            'Payment recovery confirmation failed'
        );
      }

      console.log(
        'RECOVERY COMPLETED SUCCESSFULLY'
      );

      await fetchRecoveryData();

      setSelectedTransaction(null);
      setPage('queue');

    } catch (err) {
      console.error(
        'RECOVERY FLOW ERROR:',
        err
      );

      alert(err.message);
    }
  };

  const renderInvestigation = () => {
    console.log("INVESTIGATION RENDERED", selectedTransaction);

    if (!selectedTransaction) {
      return renderQueue();
    }

    const item = selectedTransaction;

    const probability = Math.round(
      Number(item.recoveryProbability || 0) * 100
    );

    const risk = Number(item.riskScore || 0);

    return (
      <main className="dashboard investigation-page">
        <button
          className="back-button"
          onClick={() => setPage('queue')}
        >
          ← Back to Recovery Queue
        </button>

        <section className="investigation-header">
          <div>
            <div className="eyebrow">
              TRANSACTION INVESTIGATION
            </div>

            <h1>{getTransactionId(item)}</h1>

            <p className="hero-text">
              {getFailureReason(item)}
            </p>
          </div>

          <span className={`risk ${getRiskLevel(risk)}`}>
            Risk {risk}/100
          </span>
        </section>

        <section className="investigation-grid">
          <div>
            <div className="ai-analysis panel">
              <div className="eyebrow">
                ✦ AI ANALYSIS
              </div>

              <h2>
                AI DECISION:{' '}
                {item.recommendedAction ||
                  'REVIEW'}
              </h2>

              <p>
                RecoverAI evaluated this transaction using
                payment failure signals, risk score,
                recovery probability and configured
                merchant guardrails.
              </p>

              <div className="decision-factors">
                <div>
                  <span>Risk Score</span>
                  <strong>{risk}/100</strong>
                </div>

                <div>
                  <span>Recovery Probability</span>
                  <strong>{probability}%</strong>
                </div>

                <div>
                  <span>Expected Recovery</span>
                  <strong>
                    {formatCurrency(
                      item.expectedRecoveryValue
                    )}
                  </strong>
                </div>
              </div>
            </div>

            <div className="panel guardrail-panel">
              <div className="eyebrow">
                MERCHANT GUARDRAILS
              </div>

              <div className="guardrails">
                <div>
                  <span>MAX RISK</span>
                  <strong>
                    Actual: {risk}
                  </strong>
                  <small>✓ Passed</small>
                </div>

                <div>
                  <span>MIN PROBABILITY</span>
                  <strong>
                    Actual: {probability}%
                  </strong>
                  <small>✓ Passed</small>
                </div>

                <div>
                  <span>MAX RETRIES</span>
                  <strong>
                    {item.attempts || 0}/
                    {item.maxAttempts || 2}
                  </strong>
                  <small>✓ Passed</small>
                </div>
              </div>

              <div className="permission-banner">
                {item.status === 'recovered'
                  ? '✓ RECOVERY COMPLETED'
                  : item.status === 'in_progress'
                    ? '◉ RECOVERY IN PROGRESS'
                    : item.status === 'manual_review'
                      ? '⚠ MANUAL REVIEW'
                      : item.status === 'stopped'
                        ? '■ RECOVERY STOPPED'
                        : '◉ AUTOMATIC RECOVERY PERMITTED'}
              </div>
            </div>
          </div>

          <aside>
            <div className="panel recommendation-card">
              <div className="eyebrow">
                RECOMMENDED ACTION
              </div>

              <h2>
                ↻{' '}
                {item.recommendedAction ||
                  'Review'}
              </h2>

              <p>Expected recovery</p>

              <strong>
                {formatCurrency(
                  item.expectedRecoveryValue
                )}
              </strong>

              <p>Confidence</p>

              <strong>{probability}%</strong>

              {(item.status === 'ready' ||
                item.status === 'manual_review') && (
                <>
                  <button
                    className="primary-button"
                    onClick={handleExecuteRecovery}
                  >
                    Approve Recovery
                  </button>

                  {item.status === 'ready' && (
                    <button
                      className="secondary-button"
                      onClick={handleManualReview}
                    >
                      Manual Review
                    </button>
                  )}

                  <button
                    className="danger-button"
                    onClick={handleStopRecovery}
                  >
                    Stop Recovery
                  </button>
                </>
              )}

              {item.status === 'in_progress' && (
                <button className="primary-button" disabled>
                  Recovery In Progress...
                </button>
              )}

              {item.status === 'recovered' && (
                <button className="primary-button" disabled>
                  ✓ Recovery Completed
                </button>
              )}

              {item.status === 'stopped' && (
                <button className="danger-button" disabled>
                  ■ Recovery Stopped
                </button>
              )}

            </div>

            <div className="panel timeline">
              <div className="eyebrow">
                AUDIT TIMELINE
              </div>

              <div className="timeline-item">
                <strong>
                  Payment Failed
                </strong>
                <span>
                  {getFailureReason(item)}
                </span>
              </div>

              <div className="timeline-item">
                <strong>
                  Risk Calculated
                </strong>
                <span>{risk}/100</span>
              </div>

              <div className="timeline-item">
                <strong>
                  Recovery Probability Calculated
                </strong>
                <span>{probability}%</span>
              </div>

              <div className="timeline-item">
                <strong>
                  AI Recommendation
                </strong>
                <span>
                  {item.recommendedAction ||
                    'Review'}
                </span>
              </div>
            </div>
          </aside>
        </section>
      </main>
    );
  };

  const renderPlaceholder = (title, description) => (
    <main className="dashboard placeholder-page">
      <div className="eyebrow">
        RECOVERAI WORKSPACE
      </div>

      <h1>{title}</h1>

      <p className="hero-text">
        {description}
      </p>

      <div className="placeholder-card panel">
        <div className="ai-icon">✦</div>
        <h2>Coming next</h2>
        <p>
          This screen will be implemented using the
          Stitch reference you provided.
        </p>
      </div>
    </main>
  );

  const renderPolicies = () => (
    <main className="page-container">
      <div className="page-header">
        <div>
          <span className="eyebrow">POLICY CONTROL</span>
          <h1>Recovery Policies</h1>
          <p>
            Define how much autonomy RecoverAI has when recovering revenue.
          </p>
        </div>
      </div>

      <section className="policy-grid">

        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <span className="eyebrow">AUTOMATION</span>
              <h2>Automatic Recovery</h2>
            </div>

            <span className="status-badge active">ACTIVE</span>
          </div>

          <p>
            Allow RecoverAI to automatically retry eligible failed payments
            when policy conditions are satisfied.
          </p>

          <div className="policy-row">
            <span>Automatic retries</span>
            <span className="policy-value">Enabled</span>
          </div>

          <div className="policy-row">
            <span>Maximum attempts</span>
            <span className="policy-value">2</span>
          </div>

          <div className="policy-row">
            <span>Minimum recovery probability</span>
            <span className="policy-value">80%</span>
          </div>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <span className="eyebrow">RISK CONTROL</span>
              <h2>Risk Guardrails</h2>
            </div>

            <span className="status-badge active">ENABLED</span>
          </div>

          <p>
            Prevent aggressive recovery actions when transaction risk is too
            high or the recovery probability is too low.
          </p>

          <div className="policy-row">
            <span>Maximum risk score</span>
            <span className="policy-value">40/100</span>
          </div>

          <div className="policy-row">
            <span>High-value review</span>
            <span className="policy-value">Required</span>
          </div>

          <div className="policy-row">
            <span>Policy enforcement</span>
            <span className="policy-value">Active</span>
          </div>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <span className="eyebrow">RECOVERY STRATEGY</span>
              <h2>Recovery Actions</h2>
            </div>
          </div>

          <div className="policy-row">
            <span>Retry payment</span>
            <span className="status-badge active">ALLOWED</span>
          </div>

          <div className="policy-row">
            <span>Smart routing</span>
            <span className="status-badge active">ALLOWED</span>
          </div>

          <div className="policy-row">
            <span>Customer recovery</span>
            <span className="status-badge active">ALLOWED</span>
          </div>

          <div className="policy-row">
            <span>Manual intervention</span>
            <span className="status-badge">REVIEW</span>
          </div>
        </div>

        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <span className="eyebrow">MODEL CONTROL</span>
              <h2>AI Decision Policy</h2>
            </div>

            <span className="status-badge active">ACTIVE</span>
          </div>

          <p>
            Recovery decisions are evaluated against transaction risk,
            recovery probability and merchant policy.
          </p>

          <div className="policy-row">
            <span>Recovery model</span>
            <span className="policy-value">recovery-v1</span>
          </div>

          <div className="policy-row">
            <span>Policy checks</span>
            <span className="policy-value">3</span>
          </div>

          <div className="policy-row">
            <span>Human approval</span>
            <span className="policy-value">High-risk only</span>
          </div>
        </div>

      </section>
    </main>
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <div className="app">
              {renderNavbar()}

              {page === 'overview' && renderOverview()}
              {page === 'queue' && renderQueue()}
              {page === 'investigation' && renderInvestigation()}
              {page === 'recovery-queue' && <RecoveryQueue />}
              
              {page === 'analytics' && <RecoveryAnalytics />}
              {page === 'policies' && renderPolicies()}
              {page === 'audit' && <AuditLog />}
            </div>
          }
        />

        <Route
          path="/recovery-queue"
          element={
            <div className="app">
              {renderNavbar()}
              <RecoveryQueue />
            </div>
          }
        />
        <Route
          path="/investigation/:id"
          element={
            <div className="app">
              {renderNavbar()}
              <Investigation />
            </div>
          }
        />
        <Route
          path="/analytics"
          element={
            <div className="app">
              {renderNavbar()}
              <RecoveryAnalytics />
            </div>
          }
        />
        <Route
          path="/audit-log"
          element={
            <div className="app">
              {renderNavbar()}
              <AuditLog />
            </div>
          }
        />
      </Routes>

      <PaymentDemoModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentTriggered={() => {
          fetchRecoveryData();
        }}
      />
    </>
  );
}

export default App;