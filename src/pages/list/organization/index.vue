<script setup>
import { ref, watch, onMounted } from "vue";
import organization from "../../../api/organizations";
import {
  addMessage,
  editMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
} from "../../../composables/constant/buttons.js";
import showToast from "../../../composables/toast";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import employee from "../../../api/employee";

const addDialog = ref(false);
const loading = ref(true);
const markedID = ref([]);
const markedItem = ref([]);
const valueRef = ref(null);
const hoveredRowIndex = ref(null);
const isExistsOrganization = ref(false);
const organizationInDialogTitle = ref(null);

const organizations = ref([]);
const paginations = ref([]);
const employees = ref([]);
const idOrganizations = ref(null);

const nameRef = ref(null);
const innRef = ref(null);
const directorRef = ref(null);
const accountantRef = ref(null);
const addressRef = ref(null);
const descriptionRef = ref(null);
const search = ref("");

const rules = {
  required: (value) => !!value || "Поле обязательно для заполнения",
};

const headers = ref([
  { title: "№", key: "id" },
  { title: "Наименование", key: "name" },
]);

const getOrganizationData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true;
  try {
    const { data } = await organization.get({ page, itemsPerPage, sortBy, search });
    organizations.value = data.result.data.map((item) => ({
      ...item
    }));
    paginations.value = data.result.pagination;
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};


const addOrganization = async ({ page, itemsPerPage, sortBy, search }) => {
  try {

    let director;
    if (typeof directorRef.value === 'object') {
      director = directorRef.value.id
    } else {
      director = directorRef.value
    }

    let accountant;
    if (typeof accountantRef.value === 'object') {
      accountant = accountantRef.value.id
    } else {
      accountant = accountantRef.value
    }

    const body = {
      name: nameRef.value,
      INN: innRef.value,
      director_id: director,
      chief_accountant_id: accountant,
      address: addressRef.value,
      description: descriptionRef.value,
    };

    console.log(body);
    const res = await organization.add(body);
    if (res.status === 201) {
      await getOrganizationData({ page, itemsPerPage, sortBy, search });
      showToast(addMessage);
      valueRef.value = null;
      idOrganizations.value = res.data.result.id;
      organizationInDialogTitle.value = res.data.result.name;
      markedID.value.push(res.data.result.id);
      isExistsOrganization.value = true;
    }
    addDialog.value = false;
  }

  catch (error) {


    if (error.response && error.response.status === 422) {

      if (error.response.data.errors.name) {
        showToast("Поле Наименования не может быть пустым", "warning")
      }

      else if (error.response.data.errors.INN) {
        showToast("Поле инн должно быть не короче 12 символов", "warning")
      }

      else if (error.response.data.errors.director_id) {
        showToast("Поле директор не может быть пустым", "warning")
      }

      else if (error.response.data.errors.chief_accountant_id) {
        showToast("Поле гл.Бухгалтер не может быть пустым", "warning")
      }

      else if (error.response.data.errors.address) {
        showToast("Поле адрес не может быть пустым", "warning")
      }

      else if (error.response.data.errors.description) {
        showToast("Поле описания не может быть пустым", "warning")
      }
      else {
        showToast("Заполните все поля!", "warning");
      }
    }
  }
};

const addBasedOnOrganization = () => {
  if (markedID.value.length !== 1 && !isExistsOrganization.value) return showToast(selectOneItemMessage, 'warning')
  console.log(markedID.value.length)
  addDialog.value = true
 
  organizations.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      idOrganizations.value = item.id
      nameRef.value = item.name
      innRef.value = item.INN;
      directorRef.value = {
        "id": item.director.id,
        "name": item.director.name
      }
      accountantRef.value = {
        "id": item.chief_accountant.id,
        "name": item.chief_accountant.name
      }
      addressRef.value = item.address;
      descriptionRef.value = item.description;
    }
  })
}

const update = async ({ page, itemsPerPage, sortBy, search }) => {

  let director;
    if (typeof directorRef.value === 'object') {
      director = directorRef.value.id
    } else {
      director = directorRef.value
    }

    let accountant;
    if (typeof accountantRef.value === 'object') {
      accountant = accountantRef.value.id
    } else {
      accountant = accountantRef.value
    }

  const body = {
    name: nameRef.value,
    INN: innRef.value,
    director_id: director,
    chief_accountant_id: accountant,
    address: addressRef.value,
    description: descriptionRef.value,
  }

  console.log(body);
  try {
    const { status } = await organization.update(idOrganizations.value, body);
    if (status === 200) {
      await getOrganizationData({ page, itemsPerPage, sortBy, search });
      showToast(editMessage);
    }
    addDialog.value = false;
  } catch (e) {
    console.log(e);
  }
};

const openDialog = (item) => {
  addDialog.value = true;
  if (item === 0) {

    idOrganizations.value = 0;
    isExistsOrganization.value = false;
  } else {
    idOrganizations.value = item.id;
    isExistsOrganization.value = true;
    nameRef.value = item.name;
    innRef.value = item.INN;

    directorRef.value = {
      "id": item.director.id,
      "name": item.director.name
    }
    accountantRef.value = {
      "id": item.chief_accountant.id,
      "name": item.chief_accountant.name
    }

    addressRef.value = item.address;
    descriptionRef.value = item.description;
    organizationInDialogTitle.value = nameRef.value;
  }
};

const getEmployees = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await employee.get({ page, itemsPerPage, sortBy }, search);
    employees.value = data.result.data.map(item => ({
      id: item.id,
      name: item.name
    }));
    console.log(employees.value);
  } catch (error) {
    console.error(error);
  }
};


const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
};

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return restore({ page, itemsPerPage, sortBy });
  } else {
    return remove({ page, itemsPerPage, sortBy, search });
  }
};

const restore = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { status } = await organization.restore({ ids: markedID.value});
    if (status === 200) {
      showToast(restoreMessage, "green");
      await getOrganizationData({ page, itemsPerPage, sortBy });
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const remove = async ({ page, itemsPerPage, sortBy, search }) => {

  try {
    const { status } = await organization.remove({ ids: markedID.value});
    if (status === 200) {
      showToast(removeMessage, "red");
      await getOrganizationData({ page, itemsPerPage, sortBy }, search);
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const handleCheckboxClick = function (item) {
  lineMarking(item);
};

watch(addDialog, (newVal) => {
  if (!newVal) {
    nameRef.value = null;
    innRef.value = null;
    directorRef.value = null;
    accountantRef.value = null;
    addressRef.value = null;
    descriptionRef.value = null;
    isExistsOrganization.value = false;
    organization.value = [];
  }
});

onMounted(async () => {
  await getEmployees({ page: 1, itemsPerPage: 10000 });
})
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Организации</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons @click="openDialog(0)" name="add" />
              <Icons name="copy" @click="addBasedOnOrganization"/>
              <Icons
                @click="compute"
                name="delete"
              />
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
          <Icons name="filter" class="mt-1" />
        </v-card>
      </div>

      <v-card class="mt-4 table">
        <v-data-table-server
          style="height: 78vh"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          v-model:items-per-page="paginations.per_page"
           :loading="loading"
          :headers="headers"
          :items-length="paginations.total || 0"
          :items="organizations"
          :item-value="headers.title"
          @update:options="getOrganizationData"
          page-text =  '{0}-{1} от {2}'
          :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
          fixed-footer
          :search="search"
          hover
        >
          <template v-slot:item="{ item, index }">
            <tr
              @mouseenter="hoveredRowIndex = index"
              @mouseleave="hoveredRowIndex = null"
              @dblclick="openDialog(item)"
              @click="lineMarking(item)"
              :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
            >
              <td>
                <template
                  v-if="hoveredRowIndex === index || markedID.includes(item.id)"
                >
                  <CustomCheckbox
                    v-model="markedID"
                    :checked="markedID.includes(item.id)"
                    @change="handleCheckboxClick(item)"
                  >
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <Icons
                    style="margin-right: 10px"
                    :name="item.deleted_at === null ? 'valid' : 'inValid'"
                  />
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
      <v-dialog class="mt-2 pa-2" v-model="addDialog">
        <v-card
          style="border: 2px solid #3ab700"
          min-width="500"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="">{{
              isExistsOrganization
                ? organizationInDialogTitle + ""
                : "Добавление"
            }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="removeOrganization" name="delete" />
                <Icons v-if="isExistsOrganization" @click="update" name="save"/>
                <Icons v-else @click="addOrganization" name="save" />
              </div>
              <v-btn
                @click="addDialog = false"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close"/>
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
                  rounded="lg"
                  item-title="name"
                  item-value="id"
                  label="Директор"
                  variant="outlined"
                ></v-select>
                <v-select
                  v-model="accountantRef"
                  :items="employees"
                  rounded="lg"
                  item-title="name"
                  item-value="id"
                  label="Гл. бухгалтер"
                  variant="outlined"
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
                  style="height: 120px; margin-bottom: -20px"
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


