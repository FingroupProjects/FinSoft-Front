export default function validateNumberInput(data) {
 if (!data) return data || ""
 return data.replace(/[^0-9.]/g, "");
}