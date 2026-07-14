import { useEffect, useState } from 'react';
import { Button, Card, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { DeleteTransactionModal } from '../components/transactions/DeleteTransactionModal.jsx';
import { NotificationSettingsPanel } from '../components/transactions/NotificationSettingsPanel.jsx';
import { SpendingRiskMeter } from '../components/transactions/SpendingRiskMeter.jsx';
import { SummaryCards } from '../components/transactions/SummaryCards.jsx';
import { TransactionFilters } from '../components/transactions/TransactionFilters.jsx';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal.jsx';
import { TransactionTable } from '../components/transactions/TransactionTable.jsx';
import { useTransactions } from '../hooks/useTransactions.js';

export default function HomePage() {
  const {
    transactions,
    summary,
    insights,
    insightsLoading,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    fetchSummary,
    fetchInsights,
  } = useTransactions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch transactions with filters when filter changes
  useEffect(() => {
    const filters = {};
    if (search.trim()) filters.search = search;
    if (typeFilter !== 'all') filters.type = typeFilter;
    if (categoryFilter !== 'all') filters.category = categoryFilter;

    fetchTransactions(filters);
  }, [search, typeFilter, categoryFilter, fetchTransactions]);

  const hasActiveFilters =
    search.trim() !== '' || typeFilter !== 'all' || categoryFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
  };

  const handleEditClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDeleteModal(true);
  };

  const handleAddTransaction = async (newTransaction) => {
    try {
      setIsSubmitting(true);
      const result = await addTransaction(newTransaction);
      toast.success('Transaction added successfully!');

      if (result?.alertTriggered) {
        toast.warning(`Alert triggered: ${result.alertReasons.join(', ')}`);
      }

      setShowAddModal(false);
      await fetchSummary();  // Refresh summary after adding
      await fetchInsights();
    } catch (err) {
      toast.error('Failed to add transaction');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTransaction = async (updates) => {
    if (!selectedTransaction) return;
    try {
      setIsSubmitting(true);
      await updateTransaction(selectedTransaction.id, updates);
      toast.success('Transaction updated successfully!');
      setShowEditModal(false);
      setSelectedTransaction(null);
      await fetchSummary();  // Refresh summary after updating
      await fetchInsights();
    } catch (err) {
      toast.error('Failed to update transaction');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTransaction) return;
    try {
      setIsSubmitting(true);
      await deleteTransaction(selectedTransaction.id);
      toast.success('Transaction deleted successfully!');
      setShowDeleteModal(false);
      setSelectedTransaction(null);
      await fetchSummary();  // Refresh summary after deleting
      await fetchInsights();
    } catch (err) {
      toast.error('Failed to delete transaction');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {error && <Alert variant="danger">Error: {error}</Alert>}

      <section className="mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h2 className="h4 mb-1">Dashboard</h2>
            <p className="text-muted mb-0">
              Overview of your income, expenses, and recent activity.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Add Transaction
          </Button>
        </div>
      </section>

      <SummaryCards summary={summary} />

      <SpendingRiskMeter insights={insights} isLoading={insightsLoading} />

      <NotificationSettingsPanel />

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h3 className="h5 mb-0">All Transactions</h3>
              <small className="text-muted">
                Showing {transactions.length} record
                {transactions.length === 1 ? '' : 's'}
              </small>
            </div>
          </div>
        </Card.Header>

        <TransactionFilters
          search={search}
          type={typeFilter}
          category={categoryFilter}
          onSearchChange={setSearch}
          onTypeChange={setTypeFilter}
          onCategoryChange={setCategoryFilter}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <Card.Body className="p-0">
          <TransactionTable
            transactions={transactions}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            isFiltered={hasActiveFilters}
          />
        </Card.Body>
      </Card>

      <TransactionFormModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddTransaction}
        isLoading={isSubmitting}
      />

      <TransactionFormModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleUpdateTransaction}
        transaction={selectedTransaction}
        isLoading={isSubmitting}
      />

      <DeleteTransactionModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleConfirmDelete}
        transaction={selectedTransaction}
        isLoading={isSubmitting}
      />
    </>
  );
}
