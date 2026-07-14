import { Badge, Card, Col, Row } from 'react-bootstrap';
import { formatCurrency } from '../../utils/formatters.js';

const SUMMARY_ITEMS = [
  {
    key: 'income',
    label: 'Total Income',
    className: 'summary-card summary-card--income',
    badge: 'success',
  },
  {
    key: 'expense',
    label: 'Total Expenses',
    className: 'summary-card summary-card--expense',
    badge: 'danger',
  },
  {
    key: 'balance',
    label: 'Net Balance',
    className: 'summary-card summary-card--balance',
    badge: 'primary',
  },
];

export function SummaryCards({ summary }) {
  return (
    <Row className="g-3 mb-4">
      {SUMMARY_ITEMS.map(({ key, label, className, badge }) => (
        <Col key={key} md={4}>
          <Card className={`h-100 border-0 shadow-sm ${className}`}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <Card.Subtitle className="text-muted mb-0">{label}</Card.Subtitle>
                <Badge bg={badge} pill>
                  {key}
                </Badge>
              </div>
              <Card.Title className="summary-card__amount mb-0">
                {formatCurrency(summary[key])}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
