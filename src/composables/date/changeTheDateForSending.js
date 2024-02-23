export default function changeTheDateForSending(date, sign = '/') {
    let parts = date.split(sign);
    let day = parts[0];
    let month = parts[1];
    let year = parts[2];
    
    return `${year}/${month}/${day}`;
}