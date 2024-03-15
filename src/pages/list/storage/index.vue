<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '@/composables/toast'
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import storage from '../../../api/storage.js';
import employee from '../../../api/employee.js';
import organization from '../../../api/organizations.js';
import showDate from "../../../composables/date/showDate.js";
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage
} from "@/composables/constant/buttons.js";
import Icons from "@/composables/Icons/Icons.vue";

import {restoreMessage} from "../../../composables/constant/buttons.js";

const router = useRouter()
const groupDialog = ref(false)
const loading = ref(true)

const loadingStorageData = ref(true)
const dialog = ref(false)


const idStorage = ref(null)
const idStorageEmployee = ref(null)
const hoveredRowIndex = ref(null)
const hoveredRowEmployeeIndex = ref(null)

const employeeAdd = ref([])
const employeeUpdate = ref([])
const groupName = ref(null)
const isExistsStorageData = ref(false);
const isExistsGroup = ref(false);


const organizationAdd = ref([])
const organizationUpdate = ref([])

const employees = ref([])
const organizations = ref([])
const storageData = ref([])


const isExistsStorage = ref(false)
const dataDialog = ref(false)
const markedID = ref([]);
const markedEmployeeID = ref([]);
const markedItem = ref([])
const storageInDialogTitle = ref(null)
const search = ref('')
const selected = ref([])

const nameRef = ref(null)
const startDateRef = ref(null)
const endDateRef = ref(null)

const valueRef = ref(null)

const storages = ref([])
const paginations = ref([])
const paginationsStorageData = ref([])


const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
])


const headersStorageEmployee = ref([
  {title: '№', key: 'id'},
  {title: 'Сотрудник', key: 'employee.name'},
  {title: 'Дата начало', key: 'from'},
  {title: 'Дата конец', key: 'to'},
])
const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}


const getStorageData = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  try {
    const {data} = await storage.get({page, itemsPerPage, sortBy}, search)

    paginations.value = data.result.pagination
    storages.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}

const getStorageEmployeeData = async ({page, itemsPerPage, sortBy, search}) => {

  if (idStorage.value === 0) {
    loadingStorageData.value = false
    return
  }

  loadingStorageData.value = true
  try {
    const {data} = await storage.getStorageEmployee({page, itemsPerPage, sortBy}, search, idStorage.value)

    paginationsStorageData.value = data.result.pagination
    storageData.value = data.result.data.map(item => ({
      ...item,
      from: showDate(item.from),
      to: showDate(item.to),
    })) || [];
    loadingStorageData.value = false
  } catch (e) {
  }
}


const addStorage = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    organization_id: organizationAdd.value,
    storage_data: [],
  }

  try {
  const res = await storage.add(body)


  if (res.status === 201) {
    await getStorageData({page, itemsPerPage, sortBy})
    showToast(addMessage)
    valueRef.value = null
    organizationAdd.value = null
    employeeAdd.value = null
    idStorage.value = res.data.result.id
    dialog.value = false

    markedID.value = []
    markedItem.value = []

  }
  } catch (error) {

    let showToastFlag = true;

    if (error.response && error.response.status === 422) {
      if (error.response.data.errors.name && showToastFlag) {
        showToast(error.response.data.errors.name[0], "warning")
        showToastFlag = false;
      }

      if (error.response.data.errors.organization_id && showToastFlag) {
        showToast(error.response.data.errors.organization_id[0], "warning")
        showToastFlag = false;
      }
    }

  }

}



const addGroup = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: groupName.value
  }


  const res = await storage.group(body)

  if (res.status === 201) {
    await getStorageData({page, itemsPerPage, sortBy})
    showToast(addMessage)
    groupName.value = null

    groupDialog.value = false

    markedID.value = []
    markedItem.value = []

  }

}

const addStorageEmployee = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    employee_id: employeeAdd.value,
    from: startDateRef.value,
    to: endDateRef.value,
  }


  try{

  const res = await storage.addStorageEmployee(idStorage.value, body)

  if (res.status === 201) {
    await getStorageEmployeeData({page, itemsPerPage, sortBy})
    showToast(addMessage)
    employeeAdd.value = null;
    startDateRef.value = null;
    endDateRef.value = null;
    idStorage.value = res.data.result.id
    dataDialog.value = false

    markedID.value = []
    markedItem.value = []

  }
  } catch (error) {

    let showToastFlag = true;

    if (error.response && error.response.status === 422) {
      if (error.response.data.errors.employee_id && showToastFlag) {
        showToast(error.response.data.errors.employee_id[0], "warning")
        showToastFlag = false;
      }
      if (error.response.data.errors.from && showToastFlag) {
        showToast(error.response.data.errors.from[0], "warning")
        showToastFlag = false;
      }
      if (error.response.data.errors.to && showToastFlag) {
        showToast(error.response.data.errors.to[0], "warning")
        showToastFlag = false;
      }

    }

  }

}


const massDel = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedID.value
  }

  try {
    const {status} = await storage.massDeletion(body)

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getStorageData({page, itemsPerPage, sortBy}, search)
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
    const {status} = await storage.massRestoreEmployee(body)

    if (status === 200) {
      showToast(restoreMessage, 'red')
      await getStorageEmployeeData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}





const massDelEmployee = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedEmployeeID.value
  }

  try {
    const {status} = await storage.massDeletionEmployee(body)

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getStorageEmployeeData({page, itemsPerPage, sortBy}, search)
      markedEmployeeID.value = []
      dataDialog.value = false
    }

  } catch (e) {

  }
}


const massRestoreEmployee = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedEmployeeID.value
  }

  try {
    const {status} = await storage.massRestoreEmployee(body)

    if (status === 200) {
      showToast(restoreMessage, 'red')
      await getStorageEmployeeData({page, itemsPerPage, sortBy}, search)
      markedEmployeeID.value = []
      dataDialog.value = false
    }
  } catch (e) {

  }
}







const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    organization_id: organizationAdd.value
  }

  try {
    const {status} = await storage.update(idStorage.value, body)
    if (status === 200) {
      nameRef.value = null
      organizationUpdate.value = null;

      dialog.value = null
      await getStorageData({page, itemsPerPage, sortBy})
      markedID.value = []
      showToast(editMessage)


    }
  } catch (e) {
    console.log(e)
  }
}


const updateEmployee = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    employee_id: employeeAdd.value,
    from: startDateRef.value,
    to:  endDateRef.value
  }

  try {
    const {status} = await storage.updateEmployee(idStorageEmployee.value, body)
    if (status === 200) {

      await getStorageEmployeeData({page, itemsPerPage, sortBy})
      dataDialog.value = false

      employeeAdd.value = null
      startDateRef.value = null

      endDateRef.value = null


      markedEmployeeID.value = []
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}


const destroy = async ({page, itemsPerPage, sortBy}) => {
  if (markedID.value === null) return showToast(warningMessage, 'warning')
  try {
    const {status} = await storage.delete(markedID.value)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getStorageData({page, itemsPerPage, sortBy})
      dialog.value = false
      markedID.value = []
    }
  } catch (e) {

  }
}

const restore = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await storage.restore(markedID.value)
    if (status === 200) {
      showToast(restoreMessage, 'green')
      await getStorageData({page, itemsPerPage, sortBy})
      markedID.value = []
    }
  } catch (e) {

  }
}

const getEmployee = async () => {
  try {
    const {data} = await employee.get({page:1, itemsPerPage: 100})
    employees.value = data.result.data.map(item => {
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
    const {data} = await organization.get({page: 1, itemsPerPage: 1000})

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
  await getOrganizations()
})


const handleCheckboxClick = function (item) {

  lineMarking(item)
}
const handleEmployeeCheckboxClick = function (item) {
  employeeLineMarking(item)
}

const openDialog = (item) => {

  if (markedID.value.length > 1) {
    return showToast(selectOneItemMessage, 'warning');
  }



  dialog.value = true

  if (item === 0) {
    idStorage.value = 0
    isExistsStorage.value = false
  } else {
    idStorage.value = item.id

    markedID.value.push(item.id);
    isExistsStorage.value = true
    nameRef.value = item.name
    organizationAdd.value = item.organization.id
    storageInDialogTitle.value = nameRef.value
  }

}


const addBasedOnStorage = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true
  isExistsStorage.value = false

  storages.value.forEach(item => {
    if (markedID.value[0] === markedID.value) {
      console.log(markedID.value[0])
      nameRef.value = item.name
      organizationAdd.value = item.organization.id
      employeeAdd.value = item.responsiblePerson.id
    }
  })

}

const compute = ({page, itemsPerPage, sortBy, search}) => {

  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value.deleted_at) {
    return massRestore({page, itemsPerPage, sortBy})
  } else {
    return massDel({page, itemsPerPage, sortBy, search})
  }
}


const removeStorageEmployee = ({page, itemsPerPage, sortBy, search}) => {

  if (markedEmployeeID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value.deleted_at) {
    return massRestoreEmployee({page, itemsPerPage, sortBy})
  } else {

    return massDelEmployee({page, itemsPerPage, sortBy, search})
  }
}


const editDialogStorageData = (item) => {
  if (markedEmployeeID.value.length > 1) {
    return showToast(selectOneItemMessage, 'warning');
  }


  dataDialog.value = true

  if (item === 0) {
    idStorage.value = 0
    isExistsStorage.value = false
  } else {



    idStorageEmployee.value = item.id

    employeeAdd.value = item.employee.id

    startDateRef.value = item.from.split('.').reverse().join('-')
    console.log(startDateRef.value)
    endDateRef.value = item.to.split('.').reverse().join('-')


    markedEmployeeID.value.push(item.id);


    isExistsStorageData.value = true

    storageInDialogTitle.value = nameRef.value

  }

}

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = storages.value.find(el => el.id === markedID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
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


const employeeLineMarking = (item) => {

  if (markedEmployeeID.value.length > 0) {
    const firstMarkedItem = storageData.value.find(el => el.id === markedEmployeeID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
  }

  const index = markedEmployeeID.value.indexOf(item.id);
  if (index !== -1) {
    markedEmployeeID.value.splice(index, 1);
  } else {
    markedEmployeeID.value.push(item.id);
  }
  markedItem.value = item;


}


watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    organizationUpdate.value = null
    organizationAdd.value = null
    employeeAdd.value = null
    employeeUpdate.value = null;
    startDateRef.value = null;
    endDateRef.value = null;

  }
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Склады</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-2 me-3">
              <button
                  style="
                  background-color: #4ecb71;
                  border-radius: 12px;
                  white-space: nowrap;
                  height: 25px;
                  font-size: 12px;
                  border: 1px solid red;
                "
                  @click="groupDialog = true"
              >
                <span class="px-2 py-0">создать группу</span>
              </button>
              <Icons @click="openDialog(0)" name="add" />
              <Icons name="copy" @click="addBasedOnStorage" />
              <Icons
                  @click="compute"
                  name="delete"
              />
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
            :items="storages"
            :item-value="headers.title"
            :search="search"
            @update:options="getStorageData"
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)"
                @dblclick="openDialog(item)"
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

            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="300"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsStorage ? storageInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="isExistsStorage" @click="compute" name="delete"/>
                  <Icons v-if="isExistsStorage" @click="update" name="save"/>
                  <Icons v-else @click="addStorage" name="save"/>
                </div>
                <v-btn @click="dialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addStorage">
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
                      placeholder="Наименование"
                      label="Название"
                      clear-icon="close"
                      clearable
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

            <v-card class="table" style="border: 1px solid #3AB700">
              <div class="d-flex w-100 rounded-t-lg mb-1 align-center " style="border-bottom: 1px solid #3AB700">
                <div class="d-flex justify-end w-100 ga-2 pt-1 me-2" style="padding-top: 4px !important;">
                  <Icons @click="removeStorageEmployee" name="delete"/>
                  <Icons @click="dataDialog = true" name="add"/>
                </div>
              </div>
              <v-data-table-server
                  style="height: 38vh"
                  items-per-page-text="Элементов на странице:"
                  loading-text="Загрузка"
                  no-data-text="Нет данных"
                  v-model:items-per-page="paginationsStorageData.per_page"
                  :loading="loadingStorageData"
                  :headers="headersStorageEmployee"
                  :items-length="paginationsStorageData.total || 0"
                  :items="storageData"
                  :item-value="headersStorageEmployee.title"
                  :search="search"
                  @update:options="getStorageEmployeeData"
                  fixed-footer
                  hover
              >
                <template v-slot:item="{ item, index }">
                  <tr @mouseenter="hoveredRowEmployeeIndex = index" @mouseleave="hoveredRowEmployeeIndex = null"
                      @click="employeeLineMarking(item)"
                      :class="{'bg-grey-lighten-2': markedEmployeeID.includes(item.id) }"
                      @dblclick="editDialogStorageData(item)">
                    <td class="">
                      <template v-if="hoveredRowEmployeeIndex === index || markedEmployeeID.includes(item.id)">
                        <CustomCheckbox v-model="markedEmployeeID" :checked="markedEmployeeID.includes(item.id)"
                                        @change="handleEmployeeCheckboxClick(item)">
                          <span>{{ index + 1 }}</span>
                        </CustomCheckbox>
                      </template>
                      <template v-else>
                        <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                        <span>{{ index + 1 }}</span>
                      </template>
                    </td>
                    <td>{{ item.employee.name }}</td>
                    <td>{{ item.from }}</td>
                    <td>{{ item.to }}</td>
                  </tr>
                </template>
              </v-data-table-server>
            </v-card>
          </v-card>
        </v-dialog>

        <!--  addStorageData    -->
        <v-dialog v-model="dataDialog" activator="parent">
          <v-card style="border: 2px solid #3AB700" min-width="400"
                  class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center pr-5 pt-3">
              <span class="pl-5">{{ isExistsStorageData ? 'Изменить' : 'Добавить' }} сотрудника</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons @click="removeStorageEmployee" name="delete"/>
                  <Icons v-if="isExistsStorageData" @click="updateEmployee" name="save"/>
                  <Icons v-else @click="addStorageEmployee" name="save"/>
                </div>
                <v-btn @click="dataDialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100 pa-5">
              <v-row class="w-100">
                <v-col class="d-flex flex-column justify-between w-100 ga-5">
                  <v-select
                      variant="outlined"
                      label="Выберите сотрудника"
                      v-model="employeeAdd"
                      :items="employees"
                      item-title="name"
                      item-value="id"
                  />
                  <v-text-field
                      v-model="startDateRef"
                      :rules="[rules.required]"
                      type="date"
                      label="Дата начало"
                      rounded="lg"
                      color="green"
                      variant="outlined"
                      density="compact"
                      clear-icon="close"
                  />
                  <v-text-field
                      v-model="endDateRef"
                      :rules="[rules.required]"
                      type="date"
                      label="Дата конец"
                      rounded="lg"
                      color="green"
                      variant="outlined"
                      density="compact"
                      clear-icon="close"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>
      <v-card>
        <v-dialog class="mt-2 pa-2"  v-model="groupDialog">
          <v-card style="border: 2px solid #3AB700" min-width="300" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Добавление</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">

                  <Icons v-if="isExistsGroup" @click="update" name="save"/>
                  <Icons v-else @click="addGroup" name="save"/>
                </div>
                <v-btn @click="groupDialog = false"  variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close" />
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addGroup">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="groupName"
                      :rules="[rules.required]"
                      color="green"
                      rounded="lg"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      label="Наименование"
                      clear-icon="close"
                      clearable
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>

      </v-card>

    </v-col>
  </div>
  <!-- Group Modal -->


</template>

<style scoped>

</style>