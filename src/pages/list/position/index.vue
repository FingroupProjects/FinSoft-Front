<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import showToast from "../../../composables/toast";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import position from "../../../api/list/position.js";
import Button from "../../../components/button/button.vue";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {
  createAccess,
  removeAccess,
  updateAccess,
} from "../../../composables/access/access.js";
import {
  BASE_COLOR,
  FIELD_COLOR,
  FIELD_OF_SEARCH,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import {
  addMessage,
  editMessage,
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";
import Icons from "../../../composables/Icons/Icons.vue";
import validate from "./validate.js";
import debounce from "lodash.debounce";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import { markedForDeletion } from "../../../composables/constant/items.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus";
import getExcel from "../../../composables/otherQueries/getExcel.js";

const router = useRouter();

const loading = ref(true);
const dialog = ref(false);

const idPosition = ref(null);
const hoveredRowIndex = ref(null);

const isExistsPosition = ref(false);
const markedID = ref([]);
const markedItem = ref([]);
const positionInDialogTitle = ref(null);
const search = ref("");
const debounceSearch = ref("");

const nameRef = ref(null);
const valueRef = ref(null);

const positions = ref([]);
const paginations = ref([]);
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
});

const filterModal = ref(false);

const rules = {
  required: (v) => !!v,
  date: (v) =>
    (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) ||
    "Формат даты должен быть DD-MM-YYYY",
};

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }

  return count;
}

const getPositionData = async ({ page, itemsPerPage, sortBy, search } = {}) => {
  count.value = 0;
  countFilter();
  filterForm.value;

  loading.value = true;
  try {
    const { data } = await position.get(
      { page, itemsPerPage, sortBy },
      search,
      filterForm.value
    );
    paginations.value = data.result.pagination;
    positions.value = data.result.data;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const cleanFilterForm = () => {
  filterForm.value = {};
};

const closeFilterModal = async () => {
  filterModal.value = false;
  cleanFilterForm();
  await getPositionData();
  useFilterCanvasVisible().closeFilterCanvas();
};

const addPosition = async () => {
  if (validate(nameRef) !== true) return;

  try {
    const body = {
      name: nameRef.value,
    };

    const res = await position.add(body);
    if (res.status === 201) {
      await getPositionData();
      showToast(addMessage);
      valueRef.value = null;
      idPosition.value = res.data.result.id;
      dialog.value = false;
      markedID.value = [];
      markedItem.value = [];
    }
  } catch (error) {
    console.log(error);
  }
};

const massDel = async () => {
  const body = {
    ids: markedID.value,
  };
  try {
    const { status } = await position.massDeletion(body);

    if (status === 200) {
      showToast(removeMessage, "red");
      await getPositionData();
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const massRestore = async () => {
  const body = {
    ids: markedID.value,
  };

  try {
    const { status } = await position.massRestore(body);

    if (status === 200) {
      showToast(restoreMessage, "green");
      await getPositionData();
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
    const { status } = await position.update(idPosition.value, body);
    if (status === 200) {
      await getPositionData();
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
    idPosition.value = 0;
    isExistsPosition.value = false;
  } else {
    idPosition.value = item.id;
    markedID.value.push(item.id);
    isExistsPosition.value = true;
    nameRef.value = item.name;
    positionInDialogTitle.value = nameRef.value;
  }
};
const addBasedOnPosition = () => {
  if (markedID.value.length !== 1 && !isExistsPosition.value)
    return showToast(selectOneItemMessage, "warning");
  dialog.value = true;

  positions.value.forEach((item) => {
    if (markedID.value[0] === item.id) {
      idPosition.value = item.id;
      nameRef.value = item.name;
    }
  });

  isExistsPosition.value = false;
};

const compute = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");

  if (markedItem.value.deleted_at) {
    return massRestore();
  } else {
    return massDel();
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = positions.value.find(
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
  const item = positions.value.find((elem) => elem.id === idPosition.value);

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
  if (isExistsPosition.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: "id", search: null });
    showModal.value = false;
  } else {
    const isValid = validate(nameRef);
    showModal.value = false;
    if (isValid === true) {
      await addPosition({
        page: 1,
        itemsPerPage: 10,
        sortBy: "id",
        search: null,
      });
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
  markedID.value.push(idPosition.value);
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
  markedItem.value = positions.value.find((el) => el.id === newVal[0]);
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
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Должности</span>
      </div>
      <div class="d-flex align-center ga-2">
        <div class="d-flex justify-end">
          <div class="d-flex ga-2 mb-3 mr-2">
            <Button
              v-if="createAccess('position')"
              @click="openDialog(0)"
              name="create"
            />
            <Button
              v-if="createAccess('position')"
              @click="addBasedOnPosition"
              name="copy"
            />
            <Button
              v-if="removeAccess('position')"
              @click="compute"
              name="delete"
            />
            <Button name="excel" @click="getExcel(position, 'Должности')" />
          </div>

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

        <div class="filterElement">
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
        :items="positions"
        :item-value="headers.title"
        @update:options="getPositionData"
        show-select
        v-model="markedID"
        page-text="{0}-{1} от {2}"
        :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        :search="debounceSearch"
        fixed-header
        hover
      >
        <template v-slot:item="{ item, index }">
          <tr
            @mouseenter="hoveredRowIndex = index"
            @mouseleave="hoveredRowIndex = null"
            :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
            @dblclick="openDialog(item)"
          >
            <td style="width: 150px">
              <CustomCheckbox
                v-model="markedID"
                :checked="markedID.includes(item.id)"
                @change="handleCheckboxClick(item)"
              >
                <span>{{ item.id }}</span>
              </CustomCheckbox>
            </td>
            <td style="width: 150px">
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
        @keyup.esc="isExistsPosition ? checkUpdate() : checkAndClose()"
      >
        <v-card
          :style="`border: 2px solid ${BASE_COLOR}`"
          min-width="400"
          min-height="130"
          class="d-flex pa-4 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>{{
              isExistsPosition
                ? positionInDialogTitle + " (изменение)"
                : "Добавление"
            }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2">
                <Icons
                  title="Удалить"
                  v-if="removeAccess('position') && isExistsPosition"
                  @click="destroy"
                  name="delete"
                />
                <Icons
                  title="Сохранить"
                  v-if="createAccess('position') && !isExistsPosition"
                  @click="addPosition"
                  name="save"
                />
                <Icons
                  title="Сохранить"
                  v-if="updateAccess('position') && isExistsPosition"
                  @click="update"
                  name="save"
                />
                <Icons
                  name="close"
                  @click="isExistsPosition ? checkUpdate() : checkAndClose()"
                  title="Закрыть"
                />
              </div>
            </div>
          </div>
          <v-form
            class="d-flex w-100"
            :disabled="!updateAccess('position') && isExistsPosition"
            @submit.prevent="addPosition"
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
                  autofocus
                  placeholder="Бухгалтер"
                  label="Наименование"
                  clear-icon="close"
                  hide-details
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
        @close="toggleModal"
        @closeClear="closeDialogWithoutSaving"
        @closeWithSaving="closingWithSaving()"
      />
    </div>
    <filter-canvas>
      <div class="d-flex ga-2 w-100">
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
      <div class="d-flex justify-end">
        <div class="d-flex ga-2" style="margin-right: -6%">
          <v-btn color="red" class="btn" @click="closeFilterModal"
            >сбросить
          </v-btn>
          <v-btn
            :color="BASE_COLOR"
            class="btn"
            @click="
              () => {
                getPositionData({});
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
