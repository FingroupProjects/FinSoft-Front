export default function binarySearch(arr, key) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);

        if (arr[mid].id === key) {
            return mid;
        } else if (arr[mid].id < key) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}
