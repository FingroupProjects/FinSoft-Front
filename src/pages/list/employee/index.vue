<script setup>
import {computed, onMounted, ref} from "vue";
import { useRouter } from "vue-router";
import cashRegister from '../../../api/cashRegister.js'
import position from '../../../api/position.js'
import showToast from '../../../composables/toast'
import employee from "../../../api/employee.js";

const router = useRouter()
const isDialog = ref(false);
const updateDialog = ref(false);
const deleteDialog = ref(false);

const loading = ref(true);
const itemID = ref(null);

const ID = ref(null)

const name = ref(null)
const surname = ref(null)
const lastname = ref(null)
const image = ref(null)

const nameError = ref(null)
const surnameError = ref(null)
const positionError = ref(null)
const lastnameError = ref(null)

const positions = ref([])
const employees = ref([])

const paginations = ref([])

const positionAdd = ref([])
const positionUpdate = ref([])


const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Имя', key: 'name'},
  { title: 'Фамилия', key: 'lastname'},
  { title: 'Отчество', key: 'surname'},
  { title: 'Должность', key: 'position.name', align: 'center'},
  { title: 'Фото', key: 'image', align: 'center'},
  { title: '#', key: 'icons', sortable: false},
])

const getEmployeesData = async ({ page, itemsPerPage, sortBy }) => {
  loading.value = true
  try {
    const { data } = await employee.get(page, itemsPerPage, sortBy )
    paginations.value = data.result.pagination
    employees.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}

const validate = () => {
  nameError.value = null
  surnameError.value = null;

  if (name.value === null) {
    return nameError.value = 'Заполните поле!'
  }
  if (surname.value === null) {
    return surnameError.value = 'Заполните поле!'
  }
  if (lastname.value === null) {
    return lastnameError.value = 'Заполните поле!'
  }


  if (positionAdd.value.length === 0) {
   return  positionError.value = 'Выберите позицию'
  }
  if (positionUpdate.value.length === 0) {
    return positionError.value = 'Выберите позицию'
  }
  return true
}

const getPositions = async () => {
  try {
    const { data } = await position.get(1, 10000 )
    positions.value = data.result.data.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    })
  } catch (e) {

  }
}

const chooseFile = event => {
  image.value = event.target.files[0]
}


const create = async ({page, itemsPerPage, sortBy}) => {
  const form = new FormData()
  form.append('name', name.value)
  form.append('lastname', lastname.value)
  form.append('surname', surname.value)
  form.append('image', image.value)
  form.append('position_id', 1)

  console.log(form)

  const res = await employee.add(form)

  console.log(res)

  if (res.status === 201) {
    showToast('Успешно добавлена')
    isDialog.value = false;
    name.value = null;
    lastname.value = null;
    surname.value = null;
    positionAdd.value = null;

   await getEmployeesData({page, itemsPerPage, sortBy})
  }

}

const editItem = item => {
  updateDialog.value = true
  name.value = item.name
  itemID.value = item.id


  positions.value.map(el => {
    if (el.id === item.position.id) {
      positionUpdate.value = {
        id: item.position.id,
        name: item.position.name
      }
    }
  })

}

const update = async ({page, itemsPerPage, sortBy}) => {

  if (validate() !== true) return
  const body = {
    name: name.value,
    lastname: lastname.value,
    surname: surname.value,
    file: null,
    position_id: positionUpdate.value
  }

  const { status } = await cashRegister.update(itemID.value, body)

  if (status === 200) {
    showToast('Успешно обновлено')
    updateDialog.value = false
    name.value = null;
    lastname.value = null;
    surname.value = null;
    positionUpdate.value = null;

    await getEmployeesData({page, itemsPerPage, sortBy})
  }
}

const deleteItem = item => {
  ID.value = item.id
  deleteDialog.value = true
}

const deleteModal = async ({page, itemsPerPage, sortBy}) => {
  const {status} = await employee.delete(ID.value)

  if (status === 200) {
    showToast('Успешно удалено', 'red')
    deleteDialog.value = false
    ID.value = null;
    await getEmployeesData({page, itemsPerPage, sortBy})
  }
}


onMounted(async () => {
  await getPositions()
})

</script>

<template>

  <div>
    <v-col>
      <div class="d-flex w-100 justify-space-between">
        <div>
          <h2>Сотрудники</h2>
        </div>
        <v-btn rounded="lg" @click="isDialog = true" color="info" >Создать</v-btn>
      </div>
      <v-card class="mt-4 table">
        <v-data-table-server
            :loading="loading"
            v-model:items-per-page="paginations.per_page"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="employees"
            :item-value="headers.title"
            @update:options="getEmployeesData"
        >
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template v-slot:item.image="{ item }">
            <div class="p-2">
              <v-img :src="'http://95.142.94.22:8410/' + item.image" :alt="item.name" height="100px"></v-img>
            </div>
          </template>
          <template #item.icons="{ item }">
            <v-icon class="icon mr-2" @click="editItem(item)" >edit</v-icon>
            <v-icon class="trash mr-2" @click="deleteItem(item)" color="red" >delete</v-icon>
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
                    label="Имя"
                    type="text"
                    v-model="name"
                    :error-messages="nameError"
                />
                <v-text-field
                    variant="outlined"
                    label="Фамимлия"
                    type="text"
                    v-model="lastname"
                    :error-messages="nameError"
                />
                <v-text-field
                    variant="outlined"
                    label="Отчество"
                    type="text"
                    v-model="surname"
                    :error-messages="nameError"
                />
                <v-select
                    variant="outlined"
                    label="Выберите должность"
                    v-model="positionAdd"
                    :items="positions"
                    item-title="name"
                    item-value="id"
                />
                <v-text-field
                  @change="chooseFile"
                  type="file"
                  variant="outlined"
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
                    label="Имя"
                />
                <v-text-field
                    v-model="surname"
                    variant="outlined"
                    type="text"
                    :error-messages="surnameError"
                    label="Фамилия"
                />
                <v-text-field
                    v-model="lastname"
                    variant="outlined"
                    type="text"
                    :error-messages="lastnameError"
                    label="Отчество"
                />
                <v-select
                    :items="positions"
                    v-model="positionUpdate"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    label="Выберите должность"
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