<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import showToast from "../../../composables/toast/index.js";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {
  BASE_COLOR,
  FIELD_OF_SEARCH,
} from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import procurementApi from "../../../api/documents/procurement.js";
import showDate from "../../../composables/date/showDate.js";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import storageApi from "../../../api/list/storage.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import currencyApi from "../../../api/list/currency.js";
import user from "../../../api/list/user.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";

const router = useRouter();

const loading = ref(true);
const loadingRate = ref(true);
const dialog = ref(false);
const filterModal = ref(false);
const hoveredRowIndex = ref(null);

const markedID = ref([]);
const markedItem = ref([]);
const search = ref("");
const debounceSearch = ref("");
const procurements = ref([]);
const paginations = ref([]);
const showConfirmDialog = ref(false);
const showModal = ref(false);
const counterFilter = ref(0);

const organizations = ref([]);
const storages = ref([]);
const authors = ref([]);
const currencies = ref([]);
const counterparties = ref([]);
const counterpartyAgreements = ref([]);

const headerButtons = ref([
  {
    title: "Создать",
    icon: "<svg width=\"10\" height=\"10\" viewBox=\"0 0 10 10\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
        "<path d=\"M10 4.61538V5.38462H5.38462V10H4.61538V5.38462H0V4.61538H4.61538V0H5.38462V4.61538H10Z\" fill=\"white\"/>\n" +
        "</svg>\n",
    bgColor: "#524ED8",
    textColor: "#fff",
  },
  {
    title: "Создать на основании",
    icon: " <svg width=\"12\" height=\"13\" viewBox=\"0 0 12 13\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
        "                <path d=\"M10 4.48116H8V2.17893C7.99824 1.68992 7.81014 1.22146 7.47671 0.875679C7.14328 0.529895 6.69155 0.334829 6.22 0.333008H1.78C1.30846 0.334829 0.856725 0.529895 0.52329 0.875679C0.189855 1.22146 0.00175624 1.68992 0 2.17893V6.78338C0.00175624 7.27239 0.189855 7.74085 0.52329 8.08663C0.856725 8.43242 1.30846 8.62748 1.78 8.6293H4V10.7034C4 11.2535 4.21071 11.781 4.58579 12.17C4.96086 12.5589 5.46957 12.7775 6 12.7775H10C10.5304 12.7775 11.0391 12.5589 11.4142 12.17C11.7893 11.781 12 11.2535 12 10.7034V6.55523C12 6.00515 11.7893 5.4776 11.4142 5.08864C11.0391 4.69967 10.5304 4.48116 10 4.48116ZM4 6.55523V7.24659H1.78C1.66154 7.24659 1.54793 7.19779 1.46416 7.11092C1.38039 7.02405 1.33333 6.90623 1.33333 6.78338V2.17893C1.33333 2.05608 1.38039 1.93826 1.46416 1.85139C1.54793 1.76453 1.66154 1.71572 1.78 1.71572H6.22C6.33846 1.71572 6.45208 1.76453 6.53584 1.85139C6.61961 1.93826 6.66667 2.05608 6.66667 2.17893V4.48116H6C5.46957 4.48116 4.96086 4.69967 4.58579 5.08864C4.21071 5.4776 4 6.00515 4 6.55523Z\" fill=\"#2420AB\"/>\n" +
        "               </svg>",
    bgColor: "#d9dce2",
    textColor: "#524ED8",
  },
  {
    title: "Провести",
    icon: "<svg width=\"11\" height=\"12\" viewBox=\"0 0 11 12\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
        "<path d=\"M1 5C1 3.1145 1 2.1715 1.586 1.586C2.1715 1 3.1145 1 5 1H6C7.8855 1 8.8285 1 9.414 1.586C10 2.1715 10 3.1145 10 5V7C10 8.8855 10 9.8285 9.414 10.414C8.8285 11 7.8855 11 6 11H5C3.1145 11 2.1715 11 1.586 10.414C1 9.8285 1 8.8855 1 7V5Z\" stroke=\"white\"/>\n" +
        "<path d=\"M3.5 6H7.5M3.5 4H7.5M3.5 8H6\" stroke=\"white\" stroke-linecap=\"round\"/>\n" +
        "</svg>\n",
    bgColor: "#524ED8",
    textColor: "#fff",
  },
  {
    title: "Отменить",
    icon: "<svg style=\"margin-bottom: 2px;\" width=\"8\" height=\"8\" viewBox=\"0 0 8 8\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
        "<path d=\"M7.8228 0.183264C7.76667 0.127012 7.69999 0.0823841 7.62658 0.0519343C7.55318 0.0214845 7.47448 0.00581086 7.39501 0.00581086C7.31554 0.00581086 7.23685 0.0214845 7.16345 0.0519343C7.09004 0.0823841 7.02336 0.127012 6.96722 0.183264L4 3.14442L1.03278 0.177196C0.976598 0.121018 0.909905 0.0764551 0.836505 0.0460517C0.763104 0.0156483 0.684434 5.91933e-10 0.604986 0C0.525539 -5.91934e-10 0.446868 0.0156483 0.373468 0.0460517C0.300068 0.0764551 0.233374 0.121018 0.177196 0.177196C0.121018 0.233374 0.0764551 0.300068 0.0460517 0.373468C0.0156483 0.446868 -5.91933e-10 0.525539 0 0.604986C5.91934e-10 0.684434 0.0156483 0.763104 0.0460517 0.836505C0.0764551 0.909905 0.121018 0.976598 0.177196 1.03278L3.14442 4L0.177196 6.96722C0.121018 7.0234 0.0764551 7.0901 0.0460517 7.1635C0.0156483 7.2369 0 7.31557 0 7.39501C0 7.47446 0.0156483 7.55313 0.0460517 7.62653C0.0764551 7.69993 0.121018 7.76663 0.177196 7.8228C0.233374 7.87898 0.300068 7.92355 0.373468 7.95395C0.446868 7.98435 0.525539 8 0.604986 8C0.684434 8 0.763104 7.98435 0.836505 7.95395C0.909905 7.92355 0.976598 7.87898 1.03278 7.8228L4 4.85558L6.96722 7.8228C7.0234 7.87898 7.0901 7.92355 7.1635 7.95395C7.2369 7.98435 7.31557 8 7.39501 8C7.47446 8 7.55313 7.98435 7.62653 7.95395C7.69993 7.92355 7.76663 7.87898 7.8228 7.8228C7.87898 7.76663 7.92355 7.69993 7.95395 7.62653C7.98435 7.55313 8 7.47446 8 7.39501C8 7.31557 7.98435 7.2369 7.95395 7.1635C7.92355 7.0901 7.87898 7.0234 7.8228 6.96722L4.85558 4L7.8228 1.03278C8.05339 0.802195 8.05339 0.413846 7.8228 0.183264Z\" fill=\"#2420AB\"/>\n" +
        "</svg>\n",
    bgColor: "#d9dce2",
    textColor: "#524ED8",
  },
  {
    title: "Удалить",
    icon: "<svg width=\"8\" height=\"13\" viewBox=\"0 0 8 13\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
        "<path d=\"M0.555556 11.6111C0.555556 12.375 1.05556 13 1.66667 13H6.11111C6.72222 13 7.22222 12.375 7.22222 11.6111V3.27778H0.555556V11.6111ZM7.77778 1.19444H5.83333L5.27778 0.5H2.5L1.94444 1.19444H0V2.58333H7.77778V1.19444Z\" fill=\"#CD0101\"/>\n" +
        "</svg>\n",
    bgColor: "#ecdbde",
    textColor: "#CD0101",
  },
])

const filterForm = ref({
  date: null,
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
  const filterData = filterForm.value;
  filterModal.value = false;
  loading.value = true;
  try {
    const { data } = await procurementApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    paginations.value = data.result.pagination;
    procurements.value = data.result.data;
    loading.value = false;
  } catch (e) {}
};

const countFilter = () => {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      counterFilter.value++;
    }
  }
};

const massDel = async () => {
  try {
    const { status } = await procurementApi.massDeletion({
      ids: markedID.value,
    });
    if (status === 200) {
      showToast(removeMessage, "red");
      await getProcurementData({});
      markedID.value = [];
      dialog.value = false;
    }
  } catch (e) {}
};

const massRestore = async () => {
  try {
    const { status } = await procurementApi.massRestore({
      ids: markedID.value,
    });

    if (status === 200) {
      showToast(restoreMessage);
      await getProcurementData({});
      markedID.value = [];
      dialog.value = false;
    }
  } catch (e) {}
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

const closeFilterModal = async () => {
  filterModal.value = false;
  cleanFilterForm();
  await getProcurementData();
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

onMounted(() => {
  getOrganizations();
  getCounterparties();
  getCpAgreements();
  getStorages();
  getCurrencies();
  getAuthors();
});

watch(dialog, (newVal) => {
  if (newVal) {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
});

watch(markedID, (newVal) => {
  markedItem.value = procurements.value.find((el) => el.id === newVal[0]);
});

watch(
  search,
  debounce((newValue) => {
    debounceSearch.value = newValue;
  }, 500)
);
const getColor = (isActive) => {
  if (isActive) {
    return "green";
  } else {
    return "red";
  }
};
</script>

<template>
  <div class="pa-2">
    <div class="d-flex justify-space-between text-uppercase">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span style="color: #524ED8">Покупка</span>
      </div>
      <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3">
            <v-btn v-for="item in headerButtons" style="padding: 3px 12px 3px 12px !important; height: 34px;" class="d-flex align-center text-none" :color="item.bgColor" rounded="lg">
              <span v-html="item.icon"></span>
              <span :style="['width: 70px; font-size: 10px; white-space: wrap; letter-spacing: 0',{color: item.textColor}]">{{ item.title }}</span>
            </v-btn>
<!--            <Icons-->
<!--              title="Добавить"-->
<!--              @click="$router.push('/procurementOfGoods/create')"-->
<!--              name="add"-->
<!--            />-->
<!--            <Icons title="Скопировать" name="copy" />-->
<!--            <Icons title="Удалить" @click="compute" name="delete" />-->
          </div>
          <div class="w-100 custom_search">
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
            ></v-text-field>
          </div>
        </div>
        <div class="filterElement">
          <Icons
            name="filter"
            title="фильтр"
            @click="filterModal = true"
            class="mt-1"
          />
          <span v-if="counterFilter !== 0" class="countFilter">{{
            counterFilter
          }}</span>
        </div>
      </v-card>
    </div>
    <v-card class="mt-2 table">
      <v-data-table-server
        style="height: 78vh"
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
              <template
                v-if="hoveredRowIndex === index || markedID.includes(item.id)"
              >
                <CustomCheckbox
                  v-model="markedID"
                  :checked="markedID.includes(item.id)"
                  @change="lineMarking(item)"
                >
                  <span>{{ index + 1 }}</span>
                </CustomCheckbox>
              </template>
              <template v-else>
                <div class="d-flex align-center">
                  <Icons
                    style="margin-right: 10px; margin-top: 4px"
                    :name="item.deleted_at === null ? 'valid' : 'inValid'"
                  />
                  <span>{{ index + 1 }}</span>
                </div>
              </template>
            </td>
            <td>{{ item.doc_number }}</td>
            <td>{{ getDateTimeInShow(item.date) }}</td>
            <td>
              <v-chip class="w-100 d-flex justify-center" :color="getColor(item.active)">{{
                item.active ? "Проведен" : "Не проведен"
              }}</v-chip>
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
    <v-card>
      <v-dialog
        persistent
        class="mt-2 pa-2"
        v-model="filterModal"
        @keyup.esc="closeFilterModal"
      >
        <v-card
          :style="`border: 2px solid ${BASE_COLOR}`"
          min-width="450"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Фильтр</span>
          </div>
          <v-form class="d-flex w-100" @submit.prevent="">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100 ga-4">
                <div class="d-flex ga-2 w-100">
                  <custom-text-field
                    label="Дата"
                    type="date"
                    min-width="508"
                    class="date"
                    v-model="filterForm.date"
                  />
                </div>
                <div class="d-flex ga-2">
                  <custom-autocomplete
                    label="Организация"
                    :items="organizations"
                    v-model="filterForm.organization_id"
                  />
                  <custom-autocomplete
                    label="Поставщик"
                    :items="counterparties"
                    v-model="filterForm.counterparty_id"
                  />
                </div>
                <div class="d-flex ga-2">
                  <custom-autocomplete
                    label="Склад"
                    :items="storages"
                    v-model="filterForm.storage_id"
                  />
                  <custom-autocomplete
                    label="Валюта"
                    :items="currencies"
                    v-model="filterForm.currency_id"
                  />
                </div>
                <div class="d-flex ga-2">
                  <custom-autocomplete
                    label="Автор"
                    :items="authors"
                    v-model="filterForm.author_id"
                  />
                  <custom-autocomplete
                    label="Договор"
                    :items="counterpartyAgreements"
                    v-model="filterForm.counterparty_agreement_id"
                  />
                </div>
                <div class="d-flex justify-end ga-2">
                  <v-btn color="red" class="btn" @click="closeFilterModal"
                    >сбросить</v-btn
                  >
                  <v-btn
                    :color="BASE_COLOR"
                    class="btn"
                    @click="getProcurementData"
                    >применить</v-btn
                  >
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>
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
