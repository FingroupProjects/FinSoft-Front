<script setup>
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { restoreMessage } from "../../../composables/constant/buttons.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus";
import {markedForDeletion} from "../../../composables/constant/items.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import filterCanvas from "../../../components/canvas/filterCanvas.vue";
import { useFilterCanvasVisible } from "../../../store/canvasVisible";
import organization from "../../../api/list/organizations.js";
import cashRegister from "../../../api/list/cashRegister.js";
import Button from "../../../components/button/button.vue";
import { onMounted, ref, watch, computed } from "vue";
import currency from "../../../api/list/currency.js";
import employee from "../../../api/list/employee.js";
import Icons from "@/composables/Icons/Icons.vue";
import showToast from "@/composables/toast";
import { useRouter } from "vue-router";
import debounce from "lodash.debounce";
import validate from "./validate.js";
import {
  createAccess,
  removeAccess,
  updateAccess,
} from "../../../composables/access/access.js";
import {
  BASE_COLOR,
  FIELD_COLOR,
  FIELD_OF_SEARCH,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
} from "@/composables/constant/buttons.js";
import getExcel from "../../../composables/otherQueries/getExcel.js";

const router = useRouter();

const loading = ref(true);
const showConfirmDialog = ref(false);
const loadingRate = ref(true);
const dialog = ref(false);

const idCashRegister = ref(null);
const hoveredRowIndex = ref(null);

const employeeAdd = ref(null);
const employeeUpdate = ref(null);

const organizationAdd = ref(null);
const organizationUpdate = ref(null);

const currencyAdd = ref(null);
const currencyUpdate = ref(null);

const employees = ref([]);
const currencies = ref([]);
const organizations = ref([]);

const isExistsCashRegister = ref(false);
const markedID = ref([]);
const markedItem = ref([]);
const cashRegisterInDialogTitle = ref(null);
const search = ref("");
const debounceSearch = ref("");

const nameRef = ref(null);
const balanceRef = ref(null);

const valueRef = ref(null);

const cashRegisters = ref([]);
const paginations = ref([]);
const showModal = ref(false);
const count = ref(0);

const filterForm = ref({
  name: null,
  deleted: null,
  currency_id: null,
  employee_id: null,
  organization_id: null,
});

const showFilterModal = ref(false);

const headers = ref([
  { title: "Наименование", key: "name" },
  { title: "Статус", key: "deleted_at" },
  { title: "Баланс", key: "name", sortable: false },
  { title: "Валюта", key: "currency.name" },
]);

const headerButtons = ref([
  {
    name: "create",
    function: () => {
      openDialog(0);
    },
  },
  {
    name: "copy",
    function: async () => {
      addBasedOnCashRegister();
    },
  },
  {
    name: "delete",
    function: () => {
      compute({ page: 1, itemsPerPage: 25, search: "" });
    },
  },
  {
    name: "excel",
    function: () => {
      getExcel(cashRegister, 'Касса');
    },
  },
]);

const rules = {
  required: (v) => !!v,
  date: (v) =>
    (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) ||
    "Формат даты должен быть DD-MM-YYYY",
};
const toggleModal = () => {
  showModal.value = !showModal.value;
};

const isOrganizationFieldDisabled = computed(() => {
  return !createAccess("organization") && !updateAccess("organization");
});

const isEmployeeFieldDisabled = computed(() => {
  return !createAccess("employee") && !updateAccess("employee");
});
const isCurrencyFieldDisabled = computed(() => {
  return !createAccess("currency") && !updateAccess("currency");
});

const isDataChanged = () => {
  const item = cashRegisters.value.find(
    (item) => item.id === idCashRegister.value
  );

  return (
    nameRef.value !== item.name ||
    currencyAdd.value !== item.currency.id ||
    organizationAdd.value !== item.organization.id ||
    employeeAdd.value !== item.responsiblePerson.id
  );
};

const checkAndClose = () => {
  if (
    nameRef.value ||
    currencyAdd.value ||
    organizationAdd.value ||
    employeeAdd.value
  ) {
    showModal.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
};

const closingWithSaving = async () => {
  if (isExistsCashRegister.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
    showModal.value = false;
  } else {
    const isValid = validate(
      nameRef,
      currencyAdd,
      organizationAdd,
      employeeAdd
    );
    showModal.value = false;
    if (isValid === true) {
      await addCashRegister({
        page: 1,
        itemsPerPage: 10,
        sortBy: "id",
        search: null,
      });
      dialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
    }
  }
};

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false;
  showConfirmDialog.value = false;
  cleanForm();
};

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }
};

const cleanForm = () => {
  nameRef.value = null;
  currencyAdd.value = null;
  organizationAdd.value = null;
  employeeAdd.value = null;
};

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }

  return count;
}

const getCashRegisterData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true;
  count.value = 0;
  countFilter();
  showFilterModal.value = false;

  try {
    const { data } = await cashRegister.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );

    paginations.value = data.result.pagination;
    cashRegisters.value = data.result.data;
    loading.value = false;
  } catch (e) {}
};

const addCashRegister = async ({ page, itemsPerPage, sortBy }) => {
  const body = {
    name: nameRef.value,
    currency_id: currencyAdd.value,
    organization_id: organizationAdd.value,
    responsible_person_id: employeeAdd.value,
  };

  if (validate(nameRef, organizationAdd, currencyAdd, employeeAdd) !== true)
    return;

  const res = await cashRegister.add(body);

  if (res.status === 201) {
    await getCashRegisterData({ page, itemsPerPage, sortBy });
    showToast(addMessage);
    valueRef.value = null;
    currencyAdd.value = null;
    organizationAdd.value = null;
    employeeAdd.value = null;
    idCashRegister.value = res.data.result.id;
    dialog.value = false;

    markedID.value = [];
    markedItem.value = [];
  }
};

const massDel = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { status } = await cashRegister.massDeletion({ ids: markedID.value });

    if (status === 200) {
      showToast(removeMessage, "red");
      await getCashRegisterData({ page, itemsPerPage, sortBy });
      markedID.value = [];
      dialog.value = false;
    }
  } catch (e) {}
};

const massRestore = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { status } = await cashRegister.massRestore({ ids: markedID.value });

    if (status === 200) {
      showToast(restoreMessage);
      await getCashRegisterData({ page, itemsPerPage, sortBy });
      markedID.value = [];
      dialog.value = false;
    }
  } catch (e) {}
};

const update = async ({ page, itemsPerPage, sortBy }) => {
  const body = {
    name: nameRef.value,
    responsible_person_id: employeeAdd.value,
    organization_id: organizationAdd.value,
    currency_id: currencyAdd.value,
  };

  try {
    const { status } = await cashRegister.update(idCashRegister.value, body);
    if (status === 200) {
      nameRef.value = null;
      employeeUpdate.value = null;
      organizationUpdate.value = null;
      currencyUpdate.value = null;

      dialog.value = null;
      cleanForm();
      await getCashRegisterData({ page, itemsPerPage, sortBy });
      showToast(editMessage);
    }
  } catch (e) {
    console.log(e);
  }
};

const getEmployee = async () => {
  try {
    const { data } = await employee.get({ page: 1, itemsPerPage: 100000 });
    employees.value = data.result.data.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (e) {}
};

const getCurrencies = async () => {
  try {
    const { data } = await currency.get({ page: 1, itemsPerPage: 100000 });
    currencies.value = data.result.data.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (e) {}
};
const getOrganizations = async () => {
  try {
    const { data } = await organization.get({ page: 1, itemsPerPage: 100000 });
    organizations.value = data.result.data.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  } catch (e) {}
};

onMounted(async () => {
  await getEmployee();
  await getCurrencies();
  await getOrganizations();
});

const handleCheckboxClick = function (item) {
  lineMarking(item);
};

const openDialog = (item) => {
  dialog.value = true;

  if (item === 0) {
    idCashRegister.value = 0;
    isExistsCashRegister.value = false;
  } else {
    idCashRegister.value = item.id;

    markedID.value.push(item.id);
    isExistsCashRegister.value = true;
    nameRef.value = item.name;
    employeeAdd.value = item.responsiblePerson.id;
    organizationAdd.value = item.organization.id;
    currencyAdd.value = item.currency.id;
    cashRegisterInDialogTitle.value = nameRef.value;
    balanceRef.value = item.balance;
  }
};

const addBasedOnCashRegister = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");
  if (markedID.value.length > 1)
    return showToast(selectOneItemMessage, "warning");
  dialog.value = true;

  cashRegisters.value.forEach((item) => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name;
      currencyAdd.value = item.currency.id;
      organizationAdd.value = item.organization.id;
      employeeAdd.value = item.responsiblePerson.id;
    }
  });
};

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");

  if (markedItem.value.deleted_at) {
    return massRestore({ page, itemsPerPage, sortBy });
  } else {
    return massDel({ page, itemsPerPage, sortBy, search });
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = cashRegisters.value.find(
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

const closeFilterModal = async ({ page, itemsPerPage, sortBy, search }) => {
  showFilterModal.value = false;
  filterForm.value = {};
  await getCashRegisterData({ page, itemsPerPage, sortBy, search });
  useFilterCanvasVisible().closeFilterCanvas();
};

watch(markedID, (newVal) => {
  markedItem.value = cashRegisters.value.find((el) => el.id === newVal[0]);
});

watch(dialog, (newVal) => {
  if (!newVal) {
    nameRef.value = null;
    currencyUpdate.value = null;
    currencyAdd.value = null;
    organizationUpdate.value = null;
    organizationAdd.value = null;
    employeeAdd.value = null;
    employeeUpdate.value = null;
    loadingRate.value = true;
    cleanForm();
  }
});

watch(
  search,
  debounce((newValue) => {
    debounceSearch.value = newValue;
  }, 500)
);

onMounted(() => {
  // console.log(createAccess('organizationBill'))
  // console.log(updateAccess('organizationBill'))
});
</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"> Кассы </span>
      </div>
      <div class="d-flex justify-between ga-2">
        <div class="d-flex justify-end mb-3">
          <div class="d-flex ga-2 position-relative">
            <Button
              v-for="(button, idx) in headerButtons"
              :name="button.name"
              :key="idx"
              @click="button.function"
            />
          </div>
        </div>
        <!-- <Icons v-if="createAccess('cashRegister')" @click="openDialog(0)" name="add" title="Создать" />
        <Icons v-if="createAccess('cashRegister')" @click="addBasedOnCashRegister" title="Скопировать" name="copy"/>
        <Icons v-if="removeAccess('cashRegister')" @click="compute" name="delete" title="Удалить" /> -->
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

        <div class="mt-1 filterElement">
          <Icons
            name="filter"
            title="Фильтр"
            @click="useFilterCanvasVisible().toggleFilterCanvas()"
            class="mt-1"
          />
          <span v-if="count !== 0" class="countFilter">{{ count }}</span>
        </div>
      </div>
    </div>

    <v-card class="table calcWidth">
      <v-data-table-server
        style="height: calc(100vh - 150px)"
        items-per-page-text="Элементов на странице:"
        loading-text="Загрузка"
        no-data-text="Нет данных"
        v-model:items-per-page="paginations.per_page"
        :loading="loading"
        :headers="headers"
        :items-length="paginations.total || 0"
        :items="cashRegisters"
        :item-value="headers.title"
        :search="debounceSearch"
        page-text="{0}-{1} от {2}"
        show-select
        v-model="markedID"
        :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        @update:options="getCashRegisterData"
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
                <span>{{ item.id }}</span>
              </CustomCheckbox>
            </td>
            <td style="width: 250px;">{{ item.name }}</td>
            <td style="width: 300px;">
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
            <td style="width: 250px">+2500</td>
            <td>{{ item.currency.name }}</td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Modal -->
    <v-card>
      <v-dialog
        persistent
        class="mt-2 pa-2"
        v-model="dialog"
        @keyup.esc="isExistsCashRegister ? checkUpdate() : checkAndClose()"
      >
        <v-card
          :style="`border: 2px solid ${BASE_COLOR}`"
          min-width="500"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span
              >Касса:
              {{
                isExistsCashRegister ? cashRegisterInDialogTitle : "Добавление"
              }}</span
            >
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2">
                <Icons
                  title="Удалить"
                  v-if="removeAccess('cashRegister') && isExistsCashRegister"
                  @click="compute"
                  name="delete"
                />
                <Icons
                  title="Сохранить"
                  v-if="createAccess('cashRegister') && !isExistsCashRegister"
                  @click="addCashRegister"
                  name="save"
                />
                <Icons
                  title="Сохранить"
                  v-if="updateAccess('cashRegister') && isExistsCashRegister"
                  @click="update"
                  name="save"
                />
                <Icons name="close" title="Закрыть" @click="isExistsCashRegister ? checkUpdate() : checkAndClose()"/>
              </div>
            </div>
          </div>
          <v-form
            class="d-flex w-100"
            :disabled="!updateAccess('cashRegister') && isExistsCashRegister"
            @submit.prevent="addCashRegister"
          >
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100 ga-3">
                <div class="d-flex">
                  <v-text-field
                    v-model="nameRef"
                    :color="BASE_COLOR"
                    :base-color="FIELD_COLOR"
                    rounded="lg"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Наименование"
                    hide-details
                    label="Наименование"
                    clear-icon="close"
                    clearable
                    autofocus
                  />
                  <span
                    v-if="isExistsCashRegister"
                    class="d-flex align-center px-2 font-weight-bold"
                    :style="
                      balanceRef > 0 ? 'color: #3AB700' : 'color: #f67665'
                    "
                  >
                    {{ balanceRef > 0 ? "+" : "-" }}{{ balanceRef }}
                  </span>
                </div>
                <div class="d-flex ga-4">
                  <v-autocomplete
                    style="max-width: 50%; min-width: 50%"
                    variant="outlined"
                    :color="BASE_COLOR"
                    :disabled="isCurrencyFieldDisabled"
                    hide-details
                    :base-color="FIELD_COLOR"
                    label="Валюта"
                    rounded="lg"
                    no-data-text="нет данных"
                    v-model="currencyAdd"
                    :items="currencies"
                    item-title="name"
                    item-value="id"
                  />
                  <v-autocomplete
                    variant="outlined"
                    :color="BASE_COLOR"
                    no-data-text="нет данных"
                    label="Организация"
                    rounded="lg"
                    hide-details
                    :disabled="isOrganizationFieldDisabled"
                    v-model="organizationAdd"
                    :items="organizations"
                    :base-color="FIELD_COLOR"
                    item-title="name"
                    item-value="id"
                  />
                </div>
                <v-autocomplete
                  variant="outlined"
                  hide-details
                  rounded="lg"
                  no-data-text="нет данных"
                  :color="BASE_COLOR"
                  :disabled="isEmployeeFieldDisabled"
                  :base-color="FIELD_COLOR"
                  label="Ответственное лицо"
                  v-model="employeeAdd"
                  :items="employees"
                  item-title="name"
                  item-value="id"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>

    <div v-if="showModal">
      <ConfirmModal
        :showModal="true"
        @close="toggleModal()"
        @closeClear="closeDialogWithoutSaving()"
        @closeWithSaving="closingWithSaving()"
      />
    </div>

    <filterCanvas>
      <div>
        <div class="d-flex ga-2">
          <custom-filter-text-field
            v-model="filterForm.name"
            placeholder="Контрагент"
            label="Наименование"
          />
          <custom-filter-autocomplete
            v-model="filterForm.currency_id"
            placeholder="Валюта"
            :items="currencies"
            label="Валюта"
          />
        </div>
        <div class="d-flex ga-2 my-2">
          <custom-filter-autocomplete
            v-model="filterForm.organization_id"
            placeholder="Организация"
            :items="organizations"
            label="Организация"
          />
          <custom-filter-autocomplete
            label="Помечен на удаление"
            v-model="filterForm.deleted"
            :items="markedForDeletion"
          />
        </div>
        <div class="my-2">
          <custom-filter-autocomplete
            min-width="106"
            v-model="filterForm.employee_id"
            placeholder="Ответственное лицо"
            :items="employees"
            label="Ответственное лицо"
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
                  getCashRegisterData({});
                  useFilterCanvasVisible().closeFilterCanvas();
                }
              "
              >применить</v-btn
            >
          </div>
        </div>
      </div>
    </filterCanvas>
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
