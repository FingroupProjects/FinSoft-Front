<script setup>
import { ErrorSelectMessage, removeMessage, restoreMessage, selectOneItemMessage, warningMessage, } from "../../../composables/constant/buttons.js";
import { createAccess, readAccess, removeAccess, updateAccess, } from "../../../composables/access/access.js";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import { BASE_COLOR, TITLE_COLOR, FIELD_OF_SEARCH, } from "../../../composables/constant/colors.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import getListStatus from "../../../composables/displayed/getListStatus.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import { markedForDeletion } from "../../../composables/constant/items.js";
import filterCanvas from "../../../components/canvas/filterCanvas.vue";
import { useFilterCanvasVisible } from "../../../store/canvasVisible";
import getExcel from "../../../composables/otherQueries/getExcel.js";
import Button from "../../../components/button/button.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import groupApi from "../../../api/list/goodGroup.js";
import storageApi from "../../../api/list/storage.js";
import showToast from "../../../composables/toast";
import unitApi from "../../../api/list/units.js";
import goodsApi from "../../../api/list/goods";
import createGroup from "./createGroup.vue";
import { reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const hoveredRowIndex = ref(null);

const loading = ref(true);
const isFilter = ref(false);
const isEditGroup = ref(false);
const isCreateGroup = ref(false);

const search = ref("");
const selectedBlock = ref("По группам");

const count = ref(0);
const groupIdRef = ref(0);

const groupData = ref([]);
const goods = ref([]);
const units = ref([]);
const groups = ref([]);
const storages = ref([]);
const markedID = ref([]);
const markedItem = ref([]);
const pagination = ref([]);
const Grouppagination = ref([]);

const headers = ref([
  { title: "#", key: "id" },
  { title: "Статус", key: "deleted_at" },
  { title: "Товар", key: "name" },
]);

const headersGroup = ref([
  { title: "Статус", key: "deleted_at" },
  { title: "Товар", key: "name", align: "start" },
]);

const groupBy = ref([
  {
    key: "name",
    order: "asc",
  },
]);

const headerButtons = ref([
  {
    name: "group",
    function: () => {
      isCreateGroup.value = true;
    },
  },
  {
    name: "create",
    function: () => {
      goToCreate();
    },
  },
  {
    name: "copy",
    function: async () => {
      createOnBase();
    },
  },
  {
    name: "delete",
    function: () => {
      compute({ page: 1, itemsPerPage: 25 });
    },
  },
  {
    name: "excel",
    function: () => {
      getExcel(groupApi, 'Номенклатура');
    },
  },
]);

const filterForm = reactive({
  name: null,
  deleted: null,
  unit_id: null,
  storage_id: null,
  description: null,
  vendor_code: null,
  good_group_id: null,
});

const isGroupChecked = (item) => {
  return item.items[0].raw.goods.every((item) =>
    markedID.value.includes(item.id)
  );
};

const toggleGroupSelection = (group) => {
  const goods = group.items[0].raw.goods;
  if (goods.length === 0) return;

  markedItem.value = goods[0];

  const allIds = goods.map((item) => item.id);
  if (isGroupChecked(group)) {
    markedID.value = markedID.value.filter((id) => !allIds.includes(id));
  } else {
    markedID.value = [...new Set([...markedID.value, ...allIds])];
  }
};

const selectBlock = (name) => {
  closeFilterModal();
  selectedBlock.value = name;
  loading.value = false;
};

const closeFilterModal = async ({ page, itemsPerPage, sortBy, search, filterData } = {}) => {
  await getGroups({ page, itemsPerPage, sortBy, search, filterData });
  filterForm.name = null;
  filterForm.vendor_code = null;
  (filterForm.storage_id = null),
  (filterForm.unit_id = null),
  (filterForm.good_group_id = null),
  (filterForm.description = null);
};

watch(isCreateGroup, (newVal) => {
  if (newVal === false) {
    getGroups({ page: 1, itemsPerPage: 25 });
  }
});

const goToCreate = () => {
  router.push({
    name: "createUpdateGood",
    params: { id: 0 },
  });
};

const createOnBase = () => {
  if (markedID.value.length > 1) {
    showToast(selectOneItemMessage, "warning");
    return;
  } else if (markedID.value.length === 0) {
    showToast(warningMessage, "warning");
    return;
  }
  editItem(markedItem.value.id, 1);
};

const getUnits = async () => {
  try {
    const { data: { result: { data } } } = await unitApi.get({ page: 1, itemsPerPage: 10000 });
    units.value = data;
  } catch (e) {
    console.error(e);
  }
};

const getStorage = async () => {
  try {
    const { data: { result: { data } } } = await storageApi.get({ page: 1, itemsPerPage: 10000 });
    storages.value = data;
  } catch (e) {
    console.error(e);
  }
};

const editItem = (id, createOnBaseParam) => {
  router.push({
    name: "createUpdateGood",
    params: { id: id },
    query: { createOnBase: createOnBaseParam },
  });
};

const editGroup = (item) => {
  isEditGroup.value = true;
  isCreateGroup.value = true;
  groupData.value = item.items[0].raw;
};

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }
  return count;
}

const filterGroup = async (filterData) => {
  try {
    filterForm.value = filterData;
  } catch (e) {
    console.error(e);
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = goods.value.find(
      (el) => el.id === markedID.value[0]
    );

    if (
      firstMarkedItem &&
      firstMarkedItem.deleted_at &&
      item.deleted_at === null
    ) {
      showToast(ErrorSelectMessage, "warning");
      return;
    }
    if (
      firstMarkedItem &&
      firstMarkedItem.deleted_at === null &&
      item.deleted_at !== null
    ) {
      showToast(ErrorSelectMessage, "warning");
      return;
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

const getGroups = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    loading.value = true;
    count.value = 0;
    countFilter();
    const { data } = await groupApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm
    );
    groups.value = data.result.data;
    Grouppagination.value = data.result.pagination;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const getGoods = async ({ page, itemsPerPage, sortBy, search }) => {
  count.value = 0;
  countFilter();
  if (groupIdRef.value === 0) return (loading.value = false);
  try {
    loading.value = true;
    const { data } = await groupApi.getById(
      groupIdRef.value,
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    goods.value = data.result.data;
    pagination.value = data.result.pagination;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const remove = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value,
  };
  try {
    const { status } = await goodsApi.massDeletion(body);
    if (status === 200) {
      showToast(removeMessage, "red");
      markedID.value = [];
      await getGroups({ page, itemsPerPage, sortBy }, search);
    }
  } catch (e) {
    console.error(e);
  }
};

const restore = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const body = {
      ids: markedID.value,
    };
    const { status } = await goodsApi.massRestore(body);
    if (status === 200) {
      showToast(restoreMessage, "green");
      markedID.value = [];
      await getGroups({ page, itemsPerPage, sortBy });
    }
  } catch (e) {
    console.error(e);
  }
};

const compute = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");

  if (markedItem.value?.deleted_at) {
    return restore({});
  } else {
    return remove({});
  }
};

const getFilterItems = () => {
  getUnits();
  getStorage();
};
</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"> Товар </span>
      </div>
      <div class="d-flex justify-between ga-2">
        <div class="switcher">
          <button
            @click="selectBlock('По группам')"
            :class="{ active: selectedBlock === 'По группам' }"
            class="button"
          >
            По группам
          </button>
          <button
            @click="selectBlock('По элементам')"
            :class="{ active: selectedBlock === 'По элементам' }"
            class="button"
          >
            По элементам
          </button>
        </div>
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
        <div class="custom_search">
          <v-text-field
            style="width: 190px; max-height: 45px !important"
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
            @click="
              useFilterCanvasVisible().toggleFilterCanvas();
              getFilterItems();"
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
        v-model:items-per-page="Grouppagination.per_page"
        :loading="loading"
        :headers="selectedBlock === 'По группам' ? headersGroup : headers"
        :items-length="Grouppagination.total || 0"
        :items="groups"
        :group-by="selectedBlock === 'По группам' ? groupBy : []"
        @update:options="getGroups"
        :search="search"
        page-text="{0}-{1} от {2}"
        :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        fixed-header
        hover
      >
        <template v-slot:group-header="{ item, toggleGroup, isGroupOpen }">
          <tr
            style="background-color: rgba(122, 127, 176, 0.193)"
            @dblclick="editGroup(item)"
          >
            <td style="width: 350px">
              <div class="d-flex align-center">
                <CustomCheckbox
                  v-if="isGroupOpen(item)"
                  v-model="markedID"
                  :checked="isGroupChecked(item)"
                  @change="toggleGroupSelection(item)"
                >
                </CustomCheckbox>
                <VBtn
                  :icon="isGroupOpen(item) ? '$expand' : '$next'"
                  size="small"
                  variant="text"
                  @click="toggleGroup(item)"
                ></VBtn>
                <span>{{ item.value }}</span>
              </div>
            </td>
            <td style="width: 390px">
              <v-chip
                v-if="item.items[0].raw.deleted_at"
                style="height: 50px; width: 200px"
                class="d-flex justify-center"
                :color="getListColor(item.items[0].raw.deleted_at)"
              >
                <span class="padding: 5px;">{{
                  getListStatus(item.items[0].raw.deleted_at)
                }}</span>
              </v-chip>
            </td>
            <td></td>
          </tr>
        </template>
        <template v-slot:item="{ item, index }">
          <tr
            v-if="item.goods.length !== 0"
            v-for="good in item.goods"
            :key="good.id"
            :class="{ 'bg-grey-lighten-2': item.id === groupIdRef }"
            @mouseenter="hoveredRowIndex = index + 100000"
            @mouseleave="hoveredRowIndex = null"
            @dblclick="editItem(good.id)"
          >
            <td style="width: 350px">
              <div class="d-flex align-center ga-2">
                <CustomCheckbox
                  v-model="markedID"
                  :checked="markedID.includes(good.id)"
                  @change="lineMarking(good)"
                >
                </CustomCheckbox>
                {{ good?.id }}
              </div>
            </td>
            <td style="width: 390px">
              <v-chip
                style="height: 50px; width: 200px"
                class="d-flex justify-center"
                :color="getListColor(good?.deleted_at)"
              >
                <span class="padding: 5px;">{{
                  getListStatus(good?.deleted_at)
                }}</span>
              </v-chip>
            </td>
            <td>{{ good?.name }}</td>
          </tr>
          <tr v-else-if="selectedBlock === 'По группам'">
            <td></td>
            <td>Нету данных!</td>
            <td></td>
          </tr>
        </template>
      </v-data-table-server>
    </div>
    <div v-if="isCreateGroup">
      <keep-alive>
        <createGroup
          @toggleDialog="
            isCreateGroup = false;
            isEditGroup = false;
            isFilter = false;
            filterForm = {};
          "
          @filter="filterGroup"
          :isEditGroup="isEditGroup"
          :filterForm="filterForm"
          :groupData="groupData"
          :isFilter="isFilter"
        />
      </keep-alive>
    </div>

    <filterCanvas>
      <div>
        <div class="d-flex ga-2">
          <custom-filter-text-field
            v-model="filterForm.name"
            placeholder="Товар"
            label="Наименование"
          />
          <custom-filter-text-field
            v-model="filterForm.vendor_code"
            placeholder="Артикуль"
            label="Артикуль"
          />
        </div>
        <div class="d-flex ga-2 my-2">
          <custom-filter-autocomplete
            v-model="filterForm.storage_id"
            placeholder="Склад"
            :items="storages"
            label="Склад"
          />
          <custom-filter-autocomplete
            placeholder="Помечен на удаление"
            v-model="filterForm.deleted"
            label="Помечен на удаление"
            :items="markedForDeletion"
          />
        </div>
        <div class="d-flex ga-2 my-2">
          <custom-filter-autocomplete
            placeholder="Единица измерения"
            v-model="filterForm.unit_id"
            label="Единица измерения"
            :items="units"
          />
          <custom-filter-autocomplete
            placeholder="Группа товара"
            v-model="filterForm.good_group_id"
            label="Группа товара"
            :items="groups"
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
                  getGroups({});
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

<style></style>
