<script setup>
import { onMounted, ref, watch, computed } from "vue";
import counterpartyApi from "../../../api/counterparty";
import showDate from "../../../composables/date/showDate";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import createCounterparty from "./create.vue";
import { FIELD_COLOR } from "../../../composables/constant/colors.js";

const loading = ref(true);
const isCreate = ref(false);
const isEdit = ref(false);
const createOnBase = ref(false);
const hoveredRowIndex = ref(null);

const markedID = ref([]);
const markedItem = ref([]);
const counterparty = ref([]);
const pagination = ref([]);

const filterDialog = ref(false);
const organizations = ref([]);
const priceTypes = ref([]);
const counterparties = ref([]);
const currencies = ref([]);

const filterForm = ref({
  name: null,
  email: null,
  phone: null,
  comment: null,
  address: null,
  roles: [],
});

const a = ref(false);
const b = ref(false);
const c = ref(false);

const search = ref("");

const headers = ref([
  { title: "№", key: "id", align: "start" },
  { title: "Наименование", key: "name" },
  { title: "Адрес", key: "address" },
  { title: "Тип контрагента", key: "roles", sortable: false },
  { title: "Телефон", key: "phone" },
  { title: "Эл. почта", key: "email" },
  { title: "Дата создания", key: "created_at" },
]);

const formatRole = (roles) => {
  const roleMap = {
    1: "Клиент",
    2: "Поставщик",
    3: "Прочие",
  };

  return roles.map((role) => roleMap[role] || "Неизвестная роль").join(", ");
};

const count = ref(0);

watch(
  () => isEdit.value,
  (newValue, { page, itemsPerPage, sortBy }, search) => {
    if (newValue === false) {
      getCounterparty({ page, itemsPerPage, sortBy }, search);
    }
  }
);

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = counterparty.value.find(
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

const createBase = () => {
  if (markedID.value.length !== 1)
    return showToast(selectOneItemMessage, "warning");
  isCreate.value = true;
  createOnBase.value = true;
  editItem(markedID.value[0]);
};
const editItem = (item) => {
  isCreate.value = true;
  isEdit.value = true;
  markedItem.value = item;
};

function countFilter() {
  for (const key in filterForm.value) {
    if (
      filterForm.value[key] !== null &&
      (!Array.isArray(filterForm.value[key]) ||
        filterForm.value[key].length !== 0)
    ) {
      count.value++;
    }
  }

  return count;
}

const toggleModal = () => {
  isCreate.value = false;
  setTimeout(() => {
    isEdit.value = false;
  }, 100);
};
const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return massRestoreCounterparty({ page, itemsPerPage, sortBy });
  } else {
    return massDel({ page, itemsPerPage, sortBy, search });
  }
};

const getCounterparty = async ({ page, itemsPerPage, sortBy, search }) => {
  const filterData = filterForm.value;
  filterDialog.value = false;
  count.value = 0;
  countFilter();

  loading.value = true;
  try {
    const { data } = await counterpartyApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterData
    );
    counterparty.value = data.result.data.map((item) => ({
      ...item,
      created_at: showDate(item.created_at),
      roles: formatRole(item.roles),
    }));
    pagination.value = data.result.pagination;
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const closeFilterDialog = async (page, itemsPerPage, sortBy) => {
  filterForm.value = {};
  a.value = false;
  b.value = false;
  c.value = false;
  filterDialog.value = false;
  await getCounterparty({ page, itemsPerPage, sortBy });
};

const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  if (markedID.value.length === 0) {
    showToast(warningMessage, "warning");
    return;
  }
  const body = {
    ids: markedID.value,
  };
  try {
    const { status } = await counterpartyApi.massDeletion(body);
    if (status === 200) {
      showToast(removeMessage, "red");
      await getCounterparty({ page, itemsPerPage, sortBy }, search);
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const massRestoreCounterparty = async () => {
  if (markedID.value.length === 0) {
    showToast(warningMessage, "warning");
    return;
  }
  try {
    const body = {
      ids: markedID.value,
    };
    const { status } = await counterpartyApi.massRestore(body);
    if (status === 200) {
      showToast(restoreMessage, "green");
      await getCounterparty({ page: 1, itemsPerPage: 100000 });
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const getCurrencies = async () => {
  try {
    const { data } = await currencyApi.get({ page: 1, itemsPerPage: 100000 });

    currencies.value = data.result.data.map((item) => {
      return {
        id: item.id,
        name: item.name,
      };
    });
  } catch (e) {}
};

const getOrganizations = async () => {
  try {
    const { data } = await organizationApi.get({
      page: 1,
      itemsPerPage: 100000,
    });

    organizations.value = data.result.data.map((item) => {
      return {
        id: item.id,
        name: item.name,
      };
    });
  } catch (e) {}
};

const handleCheckboxChange = (index) => {
  if (!filterForm.value.roles) {
    filterForm.value.roles = [];
  }

  if (filterForm.value.roles.includes(index + 1)) {
    filterForm.value.roles = filterForm.value.roles.filter(
      (role) => role !== index + 1
    );
  } else {
    filterForm.value.roles.push(index + 1);
  }

  computeRoles();
};

const computeRoles = () => {
  filterForm.value.roles.forEach((roleIndex) => {
    if (roleIndex === 1) a.value = true;
    else if (roleIndex === 2) b.value = true;
    else if (roleIndex === 3) c.value = true;
  });
};

onMounted(async () => {
  await getCurrencies();
  await getOrganizations();
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Контрагенты</span>
        </div>
        <v-card variant="text" min-width="500" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-2 me-3">
              <Icons @click="isCreate = true" name="add" />
              <Icons @click="createBase()" name="copy" />
              <Icons
                @click="compute({ page, itemsPerPage, sortBy, search })"
                name="delete"
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
              @click="filterDialog = true"
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
          :items="counterparty"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :search="search"
          @update:options="getCounterparty"
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
              <td>
                <span>{{ item.address }}</span>
              </td>
              <td>
                <span>{{ item.roles }}</span>
              </td>
              <td>
                <span>{{ item.phone }}</span>
              </td>
              <td>
                <span>{{ item.email }}</span>
              </td>
              <td>
                <span>{{ item.created_at }}</span>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
      <create-counterparty
        :isEdit="isEdit"
        :isOpen="isCreate"
        @toggleIsOpen="toggleModal()"
        :item="markedItem"
        :createOnBase="createOnBase"
      />

      <v-dialog v-model="filterDialog" class="mt-2 pa-2">
        <v-card
          style="border: 2px solid #3ab700"
          min-width="650"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Фильтр</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="getCounterparty" name="save" title="Сохранить" />
              </div>
              <v-btn
                @click="closeFilterDialog"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <div class="d-flex justify-space-between ga-6">
                  <v-text-field
                    v-model="filterForm.name"
                    color="green"
                    :base-color="FIELD_COLOR"
                    rounded="md"
                    variant="outlined"
                    class="w-auto text-sm-body-1"
                    density="compact"
                    placeholder="Контрагент"
                    label="Наименование"
                    clear-icon="close"
                    clearable
                    hide-details
                  />
                </div>
                <div
                  :class="isEdit ? 'justify-space-between' : 'justify-end'"
                  class="d-flex justify-space-between ga-5 align-center my-3"
                >
                  <div
                    v-if="isEdit"
                    style="
                      border: 1.5px solid #cbc8c8;
                      border-radius: 4px;
                      padding: 2px 12px;
                    "
                  >
                    <span>
                      {{ date }}
                    </span>
                  </div>
                  <CustomCheckbox :checked="a" @change="handleCheckboxChange(0)"
                    >Клиент</CustomCheckbox
                  >
                  <CustomCheckbox :checked="b" @change="handleCheckboxChange(1)"
                    >Поставщик</CustomCheckbox
                  >
                  <CustomCheckbox :checked="c" @change="handleCheckboxChange(2)"
                    >Прочее</CustomCheckbox
                  >
                </div>
                <div class="d-flex ga-4 mb-3">
                  <v-text-field
                    variant="outlined"
                    :base-color="FIELD_COLOR"
                    label="Тел номер"
                    v-model.trim="filterForm.phone"
                    density="compact"
                    v-mask="'+992#########'"
                    rounded="md"
                    color="green"
                    hide-details
                    :append-inner-icon="
                      filterForm.phone !== null ? 'close' : ''
                    "
                    @click:append-inner="filterForm.phone = null"
                  />
                  <v-text-field
                    variant="outlined"
                    :base-color="FIELD_COLOR"
                    label="Почта"
                    v-model="filterForm.email"
                    density="compact"
                    rounded="md"
                    color="green"
                    hide-details
                    :append-inner-icon="
                      filterForm.email !== null ? 'close' : ''
                    "
                    @click:append-inner="filterForm.email = null"
                  />
                </div>
                <v-text-field
                  variant="outlined"
                  :base-color="FIELD_COLOR"
                  label="Адрес"
                  v-model="filterForm.address"
                  density="compact"
                  rounded="md"
                  color="green"
                  hide-details
                  :append-inner-icon="
                    filterForm.address !== null ? 'close' : ''
                  "
                  @click:append-inner="filterForm.address = null"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
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
