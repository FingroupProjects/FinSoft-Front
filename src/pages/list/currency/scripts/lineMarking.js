import { ref } from 'vue'

export default function useLineMarking() {
    const markedID = ref(0)
    const lineMarking = (item) => {
        markedID.value = item.id;
    }

    return {
        lineMarking,
        markedID
    }
}