<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '@/composables/toast'
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import cashRegister from '../../../api/cashRegister.js';
import currency from '../../../api/currency.js';
import organization from '../../../api/organizations.js';
import employee from '../../../api/employee.js';
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage
} from "@/composables/constant/buttons.js";
import Icons from "@/composables/Icons/Icons.vue";
import binarySearch from "@/composables/binarySearch/binarySearch.js";

import {restoreMessage} from "../../../composables/constant/buttons.js";

const router = useRouter()

const loading = ref(true)
const loadingRate = ref(true)
const dialog = ref(false)
const digitalRef = ref(null)

const idCashRegister = ref(null)
const hoveredRowIndex = ref(null)

const employeeAdd = ref([])
const employeeUpdate = ref([])

const organizationAdd = ref([])
const organizationUpdate = ref([])

const currencyAdd = ref([])
const currencyUpdate = ref([])

const employees = ref([])
const currencies = ref([])
const organizations = ref([])


const isExistsCashRegister = ref(false)
const markedID = ref([]);
const markedItem = ref([])
const cashRegisterInDialogTitle = ref(null)
const search = ref('')
const selected = ref([])

const nameRef = ref(null)

const valueRef = ref(null)

const cashRegisters = ref([])
const paginations = ref([])

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
  {title: 'Организация', key: 'organization.name'},
  {title: 'Валюта', key: 'currency.name'},
  {title: 'Ответственное лицо', key: 'user.name'}
])

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}


const getcashRegisterData = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  try {
    const {data} = await cashRegister.get({page, itemsPerPage, sortBy}, search)

    paginations.value = data.result.pagination
    cashRegisters.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}


const addcashRegister = async ({page, itemsPerPage, sortBy}) => {


  const body = {
    name: nameRef.value,
    currency_id: currencyAdd.value,
    organization_id: organizationAdd.value,
    employee_id: employeeAdd.value
  }



  const res = await cashRegister.add(body)
  if (res.status === 201) {
    await getcashRegisterData({page, itemsPerPage, sortBy})
    showToast(addMessage)
    valueRef.value = null
    idCashRegister.value = res.data.result.id
    dialog.value = false
  }
}

const massDel = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedID.value
  }

  try {
    const {status} = await cashRegister.massDeletion(body)

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getcashRegisterData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
    }

  } catch (e) {

  }
}


const massRestore = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedID.value
  }

  try {
    const {status} = await cashRegister.massRestore(body)

    if (status === 200) {
      showToast(restoreMessage, 'red')
      await getcashRegisterData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
    }
  } catch (e) {

  }
}


const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    employee_id: employeeUpdate.value,
    organization_id: organizationUpdate.value,
    currency_id: currencyUpdate.value
  }

  try {
    const {status} = await cashRegister.update(idCashRegister.value, body)
    if (status === 200) {
      await getcashRegisterData({page, itemsPerPage, sortBy})
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}


const destroy = async ({page, itemsPerPage, sortBy}) => {
  if (markedID.value === null) return showToast(warningMessage, 'warning')
  try {
    const {status} = await cashRegister.delete(markedID.value)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getcashRegisterData({page, itemsPerPage, sortBy})
      dialog.value = false
      markedID.value = []
    }
  } catch (e) {

  }
}

const restore = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await cashRegister.restore(markedID.value)
    if (status === 200) {
      showToast(restoreMessage, 'green')
      await getcashRegisterData({page, itemsPerPage, sortBy})
      markedID.value = []
    }
  } catch (e) {

  }
}

const getEmployee = async () => {
  try {
    const {data} = await employee.get(1, 10000)
    employees.value = data.result.data.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    })
  } catch (e) {

  }
}

const getCurrencies = async () => {
  try {
    const {data} = await currency.get({page: 1, itemsPerPage: 100000})


    currencies.value = data.result.data.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    })

  } catch (e) {

  }
}
const getOrganizations = async () => {

  try {
    const {data} = await organization.get(1, 10000)

    organizations.value = data.result.data.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    })


  } catch (e) {

  }
}

onMounted(async () => {
  await getEmployee()
  await getCurrencies()
  await getOrganizations()
})


const handleCheckboxClick = function (item) {
  lineMarking(item)
}

const openDialog = (item) => {
  dialog.value = true

  if (item === 0) {
    idCashRegister.value = 0
    isExistsCashRegister.value = false
  } else {
    idCashRegister.value = item.id

    const index = binarySearch(cashRegisters.value, item.id)

    if (index !== 1) {
      isExistsCashRegister.value = true
      nameRef.value = item.name
      cashRegisterInDialogTitle.value = nameRef.value
    } else {

    }
  }

}


const addBasedOncashRegister = () => {
  if (markedID.value === null) return showToast(warningMessage, 'warning')

  dialog.value = true

  cashRegisters.value.forEach(item => {
    if (markedID.value === item.id) {
      nameRef.value = item.name
    }
  })
}

const compute = ({page, itemsPerPage, sortBy, search}) => {

  if (markedID.value.length === 1 && markedItem.value.deleted_at === null) {
    return destroy({page, itemsPerPage, sortBy, search})
  } else if (markedID.value.length === 1 && markedItem.value.deleted_at) {
    return restore({page, itemsPerPage, sortBy})
  } else if (markedID.value.length > 1) {
    return massDel({page, itemsPerPage, sortBy, search})
  } else {
    showToast(warningMessage, 'warning')
  }
}

const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
}


watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null

    loadingRate.value = true
  }
})


</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Должность</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons @click="openDialog(0)" name="add"/>
              <Icons @click="addBasedOncashRegister" name="copy"/>
              <Icons @click="compute" name="delete"/>
            </div>

            <div class="w-100">
              <v-text-field
                  v-model="search"
                  prepend-inner-icon="search"
                  density="compact"
                  label="Поиск..."
                  variant="outlined"
                  color="info"
                  rounded="lg"
                  clear-icon="close"
                  hide-details
                  single-line
                  clearable
                  flat
              ></v-text-field>

            </div>
          </div>
          <Icons name="filter" class="mt-1"/>
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
            :items="cashRegisters"
            :item-value="headers.title"
            :search="search"
            @update:options="getcashRegisterData"
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)" @dblclick="openDialog"
                :class="{'bg-grey-lighten-2': markedID.includes(item.id) }">
              <td class="">
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)"
                                  @change="handleCheckboxClick(item)">
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                  <span>{{ index + 1 }}</span>
                </template>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.organization.name }}</td>
              <td>{{ item.currency.name }}</td>
              <td>{{ item.name }}</td>

            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="500"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsCashRegister ? cashRegisterInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons @click="compute" name="delete"/>
                  <Icons v-if="isExistsCashRegister" @click="update" name="save"/>
                  <Icons v-else @click="addcashRegister" name="save"/>
                </div>
                <v-btn @click="dialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addcashRegister">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="green"
                      rounded="lg"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Доллар"
                      label="Название"
                      clear-icon="close"
                      clearable
                  />
                  <v-select
                      variant="outlined"
                      label="Выберите сотрудника"
                      v-model="employeeAdd"
                      :items="employees"
                      item-title="name"
                      item-value="id"
                  />
                  <v-select
                      variant="outlined"
                      label="Выберите валюту"
                      v-model="currencyAdd"
                      :items="currencies"
                      item-title="name"
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
                </v-col>
              </v-row>
            </v-form>


          </v-card>
        </v-dialog>

        <!--  addCurrencyRate    -->

      </v-card>
    </v-col>
  </div>


</template>

<style scoped>

</style>