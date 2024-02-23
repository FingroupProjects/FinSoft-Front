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

const router = useRouter()

const loading = ref(true)
const isCurrentRate = ref(false)
const addDialog = ref(false)
const updateDialog = ref(false)
const deleteDialog = ref(false)

const idCurrency = ref(null)
const search = ref('')
const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const currencies = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Наименование', key: 'name'},
  { title: 'Символьный код', key: 'symbol_code'},
  { title: 'Цифровой код', key: 'digital_code'},
  { title: '#', key: 'deleted_at', align:'center'},
])

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения',
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
    isCurrentRate.value = true
    valueRef.value = null
    idCurrency.value = res.data.result.id
  }

}


const back = () => {
  nameRef.value = null
  symbolRef.value = null
  digitalRef.value = null
  isCurrentRate.value = false
  addDialog.value = false
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
    isCurrentRate.value = false
    addDialog.value = false
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

const goToShow = item => {
  const name = item.name
  const symbol = item.symbol_code
  const digital = item.digital_code
  router.push({ path: `/list/currency/${item.id}`, query: { name, symbol, digital } });
}

const goToEdit = item => {
  updateDialog.value = true
  idCurrency.value = item.id
  nameRef.value = item.name
  symbolRef.value = item.symbol_code
  digitalRef.value = item.digital_code

}
const goToDelete = item => {
  idCurrency.value = item.id
  deleteDialog.value = true
}


onMounted(() => {
  dateRef.value = currentDate()
})

watch(updateDialog, newVal => {
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
    <div class="d-flex justify-space-between">
      <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push('/adminPanel')">
        <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
      </v-btn>
      <v-btn class="rounded-circle pa-2 mb-1" stacked color="green" size="40" @click="addDialog = !addDialog">
        <v-icon size="25">{{ addIcon }}</v-icon>
      </v-btn>
    </div>

    <v-card class="mt-2 table">
      <v-card-title class="d-flex align-center pe-2">
        Список валют

        <v-spacer />
        <v-spacer />
        <v-spacer />

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
      </v-card-title>

      <v-data-table-server
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
          hover
      >
        <template v-slot:item.id="{ index }">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-slot:item.deleted_at="{ item }">
          <div class="d-flex justify-center">
            <div class="d-flex align-center justify-center ga-1" v-if="!item.deleted_at">
              <v-icon color="info" @click="goToShow(item)" class="icon">{{ showIcon }}</v-icon>
              <v-icon color="warning" @click="goToEdit(item)" class="icon">{{ editIcon }}</v-icon>
              <v-icon color="red" @click="goToDelete(item)" class="icon">{{ removeIcon }}</v-icon>
            </div>
            <v-icon v-else color="red" class=" cursor-pointer">close</v-icon>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

<!-- Modal -->
    <v-card>
<!--  addModal    -->
      <v-dialog class="mt-2" v-model="addDialog">
        <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center pr-5 pt-3">
            <span class="pl-5">Добавление</span>
            <v-btn @click="addDialog = false" color="info" variant="tonal" :size="38">
              <v-icon size="22">close</v-icon>
            </v-btn>
          </div>
          <v-form v-if="!isCurrentRate" class="d-flex w-100 pa-5" @submit.prevent="addCurrency">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    v-model="nameRef"
                    :disabled="isCurrentRate"
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
                    :disabled="isCurrentRate"
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
                    :disabled="isCurrentRate"
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
                  <v-btn :loading="loading" size="small" color="info" rounded="lg" class="mt-2" @click="addDialog = false">{{ cancel }}</v-btn>
                  <v-btn :loading="loading" size="small" color="green" rounded="lg" class="mt-2" type="submit" :hidden="isCurrentRate">{{ add }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>

          <v-form v-else class="d-flex justify-center w-100 pa-5" @submit.prevent="createCurrentRate">
            <v-row class="d-flex w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    v-model="dateRef"
                    :rules="[rules.required, rules.date]"
                    variant="outlined"
                    color="info"
                    rounded="lg"
                    density="compact"
                    type="date"
                    label="Дата"
                    clearable
                />
                <v-text-field
                    :value="symbolRef"
                    :disabled="isCurrentRate"
                    v-model="symbolRef"
                    :rules="[rules.required]"
                    color="info"
                    rounded="lg"
                    density="compact"
                    variant="outlined"
                    label="Символный код"
                    clearable
                />
                <v-text-field
                    v-model="valueRef"
                    :rules="[rules.required]"
                    color="info"
                    rounded="lg"
                    density="compact"
                    variant="outlined"
                    type="number"
                    placeholder="1.0000"
                    label="Значение"
                    clearable
                    hide-spin-buttons
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn :loading="loading" size="small" color="info" rounded="lg"  @click="back">{{ cancel }}</v-btn>
                  <v-btn :loading="loading" size="small" color="green" rounded="lg" type="submit">{{ add }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
      
<!--  updateDialog    -->
      <v-dialog v-model="updateDialog" activator="parent">
        <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center pr-5 pt-3">
            <span class="pl-5">Изменение</span>
            <v-btn @click="updateDialog = false" color="info" variant="tonal" :size="38">
              <v-icon size="22">close</v-icon>
            </v-btn>
          </div>
          <v-form  class="d-flex w-100 pa-5" @submit.prevent="update">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    v-model="nameRef"
                    :rules="[rules.required]"
                    rounded="lg"
                    variant="outlined"
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
                  <v-btn :loading="loading" size="small" color="info" rounded="lg" class="mt-2" @click="updateDialog = false">{{ cancel }}</v-btn>
                  <v-btn :loading="loading" size="small" color="green" rounded="lg" class="mt-2" type="submit" >{{ edit }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
       </v-dialog>

<!--  deleteDialog   -->
      <v-dialog v-model="deleteDialog" activator="parent">
        <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-end align-center pr-5 pt-3">

            <v-btn @click="deleteDialog = false" color="info" variant="tonal" :size="38">
              <v-icon size="22">close</v-icon>
            </v-btn>
          </div>
          <v-card class="d-flex flex-column w-100 pr-5 pl-5 pb-5 mt-2 justify-space-between h-100 " min-height="240">
            <div class="d-flex justify-center align-center flex-column text-center">
              <v-icon size="60" color="warning">error</v-icon>
              <span class="mt-4 text-h6">Вы точно хотите удалить?</span>
            </div>
            <div class="d-flex flex-column justify-end ga-2 flex-grow-1 w-100 align-center">
              <v-btn :loading="loading" size="small" color="red" rounded="xl" height="35" class="mt-2 w-100" @click="removeCurrency">
                {{ remove }}
              </v-btn>
              <v-btn :loading="loading" size="small" color="info" rounded="xl" height="35" class="mt-1 w-100" @click="deleteDialog = false">
                {{ cancel }}
              </v-btn>
            </div>
          </v-card>
        </v-card>
      </v-dialog>
    </v-card>

  </v-col>
  </div>
  
  
</template>

<style scoped>

</style>