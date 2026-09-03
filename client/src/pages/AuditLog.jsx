import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

const fallbackEvents = [
  {
    id: 'AUD-001',
    time: 'Today, 14:32',
    action: 'Recovery decision',
    transaction: 'order_demo_RX28491',
    decision: 'Retry payment',
    reason: 'Low risk and high recovery probability',
    status: 'Approved',
    type: 'AI Decision',
  },
  {
    id: 'AUD-002',
    time: 'Today, 14:28',
    action: 'Policy check',
    transaction: 'order_demo_RX28491',
    decision: 'Passed',
    reason: 'Risk score 18/100 · Recovery probability 92%',
    status: 'Allowed',
    type: 'Policy Check',
  },
  {
    id: 'AUD-003',
    time: 'Today, 14:25',
    action: 'Recovery decision',
    transaction: 'order_demo_SUCCESS_4250',
    decision: 'Retry payment',
    reason: 'Low risk and high recovery probability',
    status: 'In progress',
    type: 'AI Decision',
  },
  {
    id: 'AUD-004',
    time: 'Today, 14:20',
    action: 'Policy check',
    transaction: 'order_demo_SUCCESS_4250',
    decision: 'Passed',
    reason: 'Risk score 18/100 · Recovery probability 92%',
    status: 'Allowed',
    type: 'Policy Check',
  },
  {
    id: 'AUD-005',
    time: 'Today, 14:12',
    action: 'AI evaluation',
    transaction: 'order_demo_RX28491',
    decision: 'Recovery opportunity detected',
    reason: 'Temporary payment processing failure',
    status: 'Completed',
    type: 'AI Decision',
  },
];

function getToken() {
  return localStorage.getItem('token');
}

function normalizeEvent(event, index) {
  return {
    id:
      event.id ||
      event.eventId ||
      event._id ||
      `AUD-${String(index + 1).padStart(3, '0')}`,

    time:
      event.time ||
      event.timestamp ||
      event.createdAt ||
      'Recently',

    action:
      event.action ||
      event.eventType ||
      event.type ||
      'System event',

    transaction:
      event.transaction ||
      event.transactionId ||
      event.orderId ||
      '—',

    decision:
      event.decision ||
      event.recommendation ||
      event.result ||
      '—',

    reason:
      event.reason ||
      event.message ||
      event.description ||
      '—',

    status:
      event.status ||
      event.outcome ||
      'Recorded',

    type:
      event.type ||
      event.eventType ||
      'AI Decision',
  };
}

function formatTime(value) {
  if (!value) return 'Recently';

  if (
    typeof value === 'string' &&
    (value.startsWith('Today') ||
      value.startsWith('Yesterday'))
  ) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function AuditLog() {
  const [events, setEvents] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getToken();

      const response = await fetch(`${API_BASE}/audit`, {
        headers: {
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();

      const rawEvents = Array.isArray(data)
        ? data
        : data.events ||
          data.auditLogs ||
          data.logs ||
          data.data ||
          [];

      setEvents(
        rawEvents.map((event, index) =>
          normalizeEvent(event, index)
        )
      );
    } catch (err) {
      console.warn(
        'Audit API unavailable. Using available demo audit data.',
        err
      );

      setEvents(fallbackEvents);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events;

    if (activeFilter !== 'All') {
      result = result.filter((event) => {
        if (activeFilter === 'AI Decisions') {
          return (
            event.type
              .toLowerCase()
              .includes('ai') ||
            event.action
              .toLowerCase()
              .includes('decision') ||
            event.action
              .toLowerCase()
              .includes('evaluation')
          );
        }

        if (activeFilter === 'Policy Checks') {
          return (
            event.type
              .toLowerCase()
              .includes('policy') ||
            event.action
              .toLowerCase()
              .includes('policy')
          );
        }

        if (activeFilter === 'Recovery Actions') {
          return (
            event.action
              .toLowerCase()
              .includes('recovery') ||
            event.decision
              .toLowerCase()
              .includes('retry')
          );
        }

        return true;
      });
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((event) =>
        [
          event.id,
          event.action,
          event.transaction,
          event.decision,
          event.reason,
          event.status,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
    }

    return result;
  }, [events, activeFilter, search]);

  const aiDecisionCount = events.filter((event) =>
    event.type.toLowerCase().includes('ai') ||
    event.action.toLowerCase().includes('decision') ||
    event.action.toLowerCase().includes('evaluation')
  ).length;

  const policyCheckCount = events.filter((event) =>
    event.type.toLowerCase().includes('policy') ||
    event.action.toLowerCase().includes('policy')
  ).length;

  const successfulChecks = events.filter((event) =>
    ['allowed', 'approved', 'passed', 'completed'].some(
      (status) =>
        event.status.toLowerCase().includes(status) ||
        event.decision.toLowerCase().includes(status)
    )
  ).length;

  const successRate =
    events.length > 0
      ? Math.round((successfulChecks / events.length) * 100)
      : 0;

  return (
    <main className="page audit-page">
      {/* PAGE HEADER */}
      <section className="page-header">
        <div>
          <div className="eyebrow">
            COMPLIANCE & TRACEABILITY
          </div>

          <h1>Audit Log</h1>

          <p>
            Every AI decision, policy check and recovery
            action is recorded.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadEvents}
          disabled={loading}
        >
          {loading ? 'Loading...' : '↻ Refresh'}
        </button>
      </section>

      {/* STAT CARDS */}
      <section className="audit-stats">
        <div className="audit-stat">
          <div className="audit-stat-icon">◈</div>

          <div className="audit-stat-content">
            <span>Total events</span>
            <strong>{events.length}</strong>
          </div>
        </div>

        <div className="audit-stat">
          <div className="audit-stat-icon">✦</div>

          <div className="audit-stat-content">
            <span>AI decisions</span>
            <strong>{aiDecisionCount}</strong>
          </div>
        </div>

        <div className="audit-stat">
          <div className="audit-stat-icon">✓</div>

          <div className="audit-stat-content">
            <span>Policy checks</span>
            <strong>{policyCheckCount}</strong>
          </div>
        </div>

        <div className="audit-stat">
          <div className="audit-stat-icon">↗</div>

          <div className="audit-stat-content">
            <span>Successful checks</span>
            <strong>{successRate}%</strong>
          </div>
        </div>
      </section>

      {/* ACTIVITY */}
      <section className="audit-activity">
        <div className="audit-activity-header">
          <div className="section-label">
            ACTIVITY
          </div>

          <h2>Decision History</h2>
        </div>

        {/* FILTER BAR */}
        <div className="audit-toolbar">
          <div className="audit-tabs">
            {[
              'All',
              'AI Decisions',
              'Policy Checks',
              'Recovery Actions',
            ].map((filter) => (
              <button
                key={filter}
                className={
                  activeFilter === filter
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveFilter(filter)
                }
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="audit-search">
            <input
              type="text"
              placeholder="Search audit events..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>EVENT</th>
                <th>TIME</th>
                <th>ACTION</th>
                <th>TRANSACTION</th>
                <th>DECISION</th>
                <th>REASON</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="audit-empty"
                  >
                    Loading audit events...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="audit-empty"
                  >
                    No audit events found.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className="audit-event-id">
                        {event.id}
                      </span>
                    </td>

                    <td className="audit-time">
                      {formatTime(event.time)}
                    </td>

                    <td>
                      <span className="audit-action">
                        {event.action}
                      </span>
                    </td>

                    <td>
                      <span className="audit-transaction">
                        {event.transaction}
                      </span>
                    </td>

                    <td>
                      <span className="audit-decision">
                        {event.decision}
                      </span>
                    </td>

                    <td>
                      <span className="audit-reason">
                        {event.reason}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`audit-status ${event.status
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        <span className="status-dot" />
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-footer">
          Showing {filteredEvents.length} of{' '}
          {events.length} audit events
        </div>
      </section>
    </main>
  );
}

export default AuditLog;