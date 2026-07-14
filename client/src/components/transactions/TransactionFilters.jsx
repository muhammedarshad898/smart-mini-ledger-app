import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { TRANSACTION_CATEGORIES, TRANSACTION_TYPES } from '../../types/transaction.js';
import { capitalize } from '../../utils/formatters.js';

export function TransactionFilters({
  search,
  type,
  category,
  onSearchChange,
  onTypeChange,
  onCategoryChange,
  onClear,
  hasActiveFilters,
}) {
  return (
    <div className="transaction-filters p-3 border-bottom bg-light">
      <Row className="g-3 align-items-end">
        <Col md={5}>
          <Form.Label htmlFor="transactionSearch" className="small text-muted mb-1">
            Search
          </Form.Label>
          <InputGroup>
            <Form.Control
              id="transactionSearch"
              type="search"
              placeholder="Search by title, note, or category..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </InputGroup>
        </Col>

        <Col md={3}>
          <Form.Label htmlFor="transactionTypeFilter" className="small text-muted mb-1">
            Type
          </Form.Label>
          <Form.Select
            id="transactionTypeFilter"
            value={type}
            onChange={(event) => onTypeChange(event.target.value)}
          >
            <option value="all">All types</option>
            {TRANSACTION_TYPES.map((transactionType) => (
              <option key={transactionType} value={transactionType}>
                {capitalize(transactionType)}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Label htmlFor="transactionCategoryFilter" className="small text-muted mb-1">
            Category
          </Form.Label>
          <Form.Select
            id="transactionCategoryFilter"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="all">All categories</option>
            {TRANSACTION_CATEGORIES.map((transactionCategory) => (
              <option key={transactionCategory} value={transactionCategory}>
                {capitalize(transactionCategory)}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col md={1} className="d-grid">
          <Button
            variant="outline-secondary"
            onClick={onClear}
            disabled={!hasActiveFilters}
            title="Clear filters"
          >
            Clear
          </Button>
        </Col>
      </Row>
    </div>
  );
}
