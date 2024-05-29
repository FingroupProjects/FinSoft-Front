export default function englishSymbols (e) {
  let input = e.target.value;
  input = input.replace(/[^A-Za-z0-9@.]/g, '');
  e.target.value = input;
};
