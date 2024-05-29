<script setup>
import {onMounted, ref, watch, computed} from "vue";
import {useRouter} from "vue-router";
import showToast from '@/composables/toast'
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import storage from '../../../api/list/storage.js';
import employee from '../../../api/list/employee.js';
import organizationApi from '../../../api/list/organizations.js';
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
import storageGroup from "../../../api/list/storageGroup.js";
import {FIELD_COLOR, FIELD_OF_SEARCH, BASE_COLOR, TITLE_COLOR} from "../../../composables/constant/colors.js";
import validate from "./validate.js";
import debounce from "lodash.debounce";
import getExcel from "../../../composables/otherQueries/getExcel.js";
import schedule from "../../../api/list/schedule.js";
import Button from "../../../components/button/button.vue";
import {useFilterCanvasVisible} from "../../../store/canvasVisible.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import getListStatus from "../../../composables/displayed/getListStatus.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import {markedForDeletion} from "../../../composables/constant/items.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";

const router = useRouter()
const showConfirmDialog = ref(false);
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
const paginationsStorageData = ref([])
const showModal = ref(false);
const selectedBlock = ref("По группам")
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
  {title: '№', key: 'deleted_at'},
  {title: 'Статус', key: 'deleted_at'},
  {title: 'Наименование', key: 'name'},
])

const headersGroup = ref([
  {title: 'Статус', key: 'deleted_at'},
  {title: '', key: 'deleted_at'},
])

const headersStorageEmployee = ref([
  {title: '№', key: 'id'},
  {title: 'Сотрудник', key: 'employee.name'},
  {title: 'Дата начало', key: 'from'},
  {title: 'Дата конец', key: 'to'},
])

const filterForm = ref({
  name: null,
  deleted: null,
  organization_id: null,
  employee_id: null
})

const groupBy = ref([
  {
    key: "name",
    order: "asc",
  },
])

const filterDialog = ref(false)

const isOrganizationFieldDisabled = computed(() => {
  return !createAccess('organizations') && !updateAccess('organizations');
});

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}

const getGroups = async ({page, itemsPerPage, sortBy, search} = {}) => {
  count.value = 0
  countFilter()
  loading.value = true
  try {
    const {data} = await storageGroup.get({page, itemsPerPage, sortBy}, search, filterForm.value)
    console.log(data)
    paginations.value = data.result.pagination
    groups.value = data.result.data
    groupIdRef.value = 0

  } catch (e) {
    console.error(e)
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

const getStorageEmployeeData = async ({page, itemsPerPage, sortBy, search} = {}) => {

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
      await getGroups()
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
      await getGroups({page, itemsPerPage, sortBy})
      markedID.value = []
      showToast(editMessage)
      cleanForm()
    }
  } catch (e) {
    console.log(e)
  }
}


const addGroup = async () => {
  if (!groupName.value) {
    return showToast("Поле наименования не может быть пустым", "warning")
  }

  try {
    const res = await storageGroup.add({name: groupName.value, type: 0})
    if (res.status === 201) {
      await getGroups()
      showToast(addMessage)
      groupName.value = null
      groupDialog.value = false
    }
  } catch (e) {
    console.log(e);
    if (e.response.status === 422) {
      showToast("Группа с таким наименованием уже существует", "warning")
    }
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

  getGroups({})
}

const massDel = async () => {

  try {
    const {status} = await storage.massDeletion({ids: markedID.value})

    if (status === 200) {
      showToast(removeMessage, 'red')
      await getGroups()
      markedID.value = []
      dialog.value = false
    }

  } catch (e) {
    console.error(e)
  }
}


const massRestore = async () => {
  try {
    const {status} = await storage.massRestore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getGroups()
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {
    console.error(e)
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
    console.error(e)
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
    console.error(e)
  }
}

const updateEmployee = async () => {

  const body = {
    employee_id: employeeAdd.value,
    from: startDateRef.value,
    to: endDateRef.value
  }

  try {
    const {status} = await storage.updateEmployee(idStorageEmployee.value, body)
    if (status === 200) {

      await getStorageEmployeeData()
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
    console.error(e)
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
    console.error(e)
  }
}


const openGroupDialog = (item) => {
  groupDialog.value = true
  isExistsGroup.value = true
  groupName.value = item.value
  group.value = item.items[0].raw
}

const deleteGroup = async () => {
  
  try {
    const res = await storageGroup.delete(group.value.id)
    if (res.status === 200) {
      await getGroups()
      showToast(removeMessage)
     
    }
    
  } catch (e) {
    console.log(e);
    if (e.response.status === 400) {
      showToast(e.response.data.message, "warning")
    }
  }
  isExistsGroup.value = false
  groupDialog.value = false
}

const restoreGroup = async () => {
  const response = await storageGroup.restore(group.value.id);
    if (response.status === 200) {
      await getGroups({})
      showToast(restoreMessage);
    }
}

const computeGroup = async () => {
  if(group.value.deleted_at) {
      await restoreGroup()
  }
  else {
    await deleteGroup()
  }
}

const openDialog = (item) => {
  dialog.value = true
  console.log(item)

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

  const groupValue = groups.value.find(item => item.id === markedID.value[0])
  console.log(groupValue)
  // storages.value.forEach(item => {
  //   if (markedID.value[0] === item.id) {
  //     idStorage.value = item.id
  //     nameRef.value = item.name
  //
  //     if (item.group) {
  //       group.value = {
  //         id: item.group.id,
  //         name: item.group.name
  //       }
  //     } else {
  //       group.value = {
  //         id: groupValue.id,
  //         name: groupValue.name
  //       }
  //     }
  //
  //     organization.value = {
  //       id: item.organization.id,
  //       name: item.organization.name
  //     }
  //   }
  // })
}

const compute = () => {

  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value.deleted_at) {
    return massRestore()
  } else {
    return massDel()
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

const isDataChanged = () => {
  const item = storages.value.find(elem => elem.id === idStorage.value)

  return item && (
    nameRef.value !== item.name ||
    organization.value.id !== item.organization.id ||
    group.value.id !== item.group.id
  );
}

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
      await getGroups()
      showToast(editMessage)
      groupName.value = null
      groupDialog.value = false
      isExistsGroup.value = false
    }
  } catch (e) {
    if (e.response.status === 422) {
      showToast("Группа с таким наименованием уже существует", "warning")
    }
  }
}

const selectBlock = name => {
  closeFilterDialog();
  selectedBlock.value = name;
  loading.value = false;
};

const isGroupChecked = item => {
  return item.items[0].raw.storages.every(item => markedID.value.includes(item.id))
}

const toggleGroupSelection = group => {
  const users = group.items[0].raw.storages
  if (users.length === 0) return

  markedItem.value = users[0]

  const allIds = users.map(item => item.id);
  if (isGroupChecked(group)) {
    markedID.value = markedID.value.filter(id => !allIds.includes(id));
  } else {
    // Add all IDs of the group
    markedID.value = [...new Set([...markedID.value, ...allIds])];
  }
}


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
      <div class="d-flex justify-space-between calcWidth">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Склады</span>
        </div>
        <div class="d-flex align-center ga-2">
          <div class="d-flex ga-4 mb-1">
            <div class="switcher">
              <button
                  @click="selectBlock('По группам')"
                  :class="{'active': selectedBlock === 'По группам'}"
                  class="button"
              >
                По группам
              </button>
              <button
                  @click="selectBlock('По элементам')"
                  :class="{'active': selectedBlock === 'По элементам'}"
                  class="button"
              >
                По элементам
              </button>
            </div>
          </div>
          <div class="d-flex justify-end w-100">
            <div class="d-flex ga-2 me-3 mb-1 ">
              <Button name="group" @click="groupDialog = true" v-if="createAccess('storage')"/>
              <Button name="create" v-if="createAccess('storage')" @click="openDialog(0)" />
              <Button name="copy" v-if="createAccess('storage')" @click="addBasedOnStorage" />
              <Button name="delete" v-if="removeAccess('storage')" @click="compute" />
              <Button name="excel" @click="getExcel(schedule)" />
            </div>
            <v-text-field
                class="custom_search"
                style="width: 190px"
                v-model="search"
                prepend-inner-icon="search"
                density="compact"
                label="Поиск..."
                variant="outlined"
                :color="BASE_COLOR"
                :base-color="FIELD_OF_SEARCH"
                rounded="lg"
                clear-icon="close"
                hide-details
                single-line
                clearable
                flat
            />
          </div>
          <div class="filterElement">
            <Icons
                name="filter"
                title="фильтр"
                @click="useFilterCanvasVisible().toggleFilterCanvas()"
                class="mt-1"
            />
            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
          </div>
        </div>
      </div>

      <div class="d-flex ga-4 w-100">
        <v-card class="mt-2 table w-100">
          <v-data-table-server
              style="height: calc(100vh - 150px)"
              items-per-page-text="Элементов на странице:"
              loading-text="Загрузка"
              no-data-text="Нет данных"
              v-model:items-per-page="paginations.per_page"
              :loading="loading"
              :items-length="paginations.total || 0"
              :items="groups"
              :headers="selectedBlock === 'По группам' ? headersGroup : headers"
              :group-by="selectedBlock === 'По группам' ? groupBy : []"
              :item-value="headers.title"
              @update:options="getGroups"
              page-text='{0}-{1} от {2}'
              :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
               ]"
              fixed-header
              hover
          >
            <template v-slot:group-header="{ item, toggleGroup, isGroupOpen, index }">
              <tr style="background-color: rgba(122, 127, 176, 0.193)" @dblclick="openGroupDialog(item)">
                <td style="width: 350px;">
                  <div class="d-flex align-center">
                    <CustomCheckbox
                        v-if="isGroupOpen(item) && item.items[0].raw.storages.length !== 0"
                        v-model="markedID"
                        :checked="isGroupChecked(item)"
                        @change="toggleGroupSelection(item)"
                    >
                    </CustomCheckbox>
                    <VBtn
                        :icon="isGroupOpen(item) ? '$expand' : '$next'"
                        size="small"
                        variant="text"
                        @click="toggleGroup(item)"
                    ></VBtn>
                    <span>{{ item.value }}</span>
                  </div>
                </td>
                <td style="width: 390px;">
                  <v-chip
                      v-if="item.items[0].raw.deleted_at"
                      style="height: 50px; width: 200px;"
                      class="d-flex justify-center"
                      :color="getListColor(item.items[0].raw.deleted_at)"
                  >
              <span class="padding: 5px;">{{
                  getListStatus(item.items[0].raw.deleted_at)
                }}</span>
                  </v-chip>
                </td>
                <td></td>
              </tr>
            </template>
            <template v-slot:item="{ item, index }">
              <tr
                  v-if="item.storages.length !== 0"
                  v-for="storage in item.storages" :key="storage.id"
                  :class="{'bg-grey-lighten-2': item.id === groupIdRef }"
                  @mouseenter="hoveredRowIndex = index + 100000"
                  @mouseleave="hoveredRowIndex = null"
                  @dblclick="openDialog(storage)"
              >
                <td style="width: 350px;">
                  <div class="d-flex align-center ga-2">
                    <CustomCheckbox
                        v-model="markedID"
                        :checked="markedID.includes(storage.id)"
                        @change="lineMarking(storage)"
                    >
                    </CustomCheckbox>
                    {{ storage?.id }}
                  </div>
                </td>
                <td style="width: 390px;">
                  <v-chip
                      style="height: 50px; width: 200px;"
                      class="d-flex justify-center"
                      :color="getListColor(storage?.deleted_at)"
                  >
              <span class="padding: 5px;">{{
                  getListStatus(storage?.deleted_at)
                }}</span>
                  </v-chip>
                </td>
                <td>{{ storage?.name }}</td>
              </tr>
              <tr v-else-if=" selectedBlock === 'По группам'">
                <td></td>
                <td>Нету данных!</td>
                <td></td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
      </div>

      <v-card>
        <v-dialog persistent class="mt-2 pa-2" v-model="dialog" @keyup.esc="isExistsStorage ? checkUpdate() : checkAndClose()">
          <v-card :style="`border: 2px solid ${BASE_COLOR}`" max-width="600"
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
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      rounded="lg"
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
                      :color="BASE_COLOR"
                      rounded="lg"
                      :disabled="!isOrganizationFieldDisabled"
                      item-:color="BASE_COLOR"
                      v-model="organization"
                      :items="organizations"
                      item-title="name"
                      item-value="id"
                  />
                  <v-autocomplete
                      v-model="group"
                      no-data-text="нет данных"
                      :items="groups"
                      rounded="lg"
                      item-title="name"
                      item-value="id"
                      :base-color="FIELD_COLOR"
                      :color="BASE_COLOR"
                      item-:color="BASE_COLOR"
                      :rules="[rules.required]"
                      variant="outlined"
                      label="Группа"
                  />
                </v-col>
              </v-row>
            </v-form>

            <v-card class="table" :style="`border: 2px solid ${BASE_COLOR}`">
              <div v-if="isExistsStorage" class="d-flex w-100 rounded-t-lg mb-1 align-center"
              :style="`border-bottom: 2px solid ${BASE_COLOR}`">
                <div class="d-flex justify-end w-100 ga-2 pt-1 me-2" style="padding-top: 4px !important;">
                  <Icons v-if="isExistsStorage" @click="dataDialog = true" name="add"/>
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
                    <td>
                      {{ item.id }}
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
          <v-card :style="`border: 2px solid ${BASE_COLOR}`" min-width="400"
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
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      v-model="employeeAdd"
                      :items="employees"
                      rounded="lg"
                      item-title="name"
                      item-value="id"
                  />
                  <v-text-field
                      class="date"
                      v-model="startDateRef"
                      :rules="[rules.required]"
                      type="date"
                      label="Дата начало"
                      rounded="lg"
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      density="compact"
                      clear-icon="close"
                  />
                  <v-text-field
                      class="date"
                      v-model="endDateRef"
                      :rules="[rules.required]"
                      rounded="lg"
                      type="date"
                      label="Дата конец"
                      :color="BASE_COLOR"
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
          <v-card :style="`border: 2px solid ${BASE_COLOR}`" min-width="350"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsGroup ? 'Изменить' : 'Создать' }} группу</span>
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
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      rounded="lg"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      label="Наименование"
                      clear-icon="close"
                      hide-details
                      clearable
                      autofocus
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>

      <filter-canvas>
        <div class="d-flex ga-2">
          <custom-filter-text-field
              label="Наименование"
              v-model="filterForm.name"
          />
          <custom-filter-autocomplete
              label="Организация"
              v-model="filterForm.organization_id"
              :items="organizations"
          />
        </div>
        <div class="d-flex ga-2">
          <custom-filter-autocomplete
              label="Сотрудник"
              v-model="filterForm.employee_id"
              :items="employees"
          />
          <custom-filter-autocomplete
              label="Помечен на удаление"
              v-model="filterForm.deleted"
              :items="markedForDeletion"
          />
        </div>
        <div class="d-flex justify-end mt-2">
          <div class="d-flex ga-2" style="margin-right: -6%;">
            <v-btn color="red" class="btn"
                   @click="() => {closeFilterDialog(); useFilterCanvasVisible().closeFilterCanvas()}"
            >сбросить
            </v-btn
            >
            <v-btn
                :color="BASE_COLOR"
                class="btn"
                @click="() => {getGroups(); useFilterCanvasVisible().closeFilterCanvas()}"
            >применить
            </v-btn
            >
          </div>
        </div>
      </filter-canvas>

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