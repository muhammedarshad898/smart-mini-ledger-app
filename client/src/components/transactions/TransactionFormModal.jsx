import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
} from '../../types/transaction.js';
import { capitalize } from '../../utils/formatters.js';
import { validateTransactionForm } from '../../utils/validateTransaction.js';

const EMPTY_FORM = {
  title: '',
  amount: '',
  type: 'expense',
  category: 'food',
  date: new Date().toISOString().split('T')[0],
  note: '',
};

function getDefaultForm() {
  return {
    ...EMPTY_FORM,
    date: new Date().toISOString().split('T')[0],
  };
}

function toFormValues(transaction) {
  // Extract date in YYYY-MM-DD format from ISO string
  const dateStr = transaction.date instanceof Date 
    ? transaction.date.toISOString().split('T')[0]
    : typeof transaction.date === 'string'
      ? transaction.date.split('T')[0]
      : new Date(transaction.date).toISOString().split('T')[0];

  return {
    title: transaction.title,
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    date: dateStr,
    note: transaction.note || '',
  };
}

export function TransactionFormModal({
  show,
  onHide,
  onSubmit,
  transaction = null,
  isLoading = false,
}) {
  const isEditMode = Boolean(transaction);
  const [form, setForm] = useState(getDefaultForm());

  useEffect(() => {
    if (show) {
      setForm(transaction ? toFormValues(transaction) : getDefaultForm());
    }
  }, [show, transaction]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm(getDefaultForm());
    onHide();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = validateTransactionForm(form);

    if (!result.valid) {
      toast.error(result.message);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="transactionTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping"
              required
            />
          </Form.Group>

          <div className="row g-3">
            <div className="col-md-6">
              <Form.Group controlId="transactionAmount">
                <Form.Label>Amount (INR)</Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group controlId="transactionDate">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <Form.Group controlId="transactionType">
                <Form.Label>Type</Form.Label>
                <Form.Select name="type" value={form.type} onChange={handleChange}>
                  {TRANSACTION_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {capitalize(type)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group controlId="transactionCategory">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {capitalize(category)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-0 mt-3" controlId="transactionNote">
            <Form.Label>Note (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="Add a short note..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : isEditMode
                ? 'Update Transaction'
                : 'Save Transaction'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
