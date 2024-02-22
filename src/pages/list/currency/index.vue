<script setup>
import { onMounted, ref } from "vue";
import {useRouter} from "vue-router";
import currency from '../../../api/currency.js'
import showToast from '../../../composables/toast'
import changeTheDateForSending from '../../../composables/date/changeTheDateForSending'
import {add, addIcon, cancel, editIcon, prevIcon, showIcon} from "../../../composables/constant/buttons.js";

const router = useRouter()

const addDialog = ref(false)
const loading = ref(true)
const isCurrentRate = ref(false)
const updateModal = ref(false)
const search = ref('')

const idCurrency = ref(null)
const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const dateError = ref(null)
const valueError = ref(null)
const nameError = ref(null)
const digitalError = ref(null)
const symbolError = ref(null)

const currencies = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Наименование', key: 'name'},
  { title: 'Символьный код', key: 'symbol_code'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: '#', key: 'icons', align:'center', sortable: false},
])

onMounted( async () => {

})

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

const validateCurrency = () => {
  nameError.value = null
  digitalError.value = null
  symbolError.value = null

  if (nameRef.value === null) {
    return nameError.value = 'Заполните поле!'
  }

  if (nameRef.value.length < 3) {
    return nameError.value = 'Не менее трёх символов!'
  }

  if (digitalRef.value === null) {
    return digitalError.value = 'Заполните поле!'
  }

  if (symbolRef.value === null) {
    return symbolError.value = 'Заполните поле!'
  }

  return true
}


const addCurrency = async ({ page, itemsPerPage, sortBy }) => {
  if (validateCurrency() !== true) return

  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }

  const res = await currency.add(body)
  if (res.status === 201) {
    await getCurrencyData({ page, itemsPerPage, sortBy })
    showToast('Успешно добавлена')
    isCurrentRate.value = true
    valueRef.value = null
    idCurrency.value = res.data.result.id
  }

}


const validateCurrencyRate = () => {
  dateError.value = null
  valueError.value = null

  if (dateRef.value === null) {
    return dateError.value = 'Заполните поле!'
  }

  if (dateRef.value.length <= 9) {
    return dateError.value = 'Введите правильную дату!'
  }

  if (valueRef.value === null) {
    return valueError.value = 'Заполните поле!'
  }

  if (Number(valueRef.value) > 9999999.9999) {
    return valueError.value = 'Значение не должно превышать 9999999!'
  }

  return true
}


const back = () => {
  nameRef.value = null
  symbolRef.value = null
  digitalRef.value = null
  isCurrentRate.value = false
  addDialog.value = false
}

const createCurrentRate = async () => {
  if (validateCurrencyRate() !== true) return

  const body = {
    date: changeTheDateForSending(dateRef.value),
    value: valueRef.value
  }

  const {status} = await currency.addRate(body, String(idCurrency.value))

  if (status === 201) {
    showToast('Успешно добавлена')
    nameRef.value = null
    symbolRef.value = null
    digitalRef.value = null
    isCurrentRate.value = false
    addDialog.value = false
  }
}

const goToShow = item => {
  const name = item.name
  const symbol = item.symbol_code
  const digital = item.digital_code
  router.push({ path: `/list/currency/${item.id}`, query: { name, symbol, digital } });
}

const goToEdit = item => {
  updateModal.value = true
  idCurrency.value = item.id
  nameRef.value = item.name
  symbolRef.value = item.symbol_code
  digitalRef.value = item.digital_code

}

const update = async ({page, itemsPerPage, sortBy}) => {
  if (validateCurrency() !== true) return
  
  const body = {
    name: nameRef.value,
    symbol_code: symbolRef.value,
    digital_code: digitalRef.value
  }

  try {
    const { status } = await currency.update(idCurrency.value, body)
    if (status === 200) {
      await getCurrencyData({page, itemsPerPage, sortBy})
      updateModal.value = false
      showToast('Успешно обновлено!')
    }
  } catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <div>
    <v-col>
    <div class="d-flex justify-space-between">
      <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push('/adminPanel')">
        <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
      </v-btn>
      <v-btn class="rounded-circle pa-2 mb-1" color="green" size="40" @click="addDialog = !addDialog">
        <v-icon size="25">{{ addIcon }}</v-icon>
      </v-btn>
    </div>

    <v-card class="mt-2 table">
      <v-card-title class="d-flex align-center pe-2">
        Список курсов

        <v-spacer />
        <v-spacer />
        <v-spacer />

        <v-text-field
            v-model="search"
            prepend-inner-icon="search"
            clearable
            density="compact"
            label="Поиск..."
            color="info"
            rounded="lg"
            single-line
            flat
            hide-details
            variant="outlined"
        ></v-text-field>
      </v-card-title>

      <v-data-table-server
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :loading="loading"
          hover
          v-model:items-per-page="paginations.per_page"
          :headers="headers"
          :items-length="paginations.total || 0"
          :items="currencies"
          :item-value="headers.title"
          :search="search"
          @update:options="getCurrencyData"
      >
        <template v-slot:item.id="{ index }">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-slot:item.icons="{ item }">
          <v-icon color="info" @click="goToShow(item)" class="icon me-2">{{ showIcon }}</v-icon>
          <v-icon color="info" @click="goToEdit(item)" class="icon">{{ editIcon }}</v-icon>
        </template>
      </v-data-table-server>
    </v-card>

<!-- Modal -->
    <v-card>
<!--  addModal    -->
      <v-dialog class="mt-2" v-model="addDialog">
        <v-card width="40%" class="d-flex justify-center flex-column mx-auto my-0" rounded="lg">
          <v-form v-if="!isCurrentRate" class="d-flex  w-100 pa-5" @submit.prevent="addCurrency">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    v-model="nameRef"
                    :disabled="isCurrentRate"
                    :error-messages="nameError"
                    color="info"
                    rounded="lg"
                    variant="outlined"
                    class="w-auto"
                    density="compact"
                    placeholder="Доллар"
                    label="Название"
                />
                <v-text-field
                    :disabled="isCurrentRate"
                    :error-messages="symbolError"
                    color="info"
                    rounded="lg"
                    v-model="symbolRef"
                    variant="outlined"
                    density="compact"
                    placeholder="USD"
                    v-mask="'AAA'"
                    label="Символный код"
                />
                <v-text-field
                    :disabled="isCurrentRate"
                    :error-messages="digitalError"
                    v-model="digitalRef"
                    color="info"
                    rounded="lg"
                    density="compact"
                    variant="outlined"
                    placeholder="132"
                    v-mask="'###'"
                    label="Цифровой код"
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn :loading="loading" size="small" color="info" variant="outlined" class="mt-2" @click="addDialog = false">{{ cancel }}</v-btn>
                  <v-btn :loading="loading" size="small" color="green" class="mt-2" type="submit" :hidden="isCurrentRate">{{ add }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>

          <v-form v-else class="d-flex justify-center w-100 pa-4"  @submit.prevent="createCurrentRate">
            <v-row class="d-flex w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    :error-messages="dateError"
                    v-model="dateRef"
                    variant="outlined"
                    color="info"
                    rounded="lg"
                    density="compact"
                    type="datetime"
                    label="Дата"
                />
                <v-text-field
                    :value="symbolRef"
                    :disabled="isCurrentRate"
                    v-model="symbolRef"
                    color="info"
                    rounded="lg"
                    density="compact"
                    variant="outlined"
                    label="Символный код"
                />
                <v-text-field
                    v-model="valueRef"
                    :error-messages="valueError"
                    color="info"
                    rounded="lg"
                    density="compact"
                    variant="outlined"
                    type="number"
                    placeholder="1.0000"
                    label="Значение"
                    hide-spin-buttons
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn :loading="loading" size="small" color="info" variant="outlined"  @click="back">{{ cancel }}</v-btn>
                  <v-btn :loading="loading" size="small" color="green" type="submit">{{ add }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>

        </v-card>
      </v-dialog>
      
<!--  updateModal    -->
      <v-dialog width="500" v-model="updateModal" activator="parent">
        <v-card class="rounded-xl pl-4">
          <v-form class="w-100 pa-4" @submit.prevent="update">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100">
                <v-text-field variant="outlined" type="text" :error-messages="nameError" 
                               label="Наименнование" v-model="nameRef"/>
                <v-text-field variant="outlined" type="tel" :error-messages="symbolError"
                              label="Символьный код" v-model="symbolRef"/>
                <v-text-field variant="outlined" type="tel" :error-messages="digitalError"
                              label="Цифровой код" v-model="digitalRef"/>
                <div class="d-flex justify-end align-center">
                  <v-btn :loading="loading" color="green" type="submit">Изменить</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
       </v-dialog>
      
    </v-card>

  </v-col>
  </div>
  
  
</template>

<style scoped>

</style>