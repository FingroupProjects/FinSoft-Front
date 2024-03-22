<script setup>
import {ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage
} from "../../../composables/constant/buttons.js";
import organization from "../../../api/organizations.js";
import employee from "../../../api/employee.js";
import validate from "./validate.js";
import {FIELD_COLOR} from "../../../composables/constant/colors.js";
import CreateGroup from "./createGroup.vue";

const router = useRouter()

const loading = ref(true)
const dialog = ref(false)
const isCreateGroup = ref(false)
const idEmployee = ref(null)
const hoveredRowIndex = ref(null)

const isExistsEmployee = ref(false)
const markedID = ref([]);
const markedItem = ref([])
const employeeDialogTitle = ref(null)
const employees = ref([])
const search = ref('')

const nameRef = ref(null)
const phoneRef = ref(null)
const emailRef = ref(null)
const addressRef = ref(null)
const imageRef = ref(null)
const imagePreview = ref(null)
const fileInput = ref(null)

const paginations = ref([])
const showModal = ref(false);

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
])

const rules = {
  required: v => !!v,
}


const getEmployee = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  try {
    const {data} = await employee.get({page, itemsPerPage, sortBy}, search)
    paginations.value = data.result.pagination
    employees.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}


const onPickFile = () => {
  fileInput.value.click()
}

const selectAvatar = event => {
  const files = event.target.files
  imageRef.value = files[0];
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

const addEmployee = async ({page, itemsPerPage, sortBy}) => {

  const formData = new FormData();

  function appendIfNotNull(key, value) {
    if (value !== null) {
      formData.append(key, value);
    }
  }

  appendIfNotNull('name', nameRef.value);
  appendIfNotNull('phone', phoneRef.value);
  appendIfNotNull('email', emailRef.value);
  appendIfNotNull('address', addressRef.value);
  appendIfNotNull('image', imageRef.value);


  console.log(...formData.entries())
  if (validate(nameRef,phoneRef,emailRef,addressRef) !== true) return

  try {

    const res = await employee.add(formData)

    if (res.status === 201) {
      await getEmployee({page, itemsPerPage, sortBy})
      showToast(addMessage)
      idEmployee.value = res.data.result.id
      dialog.value = false
      cleanForm()

      markedID.value = []
      markedItem.value = []

    }


  } catch (error) {
    console.log(error);
  }

}

const cleanForm = () => {
  nameRef.value = null
  addressRef.value = null
  phoneRef.value = null
  emailRef.value = null
  imagePreview.value = null
}

const massDel = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedID.value
  }

  try {
    const {status} = await employee.massDeletion(body)

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getEmployee({page, itemsPerPage, sortBy}, search)
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
    const {status} = await employee.massRestore(body)

    if (status === 200) {
      showToast(restoreMessage)
      await getemployeeData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}


const update = async ({page, itemsPerPage, sortBy}) => {
  const formData = new FormData();

  function appendIfNotNull(key, value) {
    if (value !== null) {
      formData.append(key, value);
    }
  }


  appendIfNotNull('name', nameRef.value);
  appendIfNotNull('phone', phoneRef.value);
  appendIfNotNull('email', emailRef.value);
  appendIfNotNull('address', addressRef.value);
  appendIfNotNull('image', imageRef.value);

  if (validate(nameRef,phoneRef,emailRef,addressRef) !== true) return 
  try {
    const {status} = await employee.update(idEmployee.value, formData)
    if (status === 200) {
      cleanForm()
      dialog.value = null
      await getEmployee({page, itemsPerPage, sortBy})
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}

const getOrganization = async () => {
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


const handleCheckboxClick = (item) => {
  lineMarking(item)
}

const openDialog = (item) => {
  dialog.value = true

  if (item === 0) {
    idEmployee.value = 0
    isExistsEmployee.value = false

  } else {
    idEmployee.value = item.id
    markedID.value.push(item.id);
    isExistsEmployee.value = true
    nameRef.value = item.name
    phoneRef.value = item.phone
    emailRef.value = item.email
    addressRef.value = item.address
    employeeDialogTitle.value = nameRef.value

    if (item.image !== null) {
      imagePreview.value = import.meta.env.VITE_IMG_URL + item.image
      console.log(imagePreview.value)
    } else {
      imagePreview.value = 'data:image/png;base64,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BQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAIMAOrdVOIxsnZhAAAAAElFTkSuQmCC'
    }


  }

}




const addBasedOnEmployee = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true

  employees.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name,
          phoneRef.value = item.phone,
          emailRef.value = item.email,
          addressRef.value = item.address

    }
  })

}

const compute = ({page, itemsPerPage, sortBy, search}) => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  console.log(markedID.value)
  console.log(markedItem.value)
  if (markedItem.value.deleted_at) {
    return massRestore({page, itemsPerPage, sortBy})
  } else {
    return massDel({page, itemsPerPage, sortBy, search})
  }
}

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = employees.value.find(el => el.id === markedID.value[0]);
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

const toggleGroup = async () => {
  isCreateGroup.value = false
}


const isDataChanged = () => {
  const item = employee.value.find(
    (item) => item.id === idEmployee.value
  );

  const isChanged =
    nameRef.value !== item.name ||
    phoneRef.value !== item.phone ||
    emailRef.value.id !== item.email ||
    addressRef.value.id !== item.address 

  return isChanged;
};

const checkAndClose = () => {
  console.log(1);
  if (
    nameRef.value ||
    phoneRef.value ||
    emailRef.value ||
    addressRef.value 
  ) {
    showConfirmDialog.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
};

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false
  showConfirmDialog.value = false;
  cleanForm();
};

const checkUpdate = () => {
  if (isDataChanged()) {
    showConfirmDialog.value = true;
  } else {
    dialog.value = false;
  }

};


watch(dialog, newVal => {
  if (!newVal) {
    cleanForm()
  }
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Сотрудники</span>
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
              <Icons @click="openDialog(0)" name="add"/>
              <Icons @click="addBasedOnEmployee" name="copy"/>
              <Icons @click="compute" name="delete"/>
            </div>

            <div class="w-100">
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
            :items="employees"
            :item-value="headers.title"
            page-text='{0}-{1} от {2}'
            :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
            :search="search"
            @update:options="getEmployee"
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)"
                @dblclick="openDialog(item)"
                :class="{'bg-grey-lighten-2': markedID.includes(item.id) }">
              <td>
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)"
                                  @change="handleCheckboxClick(item)">
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <div class="d-flex">
                    <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                    <span>{{ index + 1 }}</span>
                  </div>
                </template>
              </td>
              <td>{{ item.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="540"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsEmployee ? 'сотрудник: ' + employeeDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="isExistsEmployee" @click="compute" name="delete"/>
                  <Icons v-if="isExistsEmployee" @click="update" name="save"/>
                  <Icons v-else @click="addEmployee" name="save"/>
                </div>
                <v-btn
                @click="toggleModal() ? checkUpdate() : checkAndClose({ page, itemsPerPage, sortBy, search, filterData})"
                
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addEmployee">

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
                      placeholder="Фио"
                      label="Фио"
                      clear-icon="close"
                      clearable
                  />
                  <div class="d-flex ga-4">
                      <div class="border d-flex justify-center align-center" style="width: 50%;">
                           <input
                               accept="image/*"
                               type="file"
                               @change="selectAvatar"
                               style="display: none;"
                               ref="fileInput"
                           />  
                          <div v-if="imagePreview === null">
                              <v-btn @click="onPickFile">Загрузить фото</v-btn>
                          </div>
                          <img v-else :src="imagePreview" width="150" height="150" alt="">
                      </div>

                      <div class="d-flex flex-column" style="width: 60%">
                          <v-text-field
                              v-model="phoneRef"
                              :rules="[rules.required]"
                              color="green"
                              :base-color="FIELD_COLOR"
                              variant="outlined"
                              class="w-auto text-sm-body-1"
                              density="compact"
                              placeholder="номер телефона"
                              label="Номер телефона"
                              clear-icon="close"
                              clearable
                          />
                          <v-text-field
                              v-model="emailRef"
                              :rules="[rules.required]"
                              color="green"
                              :base-color="FIELD_COLOR"
                              variant="outlined"
                              class="w-auto text-sm-body-1"
                              density="compact"
                              placeholder="email"
                              label="Электронная почта"
                              clear-icon="close"
                              clearable
                          />
                          <v-text-field
                              v-model="addressRef"
                              :rules="[rules.required]"
                              color="green"
                              :base-color="FIELD_COLOR"
                              variant="outlined"
                              class="w-auto text-sm-body-1"
                              density="compact"
                              placeholder="Адрес"
                              label="Адрес"
                              clear-icon="close"
                              clearable
                          />
                          <span
                              v-show="imagePreview !== null"
                              @click="onPickFile"
                              class="text-sm-body-2 text-blue-darken-4 cursor-pointer"
                          >Изменить
                          </span>
                      </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
        <div v-if="isCreateGroup">
          <create-group @toggleDialog="toggleGroup" />
        </div>
        <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="toggleModal()" @closeClear="closeDialogWithoutSaving()" />
      </div>
      </v-card>
    </v-col>
  </div>


</template>

<style scoped>

</style>