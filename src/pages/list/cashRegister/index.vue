<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '@/composables/toast'
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import cashRegister from '../../../api/cashRegister.js';
import currency from '../../../api/currency.js';
import organization from '../../../api/organizations.js';
import employee from '../../../api/employee.js';
import validate from "./validate.js"
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {FIELD_COLOR} from "../../../composables/constant/colors.js";
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage
} from "@/composables/constant/buttons.js";
import Icons from "@/composables/Icons/Icons.vue";
import binarySearch from "@/composables/binarySearch/binarySearch.js";

import {restoreMessage} from "../../../composables/constant/buttons.js";

const router = useRouter()

const loading = ref(true)
const showConfirmDialog = ref(false);
const loadingRate = ref(true)
const dialog = ref(false)
const digitalRef = ref(null)

const idCashRegister = ref(null)
const hoveredRowIndex = ref(null)

const employeeAdd = ref(null)
const employeeUpdate = ref(null)

const organizationAdd = ref(null)
const organizationUpdate = ref(null)

const currencyAdd = ref(null)
const currencyUpdate = ref(null)

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
const showModal = ref(false);
const count = ref(0)

const toggleModal = () => {
  showModal.value = !showModal.value;
  // console.log('openModal');
};





const filterForm = ref({
    name: null,
    currency_id: null,
    employee_id: null,
    organization_id: null,

})

const showFilterModal = ref(false)

const headers = ref([
  {title: 'Наименование', key: 'name'},
  {title: 'Баланс', key: 'name'},

])



const isDataChanged = () => {
  const item = cashRegisters.value.find(
    (item) => item.id === idCashRegister.value
  );

  console.log(item)
  

  const isChanged =
    nameRef.value !== item.name ||
    currencyAdd.value !== item.currency.id ||
    organizationAdd.value !== item.organization.id ||
    employeeAdd.value !== item.responsiblePerson.id
  


  return isChanged;
};

const checkAndClose = () => {
  
  
  if (
    nameRef.value ||
    currencyAdd.value ||
    organizationAdd.value ||
    employeeAdd.value 
  ) {
    showConfirmDialog.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
};

function countFilter() {
   
   for (const key in filterForm.value) {
       if (filterForm.value[key] !== null) {
           count.value++;
       }
   }
   
   return count;
}

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false
  showConfirmDialog.value = false;
  cleanForm();
};

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }

};
const cleanForm = () => {
  nameRef.value = null;
  currencyAdd.value = null;
  organizationAdd.value = null;
  employeeAdd.value = null;
};




const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}


const getcashRegisterData = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  count.value = 0
  countFilter()
  const filterData = filterForm.value
  showFilterModal.value = false

  try {
    const {data} = await cashRegister.get({page, itemsPerPage, sortBy}, search, filterData)

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
    responsible_person_id: employeeAdd.value
  }
  console.log(employeeAdd.value)

  if (validate(nameRef, organizationAdd, currencyAdd, employeeAdd ) !== true) return


    const res = await cashRegister.add(body)

    if (res.status === 201) {
      await getcashRegisterData({page, itemsPerPage, sortBy})
      showToast(addMessage)
      valueRef.value = null
      currencyAdd.value = null
      organizationAdd.value = null
      employeeAdd.value = null
      idCashRegister.value = res.data.result.id
      dialog.value = false

      markedID.value = []
      markedItem.value = []

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
      dialog.value = false
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
      dialog.value = false
    }
  } catch (e) {

  }
}


const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    responsible_person_id: employeeAdd.value,
    organization_id: organizationAdd.value,
    currency_id: currencyAdd.value
  }

  try {
    const {status} = await cashRegister.update(idCashRegister.value, body)
    if (status === 200) {
      nameRef.value = null
      employeeUpdate.value = null;
      organizationUpdate.value = null;
      currencyUpdate.value = null;

      dialog.value = null
      cleanForm()
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
    const {data} = await employee.get({page: 1, itemsPerPage: 100000})
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
    const {data} = await organization.get({page: 1, itemsPerPage: 100000})

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

    markedID.value.push(item.id);
    const index = binarySearch(cashRegisters.value, item.id)

    if (index !== 1) {
      isExistsCashRegister.value = true
      nameRef.value = item.name
      employeeAdd.value = item.responsiblePerson.id
      organizationAdd.value = item.organization.id
      currencyAdd.value = item.currency.id
      cashRegisterInDialogTitle.value = nameRef.value
    } else {

    }
  }

}


const addBasedOncashRegister = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true

  cashRegisters.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name
      currencyAdd.value = item.currency.id
      organizationAdd.value = item.organization.id
      employeeAdd.value = item.responsiblePerson.id
    }
  })

}

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if(markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if(markedItem.value.deleted_at) {
    return massRestore({ page, itemsPerPage, sortBy })
  }
  else{
    return massDel({ page, itemsPerPage, sortBy, search })
  }
}

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = cashRegisters.value.find(el => el.id === markedID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if(item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if(item.deleted_at !== null) {
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



const cleanFilterForm = () => {
  filterForm.value = {}
}

const  closeFilterModal = async ({page, itemsPerPage, sortBy, search}) => {
  showFilterModal.value = false
  cleanFilterForm()
  await getcashRegisterData({page, itemsPerPage, sortBy, search})
  

}

watch(markedID, (newVal) => {
  markedItem.value = cashRegisters.value.find((el) => el.id === newVal[0]);
});


watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    currencyUpdate.value = null
    currencyAdd.value = null
    organizationUpdate.value = null
    organizationAdd.value = null
    employeeAdd.value = null
    employeeUpdate.value = null;

    loadingRate.value = true
  }
})


</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Кассы</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons @click="openDialog(0)" name="add" title="Создать" />
              <Icons @click="addBasedOncashRegister" title="Скопировать" name="copy"/>
              <Icons @click="compute" name="delete" title="Удалить" />
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
                  :base-color="FIELD_COLOR"
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
              @click="showFilterModal = true"
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
            :items="cashRegisters"
            :item-value="headers.title"
            :search="search"
            page-text='{0}-{1} от {2}'
            show-select
            v-model="markedID"
            :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
            @update:options="getcashRegisterData"
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)" @dblclick="openDialog(item)"
                :class="{'bg-grey-lighten-2': markedID.includes(item.id) }">
              <td class="d-flex">
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)"
                                  @change="handleCheckboxClick(item)">

                    <span>{{ item.id }}</span>

                  </CustomCheckbox>
                </template>
                <template v-else>
                  <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                  <span>{{ index.id }}</span>
                </template>
              </td>
              <td>{{ item.name }}</td>
              <td>+2500</td>

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
              <span>Касса: {{ isExistsCashRegister ? cashRegisterInDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons title="Удалить" v-if="isExistsCashRegister"  @click="compute" name="delete"/>
                  <Icons title="Сохранить" v-if="isExistsCashRegister" @click="update" name="save"/>
                  <Icons title="Сохранить" v-else @click="addcashRegister" name="save"/>
                </div>
                <v-btn
                @click="isExistsCashRegister ? checkUpdate : checkAndClose"
                
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addcashRegister">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100 ga-3">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="green"
                      :base-color="FIELD_COLOR"
                      rounded="md"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Наименование"
                      hide-details
                      label="Наименование"
                      clear-icon="close"
                      clearable
                  />
                  <div class="d-flex ga-4">
                    <v-autocomplete
                        style="max-width: 50%; min-width: 50%;"
                        variant="outlined"
                        hide-details
                        :base-color="FIELD_COLOR"
                        label="Валюта"
                        no-data-text="нет данных"
                        v-model="currencyAdd"
                        :items="currencies"
                        item-title="name"
                        item-value="id"
                    />
                    <v-autocomplete
                      style="max-width: 47%; min-width: 46%;"
                        variant="outlined"
                        hide-details
                        no-data-text="нет данных"
                        :base-color="FIELD_COLOR"
                        label="Ответственное лицо"
                        v-model="employeeAdd"
                        :items="employees"
                        item-title="name"
                        item-value="id"
                    />

                  </div>
                  <v-autocomplete
                      variant="outlined"
                      label="Организация"
                      hide-details
                      v-model="organizationAdd"
                      :items="organizations"
                      :base-color="FIELD_COLOR"
                      item-title="name"
                      item-value="id"
                  />
                </v-col>
              </v-row>
            </v-form>


          </v-card>
        </v-dialog>

        <!--  Filter    -->
      </v-card>
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="showFilterModal">
          <v-card style="border: 2px solid #3AB700" min-width="500"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Фильтр</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
            
                <Icons @click="getcashRegisterData" title="Фильтр" name="save"/>
                </div>
                <v-btn @click="closeFilterModal" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons title="Закрыть" name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addcashRegister">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100 ga-4">
                  <v-text-field
                      v-model="filterForm.name"
                      color="green"
                      rounded="md"
                      :base-color="FIELD_COLOR"
                      hide-details
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Наименование"
                      label="Наименование"
                      clear-icon="close"
                      clearable
                  />
                  <div class="d-flex ga-4">
                    <v-autocomplete
                        style="max-width: 50%; min-width: 50%;"
                        variant="outlined"
                        hide-details
                        :base-color="FIELD_COLOR"
                        label="Валюта"
                        v-model="filterForm.currency_id"
                        :items="currencies"
                        item-title="name"
                        item-value="id"
                    />
                    <v-autocomplete
                      style="max-width: 47%; min-width: 46%;"
                        variant="outlined"
                        :base-color="FIELD_COLOR"
                        hide-details
                        label="Ответственное лицо"
                        v-model="filterForm.employee_id"
                        :items="employees"
                        item-title="name"
                        item-value="id"
                    />

                  </div>
                  <v-autocomplete
                      variant="outlined"
                      label="Организация"
                      hide-details
                      v-model="filterForm.organization_id"
                      :items="organizations"
                      item-title="name"
                      item-value="id"
                  />
                </v-col>
              </v-row>
            </v-form>


          </v-card>
        </v-dialog>
        
        <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="toggleModal()" @closeClear="closeDialogWithoutSaving()" />
      </div>

      </v-card>
    </v-col>
  </div>


</template>

<style scoped>
.filterElement {
  position: relative;
}
.countFilter {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #82abf6;
  border-radius: 50%;
  font-size: 10px;
  color: white;
}
</style>
