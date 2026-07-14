export function validateTransactionForm(form) {
  const trimmedTitle = form.title.trim();
  const parsedAmount = Number(form.amount);

  if (!trimmedTitle) {
    return { valid: false, message: 'Please enter a transaction title.' };
  }

  if (!form.amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    return { valid: false, message: 'Please enter a valid amount greater than 0.' };
  }

  if (!form.date) {
    return { valid: false, message: 'Please select a date.' };
  }

  return {
    valid: true,
    data: {
      title: trimmedTitle,
      amount: parsedAmount,
      type: form.type,
      category: form.category,
      date: form.date,
      note: form.note.trim(),
    },
  };
}
