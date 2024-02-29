<script setup>
import { ref, watch } from "vue";
import organization from '../../../api/organizations';
import { 
   addMessage,
   editMessage,
   removeMessage,
   warningMessage} from '../../../composables/constant/buttons.js'
import showToast from "../../../composables/toast";
import binarySearch from "../../../composables/binarySearch/binarySearch.js";
import Icons from "../../../composables/Icons/Icons.vue";


const addDialog = ref(false);
const updateDialog = ref(false)
const deleteDialog = ref(false)
const loading = ref(true)
const dialog = ref(false)
const markedID = ref(null)
const valueRef = ref(null)
const isExistsOrganization = ref(false)
const organizationInDialogTitle = ref(null)


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
  { key: 'icons', align:'center', sortable: false},
])

const lineMarking = (item) => {
  markedID.value = item.id;
}



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

const openDialog = (item) => {
  dialog.value = true
  if (item === 0) {
    idOrganizations.value = 0
    isExistsOrganization.value = false
  } else {
    idOrganizations.value = item.id

    const index = binarySearch(organizations.value, item.id)

    if (index !== 1) {
      isExistsOrganization.value = true
      nameRef.value = item.name
      organizationInDialogTitle.value = nameRef.value
    } else {
    }
  }

}

const addOrganization = async ({ page, itemsPerPage, sortBy }) => {

const body = {
  name: nameRef.value,
}
const res = await organization.add(body)
if (res.status === 201) {
  await getOrganizationData({ page, itemsPerPage, sortBy })
  showToast(addMessage)
  valueRef.value = null
  idOrganizations.value = res.data.result.id
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
    showToast(editMessage)
  }
} catch (e) {
  console.log(e)
}
}

const removeOrganization = async ({page, itemsPerPage, sortBy}) => {
  if (markedID.value === null) return showToast(warningMessage, 'warning')

  try {
    const {status} = await organization.remove(markedID.value)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getOrganizationData({page, itemsPerPage, sortBy})
      dialog.value = false
      markedID.value = null
    }
  } catch (e) {
  }
}

watch(updateDialog, (newValue) => {
  if(!newValue) {
    nameRef.value = null
  }
})

watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
  }
})
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span>Организации</span>
      </div>
      <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3">
            <Icons @click="openDialog(0)" name="add"/>
            <Icons name="copy"/>
            <Icons @click="removeOrganization" name="delete"/>
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

    <v-card class="mt-4 table ">
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
            hover
        >
        
        <template v-slot:item="{ item, index }">
          <tr @click="lineMarking(item)" @dblclick="openDialog(item)" :class="{'bg-grey-lighten-2' : markedID === item.id}">
            <td class="d-flex  align-center">
              <Icons class="mt-2 me-2" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
              <span>{{ index + 1 }}</span>
            </td>
            <td>
              <span>{{ item.name }}</span>
            </td>
          </tr>
        </template>
      </v-data-table-server>
      </v-card>
      </v-col>
    
      <!-- modal -->
      <v-card>
      <v-dialog class="mt-2 pa-2"  v-model="dialog">
        <v-card style="border: 2px solid #3AB700" min-width="300" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="">{{ isExistsOrganization ? organizationInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
             <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="removeOrganization" name="delete"/>
                <Icons v-if="isExistsOrganization" @click="update" name="save"/>
                <Icons v-else @click="addOrganization" name="save"/>
              </div>
              <v-btn @click="dialog = false"  variant="text" :size="32" class="pt-2 pl-1">
                <Icons name="close" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100" @submit.prevent="addOrganization">
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
                    placeholder="Огранизация"
                    label="Название"
                    clear-icon="close"
                    clearable
                />
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


