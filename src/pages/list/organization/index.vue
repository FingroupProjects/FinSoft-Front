<script setup>
import { ref } from "vue";
import api from "../../../api/organizations";
import {prevIcon,addIcon,editIcon,edit,removeIcon,remove,cancel} from '../../../composables/constant/buttons.js'

const dialog = ref(false);
const loading = ref(true)
const name = ref("");
const error = ref(null);
const organizations = ref([]);
const paginations = ref([])
const updateModal = ref(false)
const idOrganizations = ref(null)
const nameRef = ref(null)
const deleteModal = ref(false)

const rules = {
  required: value => !!value || 'Поле обязательно для заполнения',
};

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Наименование', key: 'name'},
  { title: '#', key: 'icons', align:'center', sortable: false},
])

const goToEdit = item => {
  idOrganizations.value = item.id;
  nameRef.value = item.name;
  updateModal.value = true;
};

const addOrganization = () => {
  api.add({ name: name.value }).then(() => {
    dialog.value = false;
    name.value = "";
    console.log("Organization added successfully!");
    fetchOrganizations();
  }).catch((err) => {
    error.value = err.response.data.message || "Произошла ошибка при добавлении организации.";
  });
};



const fetchOrganizations = async ( page, itemsPerPage, sortBy ) => {
  loading.value = true
  try {
    const { data } = await api.getAll(page, itemsPerPage, sortBy )
    paginations.value = data.result.pagination
    organizations.value = data.result.data
    console.log(data)
    loading.value = false
  } catch (e) {
  }
}
const update = async ({page, itemsPerPage, sortBy}) => {

const data = {
  name: nameRef.value,
}
try {
  const { status } = await organizations.update(idOrganizations.value, data)
  if (status === 200) {
    await fetchOrganizations({page, itemsPerPage, sortBy})
    updateModal.value = false
    showToast('Успешно обновлено!')
  }
} catch (e) {
  console.log(e)
}
}

const removeCurrency = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await organizations.remove(idOrganizations.value)
    if (status === 200) {
      const res = await fetchOrganizations({page, itemsPerPage, sortBy})
      console.log(res)
    }
  } catch (e) {

  } finally {
    deleteModal.value = false
  }
}
const goToDelete = item => {
  idOrganizations.value = item.id
  deleteModal.value = true
}

</script>

<template>
  <div class="element">
  <div>
    <div class="d-flex justify-space-between">
      <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push('/adminPanel')">
          <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
      </v-btn> 
      <v-btn class="rounded-circle pa-2 mb-1" stacked color="green" size="40" @click="dialog = true">
          <v-icon size="25">{{ addIcon }}</v-icon>
        </v-btn>
    </div>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-text>
          <v-text-field v-model="name" label="Name"></v-text-field>
        </v-card-text>
        <div v-if="error" class="error">{{ error }}</div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Закрыть</v-btn>
          <v-btn @click="addOrganization">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <v-card class="mt-4 table element">
      <v-data-table-server
          :loading="loading"
          v-model:items-per-page="paginations.per_page"
          :headers="headers"
          :items-length="paginations.total || 0"
          :items="organizations"
          :item-value="headers.title"
          @update:options="fetchOrganizations"
      >
        <template v-slot:item.id="{ index }">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-slot:item.icons="{ item }">
          <v-icon color="warning" @click="goToEdit(item)" class="icon">{{ editIcon }}</v-icon>
          <v-icon color="red" @click="goToDelete(item)" class="icon">{{ removeIcon }}</v-icon>
        </template>
      </v-data-table-server>
    </v-card>
    
    <v-card>
      <v-dialog v-model="updateModal" activator="parent">
          <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center pr-5 pt-3">
              <span class="pl-5">Изменение</span>
              <v-btn @click="updateModal = false" color="info" variant="tonal" :size="38">
                <v-icon size="22">close</v-icon>
              </v-btn>
            </div>
            <v-form  class="d-flex w-100 pa-5" @submit.prevent="update">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="info"
                      rounded="lg"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="name"
                      label="name"
                      clearable
                  />
                  <div class="d-flex justify-end ga-2">
                    <v-btn :loading="loading" size="small" color="info" rounded="lg" class="mt-2" @click="updateModal = false">{{ cancel }}</v-btn>
                    <v-btn :loading="loading" size="small" color="green" rounded="lg" class="mt-2" type="submit" >{{ edit }}</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
         </v-dialog>
         
         <v-dialog v-model="deleteModal" activator="parent">
        <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-end align-center pr-5 pt-3">

            <v-btn @click="deleteModal = false" color="info" variant="tonal" :size="38">
              <v-icon size="22">close</v-icon>
            </v-btn>
          </div>
          <v-card class="d-flex flex-column w-100 pr-5 pl-5 pb-5 mt-2 justify-space-between h-100 " min-height="230">
            <div class="d-flex justify-center align-center flex-column text-center">
              <v-icon size="60" color="warning">error</v-icon>
              <span class="mt-4 text-h6">Вы точно хотите удалить?</span>
            </div>
            <div class="d-flex flex-column justify-end ga-2 flex-grow-1 w-100 align-end">
              <v-btn :loading="loading" size="small" color="red" rounded="lg" class="mt-2 w-100" @click="removeCurrency">
                {{ remove }}
              </v-btn>
              <v-btn :loading="loading" size="small" color="info" rounded="lg" class="mt-2 w-100" @click="deleteModal = false">
                {{ cancel }}
              </v-btn>
            </div>
          </v-card>
        </v-card>
      </v-dialog>
    </v-card>
</div>

</template>

<style scoped>
.table {
  background: white;
  padding: 5px;
  border-radius: 16px;
  max-height: 90vh;
  overflow: auto;
}
.error {
  color: red;
}
.element::-webkit-scrollbar { width: 0; }

</style>
