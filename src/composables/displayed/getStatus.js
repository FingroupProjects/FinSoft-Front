export default function getStatus(active, deleted_at) {
  if (active) {
    return "Проведен";
  } else if (deleted_at !== null) {
    return "Удален";
  } else {
    return "Не проведен";
  }
}