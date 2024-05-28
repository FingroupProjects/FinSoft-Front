<script setup>
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import CustomFilterTextField from "@/components/formElements/CustomFilterTextField.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus";
import { markedForDeletion } from "../../../composables/constant/items.js";
import filterCanvas from "../../../components/canvas/filterCanvas.vue";
import { useFilterCanvasVisible } from "../../../store/canvasVisible";
import counterpartyApi from "../../../api/list/counterparty";
import Button from "../../../components/button/button.vue";
import showDate from "../../../composables/date/showDate";
import Icons from "../../../composables/Icons/Icons.vue";
import showToast from "../../../composables/toast";
import createCounterparty from "./create.vue";
import debounce from "lodash.debounce";
import { onMounted, ref, watch } from "vue";
import {
  removeAccess,
  updateAccess,
  createAccess,
} from "../../../composables/access/access.js";
import {
  FIELD_COLOR,
  BASE_COLOR,
  TITLE_COLOR,
  FIELD_OF_SEARCH,
} from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";

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
  roles: [],
  name: null,
  email: null,
  phone: null,
  deleted: null,
  comment: null,
  address: null,
});

const a = ref(false);
const b = ref(false);
const c = ref(false);

const count = ref(0);
const search = ref("");
const debounceSearch = ref("");

const headers = ref([
  { title: "Наименование", key: "name" },
  { title: "Статус", key: "deleted_at" },
  { title: "Баланс", key: "balance" },
  { title: "Роль", key: "roles" },
  { title: "Адрес", key: "address" },
  { title: "Телефон", key: "phone" },
]);

const formatRole = (roles) => {
  const roleMap = {
    1: "Клиент",
    2: "Поставщик",
    3: "Прочие",
  };

  return roles.map((role) => roleMap[role] || "Неизвестная роль");
};

const headerButtons = ref([
  {
    name: "create",
    function: () => {
      isCreate.value = true;
    },
  },
  {
    name: "copy",
    function: async () => {
      createBase();
    },
  },
  {
    name: "delete",
    function: () => {
      compute({ page: 1, itemsPerPage: 25, search: "" });
    },
  },
  {
    name: "excel",
    function: () => {
      getExcel();
    },
  },
]);

watch(
  () => isEdit.value,
  (newValue, { page, itemsPerPage, sortBy }, search) => {
    if (newValue === false) {
      getCounterparty({ page, itemsPerPage, sortBy }, search);
    }
  }
);

watch(
  search,
  debounce((newValue) => {
    debounceSearch.value = newValue;
  }, 500)
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
  createOnBase.value = true;
  editItem(markedItem.value);
};

const editItem = (item) => {
  isCreate.value = true;
  isEdit.value = true;
  markedID.value.push(item.id);
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
  createOnBase.value = false;
  setTimeout(() => {
    isEdit.value = false;
  }, 100);

  getCounterparty({});
};

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return massRestoreCounterparty({ page, itemsPerPage, sortBy, search });
  } else {
    return massDel({ page, itemsPerPage, sortBy, search });
  }
};

watch(markedID, (newVal) => {
  markedItem.value = counterparties.value.find((el) => el.id === newVal[0]);
});

const getCounterparty = async ({ page, itemsPerPage, sortBy, search }) => {
  filterDialog.value = false;
  count.value = 0;
  countFilter();

  loading.value = true;
  try {
    const { data } = await counterpartyApi.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    counterparty.value = data.result.data.map((item) => ({
      ...item,
      created_at: showDate(item.created_at),
      roles: formatRole(item.roles),
      balance: 2500,
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
  useFilterCanvasVisible().closeFilterCanvas();
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
    console.error(e);
  }
};

const massRestoreCounterparty = async ({
  page,
  itemsPerPage,
  sortBy,
  search,
}) => {
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
      await getCounterparty({ page, itemsPerPage, sortBy });
      markedID.value = [];
    }
  } catch (e) {
    console.error(e);
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

const getExcel = async () => {
  try {
    const { data } = await counterpartyApi.excel(filterForm.value);
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

const handleCheckboxClick = function (item) {
  lineMarking(item);
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
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          Контрагенты
        </span>
      </div>
      <!-- <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100 align-center">
            <div class="d-flex ga-2 mt-2 me-3">
              <Icons title="Добавить" v-if="createAccess('counterparty')" @click="isCreate = true" name="add" />
              <Icons title="Скопировать" v-if="createAccess('counterparty')" @click="createBase()" name="copy" />
              <Icons
              v-if="removeAccess('counterparty')"
                title="Удалить"
                @click="compute({ page, itemsPerPage, sortBy, search })"
                name="delete"
              />
            </div>
          </div>
        </v-card> -->
      <div class="d-flex justify-between ga-2">
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
          />
        </div>

        <div class="mt-1 filterElement">
          <Icons
            name="filter"
            title="Фильтр"
            @click="useFilterCanvasVisible().toggleFilterCanvas()"
            class="mt-1"
          />
          <span v-if="count !== 0" class="countFilter">{{ count }}</span>
        </div>
      </div>
    </div>

    <div class="table calcWidth">
      <v-data-table-server
        style="height: calc(100vh - 150px)"
        show-select
        v-model="markedID"
        fixed-header
        :items="counterparty"
        :headers="headers"
        :loading="loading"
        items-per-page-text="Элементов на странице:"
        loading-text="Загрузка"
        no-data-text="Нет данных"
        :search="debounceSearch"
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
            @dblclick="editItem(item)"
            :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
          >
            <td>
              <CustomCheckbox
                v-model="markedID"
                :checked="markedID.includes(item.id)"
                @change="handleCheckboxClick(item)"
              >
                <span>{{ item.id }}</span>
              </CustomCheckbox>
            </td>
            <td>
              <span>{{ item.name }}</span>
            </td>
            <td>
              <v-chip
                style="height: 50px !important; max-width: 200px"
                class="d-flex justify-center"
                :color="getListColor(item.deleted_at)"
              >
                <span class="padding: 5px;">{{
                  getListStatus(item.deleted_at)
                }}</span>
              </v-chip>
            </td>
            <td>
              <span>{{ item.balance }}</span>
            </td>
            <td>
              <span>{{ item.roles.join(" ") }}</span>
            </td>
            <td>
              <span>{{ item.address }}</span>
            </td>
            <td>
              <span>{{ item.phone }}</span>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </div>
    <create-counterparty
      :isEdit="isEdit"
      :isOpen="isCreate"
      @toggleIsOpen="toggleModal()"
      :item="markedItem"
      :createOnBase="createOnBase"
      :counterparty="counterparty"
      @computeCounterparty="
        compute({ page, itemsPerPage, sortBy, search });
        toggleModal();
      "
    />

    <filterCanvas>
      <div>
        <div class="d-flex ga-2">
          <custom-filter-text-field
            v-model="filterForm.name"
            placeholder="Контрагент"
            label="Наименование"
          />
          <custom-filter-text-field
            v-model="filterForm.phone"
            placeholder="Тел номер"
            label="Тел номер"
          />
        </div>
        <div class="d-flex ga-2 my-2">
          <custom-filter-text-field
            v-model="filterForm.email"
            placeholder="test@gmail.com"
            label="Почта"
          />
          <custom-filter-text-field
            v-model="filterForm.address"
            placeholder="Адрес"
            label="Адрес"
          />
        </div>
        <div>
          <custom-filter-autocomplete
            min-width="106"
            label="Помечен на удаление"
            v-model="filterForm.deleted"
            :items="markedForDeletion"
          />
        </div>
        <div
          :class="isEdit ? 'justify-space-between' : 'justify-end'"
          class="d-flex justify-space-between ga-5 align-center my-3 w-100"
        >
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
        <div class="d-flex justify-end">
          <div class="d-flex ga-2" style="margin-right: -6%">
            <v-btn color="red" class="btn" @click="closeFilterDialog"
              >сбросить</v-btn
            >
            <v-btn
              :color="BASE_COLOR"
              class="btn"
              @click="
                () => {
                  getCounterparty({});
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
