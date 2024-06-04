export default function getColor(active, deleted_at) {
  if (active && !deleted_at) {
    return "green";
  } else if (!active && deleted_at) {
    return "red";
  } else {
    return "orange";
  }
}