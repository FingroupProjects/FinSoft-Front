export default function formatInputPrice(price, event) {
  let value = event.target.value;

  if (value.startsWith('.')) {
    value = '0' + value;
  }

  value = value.replace(/[^\d.]/g, '');

  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  if (value.length === 2 && value.startsWith("0") && !value.includes(".")) {
    value = `0.${value[1]}`;
  }

  if (!value.startsWith("0.") && value.length > 1) {
    value = value.replace(/^0+/, '');
  }

  if (value === '' || value === '.') {
    value = null;
  }

  if (parts.length === 2) {
    parts[1] = parts[1].slice(0, 3);
    value = parts.join('.');
  }

  event.target.value = value;
}
