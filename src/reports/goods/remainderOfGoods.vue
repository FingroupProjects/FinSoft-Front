<script setup>
import { computed, reactive, ref } from "vue";
import Icons from "../../composables/Icons/Icons.vue";
import { BASE_COLOR } from "../../composables/constant/colors.js";
import CustomTextField from "../../components/formElements/CustomTextField.vue";
import remainderOfGoodsApi from "../../api/reports/remainderOfGoods";

const filterForm = reactive({
  from: null,
  to: null,
  date: null,
});

const counterFilter = ref(0);

const selectedBlock = ref("По группам");

const filterModal = ref(false);
const loading = ref(false);

const goods = ref([]);
const pagination = ref([]);

const seletectBlock = async (name) => {
  closeFilterModal();
  loading.value = true;
  selectedBlock.value = await name;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const closeFilterModal = async () => {
  filterModal.value = false;
};

const getRemainderOfGoods = async ({ page, itemsPerPage, sortBy, search }) => {
  countFilter();
  const filterData = filterForm.value;
  try {
    const res = await remainderOfGoodsApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    goods.value = res.data.result.data
    pagination.value = res.data.result.pagination
    console.log(res);
  } catch (e) {
    console.error(e);
  }
};

const totalGoods = computed(() => {
  return goods.value.length  
});

const totalIncomes = computed(() => {
  const total = goods.value.reduce((acc, curr) => {
    return acc + curr.income;
  }, 0);
  
  return total;
});

const totalOutcomes = computed(() => {
  const total = goods.value.reduce((acc, curr) => {
    return acc + curr.outcome;
  }, 0);
  
  return total;
});

const totalRemainder = computed(() => {
  const total = goods.value.reduce((acc, curr) => {
    return acc + curr.remainder;
  }, 0);
  
  return total;
});

const totalTotals = computed(() => {
  const total = goods.value.reduce((acc, curr) => {
    return acc + curr.total;
  }, 0);
  
  return total;
});

const countFilter = () => {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      counterFilter.value++;
    }
  }
};

const groupBy = ref([
  {
    key: "group.name",
    order: "asc",
  },
]);

const headers = ref([
  { title: "Товар", align: "start", key: "good.name",},
  { title: "Начало", key: "start" },
  { title: "Приход", key: "income" },
  { title: "Расход", key: "outcome" },
  { title: "Все", key: "total" },
  { title: "Остаток", key: "remainder" },
]);

</script>
<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between align-center mb-4">
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
      <div class="filterElement">
        <Icons name="filter" title="Фильтр" @click="filterModal = true" />
        <span v-if="counterFilter !== 0" class="countFilter">{{
          counterFilter
        }}</span>
      </div>
    </div>
    <v-card class="table">
      <v-data-table
        :items="goods"
        v-model:items-per-page="pagination.per_page"
        items-per-page-text="Элементов на странице"
        @update:options="getRemainderOfGoods"
        style="height: calc(100vh - 165px)"
        page-text="{0}-{1} от {2}"
        loading-text="Загрузка"
        :group-by="selectedBlock === 'По группам' ? groupBy : [] "
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
        <template
          v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
        >
          <tr>
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
              {{ totalGoods }}
            </td>
            <td>
              
            </td>
            <td>
              {{ totalIncomes }}
            </td>
            <td>
              {{ totalOutcomes }}
            </td>
            <td>
              {{ totalTotals }}
            </td>
            <td>
              {{ totalRemainder }}
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
          min-width="420"
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
                    label="От"
                    type="datetime-local"
                    v-model="filterForm.from"
                  />
                  <custom-text-field
                    class="date"
                    label="До"
                    type="datetime-local"
                    v-model="filterForm.to"
                  />
                </div>
                <custom-text-field
                  class="date w-100"
                  label="Дата"
                  type="datetime-local"
                  v-model="filterForm.date"
                />
                <div class="d-flex justify-end ga-2">
                  <v-btn color="red" class="btn" @click="closeFilterModal"
                    >сбросить</v-btn
                  >
                  <v-btn
                    :color="BASE_COLOR"
                    class="btn"
                    @click="seletectBlock('По группам')"
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
