import { Badge, Button, Table } from 'react-bootstrap';
import { capitalize, formatCurrency, formatDate } from '../../utils/formatters.js';

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
  isFiltered = false,
}) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p className="mb-1 fw-semibold">
          {isFiltered ? 'No matching transactions' : 'No transactions yet'}
        </p>
        <p className="mb-0 small">
          {isFiltered
            ? 'Try adjusting your search or filters.'
            : 'Add your first income or expense to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Category</th>
            <th>Type</th>
            <th className="text-end">Amount</th>
            <th>Note</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{formatDate(transaction.date)}</td>
              <td className="fw-semibold">{transaction.title}</td>
              <td>{capitalize(transaction.category)}</td>
              <td>
                <Badge
                  bg={transaction.type === 'income' ? 'success' : 'danger'}
                  className="text-uppercase"
                >
                  {transaction.type}
                </Badge>
              </td>
              <td
                className={`text-end fw-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-danger'
                }`}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </td>
              <td className="text-muted">{transaction.note || '—'}</td>
              <td className="text-end">
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(transaction)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
