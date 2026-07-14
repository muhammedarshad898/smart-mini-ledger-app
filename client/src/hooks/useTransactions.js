import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllTransactions,
  getTransactionSummary,
  getTransactionInsights,
  createTransaction as apiCreateTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
} from '../services/api';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasLoadedTransactions = useRef(false);

  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      if (!hasLoadedTransactions.current) {
        setLoading(true);
      }
      setError(null);
      const response = await getAllTransactions(filters);
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch transactions:', err);
    } finally {
      hasLoadedTransactions.current = true;
      setLoading(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const response = await getTransactionSummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      setInsightsLoading(true);
      const response = await getTransactionInsights();
      if (response.success) {
        setInsights(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
    fetchInsights();
  }, [fetchTransactions, fetchSummary, fetchInsights]);

  const addTransaction = async (transaction) => {
    try {
      const response = await apiCreateTransaction(transaction);
      if (response.success) {
        setTransactions((prev) => [response.data, ...prev]);
        return {
          transaction: response.data,
          alertTriggered: response.alertTriggered,
          alertReasons: response.alertReasons || [],
        };
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      const response = await apiUpdateTransaction(id, updates);
      if (response.success) {
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === id ? response.data : transaction,
          ),
        );
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await apiDeleteTransaction(id);
      if (response.success) {
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    transactions,
    summary,
    insights,
    loading,
    summaryLoading,
    insightsLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    fetchSummary,
    fetchInsights,
  };
}
