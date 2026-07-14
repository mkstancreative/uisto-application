// Helper function to format as Naira
export const formatNaira = (amount) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(numericAmount);
};

export const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatOnlyDate = (isoString) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function formatNum(n) {
  if (n == null || isNaN(n)) return '0';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return Number(n).toLocaleString('en-US');
}
