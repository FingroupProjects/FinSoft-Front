<script setup>
import storageApi from "../../../api/list/storage";
import { onMounted, reactive, ref } from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import Button from "../../../components/button/button.vue";
import organizationApi from "../../../api/list/organizations";
import counterpartyApi from "../../../api/list/counterparty.js"
import { BASE_COLOR } from "../../../composables/constant/colors.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js"
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import counterpartySettlementApi from "../../../api/reports/counterpartySettlement.js"
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";

const groupBy = ref([
  {
    key: "currency.name",
    order: "asc",
  },
]);

const headers = ref([
  { title: "Поставщик", key: "counterparty.name", sortable: false },
  { title: "Приход", key: "income" },
  { title: "Расход", key: "outcome" },
  { title: "Остаток", key: "debt" },
]);

const filterForm = reactive({
  start_date: null,
  end_date: null,
  organization_id: null,
  counterparty_id: null,
  cpAgreement_id: null,
});

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
    const { data: {result} } = await counterpartySettlementApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    items.value = result.data;
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
  const { data: {result} } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = result.data;
};

const totalCount = (itemName) => {
  const filteredGoods = items.value.filter(
    (item) => item.currency.name === itemName
  );
  return filteredGoods.length;
};

const totalIncomes = (itemName) => {
  let filteredGoods = items.value.filter(
    (item) => item.currency.name === itemName
  );
  const total = filteredGoods.reduce((acc, curr) => {
    return acc + curr.income;
  }, 0);

  return total;
};

const totalOutcomes = (itemName) => {
  let filteredGoods = items.value.filter(
    (item) => item.currency.name === itemName
  );
  const total = filteredGoods.reduce((acc, curr) => {
    return acc + curr.outcome;
  }, 0);

  return total;
};

const totalRemainder = (itemName) => {
  let filteredGoods = items.value.filter(
    (item) => item.currency.name === itemName
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
  try {
    const { data } = await counterpartySettlementApi.excel();
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

onMounted(async () => {
  await getCpAgreements()
  await getOrganizations();
  await getCounterparties()
});
</script>
<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="d-flex ga-4">
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
      </div>
      <div class="filterElement">
        <Icons name="filter" title="Фильтр" @click="filterModal = true" />
        <span v-if="counterFilter !== 0" class="countFilter">{{
          counterFilter
        }}</span>
      </div>
    </div>
    <v-card class="table">
      <v-data-table
        :items="items"
        title="ewrgthy"
        v-model:items-per-page="pagination.per_page"
        items-per-page-text="Элементов на странице"
        @update:options="getItems"
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
        <template v-slot:group-header="{ item, toggleGroup, isGroupOpen }">
          <tr style="background-color: rgba(122, 127, 176, 0.193)">
            <td>
              <VBtn
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                size="small"
                variant="text"
                @click="toggleGroup(item)"
              ></VBtn>
              {{ item.value ? item.value : "Gluten free" }}
            </td>
            <td>
              {{ totalCount(item.value) }}
            </td>
            <td>
              {{ totalIncomes(item.value) }}
            </td>
            <td>
              {{ totalOutcomes(item.value) }}
            </td>
            <td>
              {{ totalRemainder(item.value) }}
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
                  <v-btn
                    :color="BASE_COLOR"
                    class="btn"
                    @click="getItems"
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
