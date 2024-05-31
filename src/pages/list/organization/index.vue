<script setup>
import { ref, watch, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import organization from "../../../api/list/organizations";
import {
  addMessage,
  editMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  ErrorSelectMessage,
} from "../../../composables/constant/buttons.js";
import showToast from "../../../composables/toast";
import getExcel from "../../../composables/otherQueries/getExcel.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import employee from "../../../api/list/employee";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import validate from "./validate.js";
import {
  FIELD_COLOR,
  FIELD_OF_SEARCH,
  BASE_COLOR,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import Button from "../../../components/button/button.vue";
import debounce from "lodash.debounce";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import { markedForDeletion } from "../../../composables/constant/items.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus";
import {
  createAccess,
  readAccess,
  removeAccess,
  updateAccess,
} from "../../../composables/access/access.js";

const showConfirmDialog = ref(false);
const router = useRouter();
const addDialog = ref(false);
const loading = ref(true);
const markedID = ref([]);
const markedItem = ref([]);
const hoveredRowIndex = ref(null);
const isExistsOrganization = ref(false);
const organizationInDialogTitle = ref(null);
const filterModal = ref(false);

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
const search = ref(null);
const debounceSearch = ref(null);
const showModal = ref(false);

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const isEmployeeFieldDisabled = computed(() => {
  return !createAccess("employee") && !updateAccess("employee");
});

const filterForm = ref({
  name: null,
  inn: null,
  chief_accountant_id: null,
  director_id: null,
  address: null,
  description: null,
  deleted: null,
});

const count = ref(0);

const rules = {
  required: (value) => !!value,
  inn: (value) => value.length === 9,
};

const headers = ref([
  { title: "Наименование", key: "name" },
  { title: "Статус", key: "deleted_at" },
]);

const getOrganizationData = async ({ page = 1, itemsPerPage = 10, sortBy = "id", search = "" } = {}) => {
  count.value = 0;
  countFilter();
  loading.value = true;
  try {
    const { data } = await organization.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    organizations.value = data.result.data;
    paginations.value = data.result.pagination;
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const addOrganization = async () => {
  if (
    validate(nameRef, innRef, directorRef, accountantRef, addressRef) !== true
  )
    return;

  try {
    let director;
    if (typeof directorRef.value === "object") {
      director = directorRef.value.id;
    } else {
      director = directorRef.value;
    }

    let accountant;
    if (typeof accountantRef.value === "object") {
      accountant = accountantRef.value.id;
    } else {
      accountant = accountantRef.value;
    }

    const body = {
      name: nameRef.value,
      INN: innRef.value,
      director_id: director,
      chief_accountant_id: accountant,
      address: addressRef.value,
      description: descriptionRef.value,
    };

    const res = await organization.add(body);
    if (res.status === 201) {
      await getOrganizationData({});
      showToast(addMessage);
      cleanForm();
    }
    addDialog.value = false;
  } catch (error) {}
};

const addBasedOnOrganization = () => {
  if (markedID.value.length !== 1 && !isExistsOrganization.value) {
    return showToast(selectOneItemMessage, "warning");
  }

  addDialog.value = true;

  organizations.value.forEach((item) => {
    if (markedID.value[0] === item.id) {
      idOrganizations.value = item.id;
      nameRef.value = item.name;
      innRef.value = item.INN;
      directorRef.value = {
        id: item.director.id,
        name: item.director.name,
      };
      accountantRef.value = {
        id: item.chief_accountant.id,
        name: item.chief_accountant.name,
      };
      addressRef.value = item.address;
      descriptionRef.value = item.description;
    }
  });

  isExistsOrganization.value = false;
};

const update = async () => {
  if (
    validate(nameRef, innRef, directorRef, accountantRef, addressRef) !== true
  )
    return;

  let director;
  if (typeof directorRef.value === "object") {
    director = directorRef.value.id;
  } else {
    director = directorRef.value;
  }

  let accountant;
  if (typeof accountantRef.value === "object") {
    accountant = accountantRef.value.id;
  } else {
    accountant = accountantRef.value;
  }
  const body = {
    name: nameRef.value,
    INN: innRef.value,
    director_id: director,
    chief_accountant_id: accountant,
    address: addressRef.value,
    description: descriptionRef.value,
  };
  try {
    const { status } = await organization.update(idOrganizations.value, body);
    if (status == 200) {
      showToast(editMessage);
      await getOrganizationData({});
    }
    cleanForm();
  } catch (e) {
    console.error(e);
  }
  addDialog.value = false;
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
    markedID.value.push(item.id);
    directorRef.value = {
      id: item.director.id,
      name: item.director.name,
    };
    accountantRef.value = {
      id: item.chief_accountant.id,
      name: item.chief_accountant.name,
    };
    addressRef.value = item.address;
    descriptionRef.value = item.description;
    organizationInDialogTitle.value = nameRef.value;
  }
};

const getEmployees = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await employee.get({ page, itemsPerPage, sortBy }, search);
    employees.value = data.result.data.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (e) {
    console.error(e);
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = organizations.value.find(
      (el) => el.id === markedID.value[0]
    );
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, "warning");
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, "warning");
        return;
      }
    }
  }
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
  markedItem.value = item;
};

const compute = (params = {}) => {
  const { page, itemsPerPage, sortBy, search } = params;
  if (markedItem.value.deleted_at !== null) {
    return restore();
  } else {
    return remove();
  }
};

const restore = async () => {
  try {
    const { status } = await organization.restore({ ids: markedID.value });
    if (status === 200) {
      showToast(restoreMessage, "green");
      await getOrganizationData();
      markedID.value = [];
    }
  } catch (e) {}
};

const handleCheckboxClick = function (item) {
  lineMarking(item);
};

const cleanForm = () => {
  nameRef.value = null;
  innRef.value = null;
  directorRef.value = null;
  accountantRef.value = null;
  addressRef.value = null;
  descriptionRef.value = null;
};

const remove = async () => {
  try {
    const { status } = await organization.remove({ ids: markedID.value });
    if (status === 200) {
      showToast(removeMessage, "red");
      await getOrganizationData();
      markedID.value = [];
    }
  } catch (e) {
    console.error(e);
  }
};

const closeFilterModal = async () => {
  filterModal.value = false;
  filterForm.value = {};
  await getOrganizationData();
  useFilterCanvasVisible().closeFilterCanvas();
};

const isDataChanged = () => {
  const item = organizations.value.find(
    (elem) => elem.id === idOrganizations.value
  );

  return (
    nameRef.value !== item.name ||
    innRef.value !== item.INN ||
    directorRef.value.id !== item.director.id ||
    accountantRef.value.id !== item.chief_accountant.id ||
    addressRef.value !== item.address ||
    descriptionRef.value !== item.description
  );
};

const checkAndClose = () => {
  if (
    nameRef.value ||
    innRef.value ||
    directorRef.value ||
    accountantRef.value ||
    addressRef.value ||
    descriptionRef.value
  ) {
    showModal.value = true;
  } else {
    addDialog.value = false;
    showModal.value = false;
  }
};

const closeDialogWithoutSaving = () => {
  addDialog.value = false;
  showModal.value = false;
  showConfirmDialog.value = false;
  cleanForm();
};

const closingWithSaving = async () => {
  if (isExistsOrganization.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
    showModal.value = false;
  } else {
    const isValid = validate(
      nameRef,
      innRef,
      directorRef,
      accountantRef,
      addressRef,
      descriptionRef
    );
    showModal.value = false;
    if (isValid === true) {
      await addOrganization({
        page: 1,
        itemsPerPage: 10,
        sortBy: "id",
        search: null,
      });
      addDialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
      cleanForm();
    }
  }
};
const checkUpdate = () => {
  if (!updateAccess("organization")) return (addDialog.value = false);

  if (isDataChanged()) {
    showModal.value = true;
  } else {
    addDialog.value = false;
  }
};

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }

  return count;
}

const destroy = async () => {
  markedID.value.push(idOrganizations.value);
  compute({ page: 1, itemsPerPage: 10, sortBy: "id" });
  addDialog.value = false;
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
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
});

watch(markedID, (newVal) => {
  markedItem.value = organizations.value.find((el) => el.id === newVal[0]);
});

watch(addDialog, (newVal) => {
  if (!newVal) {
    cleanForm();
  }
});

watch(
  search,
  debounce((newValue) => {
    debounceSearch.value = newValue;
  }, 500)
);

onMounted(async () => {
  await getEmployees({ page: 1, itemsPerPage: 10000 });
});
</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          Организации
        </span>
      </div>
      <div class="d-flex justify-between ga-2">
        <div class="d-flex justify-end mb-3">
          <div class="d-flex ga-2">
            <Button
              v-if="createAccess('organizationBill')"
              @click="openDialog(0)"
              name="create"
            />
            <Button
              v-if="createAccess('organizationBill')"
              @click="addBasedOnOrganization"
              name="copy"
            />
            <Button
              v-if="removeAccess('organizationBill')"
              @click="compute"
              name="delete"
            />
            <Button name="excel" @click="getExcel(organization, 'Организации')" />
          </div>
        </div>
        <div class="custom_search">
          <v-text-field
            style="width: 190px"
            v-model="search"
            prepend-inner-icon="search"
            density="compact"
            label="Поиск..."
            variant="outlined"
            :color="BASE_COLOR"
            rounded="lg"
            :base-color="FIELD_OF_SEARCH"
            clear-icon="close"
            hide-details
            single-line
            :append-inner-icon="search ? 'close' : ''"
            @click:append-inner="search = ''"
            flat
          />
        </div>
        <div class="filterElement mt-2">
          <Icons
            name="filter"
            title="фильтр"
            @click="useFilterCanvasVisible().toggleFilterCanvas()"
          />
          <span v-if="count !== 0" class="countFilter">{{ count }}</span>
        </div>
      </div>
    </div>

    <div class="table calcWidth">
      <v-data-table-server
        style="height: calc(100vh - 150px)"
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
        :search="debounceSearch"
        show-select
        v-model="markedID"
        page-text="{0}-{1} от {2}"
        :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        fixed-header
        hover
      >
        <template v-slot:item="{ item, index }">
          <tr
            @mouseenter="hoveredRowIndex = index"
            @mouseleave="hoveredRowIndex = null"
            @dblclick="openDialog(item)"
            :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
          >
            <td>
              <CustomCheckbox
                v-model="markedID"
                :checked="markedID.includes(item.id)"
                @change="handleCheckboxClick(item)"
              >
                <span>{{ index + 1 }}</span>
              </CustomCheckbox>
            </td>
            <td>
              <span>{{ item.name }}</span>
            </td>
            <td>
              <v-chip
                style="height: 50px !important; max-width: 200px"
                class="d-flex justify-center"
                :color="getListColor(item.deleted_at)"
              >
                <span class="padding: 5px;">{{
                  getListStatus(item.deleted_at)
                }}</span>
              </v-chip>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </div>

    <!-- modal -->
    <v-card>
      <v-dialog
        persistent
        class="mt-2 pa-2"
        v-model="addDialog"
        @keyup.esc="isExistsOrganization ? checkUpdate() : checkAndClose()"
      >
        <v-card
          :style="`border: 2px solid ${BASE_COLOR}`"
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
              <div class="d-flex ga-3 align-center mt-2">
                <Icons
                  v-if="removeAccess('organization') && isExistsOrganization"
                  @click="destroy"
                  name="delete"
                />
                <Icons
                  v-if="createAccess('organization') && !isExistsOrganization"
                  @click="addOrganization()"
                  name="save"
                />
                <Icons
                  v-if="updateAccess('organization') && isExistsOrganization"
                  @click="update()"
                  name="save"
                />
                <Icons name="close" @click="isExistsOrganization ? checkUpdate() : checkAndClose()" title="Закрыть" />
              </div>
            </div>
          </div>
          <v-form
            class="d-flex w-100"
            :disabled="!updateAccess('organization') && isExistsOrganization"
            @submit.prevent="addOrganization"
          >
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                  v-model="nameRef"
                  :rules="[rules.required]"
                  :color="BASE_COLOR"
                  rounded="lg"
                  :base-color="FIELD_COLOR"
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
                  :rules="[rules.required, rules.inn]"
                  :color="BASE_COLOR"
                  :base-color="FIELD_COLOR"
                  rounded="lg"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  v-mask="'#########'"
                  placeholder="ИНН"
                  label="ИНН"
                  clear-icon="close"
                  clearable
                />
                <v-autocomplete
                  :color="BASE_COLOR"
                  no-data-text="Нет данных"
                  v-model="directorRef"
                  :rules="[rules.required]"
                  :disabled="isEmployeeFieldDisabled"
                  :items="employees"
                  :base-color="FIELD_COLOR"
                  rounded="lg"
                  item-title="name"
                  item-value="id"
                  label="Директор"
                  variant="outlined"
                />
                <v-autocomplete
                  :color="BASE_COLOR"
                  no-data-text="Нет данных"
                  v-model="accountantRef"
                  :rules="[rules.required]"
                  :disabled="isEmployeeFieldDisabled"
                  :items="employees"
                  :base-color="FIELD_COLOR"
                  rounded="lg"
                  item-title="name"
                  item-value="id"
                  label="Гл. бухгалтер"
                  variant="outlined"
                />
                <v-text-field
                  v-model="addressRef"
                  :rules="[rules.required]"
                  :color="BASE_COLOR"
                  :base-color="FIELD_COLOR"
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
                  :color="BASE_COLOR"
                  :base-color="FIELD_COLOR"
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

      <div v-if="showModal">
        <ConfirmModal
          :showModal="true"
          @close="toggleModal()"
          @closeClear="closeDialogWithoutSaving()"
          @closeWithSaving="closingWithSaving()"
        />
      </div>
    </v-card>

    <filter-canvas>
      <div>
        <div class="d-flex ga-2">
          <custom-filter-text-field
            label="Наименования"
            v-model="filterForm.name"
          />
          <custom-filter-text-field label="ИНН" v-model="filterForm.inn" />
        </div>
        <div class="d-flex ga-2 my-2">
          <custom-filter-autocomplete
            label="Директор"
            :items="employees"
            v-model="filterForm.director_id"
          />
          <custom-filter-autocomplete
            label="Гл. бухгалтер"
            :items="employees"
            v-model="filterForm.chief_accountant_id"
          />
        </div>
        <div class="d-flex ga-2 my-2">
          <custom-filter-text-field
            label="Адрес"
            v-model="filterForm.address"
          />
          <custom-filter-text-field
            label="Описание"
            v-model="filterForm.description"
          />
        </div>
        <div class="my-2">
          <custom-filter-autocomplete
            min-width="106"
            label="Помечен на удаление"
            v-model="filterForm.deleted"
            :items="markedForDeletion"
          />
        </div>
        <div class="d-flex justify-end">
          <div class="d-flex ga-2" style="margin-right: -6%">
            <v-btn color="red" class="btn" @click="closeFilterModal"
              >сбросить</v-btn
            >
            <v-btn
              :color="BASE_COLOR"
              class="btn"
              @click="
                () => {
                  getOrganizationData({});
                  useFilterCanvasVisible().closeFilterCanvas();
                }
              "
              >применить</v-btn
            >
          </div>
        </div>
      </div>
    </filter-canvas>
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
