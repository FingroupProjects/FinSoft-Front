export default function validateNumberInput(data) {
 if (!data) return data || 0
 return data.replace(/[^0-9.]/g, "");
}