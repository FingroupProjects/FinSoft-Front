<script setup>
import getDateTimeInShow from "../../composables/date/getDateTimeInShow.js";
import documentHistoryApi from "../../api/documents/documentHistory";
import { onMounted, ref, watch } from "vue";
import formatDateTime from "../../composables/date/formatDateTime";
import Button from "../../components/button/button.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const id = ref(route.params.id);

const selectedBlock = ref("История");

const loading = ref(true);

const historyDoc = ref([]);
const data = ref([]);
const pagination = ref([]);

const balanceHeaders = ref([
  { title: "Дата", key: "date" },
  { title: "Кредитная статья", key: "creditArticle.name" },
  { title: "Дебетовая статья", key: "debitArticle.name" },
  { title: "Сумма", key: "sum" },
]);

const accountingOfGoodsHeaders = ref([
  { title: "Дата", key: "date" },
  { title: "Тип движения", key: "movement_type" },
  { title: "Склад", key: "storage.name" },
  { title: "Количество", key: "amount" },
  { title: "Сумма", key: "sum" },
]);

const counterpartySettlementsHeaders = ref([
  { title: "Дата", key: "date" },
  { title: "Тип движения", key: "movement_type" },
  { title: "Поставщик", key: "counterparty.name" },
  { title: "Договор", key: "counterpartyAgreement.name" },
  { title: "Валютная сумма", key: "sale_sum" },
  { title: "Сумма", key: "sum" },
]);

const seletectBlock = async (name) => {
  data.value = [];
  pagination.value = [];
  selectedBlock.value = name;
};

const getDocumentHistory = async () => {
  try {
    const { data } = await documentHistoryApi.get(id.value);
    historyDoc.value = data.result.history.map((item) => ({
      ...item,
      date: formatDateTime(item.date),
    }));
    console.log(historyDoc.value);
  } catch (e) {
    console.error(e);
  }
};

const getBalance = async ({ page, itemsPerPage, sortBy, search } = {}) => {
  loading.value = true;
  try {
    const {
      data: { result },
    } = await documentHistoryApi.balance(
      id.value,
      { page, itemsPerPage, sortBy },
      search
    );
    data.value = result.data;
    pagination.value = result.pagination;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const getAccountingOfGoods = async ({
  page,
  itemsPerPage,
  sortBy,
  search,
} = {}) => {
  loading.value = true;
  try {
    const {
      data: { result },
    } = await documentHistoryApi.goodAccountings(
      id.value,
      { page, itemsPerPage, sortBy },
      search
    );
    data.value = result.data;
    pagination.value = result.pagination;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const getCounterpartySettlements = async ({
  page,
  itemsPerPage,
  sortBy,
  search,
} = {}) => {
  loading.value = true;
  try {
    const {
      data: { result },
    } = await documentHistoryApi.counterpartySettlements(
      id.value,
      { page, itemsPerPage, sortBy },
      search
    );
    data.value = result.data;
    pagination.value = result.pagination;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const closeWindow = () => {
  window.close();
};

watch(selectedBlock, (newVal) => {
  if (newVal === "История") getDocumentHistory();
});

onMounted(() => {
  id.value = route.params.id;
  getDocumentHistory();
});
</script>

<template>
  <div class="pa-4 mb-0">
    <div class="d-flex align-center">
      <div style="min-height: 60px !important" class="switcher">
        <button
          @click="seletectBlock('История')"
          :class="selectedBlock === 'История' ? 'active' : ''"
          class="button"
        >
          История
        </button>
        <button
          @click="seletectBlock('Баланс')"
          :class="selectedBlock === 'Баланс' ? 'active' : ''"
          class="button"
        >
          Баланс
        </button>
        <button
          @click="seletectBlock('Учет товаров')"
          :class="selectedBlock === 'Учет товаров' ? 'active' : ''"
          class="button"
        >
          Учет товаров
        </button>
        <button
          @click="seletectBlock('Взаимодействие с поставщиками')"
          :class="
            selectedBlock === 'Взаимодействие с поставщиками' ? 'active' : ''
          "
          class="button"
        >
          Взаимодействие с поставщиками
        </button>
        <Button @click="closeWindow" name="close" />
      </div>
    </div>

    <div v-if="selectedBlock === 'История'">
      <h2 class="my-4">История документа : Документ</h2>
      <div class="d-flex flex-column ga-4">
        <v-card class="pa-5 rounded-xl" v-for="item in historyDoc" :key="item">
          <div class="w-100" style="border-bottom: 2px solid #08072e">
            <h3>{{ item.status }}</h3>
          </div>
          <div class="d-flex ga-2">
            <span style="color: #9b9b9b">Дата: {{ item.date }}</span>
            <span>{{ item.user.name }}</span>
          </div>
          <div
            v-for="(history, index) in item.changes"
            :key="index"
            class="d-flex flex-column"
          >
            <spanw
              class="d-flex ga-2"
              v-for="(value, key) in history.body"
              :key="key"
            >
              <div class="bg-white rounded-lg">
                <span>{{ key }}: </span>
                <span>{{ value.previous_value }}</span> =>
                <span>{{ value.new_value }}</span>
              </div>
            </spanw>
            <div class="mb-4" v-for="(item, key) in history.goods" :key="key">
              <div class="w-100">
                <div>
                  <h3>Товар {{ item.type }}</h3>
                </div>
              </div>
              <div class="d-flex ga-2">
                <span v-if="item.body.created_at" style="color: #9b9b9b"
                  >Дата: {{ formatDateTime(item.body.created_at) }}</span
                >
              </div>
              <div
                class="d-flex flex-column ga-2 mt-2"
                v-for="(good, key) in [item.body]"
                :key="key"
              >
                <span v-if="good.amount">Количество: {{ good.amount }}</span>
                <span v-if="good.price">Цена: {{ good.price }}</span>
              </div>
              <div v-if="item.type == 'Изменен '">
                <div
                  class="d-flex flex-column ga-2 mt-2"
                  v-for="(values, keys) in [item.body]"
                  :key="keys"
                >
                  <div
                    class="d-flex ga-2 mt-2"
                    v-for="(value, key) in values"
                    :key="key"
                  >
                    <span>{{ key }}</span>
                    <span> {{ value?.previous_value }}</span> =>
                    <span>{{ value?.new_value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </div>
    </div>

    <div v-if="selectedBlock === 'Баланс'">
      <h2 class="my-4">Баланс</h2>
      <v-card class="table">
        <v-data-table-server
          style="height: cacl(100vh - 150px)"
          :loading="loading"
          loading-text="Загрузка"
          items-per-page-text="Элементов на странице:"
          no-data-text="Нет данных"
          v-model:items-per-page="pagination.per_page"
          :headers="balanceHeaders"
          :items-length="pagination.total || 0"
          :items="data"
          :item-value="balanceHeaders.title"
          page-text="{0}-{1} от {2}"
          @update:options="getBalance"
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
            >
              <td>{{ getDateTimeInShow(item.date) }}</td>
              <td>{{ item.creditArticle?.name }}</td>
              <td>{{ item.debitArticle?.name }}</td>
              <td>{{ item.sum }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </div>

    <div v-if="selectedBlock === 'Учет товаров'">
      <h2 class="my-4">Учет товаров</h2>
      <v-card class="table">
        <v-data-table-server
          style="height: 70vh"
          :loading="loading"
          loading-text="Загрузка"
          items-per-page-text="Элементов на странице:"
          no-data-text="Нет данных"
          v-model:items-per-page="pagination.per_page"
          :headers="accountingOfGoodsHeaders"
          :items-length="pagination.total || 0"
          :items="data"
          :item-value="accountingOfGoodsHeaders.title"
          page-text="{0}-{1} от {2}"
          @update:options="getAccountingOfGoods"
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
            >
              <td>{{ getDateTimeInShow(item.date) }}</td>
              <td>
                <v-chip
                  style="height: 50px !important; width: 140px"
                  class="d-flex justify-center"
                  :color="item.movement_type === 'приход' ? 'red' : 'green'"
                >
                  <span class="padding: 5px;">{{ item.movement_type }}</span>
                </v-chip>
              </td>
              <td>{{ item.storage.name }}</td>
              <td>{{ item.amount }}</td>
              <td>{{ item.sum }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </div>

    <div v-if="selectedBlock === 'Взаимодействие с поставщиками'">
      <h2 class="my-4">Взаимодействие с поставщиками</h2>
      <v-card class="table">
        <v-data-table-server
          style="height: 70vh"
          :loading="loading"
          loading-text="Загрузка"
          items-per-page-text="Элементов на странице:"
          no-data-text="Нет данных"
          v-model:items-per-page="pagination.per_page"
          :headers="counterpartySettlementsHeaders"
          :items-length="pagination.total || 0"
          :items="data"
          :item-value="counterpartySettlementsHeaders.title"
          page-text="{0}-{1} от {2}"
          @update:options="getCounterpartySettlements"
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
            >
              <td>{{ getDateTimeInShow(item.date) }}</td>
              <td>
                <v-chip
                  style="height: 50px !important; width: 140px"
                  class="d-flex justify-center"
                  :color="item.movement_type === 'приход' ? 'red' : 'green'"
                >
                  <span class="padding: 10px;">{{ item.movement_type }}</span>
                </v-chip>
              </td>
              <td>{{ item.counterparty?.name }}</td>
              <td>{{ item.counterpartyAgreement?.name }}</td>
              <td>{{ item.sum }}</td>
              <td>{{ item.sale_sum !== null ? item.sale_sum : "" }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.switcher {
  background-color: #d9dce2;
  padding: 10px 16px;
  display: flex;
  gap: 10px;
  width: 760px;
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
