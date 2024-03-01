import { ref } from 'vue';
import currencyApi from '@/api/currency';

export default function useCurrencyData() {
    const loading = ref(false);
    const currencies = ref([]);
    const paginations = ref([]);

    const getCurrencyData = async ({ page, itemsPerPage, sortBy, search }) => {
        loading.value = true;
        try {
            const { data } = await currencyApi.get({ page, itemsPerPage, sortBy }, search);
            paginations.value = data.result.pagination;
            currencies.value = data.result.data;
        } catch (error) {
            console.error('Error fetching currency data:', error);
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        currencies,
        paginations,
        getCurrencyData,
    }
}
