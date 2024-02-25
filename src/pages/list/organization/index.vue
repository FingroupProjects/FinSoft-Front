<script setup>
import { ref, watch } from "vue";
import organization from '../../../api/organizations';
import {add, prevIcon,addIcon,editIcon,edit,removeIcon,remove,cancel, addMessage, editMessage, removeMessage} from '../../../composables/constant/buttons.js'
import showToast from "../../../composables/toast";

const addDialog = ref(false);
const updateDialog = ref(false)
const deleteDialog = ref(false)
const loading = ref(true)

const organizations = ref([]);
const paginations = ref([])
const idOrganizations = ref(null)

const nameRef = ref(null)
const search = ref('')

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
  updateDialog.value = true;
};

const getOrganizationData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true
  try {
    const { data } = await organization.getAll({page, itemsPerPage, sortBy}, search)
    paginations.value = data.result.pagination
    organizations.value = data.result.data
    loading.value = false
  } catch (e) {

  }
}

const addOrganization = async ({page, itemsPerPage, sortBy}) => {
  const body = {
    name: nameRef.value,
  }
  
  try {
    const {status} = await organization.add(body)
    if (status === 201) {
      await getOrganizationData({page, itemsPerPage, sortBy})
      addDialog.value = false
      showToast(addMessage)
      nameRef.value = null
    }
  } catch (e) {
    console.log(e)
  }
}


const update = async ({page, itemsPerPage, sortBy}) => {
  const body = {
    name: nameRef.value,
  }
  
  try {
    const { status } = await organization.update(idOrganizations.value, body)
    if (status === 200) {
      await getOrganizationData({page, itemsPerPage, sortBy})
      updateDialog.value = false
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}

const removeOrganization = async ({page, itemsPerPage, sortBy}) => {
  try {
    const {status} = await organization.remove(idOrganizations.value)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getOrganizationData({page, itemsPerPage, sortBy})
    }
  } catch (e) {

  } 
  finally {
   deleteDialog.value = false
 }
}

const goToDelete = item => {
  idOrganizations.value = item.id
  deleteDialog.value = true
}

watch(updateDialog, (newValue) => {
  if(!newValue) {
    nameRef.value = null
  }
})

</script>

<template>
  <div>
    <div class="d-flex justify-space-between">
      <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push('/adminPanel')">
          <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
      </v-btn> 
      <v-btn class="rounded-circle pa-2 mb-1" stacked color="green" size="40" @click="addDialog = true">
          <v-icon size="25">{{ addIcon }}</v-icon>
        </v-btn>
    </div>

    
    <v-card class="mt-4 table ">
      <v-card-title class="d-flex align-center pe-2">
        Организации

        <v-spacer />
        <v-spacer />
        <v-spacer />

        <v-text-field
            v-model="search"
            prepend-inner-icon="search"
            variant="outlined"
            density="compact"
            label="Поиск..."
            color="info"
            rounded="lg"
            clearable
            single-line
            flat
            hide-details
        ></v-text-field>
      </v-card-title>
        <v-data-table-server
            style="height: 65vh"
            fixed-header
            :loading="loading"
            v-model:items-per-page="paginations.per_page"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="organizations"
            :item-value="headers.title"
            @update:options="getOrganizationData"
            fixed-footer
            :search="search"
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
      <v-dialog v-model="addDialog" activator="parent">
          <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center pr-5 pt-3">
              <span class="pl-5">Добавление</span>
              <v-btn @click="addDialog = false" color="info" variant="tonal" :size="38">
                <v-icon size="22">close</v-icon>
              </v-btn>
            </div>
            <v-form  class="d-flex w-100 pa-5" @submit.prevent="addOrganization">
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
                      label="Наименование"
                      clearable
                  />
                  <div class="d-flex justify-end ga-2">
                    <v-btn :loading="loading" size="small" color="info" rounded="lg" class="mt-2" @click="addDialog = false">{{ cancel }}</v-btn>
                    <v-btn :loading="loading" size="small" color="green" rounded="lg" class="mt-2" type="submit" >{{ add }}</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
         </v-dialog>


      <v-dialog v-model="updateDialog" activator="parent">
          <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center pr-5 pt-3">
              <span class="pl-5">Изменение</span>
              <v-btn @click="updateDialog = false" color="info" variant="tonal" :size="38">
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
                    <v-btn :loading="loading" size="small" color="info" rounded="lg" class="mt-2" @click="updateDialog = false">{{ cancel }}</v-btn>
                    <v-btn :loading="loading" size="small" color="green" rounded="lg" class="mt-2" type="submit" @click="updateDialog = false" >{{ edit }}</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
         </v-dialog>
         
       <v-dialog v-model="deleteDialog" activator="parent">
        <v-card width="30%" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-end align-center pr-5 pt-3">

            <v-btn @click="deleteDialog = false" color="info" variant="tonal" :size="38">
              <v-icon size="22">close</v-icon>
            </v-btn>
          </div>
          <v-card class="d-flex flex-column w-100 pr-5 pl-5 pb-5 mt-2 justify-space-between h-100 " min-height="240">
            <div class="d-flex justify-center align-center flex-column text-center">
              <v-icon size="60" color="warning">error</v-icon>
              <span class="mt-4 text-h6">Вы точно хотите удалить?</span>
            </div>
            <div class="d-flex flex-column justify-end ga-2 flex-grow-1 w-100 align-center">
              <v-btn :loading="loading" size="small" color="red" rounded="xl" height="35" class="mt-2 w-100" @click="removeOrganization">
                {{ remove }}
              </v-btn>
              <v-btn :loading="loading" size="small" color="info" rounded="xl" height="35" class="mt-1 w-100" @click="deleteDialog = false">
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

</style>
