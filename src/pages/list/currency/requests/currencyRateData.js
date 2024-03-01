import currency from "../../../../api/currency.js";
import showDate from "../../../../composables/date/showDate.js";
import {ref} from "vue";

export default function useCurrencyRateData() {
    const loadingRate = ref(true)
    const rates = ref([])
    const paginationsRate = ref([])
    const getCurrencyRateData = async ({ page, itemsPerPage, sortBy, search}, idCurrency) => {
        if (idCurrency === 0) {
            loadingRate.value = false
            return
        }

        try {
            const response = await currency.show(idCurrency)
            const { data } = await currency.showRate(idCurrency, { page, itemsPerPage, sortBy }, search)
            rates.value = data.result.data.map(item =>  ({
                ...item,
                date: showDate(item.date),
                name: response.data.result.name,
                digital_code: response.data.result.digital_code
            })) || [];

            paginationsRate.value = data.result.pagination || []

        } catch (e) {

        } finally {
            loadingRate.value = false
        }
    }

    return {
        loadingRate,
        rates,
        paginationsRate,
        getCurrencyRateData
    }
}