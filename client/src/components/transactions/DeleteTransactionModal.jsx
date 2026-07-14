import { Button, Modal } from 'react-bootstrap';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export function DeleteTransactionModal({ show, onHide, onConfirm, transaction, isLoading = false }) {
  if (!transaction) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Transaction</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-3">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>

        <div className="delete-preview p-3 rounded">
          <p className="mb-1 fw-semibold">{transaction.title}</p>
          <p className="mb-1 text-muted small">{formatDate(transaction.date)}</p>
          <p
            className={`mb-0 fw-semibold ${
              transaction.type === 'income' ? 'text-success' : 'text-danger'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
