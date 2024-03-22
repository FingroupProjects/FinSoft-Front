<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import goodsApi from "../../../api/goods";
import groupApi from "../../../api/goodGroup";
import storageApi from "../../../api/storage";
import unitsApi from "../../../api/units";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import createGroup from "./createGroup.vue";
import createUpdate from "./createUpdateGood.vue";
import { FIELD_COLOR } from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const isCreate = ref(false);
const isFilter = ref(false);
const isCreateGroup = ref(false);

const hoveredRowIndex = ref(null);

const search = ref("");
const groupName = ref("");

const storages = ref([]);
const units = ref([]);
const groups = ref([]);
const markedID = ref([]);
const markedItem = ref([]);
const goods = ref([]);
const pagination = ref([]);

const filterForm = ref({
  name: null,
  vendor_code: null,
  storage_id: null,
  unit_id: null,
  good_group_id: null,
  description: null,
});

const headers = ref([
  { title: "№", key: "id", align: "start" },
  { title: "Наименование", key: "name" },
]);

watch(
  () => isFilter.value,
  (newValue) => {
    if (newValue === true) {
      getUnits(),
        getStorage({ page: 1, itemsPerPage: 1000 }),
        getGroups({ page: 1, itemsPerPage: 1000 });
    }
    if (newValue === false) {
      clearForm();
    }
  }
);

const itemsProps = (item) => {
  return {
    title: item.name,
  };
};

const clearForm = () => {
  filterForm.value = {
    name: null,
    vendor_code: null,
    storage_id: null,
    unit_id: null,
    good_group_id: null,
    description: null,
  };
};

const filterGoods = async () => {
  await getGoods({ page: 1, itemsPerPage: 100 });
  isFilter.value = false;
};

const getUnits = async () => {
  try {
    const { data } = await unitsApi.get();
    units.value = data.result;
  } catch (e) {
    console.log(e);
  }
};

const getStorage = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await storageApi.get(
      { page, itemsPerPage, sortBy },
      search
    );
    storages.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const getGroups = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await groupApi.get({ page, itemsPerPage, sortBy }, search);
    groups.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const editItem = (id, createOnBaseParam) => {
  router.push({
    name: "createUpdateGood",
    params: { id: id },
    query: { createOnBase: createOnBaseParam },
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

const goToCreate = () => {
  router.push({
    name: "createUpdateGood",
    params: {
      id: 0,
    },
  });
};

const goToBack = () => {
  router.go(-1);
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = goods.value.find(
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

const getGoods = async ({ page, itemsPerPage, sortBy, search }) => {
  const filterData = filterForm.value;
  try {
    loading.value = true;
    const { data } = await groupApi.getById(
      route.params.id,
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    goods.value = data.result.data;
    pagination.value = data.result.pagination;
    loading.value = false;
  } catch (e) {
    console.log(e);
  }
};

const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value,
  };
  try {
    const { status } = await goodsApi.massDeletion(body);
    if (status === 200) {
      showToast(removeMessage, "red");
      markedID.value = [];
      await getGoods({ page, itemsPerPage, sortBy }, search);
    }
  } catch (e) {
    console.log(e);
  }
};

const massRestore = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const body = {
      ids: markedID.value,
    };
    const { status } = await goodsApi.massRestore(body);
    if (status === 200) {
      showToast(restoreMessage, "green");
      markedID.value = [];
      await getGoods({ page, itemsPerPage, sortBy });
    }
  } catch (e) {
    console.log(e);
  }
};

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return massRestore({ page, itemsPerPage, sortBy });
  } else {
    return massDel({ page, itemsPerPage, sortBy, search });
  }
};

onMounted(() => {
  markedID.value = [];
  groupName.value = route.query.group || "Номенклатура";
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <div
            style="cursor: pointer"
            @click="goToBack()"
            class="pa-1 bg-green rounded-circle d-inline-block"
          >
            <v-icon icon="keyboard_backspace" size="x-small" />
          </div>
          <span>{{ groupName }}</span>
        </div>
        <v-card variant="text" min-width="500" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-2 me-3">
              <button
                style="
                  background-color: #4ecb71;
                  border-radius: 12px;
                  white-space: nowrap;
                  height: 25px;
                  font-size: 12px;
                  border: 1px solid red;
                "
                @click="isCreateGroup = true"
              >
                <span class="px-2 py-0">создать группу</span>
              </button>
              <Icons @click="goToCreate()" name="add" title="Создать"/>
              <Icons @click="createOnBase()" name="copy" title="Создать на основе"/>
              <Icons
                @click="compute({ page, itemsPerPage, sortBy, search })"
                name="delete" title="Удалить"
              />
            </div>
            <div class="w-100">
              <v-text-field
                v-model="search"
                prepend-inner-icon="search"
                base-color="info"
                density="compact"
                label="Поиск..."
                variant="outlined"
                color="info"
                rounded="lg"
                clear-icon="close"
                hide-details
                single-line
                clearable
                flat
              ></v-text-field>
            </div>
          </div>
          <Icons @click="isFilter = true" name="filter" class="mt-1" title="Фильтр"/>
        </v-card>
      </div>

      <v-card class="table mt-2">
        <v-data-table-server
          style="height: 78vh"
          fixed-header
          :items="goods"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :search="search"
          @update:options="getGoods"
          v-model:items-per-page="pagination.per_page"
          :items-length="pagination.total || 0"
          :item-value="headers.title"
          hover
          fixed-footer
          page-text="{0}-{1} от {2}"
          :items-per-page-options="[
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
          ]"
        >
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
          </template>
          <template v-slot:item="{ item, index }">
            <tr
              @mouseenter="hoveredRowIndex = index"
              @mouseleave="hoveredRowIndex = null"
              @click="lineMarking(item)"
              @dblclick="editItem(item.id)"
              :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
            >
              <td>
                <template
                  v-if="hoveredRowIndex === index || markedID.includes(item.id)"
                >
                  <CustomCheckbox
                    :checked="markedID.includes(item.id)"
                    @change="lineMarking(item)"
                  >
                    <span>{{ item.id }}</span>
                  </CustomCheckbox>
                </template>

                <template v-else>
                  <span class="d-flex align-center">
                    <Icons
                      style="margin-right: 10px; margin-top: 4px"
                      :name="item.deleted_at === null ? 'valid' : 'inValid'"
                    />
                    <span>{{ item.id }}</span>
                  </span>
                </template>
              </td>
              <td>
                <span>{{ item.name }}</span>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
      <div v-if="isCreate">
        <createUpdate @toggleDialog="isCreate = false" />
      </div>
      <div v-if="isCreateGroup">
        <createGroup @toggleDialog="isCreateGroup = false" />
      </div>

      <v-dialog v-model="isFilter" class="mt-2 pa-2">
        <v-card
          style="border: 2px solid #3ab700"
          min-width="550"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Фильтр</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <!-- <Icons name="delete" /> -->
                <Icons @click="filterGoods()" name="save" />
              </div>
              <v-btn
                @click="isFilter = false"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100 ga-3">
                <div class="d-flex ga-3">
                  <v-text-field
                    v-model="filterForm.name"
                    color="green"
                    rounded="md"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Наименование"
                    label="Наименование"
                    clear-icon="close"
                    clearablehide-details
                    clearable
                    hide-details
                    :base-color="FIELD_COLOR"
                  />
                  <v-text-field
                    v-model="filterForm.vendor_code"
                    color="green"
                    rounded="md"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Артикуль"
                    label="Артикуль"
                    clear-icon="close"
                    clearable
                    hide-details
                    :base-color="FIELD_COLOR"
                  />
                </div>
                <div class="d-flex ga-3">
                  <v-select
                    placeholder="Место расположения"
                    label="Место расположения"
                    :item-props="itemsProps"
                    v-model="filterForm.storage_id"
                    variant="outlined"
                    item-title="name"
                    item-value="id"
                    :items="storages"
                    color="green"
                    hide-details
                    :base-color="FIELD_COLOR"
                  />
                  <v-select
                    placeholder="Ед измерения"
                    :item-props="itemsProps"
                    label="Ед измерения"
                    v-model="filterForm.unit_id"
                    variant="outlined"
                    item-title="name"
                    item-value="id"
                    :items="units"
                    color="green"
                    hide-details
                    :base-color="FIELD_COLOR"
                  />
                </div>
                <v-select
                  placeholder="Группа номенклатуры"
                  label="Группа номенклатуры"
                  :item-props="itemsProps"
                  v-model="filterForm.good_group_id"
                  variant="outlined"
                  item-title="name"
                  item-value="id"
                  :items="groups"
                  color="green"
                  hide-details
                  :base-color="FIELD_COLOR"
                />
                <v-textarea
                  v-model="filterForm.description"
                  variant="outlined"
                  label="Описание"
                  color="green"
                  :base-color="FIELD_COLOR"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </div>
</template>
