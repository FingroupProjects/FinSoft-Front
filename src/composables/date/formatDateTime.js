export default function formatDateTime(isoString) {
    const date = new Date(isoString);

    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(', ', ' ');
}