export default function total (arr) {
  const totalAmount = arr.reduce(
    (amount, item) => amount + item.amount,
    0
  );
  return totalAmount;
};