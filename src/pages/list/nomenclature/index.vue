<script setup>
import { ref, watch } from "vue";
import goodsApi from "../../../api/goods";
import unitsApi from "../../../api/units";
import createGroup from "./createGroup.vue";
import storageApi from "../../../api/storage";
import groupApi from "../../../api/goodGroup";
import { useRoute, useRouter } from "vue-router";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import { FIELD_COLOR } from "../../../composables/constant/colors.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";

const route = useRoute();
const router = useRouter();

const hoveredRowIndex = ref(null);

const loading = ref(true);
const isFilter = ref(false);
const loadingGroup = ref(true);
const isCreateGroup = ref(false);

const search = ref("");

const count = ref(0);
const groupIdRef = ref(0);

const goods = ref([]);
const groups = ref([]);
const markedID = ref([]);
const markedItem = ref([]);
const pagination = ref([]);
const Grouppagination = ref([]);

const headers = ref([{ title: "Товар", key: "name" }]);
const Groupheaders = ref([{ title: "Наименование", key: "name" }]);

const filterForm = ref({
  name: null,
  vendor_code: null,
  storage_id: null,
  unit_id: null,
  good_group_id: null,
  description: null,
});

watch(isCreateGroup, (newVal) => {
  if (newVal === false) {
    getGroups({ page: 1, itemsPerPage: 25 });
  }
});

const goToCreate = () => {
  router.push({
    name: "createUpdateGood",
    params: {
      id: 0,
    },
  });
};

const editItem = (id, createOnBaseParam) => {
  router.push({
    name: "createUpdateGood",
    params: { id: id },
    query: { createOnBase: createOnBaseParam },
  });
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
    console.log(e);
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = users.value.find(
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

const lineMarkingGroup = (group_id) => {
  markedID.value = [];
  groupIdRef.value = group_id;
  getGoods({});
};

const getGroups = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    count.value = 0;
    countFilter();
    const filterData = filterForm.value;
    loadingGroup.value = true;
    const { data } = await groupApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    groups.value = data.result.data;
    Grouppagination.value = data.result.pagination;
    loadingGroup.value = false;
  } catch (e) {
    console.log(e);
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
    console.log(e);
  }
};
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <div
            style="cursor: pointer"
            class="pa-1 bg-green rounded-circle d-inline-block"
          >
            <v-icon icon="keyboard_backspace" size="x-small" />
          </div>
          <span>Номенклатура</span>
        </div>
        <v-card variant="text" min-width="488" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex align-center ga-2 me-3">
              <button
                style="
                  background-color: #6bd68a;
                  border-radius: 8px;
                  white-space: nowrap;
                  height: 32px;
                  padding: 0px 4px;
                  font-size: 12px;
                  color: white;
                  text-transform: uppercase;
                "
                @click="isCreateGroup = true"
              >
                <span class="px-2 pb-0">создать группу</span>
              </button>
              <Icons @click="goToCreate()" name="add" title="Создать" />
              <Icons name="copy" title="Создать на основе" />
              <Icons name="delete" title="Удалить" />
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
          <div class="filterElement">
            <Icons
              name="filter"
              title="фильтр"
              @click="isFilter = true"
              class="mt-1"
            />

            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
          </div>
        </v-card>
      </div>
      <div class="d-flex ga-4" style="width: 100">
        <v-card class="table mt-2 w-50">
          <v-data-table-server
            style="height: 78vh"
            fixed-header
            :items="groups"
            :headers="Groupheaders"
            :loading="loading"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            :search="search"
            @update:options="getGroups"
            v-model:items-per-page="Grouppagination.per_page"
            :items-length="Grouppagination.total || 0"
            :item-value="headers.title"
            show-select
            v-model="markedID"
            hover
            fixed-footer
            page-text="{0}-{1} от {2}"
            :items-per-page-options="[
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
          >
            <template v-slot:loadingGroup>
              <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
            </template>
            <template v-slot:item="{ item, index }">
              <tr
                @mouseenter="hoveredRowIndex = index + 100000"
                @mouseleave="hoveredRowIndex = null"
                @dblclick="editItem(item.id)"
                @click="lineMarkingGroup(item.id)"
                :class="{ 'bg-grey-lighten-2': item.id === groupIdRef }"
              >
                <td>
                  <span class="d-flex align-center">
                    <Icons
                      style="margin-right: 10px; margin-top: 4px"
                      :name="item.deleted_at === null ? 'valid' : 'inValid'"
                    />
                    <span>{{ item.id }}</span>
                  </span>
                </td>
                <td>
                  <span>{{ item.name }}</span>
                </td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
        <v-card class="table mt-2 w-50">
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
            show-select
            v-model="markedID"
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
                @dblclick="editItem(item.id)"
                :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
              >
                <td>
                  <template
                    v-if="
                      hoveredRowIndex === index || markedID.includes(item.id)
                    "
                  >
                    <CustomCheckbox
                      @click="lineMarking(item)"
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
      </div>
      <div v-if="isCreateGroup">
        <keep-alive>
          <createGroup
            @toggleDialog="
              isCreateGroup = false;
              createGroupOnBase = false;
              isFilter = false;
              filterForm = {};
            "
            @filter="filterGroup"
            :createGroupOnBase="createGroupOnBase"
            :filterForm="filterForm"
            :groupData="groupData"
            :isFilter="isFilter"
          />
        </keep-alive>
      </div>
    </v-col>
  </div>
</template>

<style></style>
