<script setup>
import {computed, onMounted, ref, watch} from "vue";
import { useRouter } from "vue-router";
import cashRegister from '../../../api/cashRegister.js'
import organization from '../../../api/organizations.js'
import showToast from '../../../composables/toast'
import currency from "../../../api/currency.js";

const isDialog = ref(false);
const updateDialog = ref(false);
const deleteDialog = ref(false);

const loading = ref(true);

const ID = ref(null)
const search = ref('')
const name = ref(null)
const itemID = ref(null)
const nameError = ref(null)
const currencyError = ref(null)
const organizationError = ref(null)

const currencies = ref([])
const organizations = ref([])

const cashRegisters = ref([])
const paginations = ref([])

const currencyAdd = ref([])
const currencyUpdate = ref([])
const organizationAdd = ref([])
const organizationUpdate = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Название', key: 'name'},
  { title: 'Валюта', key: 'currency.symbol_code', sortable: false},
  { title: 'Организация', key: 'organization.name', sortable: false},
  { title: '#', key: 'icons', sortable: false},
])

const getCashRegisterData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true
  try {
    const { data } = await cashRegister.get({page, itemsPerPage, sortBy}, search )
    paginations.value = data.result.pagination
    cashRegisters.value = data.result.data
    loading.value = false
  } catch (e) {

  }
}

const validate = () => {
  nameError.value = null
  currencyError.value = null
  organizationError.value = null

  if (name.value === null) {
    return nameError.value = 'Заполните поле!'
  }

  if (currencyAdd.value.length === 0) {
   return  currencyError.value = 'Выберите валюту'
  }
  if (organizationAdd.value.length === 0) {
    return currencyError.value = 'Выберите организацию'
  }
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
const getOrganizations = async () => {
  try {
    const { data } = await organization.getAll(1, 10000 )
    organizations.value = data.result.data.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    })
  } catch (e) {

  }
}


const create = async ({page, itemsPerPage, sortBy}) => {
  if (validate() !== true) return

  const body = {
    name: name.value,
    currency_id: currencyAdd.value,
    organization_id: organizationAdd.value
  }

  const res = await cashRegister.add(body)

  if (res.status === 201) {
    showToast('Успешно добавлена')
    isDialog.value = false;
    name.value = null;
   await getCashRegisterData({page, itemsPerPage, sortBy})
  }

}

const editItem = item => {
  updateDialog.value = true
  name.value = item.name
  itemID.value = item.id

  let organizationID;

  organizations.value.map(el => {
    if (el.id === item.organization.id) {
      organizationUpdate.value = {
        id: item.organization.id,
        name: item.organization.name
      }
      organizationID = item.organization.id
    }
  })

  currencies.value.map(el => {
    if (el.id === item.currency.id) {
      currencyUpdate.value = {
        id: item.currency.id,
        symbol_code: item.currency.symbol_code,
        organization_id: organizationID
      }
    }
  })
}

const update = async ({page, itemsPerPage, sortBy}) => {

  if (validate() !== true) return
  const body = {
    name: name.value,
    currency_id: currencyUpdate.value.id,
    organization_id: currencyUpdate.value.organization_id || organizationUpdate.value.id,
  }

  const { status } = await cashRegister.update(itemID.value, body)

  if (status === 200) {
    showToast('Успешно обновлено')
    updateDialog.value = false
    name.value = null;
    await getCashRegisterData({page, itemsPerPage, sortBy})
  }
}

const deleteItem = item => {
  ID.value = item.id
  deleteDialog.value = true
}

const deleteModal = async ({page, itemsPerPage, sortBy}) => {
  const {status} = await cashRegister.delete(ID.value)

  if (status === 200) {
    showToast('Успешно удалено', 'red')
    deleteDialog.value = false
    ID.value = null;
    await getCashRegisterData({page, itemsPerPage, sortBy})
  }
}

watch(isDialog, async() => {
  if (isDialog.value === false) {
    name.value = null;
  }
})

watch(updateDialog, async() => {
  if (updateDialog.value === false) {
    name.value = null;
  }
})

onMounted(async () => {
  await getCurrency()
  await getOrganizations()
})

</script>

<template>

  <div>
    <v-col>
      <div class="d-flex w-100 justify-end">
        <v-btn rounded="lg" @click="isDialog = true" color="info" >Создать</v-btn>
      </div>
      <v-card class="mt-4 table">
        <v-card-title class="d-flex align-center pe-2">
          Касса

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
            :items="cashRegisters"
            :item-value="headers.title"
            :search="search"
            @update:options="getCashRegisterData"
        >
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #item.icons="{ item }">
            <v-icon class="icon mr-2" @click="editItem(item)" color="info">edit</v-icon>
            <v-icon class="icon mr-2" @click="deleteItem(item)" color="red" >delete</v-icon>
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
                <v-select
                    variant="outlined"
                    label="Выберите организацию"
                    v-model="organizationAdd"
                    :items="organizations"
                    item-title="name"
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
                    variant="outlined"
                    label="Выберите валюту"
                    persistent-hint
                    return-object
                    single-line
                />
                <v-select
                    :items="organizations"
                    v-model="organizationUpdate"
                    item-title="name"
                    item-value="id"
                    :error-messages="organizationError"
                    variant="outlined"
                    label="Выберите организацию"
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