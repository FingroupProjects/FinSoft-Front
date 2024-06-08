<script setup>
import { approveDocument, copyMessage, ErrorSelectMessage, removeMessage, restoreMessage, selectOneItemMessage, warningMessage, documentAprove} from "../../../composables/constant/buttons.js";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import { BASE_COLOR, FIELD_OF_SEARCH, TITLE_COLOR } from "../../../composables/constant/colors.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import { markedForDeletion, statusOptions } from "../../../composables/constant/items.js"
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { useModalCreateBased } from "../../../store/modalCreateBased.js";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import getStatus from "../../../composables/displayed/getStatus.js";
import procurementApi from "../../../api/documents/procurement.js";
import getColor from "../../../composables/displayed/getColor.js";
import copyDocument from "../../../api/documents/copyDocument.js";
import CreateBase from "../../../components/modal/CreateBase.vue";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import showToast from "../../../composables/toast/index.js";
import Button from "../../../components/button/button.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import currencyApi from "../../../api/list/currency.js";
import storageApi from "../../../api/list/storage.js";
import user from "../../../api/list/user.js";
import { onMounted, ref, watch } from "vue";
import debounce from "lodash.debounce";
import { useRouter } from "vue-router";

const router = useRouter();

const loading = ref(true);
const dialog = ref(false);
const filterModal = ref(false);
const hoveredRowIndex = ref(null);

const markedID = ref([]);
const markedItem = ref([]);
const search = ref("");
const debounceSearch = ref("");
const procurements = ref([]);
const paginations = ref([]);
const counterFilter = ref(0);

const organizations = ref([]);
const storages = ref([]);
const authors = ref([]);
const currencies = ref([]);
const counterparties = ref([]);
const counterpartyAgreements = ref([]);
const modalCreateBased = useModalCreateBased();

const filterForm = ref({
  date: null,
  startDate: null,
  endDate: null,
  active: null,
  deleted: null,
  provider_id: null,
  counterparty_id: null,
  counterparty_agreement_id: null,
  organization_id: null,
  storage_id: null,
  author_id: null,
  currency_id: null,
});

const headers = ref([
  { title: "Номер", key: "doc_number" },
  { title: "Дата", key: "date" },
  { title: "Статус", key: "active" },
  { title: "Поставщик", key: "counterparty.name" },
  { title: "Организация", key: "organization.name" },
  { title: "Склад", key: "storage.name" },
  { title: "Автор", key: "author.name" },
  { title: "Валюта", key: "currency.name" },
]);

const getProcurementData = async ({
  page,
  itemsPerPage,
  sortBy,
  search,
} = {}) => {
  counterFilter.value = 0;
  countFilter();
  filterModal.value = false;
  loading.value = true;
  try {
    const { data } = await procurementApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    paginations.value = data.result.pagination;
    procurements.value = data.result.data;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};
const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "procurementOfGoodsCreate" }),
  },
  {
    name: "createBasedOn",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }
      if (markedItem.value.active === false) {
        return showToast(documentAprove, "warning");
      }

      modalCreateBased.isModal();
    },
  },
  {
    name: "copy",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }

      try {
        const res = await copyDocument.copy(markedID.value[0]);
        if (res.status === 200) {
          showToast(copyMessage);
          window.open(`/procurementOfGoods/${res.data.result.id}`, "_blank");
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    name: "approve",
    function: () => {
      approve();
    },
  },
  {
    name: "cancel",
    function: () => {
      unApprove();
    },
  },
  {
    name: "delete",
    function: () => {
      compute();
    },
  },
]);

const countFilter = () => {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      counterFilter.value++;
    }
  }
};

const compute = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");
  if (markedItem.value.deleted_at) {
    return massRestore();
  } else {
    return massDel();
  }
};

const massDel = async () => {
  try {
    const { status } = await procurementApi.remove({
      ids: markedID.value,
    });
    if (status === 200) {
      showToast(removeMessage, "red");
      await getProcurementData();
    }
  } catch (e) {
    console.error(e);
  } finally {
    markedID.value = [];
  }
};

const massRestore = async () => {
  try {
    const { status } = await procurementApi.restore({ ids: markedID.value });

    if (status === 200) {
      showToast(restoreMessage);
      await getProcurementData();
      dialog.value = false;
    }
  } catch (e) {
    console.error(e);
  } finally {
    markedID.value = [];
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = procurements.value.find(
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
    markedID.value.push(item.id);
  }
  markedItem.value = item;
};

const approve = async () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");
  try {
    const res = await procurementApi.approve({ ids: markedID.value });
    showToast(approveDocument);
    await getProcurementData({});
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const unApprove = async () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");
  try {
    await procurementApi.unApprove({ ids: markedID.value });
    showToast(approveDocument);
    await getProcurementData({});
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const closeFilterModal = async () => {
  filterModal.value = false;
  cleanFilterForm();
  await getProcurementData();
  useFilterCanvasVisible().closeFilterCanvas();
};

const cleanFilterForm = () => {
  filterForm.value = {};
};

const getAuthors = async () => {
  const { data } = await user.getAuthors();
  authors.value = data.result.data;
};

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const getStorages = async () => {
  const { data } = await storageApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  storages.value = data.result.data;
};
const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  counterparties.value = data.result.data;
};

const getCpAgreements = async () => {
  const { data } = await cpAgreementApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  counterpartyAgreements.value = data.result.data;
};

const getCurrencies = async () => {
  const { data } = await currencyApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });

  currencies.value = data.result.data;
};

const show = (item) => {
  window.open(`/procurementOfGoods/${item.id}`, "_blank");
};

watch(markedID.value, (newVal) => {
  markedItem.value = procurements.value.find((el) => el.id === newVal[0]);
});

watch(
  search,
  debounce((newValue) => {
    debounceSearch.value = newValue;
  }, 500)
);

onMounted(() => {
  getOrganizations();
  getCounterparties();
  getCpAgreements();
  getStorages();
  getCurrencies();
  getAuthors();
});
</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Покупка</span>
      </div>
      <div class="d-flex justify-end ga-2">
        <div class="d-flex w-100 justify-end mb-3">
          <div class="d-flex ga-2 position-relative">
            <Button
              v-for="(button, idx) in headerButtons"
              :name="button.name"
              :key="idx"
              @click="button.function"
            />
            <create-base :marked-i-d="markedID[0]" />
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
        <div class="mt-2 filterElement">
          <Icons
            name="filter"
            title="Фильтр"
            @click="useFilterCanvasVisible().toggleFilterCanvas()"
          />
          <span v-if="counterFilter !== 0" class="countFilter">{{
            counterFilter
          }}</span>
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
        :items="procurements"
        :item-value="headers.title"
        :search="debounceSearch"
        v-model="markedID"
        @update:options="getProcurementData"
        page-text="{0}-{1} от {2}"
        :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        show-select
        fixed-header
        hover
      >
        <template v-slot:item="{ item, index }">
          <tr
            @mouseenter="hoveredRowIndex = index"
            @mouseleave="hoveredRowIndex = null"
            @dblclick="show(item)"
            :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
            style="font-size: 12px"
          >
            <td>
              <CustomCheckbox
                v-model="markedID"
                :checked="markedID.includes(item.id)"
                @change="lineMarking(item)"
              >
              </CustomCheckbox>
            </td>
            <td>{{ item.doc_number }}</td>
            <td>{{ getDateTimeInShow(item.date) }}</td>
            <td>
              <v-chip
                style="height: 50px !important"
                class="w-100 d-flex justify-center"
                :color="getColor(item.active, item.deleted_at)"
              >
                <span class="padding: 5px;">{{
                  getStatus(item.active, item.deleted_at)
                }}</span>
              </v-chip>
            </td>
            <td>{{ item.counterparty.name }}</td>
            <td>{{ item.organization.name }}</td>
            <td>{{ item.storage.name }}</td>
            <td>{{ item.author.name }}</td>
            <td>{{ item.currency.name }}</td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>
    <filter-canvas>
      <div class="d-flex flex-column ga-2 w-100">
        <custom-filter-text-field
          label="От"
          type="datetime-local"
          class="date"
          min-width="106"
          clearable
          v-model="filterForm.startDate"
        />
        <custom-filter-text-field
          label="По"
          type="datetime-local"
          class="date"
          min-width="106"
          clearable
          v-model="filterForm.endDate"
        />
      </div>
      <div class="d-flex flex-column ga-2">
        <custom-filter-autocomplete
          min-width="106"
          clearable
          label="Организация"
          :items="organizations"
          v-model="filterForm.organization_id"
        />
        <custom-filter-autocomplete
          min-width="106"
          label="Поставщик"
          :items="counterparties"
          v-model="filterForm.counterparty_id"
        />
      </div>
      <div class="d-flex flex-column ga-2">
        <custom-filter-autocomplete
          min-width="106"
          label="Склад"
          :items="storages"
          v-model="filterForm.storage_id"
        />
        <custom-filter-autocomplete
          min-width="106"
          label="Договор"
          :items="counterpartyAgreements"
          v-model="filterForm.counterparty_agreement_id"
        />
      </div>
      <div class="d-flex ga-2">
        <custom-filter-autocomplete
          label="Статус"
          :items="statusOptions"
          v-model="filterForm.active"
        />
        <custom-filter-autocomplete
          label="Удален"
          :items="markedForDeletion"
          v-model="filterForm.deleted"
        />
      </div>
      <div class="d-flex ga-2">
        <custom-filter-autocomplete
          label="Автор"
          :items="authors"
          v-model="filterForm.author_id"
        />
        <custom-filter-autocomplete
          label="Валюта"
          :items="currencies"
          v-model="filterForm.currency_id"
        />
      </div>
      <div class="d-flex justify-end">
        <div class="d-flex ga-2" style="margin-right: -6%">
          <v-btn tabindex="-1" color="red" class="btn" @click="closeFilterModal"
            >сбросить</v-btn
          >
          <v-btn
            tabindex="-1"
            :color="BASE_COLOR"
            class="btn"
            @click="
              () => {
                getProcurementData();
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