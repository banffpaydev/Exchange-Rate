export const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  CNY: '¥',
  NGN: '₦',
  LRD: 'L$'
};

export const formatPair = (pair) => {
  const [base, quote] = pair.split('/');
  return `${currencySymbols[base]}/${currencySymbols[quote]}`;
};