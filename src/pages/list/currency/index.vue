<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import showToast from "../../../composables/toast";
import currentDate from "../../../composables/date/currentDate.js";
import currency from "../../../api/list/currency.js";
import Button from "../../../components/button/button.vue";
import {
  createAccess,
  updateAccess,
  removeAccess,
} from "../../../composables/access/access.js";
import {
  addMessage,
  editMessage,
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
} from "../../../composables/constant/buttons.js";
import Icons from "../../../composables/Icons/Icons.vue";
import showDate from "../../../composables/date/showDate.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import validate from "./validate.js";
import {
  FIELD_COLOR,
  FIELD_OF_SEARCH,
  BASE_COLOR,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import { tr } from "vuetify/locale";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import { markedForDeletion } from "../../../composables/constant/items.js";
import debounce from "lodash.debounce";

const router = useRouter();

const loading = ref(false);
const loadingRate = ref(true);
const dialog = ref(false);
const rateDialog = ref(false);

const idCurrencyRate = ref(null);
const showConfirmDialog = ref(false);
const isExistsCurrency = ref(false);
const isExistsCurrencyRate = ref(false);
const idCurrency = ref(null);
const currencyInDialogTitle = ref(null);
const search = ref("");
const debounceSearch = ref("");
const filterModal = ref(null);
const count = ref(0);

const hoveredRowIndex = ref(null);
const markedItem = ref(null);
const markedID = ref([]);

const hoveredRowIndexRate = ref(null);
const markedItemRate = ref(null);
const markedIDRate = ref([]);

const nameRef = ref(null);
const symbolRef = ref(null);
const digitalRef = ref(null);
const dateRef = ref(null);
const valueRef = ref(null);
const showModal = ref(false);
const showRateModal = ref(false);

const toggleModal = () => {
  showModal.value = !showModal.value;
};
const toggleRateModal = () => {
  showRateModal.value = !showRateModal.value;
};

const filterForm = ref({
  name: null,
  symbol_code: null,
  digital_code: null,
  deleted: null,
});

const rates = ref([]);
const currencies = ref([]);
const paginationsRate = ref([]);
const paginations = ref([]);

const headers = ref([
  { title: "Наименование", key: "name" },
  { title: "Статус", key: "deleted_at" },
  { title: "Символьный код", key: "symbol_code" },
  { title: "Цифровой код", key: "digital_code" },
  { title: "Курс валюты", key: "last_exchange_rate.value", sortable: false },
]);

const headersRate = ref([
  { title: "№", key: "id" },
  { title: "Дата", key: "date" },
  { title: "Курс", key: "value" },
]);

const rules = {
  required: (v) => !!v,
  date: (v) =>
    (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) ||
    "Формат даты должен быть DD-MM-YYYY",
};

const countFilter = () => {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }
  return count;
};

const getCurrencyData = async ({ page, itemsPerPage, sortBy, search }) => {
  filterModal.value = false;
  const filterData = filterForm.value;
  count.value = 0;
  countFilter();

  loading.value = true;
  try {
    const { data } = await currency.get(
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    paginations.value = data.result.pagination;
    currencies.value = data.result.data;
    markedID.value = [];
  } catch (e) {
  } finally {
    loading.value = false;
  }
};

const isDataChanged = () => {
  const item = currencies.value.find((elem) => elem.id === idCurrency.value);

  return (
    nameRef.value !== item.name ||
    digitalRef.value != item.digital_code ||
    symbolRef.value !== item.symbol_code
  );
};

const checkAndClose = () => {
  if (nameRef.value || digitalRef.value || symbolRef.value) {
    showModal.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
};

const isDataRateChanged = () => {
  const item = rates.value.find((elem) => elem.id === idCurrencyRate.value);

  return valueRef.value !== item.value;
};

const checkRateAndClose = () => {
  if (valueRef.value) {
    showRateModal.value = true;
  } else {
    rateDialog.value = false;
    showRateModal.value = false;
  }
};

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false;
  showConfirmDialog.value = false;
  cleanForm();
};

const closingWithSaving = async () => {
  if (isExistsCurrency.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
    showModal.value = false;
  } else {
    const isValid = validate(nameRef, digitalRef, symbolRef);
    showModal.value = false;
    if (isValid === true) {
      await addCurrency({
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
const closingRateWithSaving = async () => {
  if (isExistsCurrencyRate.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
    showModal.value = false;
  } else {
    const isValid = validate(valueRef);
    showModal.value = false;
    if (isValid === true) {
      await addDialogRate({
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

const closeRateDialogWithoutSaving = () => {
  rateDialog.value = false;
  showRateModal.value = false;
  showConfirmDialog.value = false;

  valueRef.value = false;
};

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }
};
const checkRateUpdate = () => {
  if (isDataRateChanged()) {
    showRateModal.value = true;
  } else {
    rateDialog.value = false;
  }
};
const cleanForm = () => {
  nameRef.value = null;
  digitalRef.value = null;
  symbolRef.value = null;
};

const getCurrencyRateData = async ({ page, itemsPerPage, sortBy, search }) => {
  if (idCurrency.value === 0 || !isExistsCurrency.value) {
    loadingRate.value = false;
    return;
  }

  try {
    const response = await currency.show(idCurrency.value);
    const { data } = await currency.showRate(
      idCurrency.value,
      { page, itemsPerPage, sortBy },
      search
    );
    rates.value =
      data.result.data.map((item) => ({
        ...item,
        date: showDate(item.date),
        name: response.data.result.name,
        digital_code: response.data.result.digital_code,
      })) || [];

    paginationsRate.value = data.result.pagination || [];
    markedIDRate.value = [];
  } catch (e) {
  } finally {
    loadingRate.value = false;
  }
};

const closeFilterModal = async ({ page, itemsPerPage, sortBy, search }) => {
  filterModal.value = false;
  filterForm.value = {};
  await getCurrencyData({ page, itemsPerPage, sortBy, search });
  useFilterCanvasVisible().closeFilterCanvas();
};

const addCurrency = async ({ page, itemsPerPage, sortBy }) => {
  if (validate(nameRef, digitalRef, symbolRef) !== true) return;

  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value,
  };

  try {
    const res = await currency.add(body);
    if (res.status === 201) {
      await getCurrencyData({ page, itemsPerPage, sortBy });
      showToast(addMessage);
      valueRef.value = null;
      idCurrency.value = res.data.result.id;
      currencyInDialogTitle.value = res.data.result.name;
      markedID.value.push(res.data.result.id);
      isExistsCurrency.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};

const update = async ({ page, itemsPerPage, sortBy, search }) => {
  if (validate(nameRef, symbolRef, digitalRef) !== true) return;
  const body = {
    name: nameRef.value,
    symbol_code: symbolRef.value,
    digital_code: digitalRef.value,
  };

  try {
    const { status } = await currency.update(idCurrency.value, body);
    if (status === 200) {
      await getCurrencyData({ page, itemsPerPage, sortBy, search });
      showToast(editMessage);
      cleanForm();
      dialog.value = false;
    }
  } catch (e) {
    console.error(e);
  }
};

const removeCurrency = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { status } = await currency.remove({ ids: markedID.value });
    if (status === 200) {
      showToast(removeMessage, "red");
      await getCurrencyData({ page, itemsPerPage, sortBy });
      dialog.value = false;
      markedID.value = [];
    }
  } catch (e) {
    console.error(e);
  }
};

const restoreCurrency = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { status } = await currency.restore({ ids: markedID.value });
    if (status === 200) {
      showToast(restoreMessage);
      await getCurrencyData({ page, itemsPerPage, sortBy });
      markedID.value = [];
    }
  } catch (e) {
    console.error(e);
  }
};

const openDialog = (item) => {
  dialog.value = true;
  if (item === 0) {
    idCurrency.value = 0;
    isExistsCurrency.value = false;
  } else {
    markedID.value.push(item.id);
    idCurrency.value = item.id;
    isExistsCurrency.value = true;
    nameRef.value = item.name;
    symbolRef.value = item.symbol_code;
    digitalRef.value = item.digital_code;
    currencyInDialogTitle.value = nameRef.value;
  }
};

const addRate = async ({ page, itemsPerPage, sortBy }) => {
  const body = {
    date: showDate(dateRef.value, "-"),
    value: valueRef.value,
  };

  try {
    await currency.addRate(idCurrency.value, body);
    await getCurrencyRateData({ page, itemsPerPage, sortBy });
    await getCurrencyData({ page, itemsPerPage, sortBy });
    showToast(addMessage);
    valueRef.value = null;
    rateDialog.value = false;
  } catch (e) {
    showToast(e.response.data.message, "red");
  }
};

const updateRate = async ({ page, itemsPerPage, sortBy }) => {
  const body = {
    date: dateRef.value.split(".").reverse().join("-"),
    value: Number(valueRef.value),
  };

  try {
    const { status } = await currency.updateRate(idCurrencyRate.value, body);

    if (status === 200) {
      await getCurrencyRateData({ page, itemsPerPage, sortBy });
      await getCurrencyData({ page, itemsPerPage, sortBy });
      showToast(editMessage);
      rateDialog.value = false;
    }
  } catch (e) {
    console.error(e);
  }
};

const editDialogRate = (item) => {
  rateDialog.value = true;
  isExistsCurrencyRate.value = true;
  idCurrencyRate.value = item.id;
  dateRef.value = item.date.split(".").reverse().join("-");
  valueRef.value = item.value;
};

const addDialogRate = () => {
  rateDialog.value = true;
  isExistsCurrencyRate.value = false;
};

const removeCurrencyRate = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { status } = await currency.removeRate({ ids: markedIDRate.value });
    if (status === 200) {
      showToast(removeMessage, "red");
      await getCurrencyRateData({ page, itemsPerPage, sortBy });
      markedIDRate.value = [];
      rateDialog.value = false;
    }
  } catch (e) {
    console.error(e);
  }
};

const restoreCurrencyRate = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { status } = await currency.restoreRate({ ids: markedIDRate.value });
    if (status === 200) {
      showToast(restoreMessage);
      await getCurrencyRateData({ page, itemsPerPage, sortBy });
      markedIDRate.value = [];
      rateDialog.value = false;
    }
  } catch (e) {
    console.error(e);
  }
};

const addBasedOnCurrency = () => {
  if (markedID.value.length !== 1 && !isExistsCurrency.value)
    return showToast(selectOneItemMessage, "warning");

  dialog.value = true;

  currencies.value.forEach((item) => {
    if (markedID.value[0] === item.id) {
      idCurrency.value = item.id;
      nameRef.value = item.name;
      symbolRef.value = item.symbol_code;
      digitalRef.value = item.digital_code;
    }
  });
};

const getExcel = async () => {
  if (currency.value === null) {
    return showToast("Выберите поставщика", "warning");
  }
  try {
    const { data } = await currency.excel(currency.value);
    const url = window.URL.createObjectURL(
      new Blob([data], { type: "application/vnd.ms-excel" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Отчет.xls");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.error(e);
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = currencies.value.find(
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

const handleCheckboxClick = (item) => {
  lineMarking(item);
};

const compute = (params = {}) => {
  const { page, itemsPerPage, sortBy, search } = params;
  if (markedItem.value.deleted_at !== null) {
    return restoreCurrency({ page, itemsPerPage, sortBy });
  } else {
    return removeCurrency({ page, itemsPerPage, sortBy, search });
  }
};

const lineMarkingRate = (item) => {
  if (markedIDRate.value.length > 0) {
    const firstMarkedItem = rates.value.find(
      (el) => el.id === markedIDRate.value[0]
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

  if (!markedIDRate.value.includes(item.id)) {
    markedIDRate.value.push(item.id);
  }
  markedItemRate.value = item;
};

const handleCheckboxClickRate = (item) => {
  lineMarkingRate(item);
};

const computeRate = ({ page, itemsPerPage, sortBy }) => {
  if (markedItemRate.value.deleted_at !== null) {
    return restoreCurrencyRate({ page, itemsPerPage, sortBy });
  } else {
    return removeCurrencyRate({ page, itemsPerPage, sortBy });
  }
};

const validateCurrency = () => {
  let value = valueRef.value.toString();

  value = value.replace(/(?!^\.)([^\d.])/g, "");

  if (value.startsWith("0") && value.length > 1 && value[1] !== ".") {
    value = value.substring(1);
  }

  if (value === "0") {
    value = "";
  }

  valueRef.value = value;
};

onMounted(async () => {
  dateRef.value = currentDate();
});

watch(markedID, (newVal) => {
  markedItem.value = currencies.value.find((el) => el.id === newVal[0]);
});

watch(dialog, (newVal) => {
  if (!newVal) {
    nameRef.value = null;
    symbolRef.value = null;
    digitalRef.value = null;
    loadingRate.value = true;
    isExistsCurrency.value = false;
    rates.value = [];
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
});

watch(rateDialog, (newVal) => {
  if (!newVal) {
    dateRef.value = currentDate();
    valueRef.value = null;
    isExistsCurrencyRate.value = false;
  }
});

watch(
  search,
  debounce((newValue) => {
    debounceSearch.value = newValue;
  }, 500)
);

const validatePrice = (price) => {
  if (price === 0 || price === "0" || Number(price) === 0) {
    return false;
  }
  return true;
};
const handlePriceInput = (item) => {
  if (!validatePrice(item.price)) {
    item.price = null;
  }
};
</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          Валюты
        </span>
      </div>
      <div class="d-flex justify-between ga-2">
        <div class="d-flex justify-end mb-3">
          <div class="d-flex ga-2 position-relative">
            <Button
              v-if="createAccess('currency')"
              @click="openDialog(0)"
              name="create"
            />
            <Button
              v-if="createAccess('currency')"
              @click="addBasedOnCurrency"
              name="copy"
            />
            <Button
              v-if="removeAccess('currency')"
              @click="compute"
              name="delete"
            />
            <Button name="excel" @click="getExcel()" />
          </div>
        </div>
        <div class="custom_search">
          <v-text-field
            style="width: 190px;"
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

    <v-card class="table">
      <v-data-table-server
        style="height: calc(100vh - 150px)"
        items-per-page-text="Элементов на странице:"
        loading-text="Загрузка"
        no-data-text="Нет данных"
        v-model:items-per-page="paginations.per_page"
        :loading="loading"
        :headers="headers"
        :items-length="paginations.total || 0"
        :items="currencies"
        :item-value="headers.title"
        :search="debounceSearch"
        show-select
        v-model="markedID"
        @update:options="getCurrencyData"
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
            <td>{{ item.symbol_code }}</td>
            <td>{{ item.digital_code }}</td>
            <td>
              {{
                item.last_exchange_rate === null
                  ? ""
                  : item.last_exchange_rate.value
              }}
            </td>
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
        @keyup.esc="isExistsCurrency ? checkUpdate() : checkAndClose()"
      >
        <v-card
          :style="`border: 2px solid ${BASE_COLOR}`"
          min-width="300"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>{{
              isExistsCurrency
                ? "Валюта: " + currencyInDialogTitle
                : "Добавление"
            }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons
                  title="Удалить"
                  v-if="removeAccess('currency') && isExistsCurrency"
                  @click="compute"
                  name="delete"
                />
                <Icons
                  title="Сохранить"
                  v-if="createAccess('currency') && !isExistsCurrency"
                  @click="addCurrency"
                  name="save"
                />
                <Icons
                  title="Сохранить"
                  v-if="updateAccess('currency') && isExistsCurrency"
                  @click="update"
                  name="save"
                />
              </div>
              <v-btn
                @click="isExistsCurrency ? checkUpdate() : checkAndClose()"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
            </div>
          </div>
          <v-form
            class="d-flex w-100"
            :disabled="!updateAccess('currency') && isExistsCurrency"
            @submit.prevent="addCurrency"
          >
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                  v-model="nameRef"
                  :rules="[rules.required]"
                  :color="BASE_COLOR"
                  rounded="md"
                  :base-color="FIELD_COLOR"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Доллар"
                  label="Название"
                  clear-icon="close"
                  clearable
                  autofocus
                />
                <v-text-field
                  v-model="symbolRef"
                  :rules="[rules.required]"
                  :color="BASE_COLOR"
                  rounded="md"
                  :base-color="FIELD_COLOR"
                  variant="outlined"
                  density="compact"
                  placeholder="USD"
                  v-mask="'AAA'"
                  label="Символный код"
                  clear-icon="close"
                  clearable
                />
                <v-text-field
                  v-model="digitalRef"
                  :rules="[rules.required]"
                  :color="BASE_COLOR"
                  rounded="md"
                  density="compact"
                  variant="outlined"
                  :base-color="FIELD_COLOR"
                  placeholder="132"
                  v-mask="'###'"
                  label="Цифровой код"
                  clear-icon="close"
                  clearable
                />
              </v-col>
            </v-row>
          </v-form>

          <v-card class="table" :style="`border: 2px solid ${BASE_COLOR}`">
            <div
              v-if="isExistsCurrency"
              class="d-flex w-100 rounded-t-lg mb-1 align-center"
              :style="`border-bottom: 2px solid ${BASE_COLOR}`"
            >
              <div
                class="d-flex justify-end w-100 ga-2 pt-1 me-2"
                style="padding-top: 4px !important"
              >
                <Icons title="Удалить" @click="computeRate" name="delete" />
                <Icons title="Добавить" @click="addDialogRate" name="add" />
              </div>
            </div>
            <v-data-table-server
              style="height: 38vh"
              items-per-page-text="Элементов на странице:"
              loading-text="Загрузка"
              no-data-text="Нет данных"
              v-model:items-per-page="paginationsRate.per_page"
              :loading="loadingRate"
              :headers="headersRate"
              :items-length="paginationsRate.total || 0"
              :items="rates"
              :item-value="headersRate.title"
              @update:options="getCurrencyRateData"
              page-text="{0}-{1} от {2}"
              :items-per-page-options="[
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
              ]"
              fixed-footer
              fixed-header
              hover
            >
              <template v-slot:item="{ item, index }">
                <tr
                  @mouseenter="hoveredRowIndexRate = index"
                  @mouseleave="hoveredRowIndexRate = null"
                  @dblclick="editDialogRate(item)"
                  @click="lineMarkingRate(item)"
                  :class="{
                    'bg-grey-lighten-2': markedIDRate.includes(item.id),
                  }"
                >
                  <td>
                    <template
                      v-if="
                        hoveredRowIndexRate === index ||
                        markedIDRate.includes(item.id)
                      "
                    >
                      <CustomCheckbox
                        v-model="markedIDRate"
                        :checked="markedIDRate.includes(item.id)"
                        @change="handleCheckboxClickRate(item)"
                      >
                        <span>{{ index + 1 }}</span>
                      </CustomCheckbox>
                    </template>
                    <template v-else>
                      <div class="d-flex">
                        <Icons
                          style="margin-right: 10px"
                          :name="item.deleted_at === null ? 'valid' : 'inValid'"
                        />
                        <span>{{ index + 1 }}</span>
                      </div>
                    </template>
                  </td>
                  <td>{{ item.date }}</td>
                  <td>{{ item.value }}</td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card>
        </v-card>
      </v-dialog>

      <!--  addCurrencyRate    -->
      <v-dialog
        persistent
        v-model="rateDialog"
        activator="parent"
        @keyup.esc="
          isExistsCurrencyRate ? checkRateUpdate() : checkRateAndClose()
        "
      >
        <v-card
          :style="`border: 2px solid ${BASE_COLOR}`"
          min-width="400"
          class="d-flex justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center pr-5 pt-3">
            <span class="pl-5"
              >{{ isExistsCurrencyRate ? "Изменить" : "Добавить" }} курс</span
            >
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons
                  title="Удалить"
                  v-if="isExistsCurrencyRate"
                  @click="computeRate"
                  name="delete"
                />

                <Icons
                  title="Сохранить"
                  v-if="isExistsCurrencyRate"
                  @click="updateRate"
                  name="save"
                />
                <Icons title="Сохранить" v-else @click="addRate" name="save" />
              </div>
              <v-btn
                @click="
                  isExistsCurrencyRate ? checkRateUpdate() : checkRateAndClose()
                "
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100 pa-5">
            <v-row class="w-100">
              <v-col class="d-flex flex-column justify-between w-100">
                <v-text-field
                  v-model="dateRef"
                  :rules="[rules.required]"
                  type="date"
                  label="Дата"
                  rounded="md"
                  :color="BASE_COLOR"
                  :base-color="FIELD_COLOR"
                  variant="outlined"
                  density="compact"
                  clear-icon="close"
                  autofocus
                />
                <v-text-field
                  v-model="valueRef"
                  @input="validateCurrency"
                  :rules="[rules.required]"
                  placeholder="1.0000"
                  label="Курс"
                  rounded="md"
                  :base-color="FIELD_COLOR"
                  :color="BASE_COLOR"
                  variant="outlined"
                  density="compact"
                  clear-icon="close"
                  hide-spin-buttons
                  clearable
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
    <div v-if="showRateModal">
      <ConfirmModal
        :showModal="true"
        @close="toggleRateModal()"
        @closeClear="closeRateDialogWithoutSaving()"
        @closeWithSaving="closingRateWithSaving()"
      />
    </div>
    <filter-canvas>
      <div class="d-flex flex-column ga-4 w-100">
        <custom-filter-text-field
          min-width="106"
          v-model="filterForm.name"
          label="Наименование"
        />
        <custom-filter-text-field
          min-width="106"
          v-model="filterForm.symbol_code"
          label="Символьный код"
        />
      </div>
      <div class="d-flex flex-column ga-4 w-100">
        <custom-filter-text-field
          min-width="106"
          v-model="filterForm.digital_code"
          label="Цифровой код"
        />
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
                getCurrencyData({});
                getCurrencyRateData({});
                useFilterCanvasVisible().closeFilterCanvas();
              }
            "
            >применить</v-btn
          >
        </div>
      </div>
    </filter-canvas>
  </div>
</template>