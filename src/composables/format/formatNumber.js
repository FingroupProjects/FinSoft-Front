export default function formatNumber(amount) {
  const formatter = new Intl.NumberFormat('ru', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}