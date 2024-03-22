<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import currentDate from "../../../composables/date/currentDate.js";
import currency from '../../../api/currency.js'
import {
  addMessage,
  editMessage, ErrorSelectMessage,
  removeMessage, restoreMessage, selectOneItemMessage,
} from "../../../composables/constant/buttons.js";
import Icons from "../../../composables/Icons/Icons.vue";
import showDate from "../../../composables/date/showDate.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import validate from "./validate.js";
import {FIELD_COLOR} from "../../../composables/constant/colors.js";
import {tr} from "vuetify/locale";


const router = useRouter()

const loading = ref(false);
const loadingRate = ref(true)
const dialog = ref(false)
const rateDialog = ref(false)

const idCurrencyRate = ref(null)
const isExistsCurrency = ref(false)
const isExistsCurrencyRate = ref(false)
const idCurrency = ref(null)
const currencyInDialogTitle = ref(null)
const search = ref('')
const filterModal = ref(null)
const showConfirmDialog = ref(false)
const count = ref(0)

const hoveredRowIndex = ref(null)
const markedItem = ref(null)
const markedID = ref([])

const hoveredRowIndexRate = ref(null)
const markedItemRate = ref(null)
const markedIDRate = ref([])


const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)


const filterForm = ref({
  name: null,
  symbol_code: null,
  digital_code: null
})

const rates = ref([])
const currencies = ref([]);
const paginationsRate = ref([])
const paginations = ref([]);

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
  {title: 'Символьный код', key: 'symbol_code'},
  {title: 'Цифровой код', key: 'digital_code'},
  {title: 'Курс валюты', key: 'last_exchange_rate.value', sortable: false},
])

const headersRate = ref([
  {title: '№', key: 'id'},
  {title: 'Дата', key: 'date'},
  {title: 'Курс', key: 'value'},
])

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}


function countFilter() {
   
   for (const key in filterForm.value) {
       if (filterForm.value[key] !== null) {
           count.value++;
       }
   }
   
   return count;
}



const getCurrencyData = async ({page, itemsPerPage, sortBy, search}) => {

  filterModal.value = false
  const filterData = filterForm.value
  count.value = 0
  console.log(count)
  countFilter()

  loading.value = true;
  try {
    const {data} = await currency.get({page, itemsPerPage, sortBy}, search, filterData);
    paginations.value = data.result.pagination;
    currencies.value = data.result.data;
    markedID.value = []
  } catch (e) {

  } finally {
    loading.value = false;
  }
}







const isDataChanged = () => {
  
  const item = currencies.value.find(item => item.id === idCurrency.value)

  const isChanged =
    nameRef.value !== item.name ||
    digitalRef.value != item.digital_code ||
    symbolRef.value !== item.symbol_code
  return isChanged;
};
const isRateChanged = () => {

  const item = rates.value.find(item => item.id === idCurrencyRate.value)
  console.log(item)
  const isChanged =
    valueRef.value !== item.name ||
    showDate(dateRef.value) != item.date
  return isChanged;
}

const closeDialogWithoutSaving = () => {
  
  if(rateDialog.value) {
    rateDialog.value = false
  }
  else {
    dialog.value = false;
  }
  showConfirmDialog.value = false;
};
const checkUpdate = () => {

    if(isDataChanged() === true){
      showConfirmDialog.value = true
    }
    else {
      dialog.value = false
    }

}
const checkRateUpdate = () => {
   
    if(isRateChanged() === true){
      showConfirmDialog.value = true
    }
    else {
      rateDialog.value = false
    }
}
const checkAndClose = () => {

  if (nameRef.value || digitalRef.value || symbolRef.value) {
    showConfirmDialog.value = true;
  } else {
    dialog.value = false;
  }
  
};

const checkRateAndClose = () => {
  
  if (valueRef.value) {
    showConfirmDialog.value = true;
  } else {
    rateDialog.value = false;
  }
}




const getCurrencyRateData = async ({page, itemsPerPage, sortBy, search}, idCurrency) => {
  if (idCurrency === 0) {
    loadingRate.value = false
    return
  }

  try {
    const response = await currency.show(idCurrency)
    const { data } = await currency.showRate(idCurrency, {page, itemsPerPage, sortBy}, search)
    rates.value = data.result.data.map(item => ({
      ...item,
      date: showDate(item.date),
      name: response.data.result.name,
      digital_code: response.data.result.digital_code
    })) || [];

    paginationsRate.value = data.result.pagination || []
    markedIDRate.value = []
  } catch (e) {

  } finally {
    loadingRate.value = false
  }
}

const  closeFilterModal = async ({page, itemsPerPage, sortBy, search}) => {
  filterModal.value = false
  filterForm.value = {}
  await getCurrencyData({page, itemsPerPage, sortBy, search})
}




const addCurrency = async ({page, itemsPerPage, sortBy}) => {
  if (validate(nameRef,digitalRef,symbolRef) !== true) return

  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }

  try {
    const res = await currency.add(body)
    if (res.status === 201) {
      await getCurrencyData({page, itemsPerPage, sortBy})
      showToast(addMessage)
      valueRef.value = nullgit 
      idCurrency.value = res.data.result.id
      currencyInDialogTitle.value = res.data.result.name
      markedID.value.push(res.data.result.id)
      isExistsCurrency.value = true
    }
  } catch (error) {
    console.log(error);
  }
}

const update = async ({page, itemsPerPage, sortBy, search}) => {
  if (validate(nameRef,symbolRef,digitalRef,) !== true) return
  const body = {
    name: nameRef.value,
    symbol_code: symbolRef.value,
    digital_code: digitalRef.value
  }

  try {
    const {status} = await currency.update(idCurrency.value, body)
    if (status === 200) {
      await getCurrencyData({page, itemsPerPage, sortBy, search})
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}


const removeCurrency = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await currency.remove({ids: markedID.value})
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getCurrencyData({page, itemsPerPage, sortBy})
      markedID.value = []
    }
  } catch (e) {
    console.log(e)
  }
}

const restoreCurrency = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await currency.restore({ids: markedID.value})
    if (status === 200) {
      showToast(restoreMessage)
      await getCurrencyData({page, itemsPerPage, sortBy})
      markedID.value = []
    }
  } catch (e) {
    console.log(e)
  }
}

const openDialog = (item) => {

  dialog.value = true
  if (item === 0) {
    idCurrency.value = 0
    isExistsCurrency.value = false
  } else {

    idCurrency.value = item.id
    isExistsCurrency.value = true
    nameRef.value = item.name
    symbolRef.value = item.symbol_code
    digitalRef.value = item.digital_code
    currencyInDialogTitle.value = nameRef.value
  }

}

const addRate = async ({page, itemsPerPage, sortBy}) => {
  const body = {
    date: showDate(dateRef.value, '-'),
    value: valueRef.value
  }

  try {
    await currency.addRate(idCurrency.value, body)
    await getCurrencyRateData({page, itemsPerPage, sortBy}, idCurrency.value)
    await getCurrencyData({page, itemsPerPage, sortBy})
    showToast(addMessage)
    valueRef.value = null
    rateDialog.value = false
  } catch (e) {
    showToast(e.response.data.message, 'red')
  }

}

const updateRate = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    date: dateRef.value.split('.').reverse().join('-'),
    value: Number(valueRef.value)
  }

  try {
    const {status} = await currency.updateRate(idCurrencyRate.value, body)

    if (status === 200) {
      await getCurrencyRateData({page, itemsPerPage, sortBy}, idCurrency.value)
      await getCurrencyData({page, itemsPerPage, sortBy})
      showToast(editMessage)
      rateDialog.value = false
    }
  } catch (e) {
    console.log(e)
  }
}

const editDialogRate = (item) => {
  rateDialog.value = true
  isExistsCurrencyRate.value = true
  idCurrencyRate.value = item.id
  dateRef.value = item.date.split('.').reverse().join('-')
  valueRef.value = item.value
}

const addDialogRate = () => {
  rateDialog.value = true
  isExistsCurrencyRate.value = false
}


const removeCurrencyRate = async ({page, itemsPerPage, sortBy}) => {
  try {
   
    const {status} = await currency.removeRate({ids: markedIDRate.value})
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getCurrencyRateData({page, itemsPerPage, sortBy}, idCurrency.value)
      markedIDRate.value = []
    }
  } catch (e) {
    console.log(e)
  }
}

const restoreCurrencyRate = async ({page, itemsPerPage, sortBy}) => {
  try {
    console.log(markedIDRate.value)
    const {status} = await currency.restoreRate({ids: markedIDRate.value})
    if (status === 200) {
      showToast(restoreMessage)
      await getCurrencyRateData({page, itemsPerPage, sortBy}, idCurrency.value)
      markedIDRate.value = []
    }
  } catch (e) {
    console.log(e)
  }
}

const addBasedOnCurrency = () => {
  if (markedID.value.length !== 1 && !isExistsCurrency.value) return showToast(selectOneItemMessage, 'warning')
 
  dialog.value = true

  currencies.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      idCurrency.value = item.id
      nameRef.value = item.name
      symbolRef.value = item.symbol_code
      digitalRef.value = item.digital_code
    }
  })
}

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = currencies.value.find(el => el.id === markedID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
  }

  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
}

const handleCheckboxClick = (item) => {
  lineMarking(item)
}

const compute = ({page, itemsPerPage, sortBy, search}) => {
  if (markedItem.value.deleted_at !== null) {
    return restoreCurrency({page, itemsPerPage, sortBy})
  } else {
    return removeCurrency({page, itemsPerPage, sortBy, search})
  }
}


const lineMarkingRate = (item) => {
  if (markedIDRate.value.length > 0) {
    const firstMarkedItem = rates.value.find(el => el.id === markedIDRate.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
  }

  const index = markedIDRate.value.indexOf(item.id);
  if (index !== -1) {
    markedIDRate.value.splice(index, 1);
  } else {
    markedIDRate.value.push(item.id);
  }
  markedItemRate.value = item;
}

const handleCheckboxClickRate = (item) => {
  lineMarkingRate(item)
}

const computeRate = ({page, itemsPerPage, sortBy}) => {
  if (markedItemRate.value.deleted_at !== null) {
    return restoreCurrencyRate({page, itemsPerPage, sortBy})
  } else {
    return removeCurrencyRate({page, itemsPerPage, sortBy})
  }
}

onMounted(async () => {
  dateRef.value = currentDate()
})

watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    symbolRef.value = null
    digitalRef.value = null
    loadingRate.value = true
    isExistsCurrency.value = false
    rates.value = []
  }
})

watch(rateDialog, newVal => {
  if (!newVal) {
    dateRef.value = currentDate()
    valueRef.value = null
    isExistsCurrencyRate.value = false
  }
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Валюты</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить"  @click="openDialog(0)" name="add"/>
              <Icons title="Копировать"  @click="addBasedOnCurrency" name="copy"/>
              <Icons title="Удалить"  @click="compute" name="delete"/>
            </div>

            <div class="w-100">
              <v-text-field
                  v-model="search"
                  prepend-inner-icon="search"
                  density="compact"
                  label="Поиск..."
                  variant="outlined"
                  color="info"
                  :base-color="FIELD_COLOR"
                  rounded="lg"
                  clear-icon="close"
                  hide-details
                  single-line
                  clearable
                  flat
              ></v-text-field>
            </div>
          </div>
          <div class="filterElement">
            <Icons
              name="filter"
              title="фильтр"
              @click="filterModal = true"
              class="mt-1"
            />

            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
          </div>
        </v-card>
      </div>

      <v-card class="mt-2 table">
        <v-data-table-server
            style="height: 78vh"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            v-model:items-per-page="paginations.per_page"
            :loading="loading"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="currencies"
            :item-value="headers.title"
            :search="search"
            @update:options="getCurrencyData"
            page-text='{0}-{1} от {2}'
            :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @dblclick="openDialog(item)"
                @click="lineMarking(item)" :class="{'bg-grey-lighten-2': markedID.includes(item.id)}">
              <td>
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)"
                                  @change="handleCheckboxClick(item)">
                    <span>{{ item.id }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <div>
                    <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                    <span>{{ item.id }}</span>
                  </div>
                </template>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.symbol_code }}</td>
              <td>{{ item.digital_code }}</td>
              <td>{{ item.last_exchange_rate === null ? '' : item.last_exchange_rate.value }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="300"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsCurrency ? 'Валюта: ' + currencyInDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons title="Удалить"  v-show="isExistsCurrency" @click="compute" name="delete"/>
                  <Icons title="Сохранить"  v-if="isExistsCurrency" @click="update" name="save"/>
                  <Icons title="Сохранить"  v-else @click="addCurrency" name="save"/>
                </div>
                <v-btn @click="isExistsCurrency ? checkUpdate() : checkAndClose({ page, itemsPerPage, sortBy, search, filterData }) "
                  variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"   title="Закрыть"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addCurrency">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="green"
                      rounded="md"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Доллар"
                      label="Название"
                      clear-icon="close"
                      clearable
                  />
                  <v-text-field
                      v-model="symbolRef"
                      :rules="[rules.required]"
                      color="green"
                      rounded="md"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      density="compact"
                      placeholder="USD"
                      v-mask="'AAA'"
                      label="Символный код"
                      clear-icon="close"
                      clearable
                  />
                  <v-text-field
                      v-model="digitalRef"
                      :rules="[rules.required]"
                      color="green"
                      rounded="md"
                      density="compact"
                      variant="outlined"
                      :base-color="FIELD_COLOR"
                      placeholder="132"
                      v-mask="'###'"
                      label="Цифровой код"
                      clear-icon="close"
                      clearable
                  />
                </v-col>
              </v-row>
            </v-form>

            <v-card class="table" style="border: 1px solid #3AB700; overflow: auto;">
              <div v-if="isExistsCurrency" class="d-flex w-100 rounded-t-lg mb-1 align-center "
                   style="border-bottom: 1px solid #3AB700">
                <div class="d-flex justify-end w-100 ga-2 pt-1 me-2" style="padding-top: 4px !important;">
                  <Icons title="Удалить"  @click="computeRate" name="delete"/>
                  <Icons title="Добавить"  @click="addDialogRate" name="add"/>
                </div>
              </div>
              <v-data-table-server
                  style="height: 38vh"
                  items-per-page-text="Элементов на странице:"
                  loading-text="Загрузка"
                  no-data-text="Нет данных"
                  v-model:items-per-page="paginationsRate.per_page"
                  :loading="loadingRate"
                  :headers="headersRate"
                  :items-length="paginationsRate.total || 0"
                  :items="rates"
                  :item-value="headersRate.title"
                  :search="search"
                  @update:options="getCurrencyRateData({}, idCurrency)"
                  page-text='{0}-{1} от {2}'
                  :items-per-page-options="[
                      {value: 25, title: '25'},
                      {value: 50, title: '50'},
                      {value: 100, title: '100'},
                  ]"
                  fixed-footer
                  fixed-header
                  hover
              >
                <template v-slot:item="{ item, index }">
                  <tr @mouseenter="hoveredRowIndexRate = index" @mouseleave="hoveredRowIndexRate = null"
                      @dblclick="editDialogRate(item)" @click="lineMarkingRate(item)"
                      :class="{'bg-grey-lighten-2': markedIDRate.includes(item.id)}">
                    <td>
                      <template v-if="hoveredRowIndexRate === index || markedIDRate.includes(item.id)">
                        <CustomCheckbox v-model="markedIDRate" :checked="markedIDRate.includes(item.id)"
                                        @change="handleCheckboxClickRate(item)">
                          <span>{{ index + 1 }}</span>
                        </CustomCheckbox>
                      </template>
                      <template v-else>
                        <div>
                          <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                          <span>{{ index + 1 }}</span>
                        </div>
                      </template>
                    </td>
                    <td>{{ item.date }}</td>
                    <td>{{ item.value }}</td>
                  </tr>
                </template>
              </v-data-table-server>
            </v-card>
          </v-card>
        </v-dialog>

        <!--  addCurrencyRate    -->
        <v-dialog v-model="rateDialog" activator="parent">
          <v-card style="border: 2px solid #3AB700" min-width="400"
                  class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center pr-5 pt-3">
              <span class="pl-5">{{ isExistsCurrencyRate ? 'Изменить' : 'Добавить' }} курс</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons title="Удалить "  v-show="isExistsCurrencyRate" @click="removeCurrencyRate" name="delete"/>
                  <Icons title="Сохранить"  v-if="isExistsCurrencyRate" @click="updateRate" name="save"/>
                  <Icons  title="Сохранить" v-else @click="addRate" name="save"/>
                </div>
                <v-btn @click="isExistsCurrencyRate ? checkRateUpdate() : checkRateAndClose({ page, itemsPerPage, sortBy, search, filterData }) "
                  variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"   title="Закрыть"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100 pa-5">
              <v-row class="w-100">
                <v-col class="d-flex flex-column justify-between w-100 ga-5">
                  <v-text-field
                      v-model="dateRef"
                      :rules="[rules.required]"
                      type="date"
                      label="Дата"
                      rounded="md"
                      color="green"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      density="compact"
                      clear-icon="close"
                  />
                  <v-text-field
                      v-model="valueRef"
                      :rules="[rules.required]"
                      type="number"
                      placeholder="1.0000"
                      label="Курс"
                      rounded="md"
                      :base-color="FIELD_COLOR"
                      color="green"
                      variant="outlined"
                      density="compact"
                      clear-icon="close"
                      hide-spin-buttons
                      clearable
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>


      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="filterModal">
          <v-card style="border: 2px solid #3AB700" min-width="600"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Фильтр</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons  title="Сохранить" @click="getCurrencyData" name="save"/>
                </div>
                <v-btn @click="closeFilterModal" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons  title="Закрыть" name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <div class="d-flex justify-space-between ga-6 mb-3">
                    <v-text-field
                        v-model="filterForm.name"
                        color="green"
                        rounded="md"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        :base-color="FIELD_COLOR"
                        placeholder="Наименование"
                        label="Наименование"
                        clear-icon="close"
                        clearable
                        hide-details
                    />
                  </div>
                  <div class="d-flex justify-space-between ga-6 mb-3">
                     <v-text-field
                        v-model="filterForm.symbol_code"
                        color="green"
                        rounded="md"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        :base-color="FIELD_COLOR"
                        placeholder="Символьный код"
                        label="Символьный код"
                        clear-icon="close"
                        clearable
                        hide-details
                    />
                  </div>
                  <div class="d-flex justify-space-between ga-6 mb-3">
                     <v-text-field
                        v-model="filterForm.digital_code"
                        color="green"
                        rounded="md"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        :base-color="FIELD_COLOR"
                        placeholder="Цифровой код"
                        label="Цифровой код"
                        clear-icon="close"
                        clearable
                        hide-details
                    />
                  </div>
                  </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>
    

<v-dialog style="min-width: 300px;"  v-model="showConfirmDialog" persistent>
  <v-card style="max-width: 400px;" class="mx-auto flex flex-col">
    <v-card-title class="text-h6"
    >Подтверждение</v-card-title>
    <v-card-text class="text-subtitle-1">Точно хотите закрыть? Введенные данные не будут сохранены.</v-card-text>
    <v-card-actions>
      <v-btn @click="showConfirmDialog = false"
        class="text-none mb-4 w-[200px] h-[20px]"
        color="red"
        variant="flat"
      >Нет</v-btn>
      <v-btn @click="closeDialogWithoutSaving"
        class="text-none mb-4 w-[200px] h-[20px]"
        color="green"
        variant="flat"
      >Да</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

    </v-col>
  </div>


</template>

<style scoped>

</style>