<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import CreateGroup from "./createGroup.vue"
import ChangePassword from "./changePassword.vue";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage, addMessage
} from "../../../composables/constant/buttons.js";
import organizationApi from "../../../api/organizations.js";
import user from "../../../api/user.js";
import validate from "./validate.js";
import groupApi from "../../../api/userGroup.js";
import {FIELD_COLOR} from "../../../composables/constant/colors.js";
const showModal = ref(false);
const showConfirmDialog = ref(false);
const toggleModal = () => {
  showModal.value = !showModal.value;
};
const router = useRouter()

const loading = ref(true)
const loadingGroup = ref(true)
const dialog = ref(false)
const isDialogPassword = ref(false)
const idUser = ref(null)
const hoveredRowIndex = ref(null)
const isCreateGroup = ref(false)

const isExistsUser = ref(false)
const markedID = ref([])
const markedItem = ref([])
const userDialogTitle = ref(null)
const search = ref('')
const organization = ref(null)
const group = ref(null)
const groupIdRef = ref(0)

const fioRef = ref(null)
const statusRef = ref(true)
const loginRef = ref(null)
const passwordRef = ref(null)
const phoneRef = ref(null)
const emailRef = ref(null)
const imageRef = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)
const filterModal = ref(false);

const fioFilter = ref(null)
const loginFilter = ref(null)
const phoneFilter = ref(null)
const emailFilter = ref(null)
const organizationFilter = ref(null)
const groupFilter = ref(null)

const users = ref([])
const organizations = ref([])
const groups = ref([])
const paginations = ref([])
const paginationsGroup = ref([])
const count = ref(0)

const filterForm = ref({
  name: null,
  email: null,
  phone: null,
  login: null,
  organization_id: null
})

const showModalDialog = ref(null)

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'ФИО', key: 'name', align: 'start'},
])

const headersGroup = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Название группы', key: 'name', align: 'start'},
])

const rules = {
  required: v => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
}

const getGroup = async ({page, itemsPerPage, sortBy}) => {
  loadingGroup.value = true
  try {
    const { data } = await groupApi.get({page, itemsPerPage, sortBy})
    paginationsGroup.value = data.result.pagination
    groups.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (e) {
    console.log(e)
  } finally {
    loadingGroup.value = false
  }
}



const isDataChanged = () => {
  const item = users.value.find(elem => elem.id === idUser.value)

  return fioRef.value !== item.name ||
      emailRef.value !== item.email ||
      loginRef.value !== item.login ||
      statusRef.value !== item.status
}


function countFilter() {
   for (const key in filterForm.value) {
       if (filterForm.value[key] !== null) {
           count.value++
       }
   }
   return count
}

const checkAndClose = () => {
  if (fioRef.value || emailRef.value || phoneRef.value || loginRef.value || passwordRef.value || imageRef.value) {
    showModal.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
}
const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false
  showConfirmDialog.value = false;
  cleanForm();
}
const checkUpdate = () => {
  if (isDataChanged()) {
     showModal.value = true;
  } else {
    dialog.value = false;
  }
}

const cleanForm = () => {
  fioRef.value = null
  statusRef.value = null
  loginRef.value = null
  passwordRef.value = null
  phoneRef.value = null
  emailRef.value = null
  imageRef.value = null
  imagePreview.value = null
}

const getOrganization = async () => {
  try {
    const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000})
    organizations.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name
    }))
  } catch (e) {

  }
}

const onPickFile = () => {
  fileInput.value.click()
}

const selectAvatar = event => {
  const files = event.target.files
  imageRef.value = files[0]
  let filename = files[0].name
  if (filename.lastIndexOf('.') <= 0) {
    return showToast('Пожалуйста, добавьте заново!')
  }
  const fileReader = new FileReader()
  fileReader.addEventListener('load', () => {
    imagePreview.value = fileReader.result
  })
  fileReader.readAsDataURL(files[0])
}

const addUser = async ({page, itemsPerPage, sortBy}) => {
  if (validate(fioRef, organization, loginRef, passwordRef, phoneRef, emailRef, group) !== true) return

  let organizationValue;
  if (typeof organization.value === 'object') {
    organizationValue = organization.value.id
  } else {
    organizationValue = organization.value
  }

  let groupValue;
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  const formData = new FormData()
  formData.append('name', fioRef.value);
  formData.append('organization_id', organizationValue)
  formData.append('login', loginRef.value);
  formData.append('password', passwordRef.value);
  formData.append('phone', phoneRef.value);
  formData.append('email', emailRef.value);
  formData.append('group_id', groupValue);

  if (imageRef.value !== null) {
    formData.append('image', imageRef.value);
  }

  for(let pair of formData.entries()) {
    console.log(pair[0]+ ', '+ pair[1]);
  }

  try {
    const res = await user.add(formData)

    if (res.status === 201) {
      await getUser({page, itemsPerPage, sortBy,})
      showToast(addMessage)
      idUser.value = res.data.result.id
      dialog.value = false

      markedItem.value = []
    }
  } catch (e) {
    if (e.response.data.errors.email) {
      showToast(e.response.data.errors.email[0], "warning")
      return
    }
    if (e.response.data.errors.login) {
      showToast(e.response.data.errors.login[0], "warning")
      return
    }
    if (e.response.data.errors.phone) {
      showToast(e.response.data.errors.phone[0], "warning")
      return
    }
    if (e.response.data.errors.group_id) {
      showToast(e.response.data.errors.group_id[0], "warning")
    }
  }
}

const update = async ({page, itemsPerPage, sortBy}) => {
  if (validate(fioRef, organization, loginRef, passwordRef, phoneRef, emailRef, group) !== true) return

  let organizationValue
  if (typeof organization.value === 'object') {
    organizationValue = organization.value.id
  } else {
    organizationValue = organization.value
  }

  let groupValue;
  if (typeof group.value === 'object') {
    groupValue = group.value.id
  } else {
    groupValue = group.value
  }

  const formData = new FormData()
  formData.append('name', fioRef.value)
  formData.append('organization_id', organizationValue)
  formData.append('login', loginRef.value)
  formData.append('phone', phoneRef.value)
  formData.append('email', emailRef.value)
  formData.append('group_id', groupValue)
  formData.append('status', statusRef.value === 1 || statusRef.value ? 1 : 0)

  if (imageRef.value !== null) {
    formData.append('image', imageRef.value)
  }

  try {
    const response = await user.update(idUser.value, formData)
    cleanForm()
    if (response.status === 200) {
      dialog.value = null
      await getUser({page, itemsPerPage, sortBy})
      showToast(editMessage)
    }
  } catch (e) {

  }
}

const remove = async ({page, itemsPerPage, sortBy}) => {
  try {
    const { status } = await user.remove({ids: markedID.value})
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getUser({page, itemsPerPage, sortBy})
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}

const restore = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    const {status} = await user.restore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getUser({page, itemsPerPage, sortBy}, search)
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}


const closeFilterModal = async ({
  page,
  itemsPerPage,
  sortBy,
  search,
  filterData,
}) => {
  filterModal.value = false;
  await getUser({ page, itemsPerPage, sortBy, search, filterData });
  fioFilter.value = null;
    organizationFilter.value = null;
    loginFilter.value = null;
    phoneFilter.value = null;
    emailFilter.value = null;
    groupFilter.value = null;
};




const handleCheckboxClick = item => {
  lineMarking(item)
}

const openDialog = item => {
  dialog.value = true

  if (groupIdRef.value !== 0) {
    const groupValue = groups.value.find(item => item.id === groupIdRef.value)
    group.value = {
      id: groupValue.id,
      name: groupValue.name
    }
  }

  if (item === 0) {
    idUser.value = 0
    isExistsUser.value = false
  } else {
    idUser.value = item.id
    markedID.value.push(item.id);
    isExistsUser.value = true
    fioRef.value = item.name
    loginRef.value = item.login
    phoneRef.value = item.phone
    passwordRef.value = '#########'
    statusRef.value = item.status
    const groupValue = groups.value.find(item => item.id === groupIdRef.value)
    group.value = {
      id: groupValue.id,
      name: groupValue.name
    }

    if (item.organization !== null) {
      organization.value = {
        "id": item.organization.id,
        "name": item.organization.name
      }
    }

    if (item.image !== null) {
      imagePreview.value = import.meta.env.VITE_IMG_URL + item.image
    } else {
      imagePreview.value = 'data:image/png;base64,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BQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAIMAOrdVOIxsnZhAAAAAElFTkSuQmCC'
    }

    emailRef.value = item.email
    userDialogTitle.value = item.name
    console.log(userDialogTitle.value)
  }

}

const addBasedOnUser = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true

  users.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      fioRef.value = item.name
      loginRef.value = item.login
      phoneRef.value = item.phone
      statusRef.value = item.status
      emailRef.value = item.email

      const groupValue = groups.value.find(item => item.id === groupIdRef.value)
      group.value = {
        id: groupValue.id,
        name: groupValue.name
      }

      if (item.organization !== null) {
        organization.value = {
          "id": item.organization.id,
          "name": item.organization.name
        }
      }
    }
  })

}
const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value.deleted_at) {
    return restore({ page, itemsPerPage, sortBy })
  } else {
    return remove({ page, itemsPerPage, sortBy, search })
  }
}

const lineMarking = item => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = users.value.find(el => el.id === markedID.value[0])

    if (firstMarkedItem && firstMarkedItem.deleted_at && item.deleted_at === null) {
      showToast(ErrorSelectMessage, 'warning')
      return
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null && item.deleted_at !== null) {
      showToast(ErrorSelectMessage, 'warning')
      return
    }
  }

  const index = markedID.value.indexOf(item.id)
  if (index !== -1) {
    markedID.value.splice(index, 1)
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
}

const lineMarkingGroup = group_id => {
  markedID.value = []
  groupIdRef.value = group_id
  getUser({})
}

const getUser = async ({page, itemsPerPage, sortBy, search}) => {
  const filterData = filterForm.value
  showModalDialog.value = false
  loading.value = true
  count.value = 0
  countFilter()

  if (groupIdRef.value === 0) return loading.value = false

  try {
    const { data } = await groupApi.getUsers({page, itemsPerPage, sortBy}, search, groupIdRef.value, filterData)
    paginations.value = data.result.pagination
    users.value = data.result.data
  } catch (e) {
    users.value = []
  } finally {
    loading.value = false
  }
}

const closeFilterDialog = () => {
  showModalDialog.value = false
  filterForm.value = {}
  getUser({})
}

const toggleGroup = async () => {
  isCreateGroup.value = false
  await getGroup({})
}


watch(dialog, newVal => {
  if (!newVal) {
    fioRef.value = null
    organization.value = null
    passwordRef.value = null
    imagePreview.value = null
    loginRef.value = null
    phoneRef.value = null
    emailRef.value = null
  }
})

onMounted(async () =>  {
  await getOrganization()
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Пользователи</span>
        </div>
        <v-card variant="text" min-width="420" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <button
                  class="group_create"
                  @click="isCreateGroup = true"
              >
                <span class="px-2 py-0">создать группу</span>
              </button>
              <Icons title="Создать" @click="openDialog(0)" name="add"/>
              <Icons title="Скопировать" @click="addBasedOnUser" name="copy"/>
              <Icons title="Удалить" @click="compute" name="delete"/>
            </div>
            <v-text-field
                v-model="search"
                prepend-inner-icon="search"
                density="compact"
                label="Поиск..."
                variant="outlined"
                color="green"
                :base-color="FIELD_COLOR"
                rounded="lg"
                clear-icon="close"
                hide-details
                single-line
                clearable
                flat
            ></v-text-field>
          </div>
          <div class="filterElement">
            <Icons
              name="filter"
              title="фильтр"
              @click="showModalDialog = true"
              class="mt-1"
            />

            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
          </div>
        </v-card>
      </div>
      <div class="d-flex ga-4 w-100">
        <v-card class="mt-2 table">
          <v-data-table-server
              style="height: 78vh;"
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
              <tr :class="{'bg-grey-lighten-2': item.id === groupIdRef }" @mouseenter="hoveredRowIndex = index + 100000" @mouseleave="hoveredRowIndex = null" @click="lineMarkingGroup(item.id)" >
                <td>
                 <div class="d-flex">
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
              :items="users"
              :item-value="headers.title"
              :search="search"
              @update:options="getUser"
              page-text =  '{0}-{1} от {2}'
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
              <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)" @dblclick="openDialog(item)"
                  :class="{'bg-grey-lighten-2': markedID.includes(item.id) }">
                <td>
                  <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                    <CustomCheckbox
                        v-model="markedID"
                        :checked="markedID.includes(item.id)"
                        @change="handleCheckboxClick(item)"
                    >
                      <span>{{ item.id }}</span>
                    </CustomCheckbox>
                  </template>
                  <template v-else>
                    <div  class="d-flex">
                      <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
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



      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="600"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsUser ?  'Пользователь: ' + userDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="isExistsUser"  @click="compute" name="delete"/>
                  <div v-if="isExistsUser" @click="update">
                    <Icons title="Сохранить" name="save"/>
                  </div>
                  <Icons title="Сохранить" v-else @click="addUser" name="save"/>
                </div>
                <v-btn
                @click="isExistsUser ? checkUpdate() : checkAndClose({ page, itemsPerPage, sortBy, search, filterData})"

                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addUser">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <div class="d-flex" :style="isExistsUser ?? { width: '98%' }">
                    <v-text-field
                        v-model="fioRef"
                        :rules="[rules.required]"
                        color="green"
                        :base-color="FIELD_COLOR"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="Иван Иванов Иванович"
                        label="ФИО"
                        clear-icon="close"
                        :append-inner-icon="fioRef ? 'close' : ''"
                        @click:append-inner="fioRef = null"
                    />
                    <div class="mt-2 ms-4" v-if="isExistsUser">
                      <CustomCheckbox @change="statusRef = !statusRef" :checked="statusRef">
                        <span>Активный</span>
                      </CustomCheckbox>
                    </div>
                  </div>
                  <div class="d-flex w-100 ga-4">
                    <div class="border d-flex justify-center align-center" style="width: 70%;">
                      <input
                          accept="image/*"
                          type="file"
                          @change="selectAvatar"
                          style="display: none;"
                          ref="fileInput"
                      />
                     <div v-if="imagePreview === null">
                       <v-btn  @click="onPickFile">Загрузить фото</v-btn>
                     </div>
                      <img v-else :src="imagePreview" width="150" height="150" alt="">
                    </div>
                    <div class="w-100">
                      <v-select
                          v-model="organization"
                          :items="organizations"
                          color="green"
                          :base-color="FIELD_COLOR"
                          item-title="name"
                          item-value="id"
                          :rules="[rules.required]"
                          variant="outlined"
                          label="Организация"
                      />
                      <v-text-field
                          v-model="loginRef"
                          :rules="[rules.required]"
                          color="green"
                          :base-color="FIELD_COLOR"
                          variant="outlined"
                          class="w-auto text-sm-body-1"
                          density="compact"
                          placeholder="Ivan"
                          label="Логин"
                          v-mask="'XXXXXXXXXXXXXXXXXXX'"
                          clear-icon="close"
                          :append-inner-icon="loginRef ? 'close' : ''"
                          @click:append-inner="loginRef = null"
                      />
                      <div class="d-flex">
                        <v-text-field
                            v-model="passwordRef"
                            :rules="[rules.required]"
                            color="green"
                            :base-color="FIELD_COLOR"
                            type="password"
                            variant="outlined"
                            class="w-auto text-sm-body-1"
                            density="compact"
                            placeholder="********"
                            label="Пароль"
                            :disabled="passwordRef === '#########'"
                            clear-icon="close"
                            :append-inner-icon="passwordRef ? 'close' : ''"
                            @click:append-inner="passwordRef = null"
                            hide-details
                        />
                        <span v-show="isExistsUser" class="mt-1 ms-2 text-blue-darken-4 cursor-pointer" @click="isDialogPassword = true">Изменить пароль</span>
                      </div>
                    </div>
                  </div>
                  <span
                    v-show="isExistsUser"
                    @click="onPickFile"
                    class="text-sm-body-2 text-blue-darken-4 cursor-pointer"
                  >Изменить
                  </span>
                  <div :class="isExistsUser ? 'mt-2' : 'mt-5'">
                    <v-select
                      v-model="group"
                      :items="groups"
                      color="green"
                      :base-color="FIELD_COLOR"
                      item-title="name"
                      item-value="id"
                      :rules="[rules.required]"
                      variant="outlined"
                      label="Группа"
                      hide-details
                    />
                  </div>
                  <div class="d-flex ga-4 mt-5">
                    <v-text-field
                        v-model="phoneRef"
                        :rules="[rules.required, rules.phone]"
                        color="green"
                        :base-color="FIELD_COLOR"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        type="tel"
                        placeholder="+992119111881"
                        label="Номер телефона"
                        v-mask="'+############'"
                        clear-icon="close"
                        :append-inner-icon="phoneRef ? 'close' : ''"
                        @click:append-inner="phoneRef = null"
                        hide-details
                    />
                    <v-text-field
                        v-model="emailRef"
                        :rules="[rules.required, rules.email]"
                        color="green"
                        :base-color="FIELD_COLOR"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="ivan@gmail.com"
                        type="email"
                        label="Почта"
                        clear-icon="close"
                        :append-inner-icon="emailRef ? 'close' : ''"
                        @click:append-inner="emailRef = null"
                        hide-details
                    />
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
        <div v-if="isCreateGroup">
          <create-group @toggleDialog="toggleGroup" />
        </div>
        <div v-if="isDialogPassword">
          <change-password @toggleDialogPassword="isDialogPassword = false" :id="idUser" />
        </div>

        <v-dialog class="mt-2 pa-2" v-model="showModalDialog">
          <v-card style="border: 2px solid #3AB700" min-width="600"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Фильтр</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="getUser" title="Сохранить" name="save"/>
                </div>
                <v-btn @click="closeFilterDialog" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons title="Закрыть" name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" >
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <div class="d-flex" :style="isExistsUser ?? { width: '98%' }">
                    <v-text-field
                        v-model="filterForm.name"
                        color="green"
                        :base-color="FIELD_COLOR"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="Иван Иванов Иванович"
                        label="ФИО"
                        clear-icon="close"
                        :append-inner-icon="fioRef ? 'close' : ''"
                        @click:append-inner="fioRef = null"
                    />
                    <div class="mt-2 ms-4" v-if="isExistsUser">
                      <CustomCheckbox @change="filterForm.status" :checked="filterForm.status">
                        <span>Активный</span>
                      </CustomCheckbox>
                    </div>
                  </div>
                  <div class="d-flex w-100 ga-4">
                    <div class="border d-flex justify-center align-center" style="width: 70%;">
                      <input
                          accept="image/*"
                          type="file"
                          @change="selectAvatar"
                          style="display: none;"
                          ref="fileInput"
                      />
                    </div>
                    <div class="w-100">
                      <v-select
                          v-model="filterForm.organization_id"
                          :items="organizations"
                          color="green"
                          :base-color="FIELD_COLOR"
                          item-title="name"
                          item-value="id"
                          variant="outlined"
                          label="Организация"
                      />
                      <v-text-field
                          v-model="filterForm.login"

                          color="green"
                          :base-color="FIELD_COLOR"
                          variant="outlined"
                          class="w-auto text-sm-body-1"
                          density="compact"
                          placeholder="Ivan"
                          label="Логин"
                          clear-icon="close"
                          :append-inner-icon="filterForm.login ? 'close' : ''"
                          @click:append-inner="filterForm.login = null"
                      />
                    </div>
                  </div>
                  <div class="d-flex ga-4 mt-5">
                    <v-text-field
                        v-model="filterForm.phone"
                        color="green"
                        :base-color="FIELD_COLOR"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="+992119111881"
                        label="Номер телефона"
                        clear-icon="close"
                        :append-inner-icon="filterForm.phone ? 'close' : ''"
                        @click:append-inner="filterForm.phone = null"
                        hide-details
                    />
                    <v-text-field
                        v-model="filterForm.email"
                        color="green"
                        :base-color="FIELD_COLOR"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="ivan@gmail.com"
                        label="Почта"
                        clear-icon="close"
                        :append-inner-icon="filterForm.email ? 'close' : ''"
                        @click:append-inner="filterForm.email = null"
                        hide-details
                    />
                  </div>
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