const Transaction = require('../models/Transaction');
const Settings = require('../models/Settings');
const { sendAlertEmail } = require('../utils/mailer');

async function calculateBalance() {
  const [summary] = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        income: {
          $sum: {
            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
          },
        },
        expense: {
          $sum: {
            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        balance: { $subtract: ['$income', '$expense'] },
      },
    },
  ]);

  return summary?.balance || 0;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getRiskLevel({ balance, dailyExpenseAverage, projectedDaysUntilNegative }) {
  if (balance < 0 || projectedDaysUntilNegative <= 7) {
    return 'risky';
  }

  if (dailyExpenseAverage > 0 && projectedDaysUntilNegative <= 14) {
    return 'watch';
  }

  return 'safe';
}

function buildInsightMessage({
  riskLevel,
  dailyExpenseAverage,
  projectedDaysUntilNegative,
  topExpenseCategory,
}) {
  if (riskLevel === 'risky') {
    return projectedDaysUntilNegative === 0
      ? 'Balance is already negative. Pause non-essential expenses first.'
      : `At this pace, balance may go negative in ${projectedDaysUntilNegative} days.`;
  }

  if (riskLevel === 'watch') {
    return `Spending pace needs attention, especially ${topExpenseCategory || 'recent expenses'}.`;
  }

  if (dailyExpenseAverage === 0) {
    return 'No recent expenses yet. Add transactions to unlock smarter insights.';
  }

  return 'Cashflow looks stable based on the last 30 days.';
}

function buildExpenseAnomalies(recentExpenses, categoryAverages) {
  return recentExpenses
    .filter((transaction) => {
      const categoryAverage = categoryAverages.get(transaction.category);
      return categoryAverage && transaction.amount >= categoryAverage * 2 && transaction.amount > 1000;
    })
    .slice(0, 3)
    .map((transaction) => ({
      id: transaction.id,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      message: `${transaction.category} spend is unusually high vs your recent average`,
    }));
}

function buildAlertMessage(transaction, alertReasons, balance) {
  return [
    'Smart Mini-Ledger alert',
    '',
    `Triggered condition: ${alertReasons.join(', ')}`,
    `Amount: ${transaction.amount}`,
    `Category: ${transaction.category}`,
    `Date: ${transaction.date.toISOString().split('T')[0]}`,
    `Type: ${transaction.type}`,
    `Current balance: ${balance}`,
  ].join('\n');
}

async function sendTransactionAlert(transaction, alertReasons, balance) {
  const settings = await Settings.findOne();

  if (!settings?.notifyEmail) {
    console.log('No notification email configured');
    return;
  }

  const subject = 'Smart Mini-Ledger Alert';
  const message = buildAlertMessage(transaction, alertReasons, balance);

  await sendAlertEmail(settings.notifyEmail, subject, message);
}

function buildFilterQuery({ search, type, category }) {
  const query = {};

  if (type && type !== 'all') {
    query.type = type;
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { note: searchRegex },
      { category: searchRegex },
      { type: searchRegex },
    ];
  }

  return query;
}

function parseTransactionInput(body) {
  const { title, amount, type, category, date, note } = body;

  return {
    title: title?.trim(),
    amount: Number(amount),
    type,
    category,
    date: date ? new Date(date) : undefined,
    note: note?.trim() || '',
  };
}

function validateTransactionInput(data) {
  const errors = [];

  if (!data.title) {
    errors.push('Title is required');
  }

  if (!data.amount || Number.isNaN(data.amount) || data.amount <= 0) {
    errors.push('Amount must be a number greater than 0');
  }

  if (!data.type) {
    errors.push('Type is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.date || Number.isNaN(data.date.getTime())) {
    errors.push('A valid date is required');
  }

  return errors;
}

exports.getAllTransactions = async (req, res) => {
  try {
    const filter = buildFilterQuery(req.query);
    const transactions = await Transaction.find(filter).sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: 'Transactions fetched successfully',
      data: transactions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction fetched successfully',
      data: transaction,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid transaction id' });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    const parsedInput = parseTransactionInput(req.body);
    const validationErrors = validateTransactionInput(parsedInput);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const transaction = await Transaction.create(parsedInput);
    const balance = await calculateBalance();
    const alertReasons = [];

    if (transaction.type === 'expense' && transaction.amount > 5000) {
      alertReasons.push('large expense');
    }

    if (balance < 0) {
      alertReasons.push('negative balance');
    }

    const alertTriggered = alertReasons.length > 0;

    if (alertTriggered) {
      try {
        await sendTransactionAlert(transaction, alertReasons, balance);
      } catch (emailError) {
        console.error('Failed to send alert email:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
      alertTriggered,
      alertReasons,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const parsedInput = parseTransactionInput(req.body);
    const validationErrors = validateTransactionInput(parsedInput);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      parsedInput,
      { new: true, runValidators: true },
    );

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid transaction id' });
    }

    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: transaction,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid transaction id' });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [summary] = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          income: 1,
          expense: 1,
          balance: { $subtract: ['$income', '$expense'] },
        },
      },
    ]);

    const result = summary || { income: 0, expense: 0, balance: 0 };

    res.status(200).json({
      success: true,
      message: 'Summary fetched successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInsights = async (_req, res) => {
  try {
    const today = startOfDay(new Date());
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const [summary] = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
        },
      },
    ]);

    const recentExpenseStats = await Transaction.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          average: { $avg: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const recentExpenses = await Transaction.find({
      type: 'expense',
      date: { $gte: thirtyDaysAgo },
    })
      .sort({ date: -1, amount: -1 })
      .limit(20);

    const totalIncome = summary?.income || 0;
    const totalExpense = summary?.expense || 0;
    const balance = totalIncome - totalExpense;
    const recentExpenseTotal = recentExpenseStats.reduce(
      (total, category) => total + category.total,
      0,
    );
    const dailyExpenseAverage = recentExpenseTotal / 30;
    const projectedDaysUntilNegative =
      balance < 0
        ? 0
        : dailyExpenseAverage > 0
          ? Math.ceil(balance / dailyExpenseAverage)
          : null;
    const topExpenseCategory = recentExpenseStats[0]?._id || null;
    const categoryAverages = new Map(
      recentExpenseStats.map((category) => [category._id, category.average]),
    );
    const anomalies = buildExpenseAnomalies(recentExpenses, categoryAverages);
    const riskLevel = getRiskLevel({
      balance,
      dailyExpenseAverage,
      projectedDaysUntilNegative,
    });

    const insights = {
      riskLevel,
      balance,
      dailyExpenseAverage,
      projectedDaysUntilNegative,
      topExpenseCategory,
      recentExpenseTotal,
      anomalies,
      message: buildInsightMessage({
        riskLevel,
        dailyExpenseAverage,
        projectedDaysUntilNegative,
        topExpenseCategory,
      }),
    };

    res.status(200).json({
      success: true,
      message: 'Insights fetched successfully',
      data: insights,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
