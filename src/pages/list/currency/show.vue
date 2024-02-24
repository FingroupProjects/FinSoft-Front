<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import showToast from "../../../composables/toast/index.js";
import showDate from "../../../composables/date/showDate";
import currentDate from "../../../composables/date/currentDate";
import changeTheDateForSending from "../../../composables/date/changeTheDateForSending";
import currency from '../../../api/currency.js'
import {
  add,
  addIcon,
  addMessage, cancel, edit,
  editMessage,
  editIcon,
  prevIcon,
  removeIcon
} from "../../../composables/constant/buttons.js";

const route = useRoute()

const isDialog = ref(false)
const updateDialog = ref(false)
const deleteDialog = ref(false)
const loading = ref(false)
const search = ref('')

const currentCurrencyRateID = ref(null)
const symbolRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)

const currencies = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Дата', key: 'date'},
  { title: 'Значение', key: 'value'},
  { title: '#', key: 'icons', align: 'center', sortable: false},
])


const getCurrencyRateData = async ({ page, itemsPerPage, sortBy, search}) => {
  try {
    const response = await currency.show(route.params.id)
    const { data } = await currency.showRate(route.params.id, { page, itemsPerPage, sortBy }, search)
    currencies.value = data.result.data.map(item =>  ({
      ...item,
      date: showDate(item.date),
      name: response.data.result.name,
      digital_code: response.data.result.digital_code
    }))
    paginations.value = data.result.pagination
    loading.value = false
  } catch (e) {
    
  }
}


const addRate = async ({ page, itemsPerPage, sortBy }) => {

  console.log(dateRef.value)
  const body = {
    date: showDate(dateRef.value, '-'),
    value: valueRef.value
  }

  console.log(body)

  try {
    await currency.addRate(body, route.params.id)
    await getCurrencyRateData({ page, itemsPerPage, sortBy })
    showToast(addMessage)
    valueRef.value = null
    isDialog.value = false
  } catch(e) {

  }

}

const goToEdit = item => {
  currentCurrencyRateID.value = item.id
  dateRef.value = item.date.split('.').reverse().join('-')
  valueRef.value = item.value
  updateDialog.value = true
}

const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    date: changeTheDateForSending(dateRef.value, '.'),
    value: Number(valueRef.value)
  }

  const {status} = await currency.updateRate(currentCurrencyRateID.value, body)

  if (status === 200) {
    await getCurrencyRateData({page, itemsPerPage, sortBy})
    showToast(editMessage)
    updateDialog.value = false
  }
}

const goToDelete = item => {
  currentCurrencyRateID.value = item.id
  deleteDialog.value = true
}

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения',
  date: v => (v && /^\d{2}.\d{2}.\d{4}$/.test(v)) || 'Формат даты должен быть DD.MM.YYYY',
}

onMounted( async () => {
  dateRef.value = currentDate()
  symbolRef.value = useRoute().query.symbol
})


</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between  align-center">
        <div class="rounded-circle bg-blue pa-2 cursor-pointer" @click="$router.push('/list/currency')">
          <v-icon color="white" size="25">{{ prevIcon }}</v-icon>
        </div>
        <v-btn class="rounded-circle pa-2 mb-1" stacked color="green" size="40">
          <v-icon size="25">{{ addIcon }}</v-icon>
          <v-dialog v-model="isDialog" activator="parent">
            <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
              <div class="d-flex justify-space-between align-center pr-5 pt-3">
                <span class="pl-5">Добавление</span>
                <v-btn @click="isDialog = false" color="info" variant="tonal" :size="38">
                  <v-icon size="22">close</v-icon>
                </v-btn>
              </div>
              <v-form class="d-flex w-100 pa-5" @submit.prevent="addRate">
                <v-row class="w-100">
                  <v-col class="d-flex flex-column w-100">
                    <v-text-field
                        v-model="dateRef"
                        :rules="[rules.required]"
                        type="date"
                        label="Дата"
                        rounded="lg"
                        color="info"
                        variant="outlined"
                        density="compact"
                        clearable
                    />
                    <v-text-field
                        v-model="valueRef"
                        :rules="[rules.required]"
                        type="number"
                        hide-spin-buttons
                        placeholder="1.0000"
                        label="Значение"
                        rounded="lg"
                        color="info"
                        variant="outlined"
                        density="compact"
                        clearable
                    />
                    <div class="d-flex ga-2 justify-end align-center">
                      <v-btn :loading="loading" color="info" type="submit">{{ add }}</v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-dialog>
        </v-btn>
        
      </div>
      <v-card class="mt-4 table">
        <v-card-title class="d-flex align-center pe-2">
          <div class="d-flex flex-column text-sm-body-1">
            <p><strong>Наименование:</strong> {{ useRoute().query.name }}</p>
            <p><strong>Символьный код:</strong> {{ useRoute().query.symbol }}</p>
            <p><strong>Цифровой код:</strong> {{ useRoute().query.digital }}</p>
          </div>

          <v-spacer />
          <v-spacer />
          <v-spacer />

          <v-text-field
              v-model="search"
              prepend-inner-icon="search"
              density="compact"
              label="Поиск..."
              variant="outlined"
              color="info"
              single-line
              flat
              hide-details
              clearable
          ></v-text-field>
        </v-card-title>

        <v-data-table-server
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка..."
            no-data-text="Нет данных"
            v-model:items-per-page="paginations.per_page"
            :loading="loading"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="currencies"
            :search="search"
            :item-value="headers.title"
            @update:options="getCurrencyRateData"
            hover
        >
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
          </template>

          <template v-slot:item.icons="{ item }">
            <v-icon color="warning" @click="goToEdit(item)" class="icon">{{ editIcon }}</v-icon>
            <v-icon color="red" @click="goToDelete(item)" class="icon me-2">{{ removeIcon }}</v-icon>
          </template>
        </v-data-table-server>
      </v-card>

      <v-card>
        <v-dialog v-model="updateDialog" activator="parent">
          <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center pr-5 pt-3">
              <span class="pl-5">Изменение</span>
              <v-btn @click="updateDialog = false" color="info" variant="tonal" :size="38">
                <v-icon size="22">close</v-icon>
              </v-btn>
            </div>
            <v-form class="d-flex w-100 pa-5" @submit.prevent="update">
              <v-row class="w-100">
                <v-col class="d-flex flex-column justify-between w-100 ga-5">
                  <v-text-field
                      v-model="dateRef"
                      :rules="[rules.required, rules.date]"
                      type="date"
                      label="Дата"
                      rounded="lg"
                      color="info"
                      variant="outlined"
                      density="compact"
                      clearable
                  />
                  <v-text-field
                      v-model="valueRef"
                      :rules="[rules.required]"
                      type="number"
                      hide-spin-buttons
                      placeholder="1.0000"
                      label="Значение"
                      rounded="lg"
                      color="info"
                      variant="outlined"
                      density="compact"
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
      </v-card>

    </v-col>
  </div>
</template>

<style scoped>

</style>