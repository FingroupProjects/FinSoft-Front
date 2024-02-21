<script setup>
import {computed, onMounted, ref, watch} from "vue";
import { useRouter } from "vue-router";
import priceType from '../../../api/priceType.js'
import showToast from '../../../composables/toast'
import currency from "../../../api/currency.js";

const router = useRouter()
const isDialog = ref(false);
const updateDialog = ref(false);
const deleteDialog = ref(false);
const expand = ref(false);
const loading = ref(true);

const ID = ref(null)

const name = ref(null)
const symbol_code = ref(null)
const itemID = ref(null)
const nameError = ref(null)

const currencies = ref([])

const priceTypes = ref([])
const paginations = ref([])

const currencyAdd = ref([])
const currencyUpdate = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Название', key: 'name'},
  { title: 'Валюта', key: 'currency.symbol_code', sortable: false},
  { title: '#', key: 'icons', sortable: false},
])

const getCurrencyData = async ({ page, itemsPerPage, sortBy }) => {
  loading.value = true
  try {
    const { data } = await priceType.get(page, itemsPerPage, sortBy )
    paginations.value = data.result.pagination
    priceTypes.value = data.result.data
    loading.value = false
  } catch (e) {

  }
}

const validate = () => {
  nameError.value = null
  if (name.value.length < 1) {
    return nameError.value = 'Заполните поле!'
  }

  // if (currencyUpdate.id === null) {
  //   return nameError.value = 'Заполните поле!'
  // }

  return true
}

const getCurrency = async () => {
  try {
    const { data } = await currency.get(1, 10000 )
    currencies.value = data.result.data.map(item => {
      return {
        id: item.id,
        symbol_code: item.symbol_code
      }
    })
  } catch (e) {

  }
}

const create = async ({page, itemsPerPage, sortBy}) => {
  if (validate() !== true) return


  const body = {
    name: name.value,
    currency_id: currencyAdd.value
  }

  const res = await priceType.add(body)

  if (res.status === 201) {
    showToast('Успешно добавлена')
    isDialog.value = false;
    name.value = null;
   await getCurrencyData({page, itemsPerPage, sortBy})
  }

}

const editItem = item => {
  updateDialog.value = true
  name.value = item.name
  itemID.value = item.id
      currencies.value.map(el => {
    if (el.id === item.currency.id) {
      currencyUpdate.value = {
        id: item.currency.id,
        symbol_code: item.currency.symbol_code
      }
    }
  })
}

const update = async ({page, itemsPerPage, sortBy}) => {

  if (validate() !== true) return

  const body = {
    name: name.value,
    currency_id: currencyUpdate.value.id
  }

  const res = await priceType.update(itemID.value, body)

  if (res.status === 200) {
    showToast('Успешно обновлено')
    updateDialog.value = false
    name.value = null;
    await getCurrencyData({page, itemsPerPage, sortBy})
  }
}

const deleteItem = item => {
  ID.value = item.id
  deleteDialog.value = true
}

const deleteModal = async ({page, itemsPerPage, sortBy}) => {
  const {status} = await priceType.delete(ID.value)

  if (status === 200) {
    showToast('Успешно удалено', 'red')
    deleteDialog.value = false
    ID.value = null;
    await getCurrencyData({page, itemsPerPage, sortBy})
  }
}

watch(isDialog, async() => {
  if (isDialog.value === false) {
    name.value = null;
  }
} )
watch(updateDialog, async() => {
  if (updateDialog.value === false) {
    name.value = null;
  }
})


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
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #item.icons="{ item }">
            <v-icon class="icon mr-2" @click="editItem(item)" >edit</v-icon>
            <v-icon class="trash mr-2" @click="deleteItem(item)" color="red" >delete</v-icon>
          </template>
        </v-data-table-server>
      </v-card>
    </v-col>

<!-- addDialog   -->
    <v-card>
      <v-dialog width="500" v-model="isDialog" activator="parent">
        <v-card class="rounded-xl pl-4" :title="'Добавление'">
          <v-form class="w-100 pa-4" @submit.prevent="create">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100 ga-5">
                <v-text-field
                    variant="outlined"
                    label="Наименование"
                    type="text"
                    v-model="name"
                    :error-messages="nameError"
                />
                <v-select
                    variant="outlined"
                    label="Выберите валюту"
                    v-model="currencyAdd"
                    :items="currencies"
                    item-title="symbol_code"
                    item-value="id"
                />
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="green" type="submit">Добавить</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>

  <!-- updateDialog   -->
    <v-card>
      <v-dialog width="500" v-model="updateDialog" activator="parent">
        <v-card class="rounded-xl pl-4" :title="'Изменение '">
          <v-form class="w-100 pa-4" @submit.prevent="update">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100 ga-5">
                <v-text-field
                    v-model="name"
                    variant="outlined"
                    type="text"
                    :error-messages="nameError"
                    label="Наименование"
                />
                <v-select
                    :items="currencies"
                    v-model="currencyUpdate"
                    item-title="symbol_code"
                    item-value="id"
                    :hint="`${currencyUpdate.symbol_code} ${currencyUpdate.id}`"
                    variant="outlined"
                    label="Выберите валюту"
                    persistent-hint
                    return-object
                    single-line
                />
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="green" type="submit">Добавить</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>

<!-- deleteDialog   -->
    <v-card>
      <v-dialog width="400" v-model="deleteDialog" activator="parent">
        <v-card class="rounded-xl py-2">
          <v-form class="w-100 pa-2" @submit.prevent="deleteModal">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100 ga-5">
                <div class="text-center">
                  Вы точно хотите удалить?
                </div>
                 <div class="d-flex ga-2  justify-end align-center">
                  <v-btn :loading="loading" class="text-sm-body-2" color="red" type="submit">Удалить</v-btn>
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