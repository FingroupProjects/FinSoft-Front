export default function formatInputAmount(input) {
  // Преобразуем входное значение в строку
  input = input.toString();

  // Проверяем, что последний символ это точка
  if (input[input.length - 1] === '.') {
    // Добавляем точку в конец строки, если её еще нет
    if ((input.match(/\./g) || []).length === 1) {
      return input;
    }
  }

  // Проверяем, что в строке не больше одной десятичной точки
  if ((input.match(/\./g) || []).length > 1) {
    return null;
  }

  // Проверяем, что после десятичной точки только одно число
  const decimalIndex = input.indexOf('.');
  if (decimalIndex !== -1 && decimalIndex < input.length - 2) {
    return null;
  }

  // Преобразуем входное значение в число
  const parsedNumber = parseFloat(input);

  // Проверяем, является ли полученное значение числом и не является NaN
  if (!isNaN(parsedNumber)) {
    return parsedNumber;
  }

  // Возвращаем null, если ввод не является валидным числом
  return null;
}
