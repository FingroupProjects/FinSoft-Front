<script setup>
import { onMounted, ref, watch } from "vue";
import showToast from "../../../composables/toast";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import unit from "../../../api/list/units.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import validate from "../unit/validate";
import {
  BASE_COLOR,
  FIELD_COLOR,
  FIELD_OF_SEARCH,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import {
  addMessage,
  editMessage,
  removeMessage,
  selectOneItemMessage,
  ErrorSelectMessage,
} from "../../../composables/constant/buttons.js";
import {
  createAccess,
  removeAccess,
  updateAccess,
} from "../../../composables/access/access.js";
import Icons from "../../../composables/Icons/Icons.vue";
import Button from "../../../components/button/button.vue";
import { restoreMessage } from "../../../composables/constant/buttons.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import debounce from "lodash.debounce";
import showDate from "../../../composables/date/showDate.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus";
import { markedForDeletion } from "../../../composables/constant/items.js";
import getExcel from "../../../composables/otherQueries/getExcel.js";

const loading = ref(true);
const dialog = ref(false);

const idUnit = ref(null);
const hoveredRowIndex = ref(null);

const isExistsUnit = ref(false);
const markedID = ref([]);
const paginations = ref([]);
const markedItem = ref([]);
const unitInDialogTitle = ref(null);
const search = ref("");
const debounceSearch = ref("");

const nameRef = ref(null);
const valueRef = ref(null);

const units = ref([]);
const showModal = ref(false);
const showConfirmDialog = ref(false);

const count = ref(0);

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const headers = ref([
  { title: "Наименование", key: "name" },
  { title: "Статус", key: "deleted_at" },
]);

const filterForm = ref({
  name: null,
  deleted: null,
});

const filterModal = ref(false);

const rules = {
  required: (v) => !!v,
  date: (v) =>
    (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) ||
    "Формат даты должен быть DD-MM-YYYY",
};

const deletionStatuses = ["нет", "да"];

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }

  return count;
}

const getUnitData = async ({ page, itemsPerPage, sortBy, search }) => {
  count.value = 0;
  countFilter();

  loading.value = true;
  try {
    const {
      data: { result },
    } = await unit.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    units.value = result.data.map((item) => ({
      ...item,
      date: showDate(item.date),
    }));
    paginations.value = result.pagination;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const cleanFilterForm = () => {
  filterForm.value = {};
};

const closeFilterModal = async ({ page, itemsPerPage, sortBy, search }) => {
  filterModal.value = false;
  cleanFilterForm();
  await getUnitData({ page, itemsPerPage, sortBy, search });
  useFilterCanvasVisible().closeFilterCanvas();
};

const addUnit = async () => {
  if (validate(nameRef) !== true) return;
  try {
    const body = {
      name: nameRef.value,
    };

    const res = await unit.add(body);
    if (res.status === 201) {
      await getUnitData({});
      showToast(addMessage);
      valueRef.value = null;
      idUnit.value = res.data.result.id;
      dialog.value = false;
      markedID.value = [];
      markedItem.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};

const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value,
  };
  console.log(body);
  try {
    const { status } = await unit.massDeletion(body);

    if (status === 200) {
      showToast(removeMessage, "red");
      await getUnitData({ page, itemsPerPage, sortBy }, search);
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const massRestore = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value,
  };

  try {
    const { status } = await unit.massRestore(body);

    if (status === 200) {
      showToast(restoreMessage, "red");
      await getUnitData({ page, itemsPerPage, sortBy }, search);
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const update = async () => {
  if (validate(nameRef) !== true) return;
  const body = {
    name: nameRef.value,
  };

  try {
    const { status } = await unit.update(idUnit.value, body);
    if (status === 200) {
      await getUnitData({});
      showToast(editMessage);

      dialog.value = false;
      nameRef.value = null;
    }
  } catch (e) {
    console.log(e);
  }
};

const handleCheckboxClick = function (item) {
  lineMarking(item);
};

const openDialog = (item) => {
  dialog.value = true;

  if (item === 0) {
    idUnit.value = 0;
    isExistsUnit.value = false;
  } else {
    idUnit.value = item.id;
    markedID.value.push(item.id);
    isExistsUnit.value = true;
    nameRef.value = item.name;
    unitInDialogTitle.value = nameRef.value;
  }
};
const addBasedOnUnit = () => {
  if (markedID.value.length !== 1 && !isExistsUnit.value) {
    return showToast(selectOneItemMessage, "warning");
  }

  dialog.value = true;

  units.value.forEach((item) => {
    if (markedID.value[0] === item.id) {
      idUnit.value = item.id;
      nameRef.value = item.name;
    }
  });

  isExistsUnit.value = false;
};

const compute = (params = {}) => {
  const { page, itemsPerPage, sortBy, search } = params;
  if (markedItem.value.deleted_at !== null) {
    return massRestore({ page, itemsPerPage, sortBy });
  } else {
    return massDel({ page, itemsPerPage, sortBy, search });
  }
}

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = units.value.find(
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
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
  markedItem.value = item;
};

const isDataChanged = () => {
  const item = units.value.find((elem) => elem.id === idUnit.value);

  return nameRef.value !== item.name;
};

const checkAndClose = () => {
  if (nameRef.value) {
    showModal.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
};

const closingWithSaving = async () => {
  if (isExistsUnit.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
    showModal.value = false;
  } else {
    const isValid = validate(nameRef);
    showModal.value = false;
    if (isValid === true) {
      await addUnit({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
      dialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
    }
  }
};

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false;
  showConfirmDialog.value = false;
  nameRef.value = null;
};

const destroy = async () => {
  markedID.value.push(idUnit.value);
  compute({ page: 1, itemsPerPage: 10, sortBy: "id" });
  dialog.value = false;
};

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }
};

watch(markedID, (newVal) => {
  markedItem.value = units.value.find((el) => el.id === newVal[0]);
});

watch(dialog, (newVal) => {
  if (!newVal) {
    nameRef.value = null;
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
});

watch(
  search,
  debounce((newValue) => {
    debounceSearch.value = newValue;
  }, 500)
);
</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"
          >Единица измерения</span
        >
      </div>
      <div class="d-flex justify-between ga-2">
        <div class="d-flex justify-end mb-3">
          <div class="d-flex ga-2">
            <Button
              v-if="createAccess('unit')"
              @click="openDialog(0)"
              name="create"
            />
            <Button
              v-if="createAccess('unit')"
              @click="addBasedOnUnit"
              name="copy"
            />
            <Button
              v-if="removeAccess('unit')"
              @click="compute"
              name="delete"
            />
            <Button name="excel" @click="getExcel(unit, 'Единицы_измерения')" />
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
        <div class="filterElement mt-1">
          <Icons
            name="filter"
            title="фильтр"
            @click="useFilterCanvasVisible().toggleFilterCanvas()"
            class="mt-1"
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
        :items="units"
        :item-value="headers.title"
        :search="debounceSearch"
        @update:options="getUnitData"
        page-text="{0}-{1} от {2}"
        show-select
        v-model="markedID"
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
            @dblclick="openDialog(item)"
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
          </tr>
        </template>
      </v-data-table-server>
    </v-card>

    <!-- Modal -->
    <v-card>
      <v-dialog
        persistent
        class="mt-2 pa-2"
        v-model="dialog"
        @keyup.esc="isExistsUnit ? checkUpdate() : checkAndClose()"
      >
        <v-card
          :style="`border: 2px solid ${BASE_COLOR}`"
          min-width="400"
          min-height="150"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>{{
              isExistsUnit ? unitInDialogTitle + " (изменение)" : "Добавление"
            }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2">
                <Icons
                  title="Удалить"
                  v-if="removeAccess('unit') && isExistsUnit"
                  @click="destroy"
                  name="delete"
                />
                <Icons
                  title="Сохранить"
                  v-if="createAccess('unit') && !isExistsUnit"
                  @click="addUnit()"
                  name="save"
                />
                <Icons
                  title="Сохранить"
                  v-if="updateAccess('unit') && isExistsUnit"
                  @click="update()"
                  name="save"
                />
                <Icons name="close" @click="isExistsUnit ? checkUpdate() : checkAndClose()" title="Закрыть" />
              </div>
            </div>
          </div>
          <v-form
            class="d-flex w-100"
            :disabled="!updateAccess('unit') && isExistsUnit"
            @submit.prevent="addUnit"
          >
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100">
                <v-text-field
                  v-model="nameRef"
                  :rules="[rules.required]"
                  :color="BASE_COLOR"
                  rounded="lg"
                  variant="outlined"
                  :base-color="FIELD_COLOR"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Наименование"
                  label="Наименование"
                  autofocus
                  clear-icon="close"
                  clearable
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>
    <div v-if="showModal">
      <ConfirmModal
        :showModal="true"
        @close="toggleModal()"
        @closeClear="closeDialogWithoutSaving()"
        @closeWithSaving="closingWithSaving()"
      />
    </div>
    <filter-canvas>
      <div>
        <div class="d-flex ga-2">
          <custom-filter-text-field
            v-model="filterForm.name"
            label="Наименование"
          />
          <custom-filter-autocomplete
            label="Помечен на удаление"
            v-model="filterForm.deleted"
            :items="markedForDeletion"
          />
        </div>
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
                getUnitData({});
                useFilterCanvasVisible().closeFilterCanvas();
              }
            "
            >применить</v-btn
          >
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
