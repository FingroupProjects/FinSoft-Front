<script setup>
import {onMounted, ref, watch} from "vue";
import showToast from '../../../composables/toast'
import employee from '../../../api/employee.js'
import storage from "../../../api/storage.js";
import {add, edit, remove} from "../../../composables/constant/buttons.js";

const isDialog = ref(false);
const updateDialog = ref(false);
const deleteDialog = ref(false);
const loading = ref(true);

const ID = ref(null)

const search = ref(null)
const name = ref(null)
const itemID = ref(null)
const nameError = ref(null)

const employees = ref([])

const storages = ref([])
const paginations = ref([])

const employeeAdd = ref([])
const employeeUpdate = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Название', key: 'name'},
  { title: 'Сотрудник', key: 'employee.name', sortable: false},
  { title: '#', key: 'icons', sortable: false},
])

const getStorageData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true
  try {
    const { data } = await storage.get({page, itemsPerPage, sortBy}, search )
    paginations.value = data.result.pagination
    storages.value = data.result.data
    loading.value = false
  } catch (e) {

  }
}

const validate = () => {
  nameError.value = null
  if (name.value.length < 1) {
    return nameError.value = 'Заполните поле!'
  }

  return true
}

const getEmployee = async () => {
  try {
    const { data } = await employee.get(1, 10000 )
    employees.value = data.result.data.map(item => {
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
    employee_id: employeeAdd.value
  }

  const res = await storage.add(body)

  if (res.status === 201) {
    showToast('Успешно добавлена')
    isDialog.value = false;
    name.value = null;
   await getStorageData({page, itemsPerPage, sortBy})
  }

}

const editItem = item => {
  updateDialog.value = true
  name.value = item.name
  itemID.value = item.id

  employees.value.map(el => {
    if (el.id === item.employee.id) {
      employeeUpdate.value = {
        id: item.employee.id,
        name: item.employee.name
      }
    }
  })
}

const update = async ({page, itemsPerPage, sortBy}) => {

  if (validate() !== true) return

  const body = {
    name: name.value,
    employee_id: employeeUpdate.value.id
  }

  const res = await storage.update(itemID.value, body)

  if (res.status === 200) {
    showToast('Успешно обновлено')
    updateDialog.value = false
    name.value = null;
    await getStorageData({page, itemsPerPage, sortBy})
  }
}

const deleteItem = item => {
  ID.value = item.id
  deleteDialog.value = true
}

const deleteModal = async ({page, itemsPerPage, sortBy}) => {
  const {status} = await storage.delete(ID.value)

  if (status === 200) {
    showToast('Успешно удалено', 'red')
    deleteDialog.value = false
    ID.value = null;
    await getStorageData({page, itemsPerPage, sortBy})
  }
}

watch(isDialog, async() => {
  if (isDialog.value === false) {
    name.value = null;
    employeeAdd.value = null;
    employeeUpdate.value = null;

  }
})
watch(updateDialog, async() => {
  if (updateDialog.value === false) {
    name.value = null;
    employeeAdd.value = null;
    employeeUpdate.value = null;
  }
})


onMounted(async () => {
  await getEmployee()
})

</script>

<template>

  <div>
    <v-col>
      <div class="d-flex w-100 justify-end">
        <v-btn rounded="lg" @click="isDialog = true" color="info">{{ add }}</v-btn>
      </div>
      <v-card class="mt-4 table">

        <v-card-title class="d-flex align-center pe-2">
          Список складов

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
            :loading="loading"
            v-model:items-per-page="paginations.per_page"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="storages"
            :search="search"
            :item-value="headers.title"
            @update:options="getStorageData"
        >
          <template v-slot:item.id="{ index }">
            <span>{{ index + 1 }}</span>
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
                    label="Наименование"
                    type="text"
                    v-model="name"
                    :error-messages="nameError"
                />
                <v-select
                    variant="outlined"
                    label="Выберите сотрудника"
                    v-model="employeeAdd"
                    :items="employees"
                    item-title="name"
                    item-value="id"
                />
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="info" type="submit">{{ add }}</v-btn>
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
                    :items="employees"
                    v-model="employeeUpdate"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    label="Выберите сотрудника"
                    persistent-hint
                    return-object
                    single-line
                />
                <div class="d-flex ga-2 justify-end align-center">
                  <v-btn :loading="loading" color="info" type="submit">{{ edit }}</v-btn>
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
                  <v-btn :loading="loading" class="text-sm-body-2" color="red" type="submit">{{ remove }}</v-btn>
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