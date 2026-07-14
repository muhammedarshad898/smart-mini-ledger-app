import { Badge, Card, Col, ProgressBar, Row, Spinner } from 'react-bootstrap';
import { capitalize, formatCurrency } from '../../utils/formatters.js';

const RISK_CONFIG = {
  safe: {
    badge: 'success',
    progress: 28,
    label: 'Safe',
  },
  watch: {
    badge: 'warning',
    progress: 62,
    label: 'Watch',
  },
  risky: {
    badge: 'danger',
    progress: 92,
    label: 'Risky',
  },
};

function formatProjection(days) {
  if (days === null || days === undefined) {
    return 'No runway risk';
  }

  if (days === 0) {
    return 'Already negative';
  }

  return `${days} day${days === 1 ? '' : 's'}`;
}

export function SpendingRiskMeter({ insights, isLoading }) {
  const riskLevel = insights?.riskLevel || 'safe';
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.safe;
  const anomalies = insights?.anomalies || [];

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body>
        <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="h5 mb-0">Smart Spending Risk Meter</h3>
              <Badge bg={config.badge}>{config.label}</Badge>
            </div>
            <p className="text-muted mb-0">
              {isLoading ? 'Reading recent spending patterns...' : insights?.message}
            </p>
          </div>
          {isLoading && <Spinner animation="border" size="sm" />}
        </div>

        <ProgressBar
          now={config.progress}
          variant={config.badge}
          className="spending-risk-meter__bar mb-3"
        />

        <Row className="g-3">
          <Col md={3}>
            <div className="spending-risk-meter__metric">
              <span className="text-muted small">Daily expense avg</span>
              <strong>{formatCurrency(insights?.dailyExpenseAverage || 0)}</strong>
            </div>
          </Col>
          <Col md={3}>
            <div className="spending-risk-meter__metric">
              <span className="text-muted small">Projected Safe Days</span>
              <strong>{formatProjection(insights?.projectedDaysUntilNegative)}</strong>
            </div>
          </Col>
          <Col md={3}>
            <div className="spending-risk-meter__metric">
              <span className="text-muted small">Top category</span>
              <strong>{capitalize(insights?.topExpenseCategory) || 'None'}</strong>
            </div>
          </Col>
          <Col md={3}>
            <div className="spending-risk-meter__metric">
              <span className="text-muted small">30-day expenses</span>
              <strong>{formatCurrency(insights?.recentExpenseTotal || 0)}</strong>
            </div>
          </Col>
        </Row>

        {anomalies.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <p className="small fw-semibold mb-2">Unusual recent expenses</p>
            <div className="d-flex flex-column gap-2">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="d-flex justify-content-between align-items-center gap-3 small"
                >
                  <span className="text-muted">{anomaly.message}</span>
                  <strong>{formatCurrency(anomaly.amount)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
