<script setup>
import { onMounted, ref, watch } from "vue";
import showToast from "../../../composables/toast/index.js";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import user from "../../../api/list/user.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {
  BASE_COLOR,
  FIELD_OF_SEARCH,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";
import copyDocument from "../../../api/documents/copyDocument.js";
import getStatus from "../../../composables/displayed/getStatus.js";
import getColor from "../../../composables/displayed/getColor.js";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import Button from "../../../components/button/button.vue";
import debounce from "lodash.debounce";
import clientOrderApi from "../../../api/documents/clientOrder.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import personnelMovement from "../../../api/hr/personnelMovement.js";
import { useRouter } from "vue-router";

const router = useRouter()

const loading = ref(true);
const loadingRate = ref(true);
const dialog = ref(false);
const filterModal = ref(false);
const hoveredRowIndex = ref(null);

const markedID = ref([]);
const markedItem = ref([]);
const search = ref("");
const debounceSearch = ref("");
const nameRef = ref(null);
const descriptionRef = ref(null);
const personnelMovements = ref([]);
const paginations = ref([]);
const showConfirmDialog = ref(false);
const showModal = ref(false);
const count = ref(0);
const authors = ref([]);
const counterparties = ref([]);
const organizations = ref([]);

const filterForm = ref({
  endDate: null,
  startDate: null,
  counterparty_id: null,
  organization_id: null,
  author_id: null,
});

const headers = ref([
  { title: "Номер", key: "name" },
  { title: "Дата", key: "currency.name" },
  { title: "Статус", key: "deleted_at" },
  { title: "Сотрудник", key: "currency.name" },
]);

const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "personnelMovementCreate" }),
  },
  {
    name: "createBasedOn",
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
          window.open(`/hr/personnelMovement/${res.data.result.id}`, "_blank");
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
      compute({});
    },
  },
]);

const getPersonnelMovementData = async ({
  page,
  itemsPerPage,
  sortBy,
  search,
} = {}) => {
  count.value = 0;
  countFilter();
  filterModal.value = false;
  loading.value = true;
  try {
    const { data } = await personnelMovement.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    paginations.value = data.result.pagination;
    personnelMovements.value = data.result.data;
  } catch (e) {
  } finally {
    loading.value = false;
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
    const { status } = await clientOrderApi.massDeletion({
      ids: markedID.value,
    });

    if (status === 200) {
      showToast(removeMessage, "red");
      await getPersonnelMovementData({});
      markedID.value = [];
      dialog.value = false;
    }
  } catch (e) {}
};

const massRestore = async () => {
  try {
    const { status } = await clientOrderApi.massRestore({
      ids: markedID.value,
    });

    if (status === 200) {
      showToast(restoreMessage);
      await getPersonnelMovementData({});
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
    const firstMarkedItem = personnelMovements.value.find(
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
  filterModal.value = {};
  cleanFilterForm();
  await getPersonnelMovementData({ page, itemsPerPage, sortBy, search });
  useFilterCanvasVisible().closeFilterCanvas();
};

const show = (item) => {
  window.open(`/hr/personnelMovement/${item.id}`, "_blank");
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

const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  counterparties.value = data.result.data;
};

watch(dialog, (newVal) => {
  if (!newVal) {
    nameRef.value = null;
    descriptionRef.value = null;
    loadingRate.value = true;
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
});

watch(markedID, (newVal) => {
  markedItem.value = personnelMovements.value.find((el) => el.id === newVal[0]);
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
  getAuthors();
});
</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"
          >Кадровое перемещение</span
        >
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
          ></v-text-field>
        </div>
        <div class="mt-2 filterElement">
          <Icons
            name="filter"
            title="фильтр"
            @click="useFilterCanvasVisible().toggleFilterCanvas()"
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
        :items="personnelMovements"
        :item-value="headers.title"
        :search="debounceSearch"
        v-model="markedID"
        @update:options="getPersonnelMovementData"
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
                  getStatus(item.active, item.deleted_at)
                }}</span>
              </v-chip>
            </td>
            <td>{{ item.employee.name }}</td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>

    <filter-canvas>
      <div class="d-flex flex-column ga-2 w-100">
        <custom-filter-text-field
          label="Дата"
          min-width="106"
          class="date"
          clearable
          type="datetime-local"
          v-model="filterForm.date"
        />
        <custom-filter-text-field
          label="По"
          type="datetime-local"
          class="date"
          min-width="106"
          clearable
          v-model="filterForm.endDate"
        />
        <custom-filter-autocomplete
          label="Организация"
          min-width="106"
          :items="organizations"
          v-model="filterForm.organization_id"
        />
        <custom-filter-autocomplete
          label="Клиент"
          min-width="106"
          :items="counterparties"
          v-model="filterForm.counterparty_id"
        />

        <custom-filter-autocomplete
          label="Автор"
          min-width="106"
          :items="authors"
          v-model="filterForm.author_id"
        />
      </div>
      <div class="d-flex justify-end ga-2">
        <div class="d-flex ga-2" style="margin-right: -6%">
          <v-btn color="red" class="btn" @click="closeFilterModal"
            >сбросить</v-btn
          >
          <v-btn
            :color="BASE_COLOR"
            class="btn"
            @click="
              () => {
                getPersonnelMovementData();
                useFilterCanvasVisible().closeFilterCanvas();
              }
            "
            >применить
          </v-btn>
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
