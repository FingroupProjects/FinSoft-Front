<script setup>
import {onMounted, ref, watch, computed} from "vue";
import {useRouter} from "vue-router";
import showToast from '@/composables/toast'
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import storage from '../../../api/storage.js';
import employee from '../../../api/employee.js';
import organizationApi from '../../../api/organizations.js';
import showDate from "../../../composables/date/showDate.js";
import {createAccess, updateAccess, removeAccess} from "../../../composables/access/access.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";

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
import storageGroup from "../../../api/storageGroup.js";
import {FIELD_COLOR, FIELD_OF_SEARCH} from "../../../composables/constant/colors.js";
import validate from "./validate.js";
import debounce from "lodash.debounce";

const router = useRouter()
const showConfirmDialog = ref(false);
const groupDialog = ref(false)
const loading = ref(true)
const loadingGroup = ref(true)

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
const groupIdRef = ref(0)

const organization = ref(null)

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
const debounceSearch = ref('')
const group = ref(null)

const nameRef = ref(null)
const startDateRef = ref(null)
const endDateRef = ref(null)

const valueRef = ref(null)

const storages = ref([])
const groups = ref([])
const paginations = ref([])
const paginationsGroup = ref([])
const paginationsStorageData = ref([])
const showModal = ref(false);

const count = ref(0)

const toggleModal = () => {
  showModal.value = !showModal.value;
};

watch(groupDialog, newVal => {
  if (!newVal) {
    isExistsGroup.value = false
    groupName.value = null
  }
})

const headers = ref([
  {title: 'Наименование', key: 'name'},
])

const headersGroup = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Название группы', key: 'name'},
])

const headersStorageEmployee = ref([
  {title: '№', key: 'id'},
  {title: 'Сотрудник', key: 'employee.name'},
  {title: 'Дата начало', key: 'from'},
  {title: 'Дата конец', key: 'to'},
])

const filterForm = ref({
  name: null,
  organization_id: null,
  employee_id: null
})
const filterDialog = ref(false)


const isOrganizationFieldDisabled = computed(() => {
  return !createAccess('organizations') && !updateAccess('organizations');
});

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}

const getGroup = async ({page, itemsPerPage, sortBy}) => {
  loadingGroup.value = true
  try {
    const {data} = await storageGroup.get({page, itemsPerPage, sortBy})
    paginationsGroup.value = data.result.pagination
    groups.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name,
      deleted_at: item.deleted_at
    }))
  } catch (e) {

  } finally {
    loadingGroup.value = false
  }
}

const getStorage = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  try {
    const {data} = await storage.get({page, itemsPerPage, sortBy}, search, filterForm.value)
    paginations.value = data.result.pagination
    storages.value = data.result.data
    groupIdRef.value = 0
  } catch (e) {

  } finally {
    loading.value = false
  }
}

const getStoragesFromTheGroup = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    count.value = 0
    countFilter()
    const filterData = filterForm.value
    filterDialog.value = false
    if (groupIdRef.value === 0) return

    loading.value = true

    const { data } = await storageGroup.getStorages({page, itemsPerPage, sortBy}, search, groupIdRef.value, filterData)
    paginations.value = data.result.pagination
    storages.value = data.result.data

  } catch (e) {

  } finally {
    loading.value = false
  }
}

function countFilter() {
   
   for (const key in filterForm.value) {
       if (filterForm.value[key] !== null) {
           count.value++;
       }
   }
   
   return count;
}

const getStorageEmployeeData = async ({page, itemsPerPage, sortBy, search}) => {

  if (idStorage.value === 0) {
    loadingStorageData.value = false
    return
  }

  loadingStorageData.value = true
  try {
    const { data } = await storage.getStorageEmployee({page, itemsPerPage, sortBy}, search, idStorage.value)

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


const addStorage = async () => {
  if (validate(nameRef, organization, group) !== true) return

  let groupValue;
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  let organizationValue;
  if (typeof organization.value === 'object') {
    organizationValue = organization.value.id
  } else {
    organizationValue = organization.value
  }

  try {
    const body = {
      name: nameRef.value,
      organization_id: organizationValue,
      storage_data: [],
      group_id: groupValue
    }

    const res = await storage.add(body)
    if (res.status === 201) {
      await getStoragesFromTheGroup({})
      showToast(addMessage)
      valueRef.value = null
      organization.value = null
      employeeAdd.value = null
      idStorage.value = res.data.result.id
      isExistsStorage.value = true
      storageInDialogTitle.value = res.data.result.name

      organization.value = res.data.result.organization.id

      markedID.value = []
      markedItem.value = []

    }
  } catch (error) {

    if (error.response && error.response.status === 422) {
      if (error.response.data.errors.name) {
        showToast(error.response.data.errors.name[0], "warning")
      }

      if (error.response.data.errors.organization_id) {
        showToast(error.response.data.errors.organization_id[0], "warning")
      }
    }

  }
}

const update = async ({page, itemsPerPage, sortBy}) => {
  if (validate(nameRef, organization, group) !== true) return

  let groupValue;
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  let organizationValue;
  if (typeof organization.value === 'object') {
    organizationValue = organization.value.id
  } else {
    organizationValue = organization.value
  }

  const body = {
    name: nameRef.value,
    organization_id: organizationValue,
    group_id: groupValue
  }

  try {
    const {status} = await storage.update(idStorage.value, body)
    if (status === 200) {
      nameRef.value = null
      organization.value = null
      dialog.value = null
      cleanForm()
      await getStoragesFromTheGroup({page, itemsPerPage, sortBy})
      markedID.value = []
      showToast(editMessage)
      cleanForm()
    }
  } catch (e) {
    console.log(e)
  }
}


const addGroup = async (page, itemsPerPage, sortBy) => {
  if (!groupName.value) {
    return showToast("Поле наименования не может быть пустым", "warning")
  }
  try {
    const res = await storageGroup.add({name: groupName.value, type: 0})
    if (res.status === 201) {
      await getGroup({page, itemsPerPage, sortBy})
      showToast(addMessage)
      groupName.value = null
      groupDialog.value = false
    }
  } catch (error) {
    console.log(error);
  }
}

const addStorageEmployee = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    employee_id: employeeAdd.value,
    from: startDateRef.value,
    to: endDateRef.value,
  }

  try {
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
    if (error.response && error.response.status === 422) {
      if (error.response.data.errors.employee_id) {
        showToast(error.response.data.errors.employee_id[0], "warning")
      }
      if (error.response.data.errors.from) {
        showToast(error.response.data.errors.from[0], "warning")
      }
      if (error.response.data.errors.to) {
        showToast(error.response.data.errors.to[0], "warning")
      }
    }
  }

}
const closeFilterDialog = () => {
  filterDialog.value = false
  filterForm.value = {}

  getStoragesFromTheGroup({})
}

const massDel = async ({page, itemsPerPage, sortBy, search}) => {

  try {
    const {status} = await storage.massDeletion({ids: markedID.value})

    if (status === 200) {
      showToast(removeMessage, 'red')
      await getStoragesFromTheGroup({page, itemsPerPage, sortBy, search})
      markedID.value = []
      dialog.value = false
    }

  } catch (e) {

  }
}


const massRestore = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    const {status} = await storage.massRestore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getStoragesFromTheGroup({page, itemsPerPage, sortBy, search})
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}


const massDelEmployee = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    const {status} = await storage.massDeletionEmployee({ids: markedEmployeeID.value})

    if (status === 200) {
      showToast(removeMessage, 'red')
      await getStorageEmployeeData({page, itemsPerPage, sortBy}, search)
      markedEmployeeID.value = []
      dataDialog.value = false
    }

  } catch (e) {

  }
}


const massRestoreEmployee = async ({page, itemsPerPage, sortBy}) => {

  try {
    const {status} = await storage.massRestoreEmployee({ids: markedEmployeeID.value})

    if (status === 200) {
      showToast(restoreMessage, 'red')
      await getStorageEmployeeData({page, itemsPerPage, sortBy})
      markedEmployeeID.value = []
      dataDialog.value = false
    }
  } catch (e) {

  }
}

const updateEmployee = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    employee_id: employeeAdd.value,
    from: startDateRef.value,
    to: endDateRef.value
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


const getEmployee = async () => {
  try {
    const {data} = await employee.get({page: 1, itemsPerPage: 100})
    employees.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (e) {

  }
}


const getOrganizations = async () => {
  try {
    const {data} = await organizationApi.get({page: 1, itemsPerPage: 1000})

    organizations.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (e) {

  }
}

const handleCheckboxClick = function (item) {
  lineMarking(item)
}
const handleEmployeeCheckboxClick = function (item) {
  employeeLineMarking(item)
}

const openGroupDialog = (item) => {
  groupDialog.value = true
  isExistsGroup.value = true
  groupName.value = item.name
  group.value = item
}

const deleteGroup = async () => {
  
  try {
    const res = await storageGroup.delete(group.value.id)
    if (res.status === 200) {
      await getGroup({})
      showToast(removeMessage)
     
    }
    
  } catch (error) {
    console.log(error);
  }
  isExistsGroup.value = false
  groupDialog.value = false
}

const restoreGroup = async () => {
  const response = await storageGroup.restore(group.value.id);
    if (response.status === 200) {
      await getGroup({})
      showToast(restoreMessage);
    }
}



const computeGroup = async () => {
  if(group.value.deleted_at !== null) {
      await restoreGroup()
  }
  else {
    await deleteGroup()
  }
}




const openDialog = (item) => {
  dialog.value = true

  const groupValue = groups.value.find(item => item.id === groupIdRef.value)
  if (groupIdRef.value !== 0) {
    group.value = {
      id: groupValue.id,
      name: groupValue.name
    }
  }

  if (item === 0) {
    idStorage.value = 0
    isExistsStorage.value = false
  } else {
    idStorage.value = item.id
    markedID.value.push(item.id);
    isExistsStorage.value = true
    nameRef.value = item.name
    if (item.group) {
      group.value = {
        id: item.group.id,
        name: item.group.name
      }
    }
    organization.value = {
      id: item.organization.id,
      name: item.organization.name
    }
    storageInDialogTitle.value = nameRef.value
  }

}


const addBasedOnStorage = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')

  dialog.value = true
  isExistsStorage.value = false

  const groupValue = groups.value.find(item => item.id === groupIdRef.value)

  storages.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      idStorage.value = item.id
      nameRef.value = item.name

      if (item.group) {
        group.value = {
          id: item.group.id,
          name: item.group.name
        }
      } else {
        group.value = {
          id: groupValue.id,
          name: groupValue.name
        }
      }

      organization.value = {
        id: item.organization.id,
        name: item.organization.name
      }
    }
  })
}

const compute = ({page, itemsPerPage, sortBy}) => {

  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value.deleted_at) {
    return massRestore({page, itemsPerPage, sortBy})
  } else {
    return massDel({page, itemsPerPage, sortBy})
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
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
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
  markedItem.value = item
}

const lineMarkingGroup = group_id => {
  markedID.value = []
  groupIdRef.value = group_id
  getStoragesFromTheGroup({})
}

const isDataChanged = () => {
  const item = storages.value.find(elem => elem.id === idStorage.value)

  return item && (
    nameRef.value !== item.name ||
    organization.value.id !== item.organization.id ||
    group.value.id !== item.group.id
  );
}



watch(idStorage, (newVal) => {
  console.log(newVal)
})

const cleanForm = () => {
  nameRef.value = null;
  organization.value = null;
  group.value = null;
};

const closingWithSaving = async () => {
  if (isExistsStorage.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: 'id', search: null });
    showModal.value = false
  } else {
    const isValid = validate(
      nameRef,
      organization,
      group
      );
      showModal.value = false
    if (isValid === true) {
      await addStorage({ page: 1, itemsPerPage: 10, sortBy: 'id', search: null });
      dialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
    }
  }
};

const checkAndClose = () => {
  if (nameRef.value || (organization.value) || (group.value && group.value.length > 0)) {
    showModal.value = true
  } else {
    dialog.value = false
    showModal.value = false
  }
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
}

const updateGroup = async () => {
  if (!groupName.value) {
    return showToast("Поле наименования не может быть пустым", "warning")
  }

  try {
    const res = await storageGroup.update(group.value.id, {name: groupName.value})
    if (res.status === 200) {
      await getGroup({})
      showToast(editMessage)
      groupName.value = null
      groupDialog.value = false
      isExistsGroup.value = false
    }
  } catch (error) {
    console.log(error);
  }
}

watch(markedID, (newVal) => {
  markedItem.value = storages.value.find((el) => el.id === newVal[0]);
})

watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    organization.value = null
    employeeAdd.value = null
    employeeUpdate.value = null;
    startDateRef.value = null;
    endDateRef.value = null;
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
})

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))


onMounted(async () => {
  await getEmployee()
  await getOrganizations()
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Склады</span>
        </div>
        <v-card variant="text" min-width="450" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 me-3">
              <button
                style="
                  margin-top: 5px;
                  background-color: #6bd68a;
                  border-radius: 8px;
                  white-space: nowrap;
                  height: 32px;
                  padding: 0 4px;
                  font-size: 12px;
                  color: white;
                  text-transform: uppercase;
                "
                v-if="createAccess('storage') && isExistsStorage"
                @click="groupDialog = true"
              >
                <span class="px-2 pb-0">создать группу</span>
              </button>
              <Icons v-if="createAccess('storage')" @click="openDialog(0)" name="add"/>
              <Icons v-if="createAccess('storage')" @click="addBasedOnStorage" name="copy"/>
              <Icons v-if="removeAccess('storage')" @click="compute" name="delete"/>
            </div>
            <div class="w-100">
              <v-text-field
                  v-model="search"
                  prepend-inner-icon="search"
                  density="default"
                  placeholder="Поиск..."
                  variant="outlined"
                  color="info"
                  :base-color="FIELD_OF_SEARCH"
                  rounded="lg"
                  hide-details
                  single-line
                  clear-icon="close"
                  clearable
                  flat
              ></v-text-field>
            </div>
          </div>
          <div class="filterElement">
            <Icons
              name="filter"
              title="фильтр"
              @click="filterDialog = true"
              class="mt-1"
            />
            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
          </div>
        </v-card>
      </div>

      <div class="d-flex ga-4 w-100">
        <v-card class="mt-2 table w-50">
          <v-data-table-server
              style="height: 78vh"
              items-per-page-text="Элементов на странице:"
              loading-text="Загрузка"
              no-data-text="Нет данных"
              v-model:items-per-page="paginationsGroup.per_page"
              :loading="loadingGroup"
              :headers="headersGroup"
              :items-length="paginationsGroup.total || 0"
              :items="groups"
              :item-value="headers.title"
              @update:options="getGroup"
              page-text='{0}-{1} от {2}'
              :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
               ]"
              fixed-header
              hover
          >
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
            </template>
            <template v-slot:item="{ item, index }">
              <tr
                  :class="{'bg-grey-lighten-2': item.id === groupIdRef }"
                  @mouseenter="hoveredRowIndex = index + 100000"
                  @mouseleave="hoveredRowIndex = null"
                  @click="lineMarkingGroup(item.id)"
                  @dblclick="openGroupDialog(item)"
              >
                <td>
                  <div class="d-flex">
                    <Icons
                          style="margin-right: 10px; margin-top: 4px"
                          :name="item.deleted_at === null ? 'valid' : 'inValid'"
                      />
                    <span>{{ item.id }}</span>
                  </div>
                </td>
                <td>{{ item.name }}</td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
        <v-card class="mt-2 table w-100">
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
              :search="debounceSearch"
              @update:options="getStorage"
              show-select
              v-model="markedID"
              page-text='{0}-{1} от {2}'
              :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
               ]"
              fixed-header
              hover
          >
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
            </template>
            <template v-slot:item="{ item, index }">
              <tr
                  @mouseenter="hoveredRowIndex = index"
                  @mouseleave="hoveredRowIndex = null"
                  @dblclick="openDialog(item)"
                  :class="{'bg-grey-lighten-2': markedID.includes(item.id) }"
              >
                <td class="">
                  <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                    <CustomCheckbox
                        v-model="markedID"
                        :checked="markedID.includes(item.id)"
                        @click="lineMarking(item)"
                        @change="handleCheckboxClick(item)"
                    >
                      <span>{{ item.id }}</span>
                    </CustomCheckbox>
                  </template>
                  <template v-else>
                    <div class="d-flex align-center">
                      <Icons
                          style="margin-right: 10px; margin-top: 4px"
                          :name="item.deleted_at === null ? 'valid' : 'inValid'"
                      />
                      <span>{{ item.id }}</span>
                    </div>
                  </template>
                </td>
                <td>{{ item.name }}</td>

              </tr>
            </template>
          </v-data-table-server>
        </v-card>
      </div>

      <v-card>
        <v-dialog persistent class="mt-2 pa-2" v-model="dialog" @keyup.esc="isExistsStorage ? checkUpdate() : checkAndClose()">
          <v-card style="border: 2px solid #3AB700" max-width="600"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsStorage ? 'Склад: ' + storageInDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="removeAccess('storage') && isExistsStorage" @click="compute" name="delete"/>
                  <Icons v-if="createAccess('storage') && !isExistsStorage" @click="addStorage" name="save"/>
                  <Icons v-if="updateAccess('storage') && isExistsStorage" @click="update" name="save"/>
                </div>
                <v-btn
                  @click="isExistsStorage ? checkUpdate() : checkAndClose()"
                  variant="text"
                  :size="32"
                  class="pt-2 pl-1"
                >
                  <Icons name="close" title="Закрыть" />
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" :disabled="!updateAccess('storage') && isExistsStorage" @submit.prevent="addStorage">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="green"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Наименование"
                      label="Название"
                      clear-icon="close"
                      clearable
                      autofocus
                  />
                  <v-autocomplete
                      variant="outlined"
                      no-data-text="Нет данных"
                      label="Выберите организацию"
                      :base-color="FIELD_COLOR"
                      color="green"
                      :disabled="isOrganizationFieldDisabled"
                      item-color="green"
                      v-model="organization"
                      :items="organizations"
                      item-title="name"
                      item-value="id"
                  />
                  <v-autocomplete
                      v-model="group"
                      no-data-text="нет данных"
                      :items="groups"
                      item-title="name"
                      item-value="id"
                      :base-color="FIELD_COLOR"
                      color="green"
                      item-color="green"
                      :rules="[rules.required]"
                      variant="outlined"
                      label="Группа"
                  />
                </v-col>
              </v-row>
            </v-form>

            <v-card class="table" style="border: 1px solid #3AB700">
              <div v-if="isExistsStorage" class="d-flex w-100 rounded-t-lg mb-1 align-center"
                   style="border-bottom: 1px solid #3AB700">
                <div class="d-flex justify-end w-100 ga-2 pt-1 me-2" style="padding-top: 4px !important;">
                  <Icons v-if="createAccess('storage') && !isExistsStorage" @click="dataDialog = true" name="add"/>
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
                  page-text='{0}-{1} от {2}'
                  :items-per-page-options="[
                    {value: 25, title: '25'},
                    {value: 50, title: '50'},
                    {value: 100, title: '100'},
                   ]"
                  fixed-footer
                  hover
              >
                <template v-slot:loading>
                  <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
                </template>
                <template v-slot:item="{ item, index }">
                  <tr
                      v-if="isExistsStorage"
                      @mouseenter="hoveredRowEmployeeIndex = index" @mouseleave="hoveredRowEmployeeIndex = null"
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
        <v-dialog persistent v-model="dataDialog" activator="parent">
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
                <v-col class="d-flex flex-column justify-between w-100">
                  <v-autocomplete
                      variant="outlined"
                      label="Выберите сотрудника"
                      no-data-text="нет данных"
                      color="green"
                      :base-color="FIELD_COLOR"
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
                      color="green"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      density="compact"
                      clear-icon="close"
                  />
                  <v-text-field
                      v-model="endDateRef"
                      :rules="[rules.required]"
                      type="date"
                      label="Дата конец"
                      color="green"
                      :base-color="FIELD_COLOR"
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
        <v-dialog persistent class="mt-2 pa-2" v-model="groupDialog" @keyup.esc="groupDialog = false">
          <v-card style="border: 2px solid #3AB700" min-width="350"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{isExistsGroup ? 'Изменить' : 'Создать'}} группу</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                   <Icons v-if="isExistsGroup"  @click="computeGroup" name="delete"/>
            
                  <Icons v-if="isExistsGroup" @click="updateGroup" name="save"/>
                  <Icons v-else @click="addGroup" name="save"/>
                </div>
                <v-btn @click="groupDialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
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
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      label="Наименование"
                      clear-icon="close"
                      clearable
                      autofocus
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>

      <v-dialog persistent class="mt-2 pa-2" v-model="filterDialog" @keyup.esc="closeFilterDialog">
        <v-card style="border: 2px solid #3AB700" min-width="450"
                class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Фильтр</span>
          </div>
          <v-form class="d-flex w-100">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                    v-model="filterForm.name"
                    color="green"
                    :base-color="FIELD_COLOR"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Наименование"
                    label="Название"
                    clear-icon="close"
                    clearable
                    autofocus
                />
                <v-autocomplete
                    variant="outlined"
                    label="Выберите организацию"
                    no-data-text="Нет данных"
                    :base-color="FIELD_COLOR"
                    color="green"
                    item-color="green"
                    v-model="filterForm.organization_id"
                    :items="organizations"
                    item-title="name"
                    item-value="id"
                />
                <v-autocomplete
                    v-model="filterForm.employee_id"
                    no-data-text="нет данных"
                    :items="employees"
                    item-title="name"
                    item-value="id"
                    :base-color="FIELD_COLOR"
                    color="green"
                    item-color="green"
                    variant="outlined"
                    label="Сотрудник"
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn color="red" class="btn" @click="closeFilterDialog">сбросить</v-btn>
                  <v-btn color="green" class="btn"  @click="getStoragesFromTheGroup">применить</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
      <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="toggleModal" @closeClear="closeDialogWithoutSaving" @closeWithSaving="closingWithSaving()"/>
      </div>
    </v-col>
  </div>
  <!-- Group Modal -->

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