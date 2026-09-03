import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const API_URL = 'http://localhost:5000/api';

function RecoveryQueue() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

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
      console.error('Recovery Queue error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecoveryData();
  }, []);

  const getTransactionId = (item) =>
    item.transactionId?.razorpayOrderId ||
    item.transactionId?._id ||
    item._id;

  const getFailureReason = (item) =>
    item.transactionId?.failureReason || 'Payment failure';

  const getStatus = (item) => {
    if (item.status === 'recovered') return 'RECOVERED';
    if (item.status === 'in_progress') return 'IN PROGRESS';

    if (
      item.recommendedAction?.toLowerCase().includes('manual')
    ) {
      return 'MANUAL REVIEW';
    }

    return 'READY';
  };

  const getRiskLevel = (risk) => {
    if (risk <= 30) return 'LOW';
    if (risk <= 60) return 'MED';
    return 'HIGH';
  };

  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities];

    if (activeFilter === 'READY') {
      result = result.filter(
        (item) => getStatus(item) === 'READY'
      );
    }

    if (activeFilter === 'AT RISK') {
      result = result.filter(
        (item) => item.riskScore > 60
      );
    }

    if (activeFilter === 'HIGH VALUE') {
      result = result.filter(
        (item) => (item.expectedRecoveryValue || 0) >= 10000
      );
    }

    if (activeFilter === 'MANUAL REVIEW') {
      result = result.filter((item) =>
        item.recommendedAction
          ?.toLowerCase()
          .includes('manual')
      );
    }

    if (activeFilter === 'RECOVERED') {
      result = result.filter(
        (item) => item.status === 'recovered'
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((item) => {
        const transaction = getTransactionId(item);
        const failure = getFailureReason(item);
        const action = item.recommendedAction || '';

        return (
          transaction?.toLowerCase().includes(query) ||
          failure.toLowerCase().includes(query) ||
          action.toLowerCase().includes(query)
        );
      });
    }

    result.sort((a, b) => {
      const aValue = a.expectedRecoveryValue || 0;
      const bValue = b.expectedRecoveryValue || 0;

      return sortAsc
        ? bValue - aValue
        : aValue - bValue;
    });

    return result;
  }, [
    opportunities,
    activeFilter,
    search,
    sortAsc,
  ]);

  const totalRecoverable = opportunities.reduce(
    (total, item) =>
      total + (item.expectedRecoveryValue || 0),
    0
  );

  const highConfidence = opportunities.filter(
    (item) => item.recoveryProbability >= 0.8
  ).length;

  const recovered = opportunities.filter(
    (item) => item.status === 'recovered'
  ).length;

  const recoveryRate =
    opportunities.length > 0
      ? Math.round(
          (recovered / opportunities.length) * 100
        )
      : 0;

  return (
    <div className="queue-page">

      {/* HERO */}

      <section className="queue-hero">

        <div>
          <div className="eyebrow">
            RECOVERY OPERATIONS
          </div>

          <h1>Recovery Queue</h1>

          <p className="hero-text">
            Prioritize the revenue opportunities most
            worth recovering.
          </p>
        </div>

        <div className="priority-card">

          <div className="priority-label">
            ✦ AI PRIORITY INSIGHT
          </div>

          <strong>
            {opportunities.length} opportunities represent
            ₹{totalRecoverable.toLocaleString('en-IN')}
          </strong>

          <p>
            Recommended focus: low-risk failures with
            recovery probability above 80%.
          </p>

          <Link to="/analytics">
            View analysis →
          </Link>

        </div>

      </section>

      {/* SUMMARY */}

      <section className="queue-summary">

        <div className="summary-item">
          <strong>
            ₹{totalRecoverable.toLocaleString('en-IN')}
          </strong>
          <span>RECOVERABLE</span>
        </div>

        <div className="summary-item">
          <strong>{opportunities.length}</strong>
          <span>OPPORTUNITIES</span>
        </div>

        <div className="summary-item">
          <strong>{highConfidence}</strong>
          <span>HIGH-CONFIDENCE</span>
        </div>

        <div className="summary-item">
          <strong>{recoveryRate}%</strong>
          <span>RECOVERY RATE</span>
        </div>

      </section>

      {/* FILTER BAR */}

      <section className="queue-toolbar">

        <div className="filter-buttons">

          {[
            'ALL',
            'READY',
            'AT RISK',
            'HIGH VALUE',
            'MANUAL REVIEW',
            'RECOVERED',
          ].map((filter) => (
            <button
              key={filter}
              className={
                activeFilter === filter
                  ? 'filter-button active'
                  : 'filter-button'
              }
              onClick={() =>
                setActiveFilter(filter)
              }
            >
              {filter}

              {filter === 'ALL' && (
                <span>{opportunities.length}</span>
              )}
            </button>
          ))}

        </div>

        <div className="queue-tools">

          <input
            type="text"
            placeholder="Search transaction..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            className="tool-button"
            onClick={() =>
              setActiveFilter(
                activeFilter === 'AT RISK'
                  ? 'ALL'
                  : 'AT RISK'
              )
            }
          >
            Filter
          </button>

          <button
            className="tool-button"
            onClick={() =>
              setSortAsc((value) => !value)
            }
          >
            Sort {sortAsc ? '↓' : '↑'}
          </button>

        </div>

      </section>

      {/* ERROR */}

      {error && (
        <div className="notification error">
          {error}
        </div>
      )}

      {/* TABLE */}

      <section className="queue-table-panel">

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

                filteredOpportunities.map(
                  (item, index) => {

                    const risk =
                      item.riskScore || 0;

                    const probability =
                      Math.round(
                        (item.recoveryProbability || 0) *
                          100
                      );

                    const riskLevel =
                      getRiskLevel(risk);

                    const status =
                      getStatus(item);

                    const transactionId =
                      getTransactionId(item);

                    const amount =
                      item.transactionId?.amount ||
                      item.amount ||
                      0;

                    const attempts =
                      item.attempts ??
                      item.transactionId?.attempts ??
                      0;

                    const maxAttempts =
                      item.maxAttempts || 2;

                    return (
                      <tr
                        key={item._id}
                        className="queue-row"
                      >

                        <td>
                          <span className="priority-number">
                            {index + 1}
                          </span>
                        </td>

                        <td>

                          <Link
                            to={`/investigation/${item._id}`}
                            className="transaction-link"
                          >
                            {transactionId}
                          </Link>

                          <div className="failure-reason">
                            {getFailureReason(item)}
                          </div>

                        </td>

                        <td>
                          <strong>
                            ₹
                            {Number(
                              amount
                            ).toLocaleString('en-IN')}
                          </strong>
                        </td>

                        <td>
                          {getFailureReason(item)}
                        </td>

                        <td>
                          <span
                            className={`risk ${riskLevel.toLowerCase()}`}
                          >
                            {risk}/100
                          </span>
                        </td>

                        <td>

                          <div className="recovery-cell">

                            <strong>
                              {probability}%
                            </strong>

                            <div className="recovery-bar">
                              <div
                                style={{
                                  width: `${probability}%`,
                                }}
                              />
                            </div>

                          </div>

                        </td>

                        <td>
                          <strong>
                            ₹
                            {Number(
                              item.expectedRecoveryValue ||
                                0
                            ).toLocaleString('en-IN')}
                          </strong>
                        </td>

                        <td>

                          <span className="action-badge">
                            {item.recommendedAction ||
                              'Review'}
                          </span>

                        </td>

                        <td>
                          {attempts}/{maxAttempts}
                        </td>

                        <td>

                          <span
                            className={`status-badge ${status
                              .toLowerCase()
                              .replace(' ', '_')}`}
                          >
                            ● {status}
                          </span>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        <div className="table-footer">
          Showing {filteredOpportunities.length} of{' '}
          {opportunities.length} opportunities

          <div>
            <button className="pagination-button">
              Previous
            </button>

            <button className="pagination-button">
              Next
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}

export default RecoveryQueue;