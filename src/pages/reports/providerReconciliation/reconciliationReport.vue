<script setup>
import storageApi from "../../../api/list/storage.js";
import { onMounted, reactive, ref, watch } from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import Button from "../../../components/button/button.vue";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import {
  BASE_COLOR,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import reconciliationActApi from "../../../api/reports/reconciliationAct.js";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import showToast from "../../../composables/toast";

const groupBy = ref([
  {
    key: "id",
    order: "asc",
  },
]);

const headers = ref([
  { title: "Дата", key: "date", sortable: false },
  { title: "Тип операции", key: "movement_type", sortable: false },
  { title: "Сумма", key: "sum" },
]);

const filterForm = reactive({
  start_date: null,
  end_date: null,
  organization_id: null,
  counterparty_id: null,
  cpAgreement_id: null,
});

const counterparty_id = ref(null);
const counterFilter = ref(0);

const selectedBlock = ref("По группам");

const filterModal = ref(false);
const loading = ref(false);

const items = ref([]);
const counterparties = ref([]);
const cpAgreements = ref([]);
const pagination = ref([]);
const organizations = ref([]);

const seletectBlock = async (name) => {
  closeFilterModal();
  loading.value = true;
  selectedBlock.value = await name;
  loading.value = false;
};

const closeFilterModal = async () => {
  filterModal.value = false;
  filterForm.start_date = null;
  filterForm.end_date = null;
  filterForm.organization_id = null;
  filterForm.counterparty_id = null;
  filterForm.cpAgreement_id = null;
};

const getItems = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true;
  countFilter();
  const filterData = filterForm;
  try {
    const {
      data: { result },
    } = await reconciliationActApi.get(
      counterparty_id.value,
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    items.value = result.data;
    console.log(items.value);
    pagination.value = result.pagination;
    loading.value = false;
    filterModal.value = false;
  } catch (e) {
    console.error(e);
  }
};

const getCounterparties = async () => {
  try {
    const { data } = await counterpartyApi.get({
      page: 1,
      itemsPerPage: 100000,
      sortBy: "name",
    });
    counterparties.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
};

const getCpAgreements = async () => {
  try {
    const { data } = await cpAgreementApi.get();
    cpAgreements.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
};

const getOrganizations = async () => {
  const {
    data: { result },
  } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = result.data;
};

const totalCount = (goods) => {
  return goods.length;
};

const totalAmount = (goods) => {
  const total = goods.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);
  return total;
};

const totalSum = (goods) => {
  const total = goods.reduce((acc, item) => {
    return acc + item.sum;
  }, 0);

  return total.toFixed(2);
};

const totalRemainder = (itemName) => {
  let filteredGoods = items.value.filter(
    (item) => item.counterparty_id === itemName
  );
  const total = filteredGoods.reduce((acc, curr) => {
    return acc + curr.debt;
  }, 0);

  return total;
};

const countFilter = () => {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      counterFilter.value++;
    }
  }
};

const getExcel = async () => {
  if(counterparty_id.value === null) {
    return showToast('Выберите поставщика', 'warning')
  }
  try {
    const { data } = await reconciliationActApi.excel(counterparty_id.value);
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

watch(counterparty_id, () => {
  getItems({ page: 1, itemsPerPage: 10, sortBy: "name", search: "" });
});

onMounted(async () => {
  await getCpAgreements();
  await getOrganizations();
  await getCounterparties();
});
</script>
<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"
          >Акт сверки с поставщиками</span
        >
      </div>
      <div class="d-flex align-center">
        <div class="d-flex ga-2">
          <div class="switcher">
            <button
              @click="seletectBlock('По группам')"
              :class="selectedBlock === 'По группам' ? 'active' : ''"
              class="button"
            >
              По группам
            </button>
            <button
              @click="seletectBlock('По элементам')"
              :class="selectedBlock === 'По элементам' ? 'active' : ''"
              class="button"
            >
              По элементам
            </button>
          </div>
          <Button name="excel" @click="getExcel()" />
          <custom-autocomplete
            label="Поставщик"
            :items="counterparties"
            v-model="counterparty_id"
            class="button mt-1"
          />
        </div>
        <div class="filterElement">
          <Icons name="filter" title="Фильтр" @click="filterModal = true" />
          <span v-if="counterFilter !== 0" class="countFilter">{{
            counterFilter
          }}</span>
        </div>
      </div>
    </div>
    <v-card class="table">
      <v-data-table
        :items="items"
        v-model:items-per-page="pagination.per_page"
        items-per-page-text="Элементов на странице"
        style="height: calc(100vh - 165px)"
        page-text="{0}-{1} от {2}"
        loading-text="Загрузка"
        :group-by="selectedBlock === 'По группам' ? groupBy : []"
        :headers="headers"
        :loading="loading"
        item-value="name"
        fixed-header
        hover
        :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
      >
        <template v-slot:no-data>
          <div class="text-center">Нет данных для отображения</div>
        </template>
        <template v-slot:group-header="{ item, toggleGroup, isGroupOpen }">
          <tr style="background-color: rgba(122, 127, 176, 0.193)">
            <td>
              <VBtn
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                size="small"
                variant="text"
                @click="toggleGroup(item)"
              ></VBtn>
              <!-- {{ item.value ? item.value : "Gluten free" }} -->
            </td>
            <td>
              {{ item.items[0].columns.date }}
            </td>
            <td>
              {{ item.items[0].columns.movement_type }}
            </td>
            <td>
              {{ item.items[0].columns.sum }}
            </td>
          </tr>
        </template>
        <template v-slot:item="{ item }">
          <tr  v-if="selectedBlock === 'По группам'" style="background-color: rgba(122, 127, 176, 0.193)">
            <td />
            <td>
              {{ totalCount(item.goods) }}
            </td>
            <td>
              {{ totalAmount(item.goods) }}
            </td>
            <td>
              {{ totalSum(item.goods) }}
            </td>
          </tr>
          <tr v-for="good in item.goods" :key="good.id">
            <td v-if="selectedBlock === 'По группам'"></td>
            <td>
              {{ good.good.name }}
            </td>
            <td>
              {{ good.amount }}
            </td>
            <td>
              {{ good.sum }}
            </td>
          </tr>
        </template>
      </v-data-table>
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
          min-width="620"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span style="font-size: 20px">Фильтр</span>
          </div>
          <v-form class="d-flex" @submit.prevent="">
            <v-row>
              <v-col class="d-flex flex-column ga-4">
                <div class="d-flex justify-space-between">
                  <custom-text-field
                    class="date"
                    minWidth="280"
                    label="От"
                    type="datetime-local"
                    v-model="filterForm.start_date"
                  />
                  <custom-text-field
                    class="date"
                    minWidth="280"
                    label="По"
                    type="datetime-local"
                    v-model="filterForm.end_date"
                  />
                </div>
                <div class="d-flex justify-space-between">
                  <custom-autocomplete
                    minWidth="280"
                    label="Организация"
                    :items="organizations"
                    v-model="filterForm.organization_id"
                  />
                  <custom-autocomplete
                    label="Поставщик"
                    minWidth="280"
                    :items="counterparties"
                    v-model="filterForm.counterparty_id"
                  />
                </div>
                <custom-autocomplete
                  label="Договор"
                  minWidth="280"
                  :items="cpAgreements"
                  v-model="filterForm.cpAgreement_id"
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn color="red" class="btn" @click="closeFilterModal"
                    >сбросить</v-btn
                  >
                  <v-btn :color="BASE_COLOR" class="btn" @click="getItems"
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

.switcher {
  background-color: #d9dce2;
  padding: 10px 16px;
  display: flex;
  gap: 10px;
  width: 290px;
  border-radius: 12px;
}

.button {
  padding: 8px 10px;
  transition: all 400ms ease-in-out;
}
.active {
  background-color: #4f4cd1;
  border-radius: 12px;
  color: white;
}
</style>
