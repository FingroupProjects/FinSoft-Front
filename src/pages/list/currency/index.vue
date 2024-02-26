<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import changeTheDateForSending from '../../../composables/date/changeTheDateForSending'
import currentDate from "../../../composables/date/currentDate.js";
import currency from '../../../api/currency.js'
import {
  add,
  addIcon, addMessage,
  cancel,
  edit,
  editIcon, editMessage,
  prevIcon, remove,
  removeIcon, removeMessage,
  showIcon
} from "../../../composables/constant/buttons.js";
import Icons from "../../../composables/Icons/Icons.vue";
import binarySearch from "../../../composables/binarySearch/binarySearch.js";
import {tr} from "vuetify/locale";

const router = useRouter()

const loading = ref(true)
const dialog = ref(false)
const updateDialog = ref(false)
const deleteDialog = ref(false)

const idCurrency = ref(null)
const isExistsCurrency = ref(false)
const search = ref('')
const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const currencies = ref([])
const paginations = ref([])

const headers = ref([
  { title: 'Наименование', key: 'name'},
  { title: 'Символьный код', key: 'symbol_code'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: 'Курс валюты', key: 'last_exchange_rate.value', sortable: false},
])

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}

const getCurrencyData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true
  try {
    const { data } = await currency.get({page, itemsPerPage, sortBy}, search)
    paginations.value = data.result.pagination
    currencies.value = data.result.data
    loading.value = false
  } catch (e) {

  }
}


const addCurrency = async ({ page, itemsPerPage, sortBy }) => {

  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }
  
  const res = await currency.add(body)
  if (res.status === 201) {
    await getCurrencyData({ page, itemsPerPage, sortBy })
    showToast(addMessage)
    valueRef.value = null
    idCurrency.value = res.data.result.id
  }

}


const createCurrentRate = async () => {
  const body = {
    date: changeTheDateForSending(dateRef.value),
    value: valueRef.value
  }

  const {status} = await currency.addRate(body, String(idCurrency.value))

  if (status === 201) {
    showToast(addMessage)
    nameRef.value = null
    symbolRef.value = null
    digitalRef.value = null
    dialog.value = false
  }
}

const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    symbol_code: symbolRef.value,
    digital_code: digitalRef.value
  }

  try {
    const { status } = await currency.update(idCurrency.value, body)
    if (status === 200) {
      await getCurrencyData({page, itemsPerPage, sortBy})
      updateDialog.value = false
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}

const removeCurrency = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await currency.remove(idCurrency.value)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getCurrencyData({page, itemsPerPage, sortBy})
    }
  } catch (e) {

  } finally {
    deleteDialog.value = false
  }
}


const openDialog = item => {
  dialog.value = true
  idCurrency.value = item.id

  const index = binarySearch(currencies.value, item.id)
  if (index !== 1) {
    isExistsCurrency.value = true
    nameRef.value = item.name
    symbolRef.value = item.symbol_code
    digitalRef.value = item.digital_code
  }

}

onMounted(() => {
  dateRef.value = currentDate()
})

watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    symbolRef.value = null
    digitalRef.value = null
  }
})
</script>

<template>
  <div>
    <v-col>
    <div class="d-flex justify-space-between text-uppercase ">
      <div class="d-flex align-center pe-2">
        Валюты
      </div>
      <v-card variant="text" min-width="200" class="d-flex align-center ga-2">
        <v-text-field
            v-model="search"
            prepend-inner-icon="search"
            variant="outlined"
            density="compact"
            label="Поиск..."
            color="info"
            rounded="lg"
            clearable
            single-line
            flat
            hide-details
        ></v-text-field>
        <v-icon class="icon" color="info">filter_alt</v-icon>
      </v-card>
    </div>

    <v-card class="mt-2 table">
      <v-data-table-server
          style="height: 58vh"
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
          fixed-footer
          hover
      >
        <template v-slot:item="{ item, index }">
          <tr @dblclick="openDialog(item)">
            <td>{{ item.name }}</td>
            <td>{{ item.symbol_code }}</td>
            <td>{{ item.digital_code }}</td>
            <td>{{ item.last_exchange_rate === null ? '' : item.last_exchange_rate.value}}</td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>

<!-- Modal -->
    <v-card>
      <v-dialog class="mt-2" v-model="dialog">
        <v-card min-width="300" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center pr-5 pt-3">
            <span class="pl-5">{{ isExistsCurrency ? 'Изменение' : 'Добавление' }}</span>
            <v-btn @click="dialog = false"  variant="text" :size="32" class="pt-2 pl-1">
              <Icons name="close" />
            </v-btn>
          </div>
          <v-form class="d-flex w-100 pa-5" @submit.prevent="addCurrency">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    v-model="nameRef"
                    :rules="[rules.required]"
                    color="info"
                    rounded="lg"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Доллар"
                    label="Название"
                    clearable
                />
                <v-text-field
                    v-model="symbolRef"
                    :rules="[rules.required]"
                    color="info"
                    rounded="lg"
                    variant="outlined"
                    density="compact"
                    placeholder="USD"
                    v-mask="'AAA'"
                    label="Символный код"
                    clearable
                />
                <v-text-field
                    v-model="digitalRef"
                    :rules="[rules.required]"
                    color="info"
                    rounded="lg"
                    density="compact"
                    variant="outlined"
                    placeholder="132"
                    v-mask="'###'"
                    label="Цифровой код"
                    clearable
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn :loading="loading" size="small" color="info" rounded="lg" class="mt-2" @click="dialog = false">{{ cancel }}</v-btn>
                  <v-btn :loading="loading" size="small" color="green" rounded="lg" class="mt-2" type="submit">{{ add }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>

          <v-card class="mt-2 table">
            <v-data-table-server
                style="height: 58vh"
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
                :item-key="currencies.id"
                fixed-footer
                hover
            >
              <template v-slot:item="{ item, index }">
                <tr @click="dialog(item)">
                  <td>{{ item.name }}</td>
                  <td>{{ item.symbol_code }}</td>
                  <td>{{ item.digital_code }}</td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card>
        </v-card>
      </v-dialog>
    </v-card>

  </v-col>
  </div>
  
  
</template>

<style scoped>

</style>