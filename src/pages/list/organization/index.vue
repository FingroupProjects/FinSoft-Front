<script setup>
import { ref, watch,onMounted } from "vue";
import organization from '../../../api/organizations';
import { 
   addMessage,
   editMessage,
   removeMessage,
   warningMessage,
   restoreMessage} from '../../../composables/constant/buttons.js'
import showToast from "../../../composables/toast";
import binarySearch from "../../../composables/binarySearch/binarySearch.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import employee from "../../../api/employee";


const addDialog = ref(false);
const updateDialog = ref(false)
const deleteDialog = ref(false)
const isCreate = ref(false)
const isEdit = ref(false)
const loading = ref(true)
const dialog = ref(false)
const markedID = ref([])
const markedItem = ref([])
const valueRef = ref(null)
const hoveredRowIndex = ref(null)
const isExistsOrganization = ref(false)
const organizationInDialogTitle = ref(null)


const organizations = ref([]);
const paginations = ref([])
const employees = ref([]);
const idOrganizations = ref(null)

const nameRef = ref(null)
const innRef = ref(null);
const directorRef = ref(null);
const accountantRef = ref(null);
const addressRef = ref(null);
const descriptionRef = ref(null);
const search = ref('')

const rules = {
  required: value => !!value || 'Поле обязательно для заполнения',
};

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Наименование', key: 'name'},
])

const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
}


const getEmployees = async () => {
  try {
    const response = await employee.get();
    employees.value = response.data;
  } catch (error) {
    console.error(error);
  }
};
onMounted(getEmployees);

const getOrganizationData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true;
  try {
    const { data } = await organization.get({ page, itemsPerPage, sortBy }, search);
    organizations.value = data.result.data.map((item) => ({
      ...item,
    }));
    paginations.value = data.result.pagination;
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const openDialog = (item) => {
  addDialog.value = true;
  if (item === 0) {
    idOrganizations.value = 0;
    isExistsOrganization.value = false;
  } else {
    idOrganizations.value = item.id;
    const index = binarySearch(organizations.value, item.id);
    if (index !== 1) {
      isExistsOrganization.value = true;
      nameRef.value = item.name;
      organizationInDialogTitle.value = nameRef.value;
    } else {
    }
  }
};


const addOrganization = async ({ page, itemsPerPage, sortBy }) => {
  const body = {
    name: nameRef.value,
    inn: innRef.value,
    director: directorRef.value,
    accountant: accountantRef.value,
    address: addressRef.value,
    description: descriptionRef.value,
  };

  const res = await organization.add(body);
  if (res.status === 201) {
    await getOrganizationData({ page, itemsPerPage, sortBy });
    showToast(addMessage);
    valueRef.value = null;
    idOrganizations.value = res.data.result.id;
  }
};

const addNewOrganization = async () => {
  await addOrganization({ page, itemsPerPage, sortBy });
  addDialog.value = false; 
};


const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return massRestoreCounterparty({ page, itemsPerPage, sortBy })
  }
  else {
    return massDel({ page, itemsPerPage, sortBy, search })
  }
}

const massRestoreCounterparty = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const body = {
      ids: markedID.value
    }
    const { status } = await organization.massRestore(body)
    if (status === 200) {
      showToast(restoreMessage, 'green')
      await getOrganizationData({ page, itemsPerPage, sortBy })
      markedID.value = []
    }
  } catch (e) {
    console.log(e)
  }
}

const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value
  }
  try {
    const { status } = await organization.massDeletion(body)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getOrganizationData({ page, itemsPerPage, sortBy }, search)
      markedID.value = []
    }
  } catch (e) {
    console.log(e)
  }
}

const handleCheckboxClick = function (item) {
  lineMarking(item)
}

const editItem = (item) => {
  isCreate.value = true;
  isEdit.value = true;
  markedItem.value = item.id
}

watch(() => isEdit.value, (newValue, { page, itemsPerPage, sortBy }, search) => {
  if (newValue === false) {
    getOrganizationData({ page, itemsPerPage, sortBy }, search)
  }
});
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
            <Icons @click="addDialog = true" name="add" />
              <Icons name="copy" />
              <Icons @click="compute({ page, itemsPerPage, sortBy, search })" name="delete" />
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
            style="height: 78vh"
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
        
        <template v-slot:item="{ item, index }" >
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @dblclick="openDialog(item)" @click="lineMarking(item)" :class="{'bg-grey-lighten-2': markedID.includes(item.id)}">
              <td class="">
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)" @change="handleCheckboxClick(item)">
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                  <span>{{ index + 1 }}</span>
                </template>
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
      <v-dialog class="mt-2 pa-2"  v-model="addDialog">
        <v-card style="border: 2px solid #3AB700" min-width="500" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="">{{ isExistsOrganization ? organizationInDialogTitle + '' : 'Добавление' }}</span>
             <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="removeOrganization" name="delete"/>
                <Icons v-if="isExistsOrganization" @click="update" name="save"/>
                <Icons v-else @click="addNewOrganization" name="save"/>
              </div>
              <v-btn @click="dialog = false"  variant="text" :size="32" class="pt-2 pl-1">
                <Icons name="close" @click="addDialog = false"/>
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
          placeholder="Организация"
          label="Наименования"
          clear-icon="close"
          clearable
      />
      <v-text-field
          v-model="innRef"
          color="green"
          rounded="lg"
          variant="outlined"
          class="w-auto text-sm-body-1"
          density="compact"
          placeholder="ИНН"
          label="ИНН"
          clear-icon="close"
          clearable
      />
        <v-select
        v-model="directorRef"
        :items="employees"
        item-text="name"
        item-value="id"
        label="Директор"
        dense
        outlined
      ></v-select>
      <v-select
        v-model="accountantRef"
        :items="employees"
        item-text="name"
        item-value="id"
        label="Гл. бухгалтер"
        dense
        outlined
      ></v-select>
      <v-text-field
          v-model="addressRef"
          color="green"
          rounded="lg"
          variant="outlined"
          class="w-auto text-sm-body-1"
          density="compact"
          placeholder="Адрес"
          label="Адрес"
          clear-icon="close"
          clearable
      />
      <v-text-field
          v-model="descriptionRef"
          color="green"
          rounded="lg"
          variant="outlined"
          class="w-auto text-sm-body-1"
          density="compact"
          placeholder="Описание"
          label="Описание"
          clear-icon="close"
          style="height: 120px; margin-bottom: -20px;"
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


