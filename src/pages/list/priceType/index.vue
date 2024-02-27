<script setup>
import {onMounted, ref, watch} from "vue";
import showToast from '../../../composables/toast'
import priceType from '../../../api/priceType.js'
import currency from "../../../api/currency.js";
import {add, editIcon, remove, removeIcon, cancel} from "../../../composables/constant/buttons.js";


const search = ref('')
const isDialog = ref(false);
const updateDialog = ref(false);
const deleteDialog = ref(false);
const loading = ref(true);

const ID = ref(null)

const name = ref(null)
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
  { title: 'Валюта', key: 'currency.symbol_code'},
  { title: '#', key: 'deleted_at', align: 'center', sortable: false},
])

const getPriceTypeData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true

  try {
    const { data } = await priceType.get({page, itemsPerPage, sortBy}, search)
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

  return true
}

const getCurrency = async () => {
  try {
    const { data } = await currency.get({itemsPerPage: 1000})
    currencies.value = data.result.data.map(item => {
      return {
        id: item.id,
        symbol_code: item.symbol_code
      }
    })
  } catch (e) {

  }
}

const create = async ({ page, itemsPerPage, sortBy }) => {
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
    await getPriceTypeData({ page, itemsPerPage, sortBy })
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

const update = async ({ page, itemsPerPage, sortBy }) => {

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
    await getPriceTypeData({ page, itemsPerPage, sortBy })
  }
}

const deleteItem = item => {
  ID.value = item.id
  deleteDialog.value = true
}

const deleteModal = async ({ page, itemsPerPage, sortBy }) => {
  const { status } = await priceType.delete(ID.value)

  if (status === 200) {
    showToast('Успешно удалено', 'red')
    deleteDialog.value = false
    ID.value = null;
    await getPriceTypeData({ page, itemsPerPage, sortBy })
  }
}

watch(isDialog, () => {
  if (isDialog.value === false) {
    name.value = null;
  }
})
watch(updateDialog,() => {
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
      <div class="d-flex w-100 justify-end">
        <v-btn rounded="lg" @click="isDialog = true" color="info">Создать</v-btn>
      </div>
      <v-card class="mt-4 table">
        <v-card-title class="d-flex align-center pe-2">
          Виды цен

          <v-spacer />
          <v-spacer />
          <v-spacer />

          <v-text-field
              v-model="search"
              prepend-inner-icon="search"
              density="compact"
              label="Поиск..."
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
            v-model:items-per-page="paginations.per_page"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="priceTypes"
            :search="search"
            :item-value="headers.title"
            @update:options="getPriceTypeData"
        >
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template v-slot:item.deleted_at="{ item }">
            <div class="d-flex justify-center">
              <div class="d-flex align-center justify-center ga-1" v-if="!item.deleted_at">
                <v-icon color="warning" @click="editItem(item)" class="icon">{{ editIcon }}</v-icon>
                <v-icon color="red" @click="deleteItem(item)" class="icon">{{ removeIcon }}</v-icon>
              </div>
              <v-icon v-else color="red" class=" cursor-pointer">close</v-icon>
            </div>
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
                    v-model="currencyAdd"
                    :items="currencies"
                    variant="outlined"
                    label="Выберите валюту"
                    item-title="symbol_code"
                    item-value="id"
                />
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="green" type="submit">{{ add }}</v-btn>
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
                <v-text-field v-model="name" variant="outlined" type="text" :error-messages="nameError"
                  label="Наименование" />
                <v-select :items="currencies" v-model="currencyUpdate" item-title="symbol_code" item-value="id"
                  :hint="`${currencyUpdate.symbol_code} ${currencyUpdate.id}`" variant="outlined" label="Выберите валюту"
                  persistent-hint return-object single-line />
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="green" type="submit">{{ add }}</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>

    <!-- deleteDialog   -->
    <v-card>
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
              <v-btn :loading="loading" size="small" color="red" rounded="xl" height="35" class="mt-2 w-100" @click="deleteModal">
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

  </div>
</template>

<style scoped></style>