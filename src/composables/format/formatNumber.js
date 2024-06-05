export default function formatNumber(amount) {
  const formatter = new Intl.NumberFormat('ru', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return formatter.format(amount);
}