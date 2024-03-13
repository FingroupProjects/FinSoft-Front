<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
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
import counterpartyApi from "../../../api/counterparty.js";

const router = useRouter()

const loading = ref(true)
const imagePreview = ref(null)
const imageRef = ref(null)
const fileInput = ref(null)
const dialog = ref(false)
const idEmployee = ref(null)
const hoveredRowIndex = ref(null)
const url = ref(null)

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

const paginations = ref([])

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
  {title: 'Номер телефона', key: 'phone'},
  {title: 'Эл.Почта', key: 'email'},
  {title: 'Адрес', key: 'address'}
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
  appendIfNotNull('address', addressRef.value);
  appendIfNotNull('image', imageRef.value);

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


    if (error.response && error.response.status === 422) {

      if (error.response.data.errors.name) {
        showToast("Поле ФИО не может быть пустым", "warning")
      }

      else if (error.response.data.errors.phone) {
        showToast("Поле тел. номер должно быть не короче 13 символов", "warning")
      }

      else if (error.response.data.errors.email) {
        showToast(error.response.data.errors.email[0], "warning")
      }
      else if (error.response.data.errors.address) {
        showToast("Поле Адрес не может быть пустым", "warning")
      }

      else {
        showToast("Заполните все поля!", "warning");
      }
    }

  }

}

const cleanForm = () => {
  nameRef.value = null
  addressRef.value = null
  phoneRef.value = null
  emailRef.value = null
  imageRef.value = null
  imagePreview.value = null
  fileInput.value = null
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

  console.log(nameRef.value)
  console.log(phoneRef.value)
  console.log(emailRef.value)
  console.log(addressRef.value)
  console.log(imageRef.value)

  appendIfNotNull('name', nameRef.value);
  appendIfNotNull('phone', phoneRef.value);
  appendIfNotNull('email', emailRef.value);
  appendIfNotNull('address', addressRef.value);
  appendIfNotNull('image', imageRef.value);


  try {

    const res = await employee.update(idEmployee.value, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });



    if (res.status === 200) {
      await getEmployee({page, itemsPerPage, sortBy})
      showToast(editMessage)
      idEmployee.value = res.data.result.id
      dialog.value = false
      cleanForm()
      markedID.value = []
      markedItem.value = []
    }


  } catch (error) {


    if (error.response && error.response.status === 422) {

      if (error.response.data.errors.name) {
        showToast("Поле ФИО не может быть пустым", "warning")
      }

      else if (error.response.data.errors.phone) {
        showToast("Поле тел. номер должно быть не короче 13 символов", "warning")
      }

      else if (error.response.data.errors.email) {
        showToast(error.response.data.errors.email[0], "warning")
      }
      else if (error.response.data.errors.address) {
        showToast("Поле Адрес не может быть пустым", "warning")
      }

      else {
        showToast("Заполните все поля!", "warning");
      }
    }
    console.log(error);
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
const onPickFile = () => {
  fileInput.value.click()
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
    imagePreview.value = 'http://localhost:8410/' + item.image
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
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
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
            :items="employees"
            :item-value="headers.title"
            page-text =  '{0}-{1} от {2}'
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
              <td>{{ item.phone }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.address }}</td>
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
                <v-btn @click="dialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
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
                      rounded="md"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Фио"
                      label="Фио"
                      clear-icon="close"
                      clearable
                  />
                  <div class="d-flex w-100 ga-4">
                    <div class="border me-4  d-flex justify-center align-center" style="width: 40%">
                      <div v-if="imagePreview === null">
                        <v-btn  @click="onPickFile">Загрузить фото</v-btn>
                        <input
                            accept="image/*"
                            type="file"
                            @change="selectAvatar"
                            style="display: none;"
                            ref="fileInput"
                        />
                      </div>
                      <img v-else :src="imagePreview" width="150" height="150" alt="">
                    </div>

                    <div class="d-flex flex-column" style="width: 60%">
                      <v-text-field
                          v-model="phoneRef"
                          :rules="[rules.required]"
                          color="green"
                          rounded="md"
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
                          rounded="md"
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
                          rounded="md"
                          variant="outlined"
                          class="w-auto text-sm-body-1"
                          density="compact"
                          placeholder="Адрес"
                          label="Адрес"
                          clear-icon="close"
                          clearable
                      />
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>
    </v-col>
  </div>


</template>

<style scoped>

</style>