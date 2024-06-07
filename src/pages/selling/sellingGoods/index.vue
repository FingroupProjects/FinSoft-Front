<script setup>
import { approveDocument, copyMessage, ErrorSelectMessage, removeMessage, selectOneItemMessage } from "../../../composables/constant/buttons.js";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import { BASE_COLOR, FIELD_OF_SEARCH, TITLE_COLOR } from "../../../composables/constant/colors.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import { markedForDeletion, statusOptions } from "../../../composables/constant/items.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { useModalCreateBased } from "../../../store/modalCreateBased.js";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
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
import saleApi from "../../../api/documents/sale.js";
import { useRoute, useRouter } from "vue-router";
import user from "../../../api/list/user.js";
import { onMounted, ref, watch } from "vue";
import debounce from "lodash.debounce";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const filterModal = ref(false);
const isAproveError = ref(false);
const hoveredRowIndex = ref(null);
const modalCreateBased = useModalCreateBased();

const markedID = ref([]);
const markedItem = ref([]);
const search = ref("");
const debounceSearch = ref("");
const sales = ref([]);
const paginations = ref([]);
const count = ref(0);

const approveError = ref([]);
const organizations = ref([]);
const storages = ref([]);
const authors = ref([]);
const currencies = ref([]);
const counterparties = ref([]);
const counterpartyAgreements = ref([]);

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
  { title: "Номер", key: "name" },
  { title: "Дата", key: "date" },
  { title: "Статус", key: "active" },
  { title: "Клиент", key: "counterparty.name" },
  { title: "Организация", key: "organization.name" },
  { title: "Склад", key: "storage.name" },
  { title: "Автор", key: "author.name" },
  { title: "Валюта", key: "currency.name" },
]);

const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "sellingGoodsCreate" }),
  },
  {
    name: "createBasedOn",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }

      modalCreateBased.isModal();
    },
  },
  {
    name: "copy",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "red");
      }

      try {
        const res = await copyDocument.copy(markedID.value[0]);
        if (res.status === 200) {
          showToast(copyMessage);
          await getSellingGoods();
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
      massDel();
    },
  },
]);

const getSellingGoods = async ({ page, itemsPerPage, sortBy, search } = {}) => {
  count.value = 0;
  countFilter();
  filterModal.value = false;
  loading.value = true;
  try {
    const { data } = await saleApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    paginations.value = data.result.pagination;
    sales.value = data.result.data;
    loading.value = false;
  } catch (e) {
    console.error(e);
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

const massDel = async () => {
  try {
    const { status } = await saleApi.delete({ ids: markedID.value });
    if (status === 200) {
      showToast(removeMessage, "red");
      await getSellingGoods();
      markedID.value = [];
    }
  } catch (e) {}
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = sales.value.find(
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

const closeFilterModal = async ({ page, itemsPerPage, sortBy, search }) => {
  filterModal.value = true;
  cleanFilterForm();
  await getSellingGoods({ page, itemsPerPage, sortBy, search });
  useFilterCanvasVisible().closeFilterCanvas();
  isAproveError.value = false;
};

const cleanFilterForm = () => {
  filterForm.value = {};
};

const total = () => {
  const totalAmount = approveError.value.reduce(
    (amount, item) => amount + item.amount,
    0
  );
  return totalAmount;
};

const approve = async () => {
  try {
    const res = await saleApi.approve({ ids: markedID.value });
    console.log("res", res);
    showToast(approveDocument);
    await getSellingGoods({});
    markedID.value = [];
  } catch (e) {
    console.error(e);
    approveError.value = e.response.data.errors;
    isAproveError.value = true;
  }
};

const unApprove = async () => {
  try {
    await saleApi.unApprove({ ids: markedID.value });
    showToast(approveDocument);
    await getSellingGoods({});
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
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

const getStorages = async () => {
  const { data } = await storageApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  storages.value = data.result.data;
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
  window.open(`/sellingGoods/${item.id}`, "_blank");
};

watch(markedID, (newVal) => {
  markedItem.value = sales.value.find((el) => el.id === newVal[0]);
});

watch(isAproveError, (newVal) => {
  if (newVal) {
    useFilterCanvasVisible().toggleFilterCanvas();
  }
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
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Продажа</span>
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
        :items="sales"
        :item-value="headers.title"
        :search="debounceSearch"
        v-model="markedID"
        @update:options="getSellingGoods"
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
                  item.active
                    ? "Проведен"
                    : item.deleted_at !== null
                    ? "Удален"
                    : "Не проведен"
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
    </div>

    <filter-canvas @closeCanvas="isAproveError = false" :isAproveError="isAproveError">
      <div v-if="isAproveError">
        <p>Недостаточно следующих товаров для проведения документа</p>
        <div
          style="border-bottom: 3px solid black"
          class="d-flex justify-space-between px-2"
        >
          <div class="my-2">
            <span style="font-weight: 600">Наименований: </span>
            <span>{{ approveError.length }}</span>
          </div>
          <div class="my-2">
            <span style="font-weight: 600">Кол-во: </span>
            <span>{{ total() }}</span>
          </div>
        </div>
        <div style="max-height: 70vh; overflow: auto">
          <div
            v-for="good in approveError"
            :key="good.id"
            style="box-shadow: 1px 1px 1px 1px lightgray; border-radius: 12px"
            class="d-flex flex-column ga-2 my-4 mx-1 pa-4"
          >
            <span style="font-weight: 600">{{ good.good }}</span>
            <span style="font-size: 12px; color: gray"
              >Кол-во: {{ good.amount }}</span
            >
          </div>
        </div>
        <!-- {{ approveError }} -->
      </div>
      <div v-else class="d-flex flex-column w-100 ga-2">
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
            label="Организация"
            :items="organizations"
            v-model="filterForm.organization_id"
          />
          <custom-filter-autocomplete
            min-width="106"
            label="Клиент"
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
            label="Удалён"
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
        <div class="d-flex justify-end ga-2">
          <div class="d-flex ga-2" style="margin-right: -6%">
            <v-btn
              :tabindex="-1"
              color="red"
              class="btn"
              @click="closeFilterModal"
              >сбросить</v-btn
            >
            <v-btn
              :tabindex="-1"
              :color="BASE_COLOR"
              class="btn"
              @click="
                () => {
                  getSellingGoods();
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
