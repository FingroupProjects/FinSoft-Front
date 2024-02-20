<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import priceType from '../../../api/priceType.js'
import showToast from '../../../composables/toast'
import currency from "../../../api/currency.js";

const router = useRouter()
const isDialog = ref(false);
const updateDialog = ref(false);
const expand = ref(false);
const loading = ref(true);

const ID = ref(null)

const name = ref(null)
const nameError = ref(null)

const currencies = ref([])


const priceTypes = ref([])
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id', align: 'start',},
  { title: 'Название', key: 'name', align: 'start',},
  { title: 'Валюта', key: 'currency.symbol_code', align: 'start',},
  { title: '#', key: 'icons', align: 'start',},
])

const getCurrencyData = async ({ page, itemsPerPage, sortBy }) => {
  loading.value = true
  try {
    const { data } = await priceType.get(page, itemsPerPage, sortBy )
    priceTypes.value = data.result.data
    console.log(data)
    paginations.value = data.result.pagination
    loading.value = false
  } catch (e) {

  }
}

const currencyName = item => {
  return {
    title: item.digital_code
  }
}


const validate = () => {
  nameError.value = null

  if (name.value === '') {
    return nameError.value = 'Заполните поле!'
  }

  console.log(ID.value)
  if (ID.value === null) {
    return nameError.value = 'Заполните поле!'
  }

  return true
}

const getCurrency = async () => {
  try {
    const { data } = await currency.get(1, 10000 )
    currencies.value = data.result.data
    console.log(currencies.value)

  } catch (e) {

  }
}

const create = async ({page, itemsPerPage, sortBy}) => {
  if (validate() !== true) return

  const body = {
    name: name.value,
    currency_id: ID.value.id
  }

  const res = await priceType.add(body)

  if (res.status === 201) {
    showToast('Успешно добавлена')
    isDialog.value = false;
    name.value = '';
    ID.value = null
   await getCurrencyData({page, itemsPerPage, sortBy})
  }

}

const update = async ({page, itemsPerPage, sortBy}) => {

  if (validate() !== true) return


  const body = {
    name: name.value,
    currency_id: ID.value.id
  }

  const res = await priceType.update(item.id, body)
  console.log(res)

  if (res.status === 200) {
    showToast('Успешно обновлено')
    isDialog.value = false
    name.value = '';
    ID.value = null;
    await getCurrencyData({page, itemsPerPage, sortBy})

  }
}

const showModal = async (item) => {
  isDialog.value = true
  name.value = item.name;
  ID.value = item.currency.id
}

onMounted(async () => {
  await getCurrency()
})

</script>

<template>

  <div>

    <v-col>
      <div class="d-flex w-100 justify-space-between">
        <div>
          <h2>Виды цен</h2>
        </div>
        <v-btn rounded="lg" @click="isDialog = true" color="info" >Создать</v-btn>
      </div>

      <v-card class="mt-4 table">

        <v-data-table-server
            :loading="loading"
            v-model:items-per-page="paginations.per_page"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="priceTypes"
            :item-value="headers.title"
            @update:options="getCurrencyData"
        >

          <template v-slot:item.id="{ item }">
            <span>{{ item.id }}</span>
          </template>
          <template #item.icons="{ item }">
            <v-icon class="icon mr-2" @click="showModal(item)" >edit</v-icon>
            <v-icon class="trash mr-2" color="red" >delete</v-icon>
          </template>

        </v-data-table-server>

      </v-card>
    </v-col>
    <v-card>
      <v-dialog width="500" v-model="isDialog" activator="parent">
        <v-card class="rounded-xl pl-4" :title="'Добавление'">
          <v-form class="w-100 pa-4" @submit.prevent="create">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100 ga-5">
                <v-text-field variant="outlined" type="text" :error-messages="nameError"
                              label="Наименование" v-model="name"/>
                <v-select :items="currencies" v-model="ID" :item-props="currencyName" variant="outlined" label="Выберите валюту"></v-select>
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="green" type="submit">Добавить</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>
    <v-card>
      <v-dialog width="500" v-model="updateDialog" activator="parent">
        <v-card class="rounded-xl pl-4" :title="'Изменение '">
          <v-form class="w-100 pa-4" @submit.prevent="update">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100 ga-5">
                <v-text-field variant="outlined" type="text" :error-messages="nameError"
                              label="Наименование" v-model="name"/>
                <v-select :items="currencies" v-model="ID" :item-props="currencyName" variant="outlined" label="Выберите валюту"></v-select>
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="green" type="submit">Добавить</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>
  </div>


</template>

<style scoped>

</style>