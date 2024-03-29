<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import groupApi from "../../../api/goodGroup";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import createGroup from "./createGroup.vue";
import createUpdate from "./createUpdateGood.vue";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";

const router = useRouter();
const { query, params: routeParams } = useRoute();

const loading = ref(true);
const isCreate = ref(false);
const isFilter = ref(false);
const isCreateGroup = ref(false);
const isCreataOnBase = ref(false);
const createGroupOnBase = ref(false);

const count = ref(0);
const hoveredRowIndex = ref(null);

const search = ref("");

const groups = ref([]);
const markedID = ref([]);
const markedItem = ref([]);
const pagination = ref([]);
const groupData = ref([]);
const filterForm = ref({
  name: null,
  is_good: null,
  is_service: null,
});

const headers = ref([{ title: "Наименование", key: "name" }]);

watch(isCreateGroup, (newVal) => {
  if (newVal === false) {
    getGroups({ page: 1, itemsPerPage: 100 });
  }
});

watch(markedID, (newVal) => {
  markedItem.value = groups.value.find((el) => el.id === newVal[0]);
});

const detail = (item) => {
  router.push({
    name: "nomenclature",
    params: {
      id: item.id,
    },
    query: {
      group: item.name,
    },
  });
};

const goToCreate = () => {
  router.push({
    name: "createUpdateGood",
    params: {
      id: 0,
    },
  });
};

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null && filterForm.value[key] !== false) {
      count.value++;
    }
  }
  return count;
}

const createOnBase = async () => {
  if (markedID.value.length > 1) {
    showToast(selectOneItemMessage, "warning");
    return;
  } else if (markedID.value.length === 0) {
    showToast(warningMessage, "warning");
    return;
  }
  await getGroupById({ page: 1, itemsPerPage: 1 });
  createGroupOnBase.value = true;
  isCreateGroup.value = true;
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = groups.value.find(
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

const getGroupById = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await groupApi.getGroupById(
      markedItem.value.id,
      { page, itemsPerPage, sortBy },
      search
    );
    groupData.value = data.result;
  } catch (e) {
    console.log(e);
  }
};

const getGroups = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    count.value = 0;
    countFilter();
    const filterData = filterForm.value;
    loading.value = true;
    const { data } = await groupApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    groups.value = data.result.data;
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
    const { status } = await groupApi.massDeletion(body);
    if (status === 200) {
      showToast(removeMessage, "red");
      markedID.value = [];
      await getGroups({ page, itemsPerPage, sortBy }, search);
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
    const { status } = await groupApi.massRestore(body);
    if (status === 200) {
      showToast(restoreMessage, "green");
      markedID.value = [];
      await getGroups({ page, itemsPerPage, sortBy });
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

const filterGroup = async (filterData) => {
  try {
    filterForm.value = filterData;
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  markedID.value = [];
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
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
                <span class="px-2 py-0">создать группу</span>
              </button>
              <Icons @click="goToCreate()" name="add" title="Создать" />
              <Icons
                @click="createOnBase()"
                name="copy"
                title="Создать на основе"
              />
              <Icons
                @click="compute({ page, itemsPerPage, sortBy, search })"
                name="delete"
                title="Удалить"
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

      <v-card class="table mt-2">
        <v-data-table-server
          style="height: 78vh"
          fixed-header
          :items="groups"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :search="search"
          @update:options="getGroups"
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
              @dblclick="detail(item)"
              :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
            >
              <td>
                <template
                  v-if="hoveredRowIndex === index || markedID.includes(item.id)"
                >
                  <CustomCheckbox
                    :checked="markedID.includes(item.id)"
                    @click="lineMarking(item)"
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
<style>
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
