<script setup>
import {onMounted, ref, watch, computed} from "vue";

import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import organizationBill from "../../../api/organizationBill.js";
import currencyApi from "../../../api/currency.js";
import organizationApi from "../../../api/organizations.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showDate from "../../../composables/date/showDate.js";
import validate from "./validate.js";
import {createAccess, removeAccess, updateAccess} from "../../../composables/access/access.js";
import {FIELD_COLOR, FIELD_OF_SEARCH} from "../../../composables/constant/colors.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage,
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";

const loading = ref(true);
const showConfirmDialog = ref(false);
const dialog = ref(false);
const idOrganizationBill = ref(null);
const hoveredRowIndex = ref(null);

const filterModal = ref(false);
const dateRef = ref(null);
const bill_number = ref(null);


const comment = ref(null);
const organizationAdd = ref(null);

const currencies = ref([]);

const currencyAdd = ref(null);
const organizations = ref(null);

const isExistsOrganizationBill = ref(false);
const markedID = ref([]);
const markedItem = ref([]);
const organizationBillInDialogTitle = ref(null);
const search = ref("");
const debounceSearch = ref("");
const nameRef = ref(null);
const organizationBills = ref([]);
const paginations = ref([]);

const currenciesCopy = ref([])
const organizationCopy = ref([])
const showModal = ref(false);


const count = ref(0);
const filterForm = ref({
  name: null,
  currency_id: null,
  date: null,
  bill_number: null,
  organization_id: null,
  comment: null,
});

const toggleModal = () => {
  showModal.value = !showModal.value;
};


const headers = ref([
  {title: "Наименование", key: "name"},
  {title: "Баланс", key: "name", sortable: false},
  {title: "Организация", key: "organization.name"},
  {title: "Валюта", key: "currency.name"},
]);

const isOrganizationFieldDisabled = computed(() => {
  return !createAccess('organizations') && !updateAccess('organizations');
});

const isCurrencyFieldDisabled = computed(() => {
  return !createAccess('currencies') && !updateAccess('currencies');
});

function countFilter() {

  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }
  return count;
}


const isDataChanged = () => {
  const item = organizationBills.value.find(item => item.id === idOrganizationBill.value);

  return   nameRef.value !== item.name ||
      organizationAdd.value !== item.organization.id ||
      currencyAdd.value !== item.currency.id ||
      bill_number.value !== item.bill_number ||
      showDate(dateRef.value) !== item.date ||
      comment.value !== item.comment;
};

const checkAndClose = () => {
  if (
      nameRef.value ||
      organizationAdd.value ||
      currencyAdd.value ||
      bill_number.value ||
      dateRef.value ||
      comment.value
  ) {
    showModal.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
};

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false
  showConfirmDialog.value = false;
  cleanForm();
};

const closingWithSaving = async () => {
  if (isExistsOrganizationBill.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: 'id', search: null });
    showModal.value = false
  } else {
    const isValid = validate(
      nameRef,
      organizationAdd,
      currencyAdd,
      bill_number,
      dateRef,
      comment
      );
      showModal.value = false
    if (isValid === true) {
      await addOrganizationBill({ page: 1, itemsPerPage: 10, sortBy: 'id', search: null });
      dialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
      cleanForm();
    }
  }
};


const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }

};


const rules = {
  required: (v) => !!v,
};

const getOrganizationBillData = async ({page, itemsPerPage, sortBy, search}) => {
  const filterData = filterForm.value;
  filterModal.value = false;
  count.value = 0;
  countFilter();

  loading.value = true;
  try {
    const {data} = await organizationBill.getAll({page, itemsPerPage, sortBy}, search, filterData);
    paginations.value = data.result.pagination;
    organizationBills.value =
        data.result.data.map((item) => ({
          ...item,
          date: showDate(item.date),
        })) || [];
    loading.value = false;
  } catch (e) {
  }
};

const addOrganizationBill = async ({page, itemsPerPage, sortBy}) => {
  const body = {
    name: nameRef.value,
    organization_id: organizationAdd.value,
    currency_id: currencyAdd.value,
    bill_number: bill_number.value,
    date: dateRef.value,
    comment: comment.value,
  };

  if (validate(nameRef, bill_number, dateRef, organizationAdd, currencyAdd) !== true)    return;

  const res = await organizationBill.create(body);

  if (res.status === 201) {
    await getOrganizationBillData({page, itemsPerPage, sortBy});
    showToast(addMessage);

    idOrganizationBill.value = res.data.result.id;
    dialog.value = false;

    markedID.value = [];
    markedItem.value = [];
  }
};

const remove = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    const {status} = await organizationBill.remove({ids: markedID.value});

    if (status === 200) {
      showToast(removeMessage, "red");
      await getOrganizationBillData({page, itemsPerPage, sortBy}, search);
      markedID.value = [];
      dialog.value = false;
    }
  } catch (e) {
  }
};

const restore = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    const {status} = await organizationBill.restore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage);
      await getOrganizationBillData({page, itemsPerPage, sortBy}, search);
      markedID.value = [];
      dialog.value = false;
    }
  } catch (e) {
  }
};

const update = async ({page, itemsPerPage, sortBy}) => {
  const body = {
    name: nameRef.value,
    organization_id: organizationAdd.value,
    currency_id: currencyAdd.value,
    bill_number: bill_number.value,
    date: dateRef.value,
    comment: comment.value,
  };
  if (
      validate(nameRef, bill_number, dateRef, organizationAdd, currencyAdd) !==
      true
  )
    return;

  try {
    const {status} = await organizationBill.update(
        idOrganizationBill.value,
        body
    );
    if (status === 200) {
      cleanForm();
      dialog.value = false;
      await getOrganizationBillData({page, itemsPerPage, sortBy});
      showToast(editMessage);
    }
  } catch (e) {
    console.log(e);
  }
};

const getCurrencies = async () => {
  try {
    const {data} = await currencyApi.get({page: 1, itemsPerPage: 100000});

    currencies.value = data.result.data.map((item) => {
      return {
        id: item.id,
        name: item.name,
      };
    });
  } catch (e) {
  }
};

const getOrganizations = async () => {
  try {
    const {data} = await organizationApi.get({
      page: 1,
      itemsPerPage: 100000,
    });

    organizations.value = data.result.data.map((item) => {
      return {
        id: item.id,
        name: item.name,
      };
    });
  } catch (e) {
  }
};

const handleCheckboxClick = (item) => {
  lineMarking(item);
};

watch(markedID, (newVal) => {
  markedItem.value = organizationBills.value.find((el) => el.id === newVal[0]);
});


const openDialog = (item) => {
  dialog.value = true;

  if (item === 0) {
    idOrganizationBill.value = 0;
    isExistsOrganizationBill.value = false;
  } else {
    idOrganizationBill.value = item.id;
    markedID.value.push(item.id);
    isExistsOrganizationBill.value = true;
    nameRef.value = item.name;
    bill_number.value = item.bill_number;
    comment.value = item.comment;
    currencyAdd.value = item.currency.id;
    dateRef.value = item.date.split(".").reverse().join("-");

    organizationAdd.value = item.organization.id;

    organizationBillInDialogTitle.value = item.name;
  }
};

const cleanForm = () => {
  nameRef.value = null;
  bill_number.value = null;
  dateRef.value = null;
  organizationAdd.value = null;
  currencyAdd.value = null;
  comment.value = null;
};


const cleanFilterForm = () => {
  filterForm.value = {};
  count.value = 0
};

const addBasedOnOrganizationBill = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");
  if (markedID.value.length > 1)
    return showToast(selectOneItemMessage, "warning");
  dialog.value = true;

  organizationBills.value.forEach((item) => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name;
      organizationAdd.value = item.organization.id;
      currencyAdd.value = item.currency.id;
      comment.value = item.comment;
      dateRef.value = item.date.split(".").reverse().join("-");
      bill_number.value = item.bill_number;
    }
  });
  isExistsOrganizationBill.value = false

};

const compute = ({page, itemsPerPage, sortBy, search}) => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");

  if (markedItem.value.deleted_at) {
    return restore({page, itemsPerPage, sortBy});
  } else {
    return remove({page, itemsPerPage, sortBy, search});
  }
};

const closeFilterModal = async ({page, itemsPerPage, sortBy, search}) => {
  filterModal.value = false;
  cleanFilterForm();
  await getOrganizationBillData({page, itemsPerPage, sortBy, search});
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = organizationBills.value.find(
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


watch(dialog, (newVal) => {
  if (!newVal) {
    cleanForm();
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
})

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))


onMounted(async () => {
  await getCurrencies();
  await getOrganizations();
  currenciesCopy.value = [...currencies.value];
  organizationCopy.value = [...organizations.value]
})

onMounted(() => {
  console.log(createAccess('organizationBill'))
  console.log(updateAccess('organizationBill'))
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Банковские счета организации</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons v-if="createAccess('organizationBill')" @click="openDialog(0)" name="add" title="Создать"/>
              <Icons v-if="createAccess('organizationBill')" @click="addBasedOnOrganizationBill" title="Скопировать" name="copy"/>
              <Icons v-if="removeAccess('organizationBill')" @click="compute" title="Удалить" name="delete"/>
            </div>

            <div class="w-100">
              <v-text-field
                  v-model="search"
                  :base-color="FIELD_OF_SEARCH"
                  prepend-inner-icon="search"
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
                @click="filterModal = true"
                class="mt-1"
            />

            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
          </div>
        </v-card>
      </div>

      <v-card class="mt-2 table">
        <v-data-table-server
            style="height: 78vh"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            v-model:items-per-page="paginations.per_page"
            :loading="loading"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="organizationBills"
            :item-value="headers.title"
            :search="debounceSearch"
            @update:options="getOrganizationBillData"
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
                <template
                    v-if="hoveredRowIndex === index || markedID.includes(item.id)"
                >
                  <CustomCheckbox
                      v-model="markedID"
                      @click="lineMarking(item)"
                      :checked="markedID.includes(item.id)"
                      @change="handleCheckboxClick(item)"
                  >
                    <span>{{ item.id }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <div class="d-flex align-center">
                    <Icons
                        style="margin-right: 10px; margin-top: 4px"
                        :name="item.deleted_at === null ? 'valid' : 'inValid'"
                    />
                    <span>{{ item.id }}</span>
                  </div>
                </template>
              </td>
              <td>{{ item.name }}</td>
              <td>+2500</td>
              <td>{{ item.organization.name }}</td>
              <td>{{ item.currency.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <!-- Modal -->
      <v-card>
        <v-dialog persistent class="mt-2 pa-2" v-model="dialog" @keyup.esc="isExistsOrganizationBill ? checkUpdate() : checkAndClose()">
          <v-card
              style="border: 2px solid #3ab700"
              min-width="600"
              class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
              rounded="xl"
          >
            <div class="d-flex justify-space-between align-center mb-2">
              <span
              >Банковский счет:
                {{
                  isExistsOrganizationBill
                      ? organizationBillInDialogTitle
                      : "Добавление"
                }}</span
              >
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="removeAccess('organizationBill') && isExistsOrganizationBill" title="Удалить" @click="compute" name="delete"/>
                  <Icons v-if="createAccess('organizationBill') && !isExistsOrganizationBill" @click="addOrganizationBill" title="Сохранить" name="save"/>
                  <Icons v-if="updateAccess('organizationBill') && isExistsOrganizationBill" title="Сохранить" @click="update" name="save"/>
                </div>
                <v-btn
                    @click="isExistsOrganizationBill ? checkUpdate() : checkAndClose({ page, itemsPerPage, sortBy, search, filterData})"

                    variant="text"
                    :size="32"
                    class="pt-2 pl-1"
                >
                  <Icons name="close" title="Закрыть"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" :disabled="!updateAccess('organizationBill') && isExistsOrganizationBill" @submit.prevent="addOrganizationBill">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <div class="d-flex justify-space-between ga-6 mb-3">
                    <v-text-field
                        v-model="nameRef"
                        :rules="[rules.required]"
                        color="green"
                        rounded="md"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        :base-color="FIELD_COLOR"
                        basecolor=""
                        placeholder="Наименование"
                        autofocus
                        label="Наименование"
                        clear-icon="close"
                        clearable
                        hide-details
                    />

                    <span
                        v-if="isExistsOrganizationBill"
                        style="color: red; font-weight: bolder"
                        class="mr-4 mt-1"
                    >2500,00</span
                    >
                  </div>
                  <div class="d-flex ga-2 mb-3">
                    <v-text-field
                        style="max-width: 30%"
                        variant="outlined"
                        :rules="[rules.required]"
                        label="Дата создания"
                        type="date"
                        v-model="dateRef"
                        density="compact"
                        :base-color="FIELD_COLOR"
                        rounded="md"
                        color="green"
                        :append-inner-icon="dateRef ? 'close' : ''"
                        @click:append-inner="dateRef = null"
                        hide-details
                    />
                    <v-text-field
                        v-model="bill_number"
                        :rules="[rules.required]"
                        variant="outlined"
                        :base-color="FIELD_COLOR"
                        label="Номер счёта"
                        density="compact"
                        rounded="md"
                        color="green"
                        :append-inner-icon="bill_number ? 'close' : ''"
                        @click:append-inner="bill_number = null"
                        hide-details
                    />
                    <v-autocomplete
                        style="max-width: 40%; min-width: 40%"
                        v-model="currencyAdd"
                        :disabled="isCurrencyFieldDisabled"
                        no-data-text="Валюта не найдена"
                        color="green"
                        :items="currencies"
                        :base-color="FIELD_COLOR"
                        item-title="name"
                        item-value="id"
                        :rules="[rules.required]"
                        label="Валюта"
                        variant="outlined"
                        density="compact"
                        hide-details
                    />

                  </div>
                  <v-autocomplete
                      no-data-text="Организация не найдена"
                      color="green"
                      v-model="organizationAdd"
                      :items="organizations"
                      item-title="name"
                      :disabled="isOrganizationFieldDisabled"
                      :base-color="FIELD_COLOR"
                      item-value="id"
                      :rules="[rules.required]"
                      label="Организация"
                      variant="outlined"
                      density="compact"
                  />
                  <v-textarea
                      variant="outlined"
                      :base-color="FIELD_COLOR"
                      label="Комментарий"
                      v-model="comment"
                      density="compact"
                      rounded="md"
                      color="green"
                      hide-details
                      :append-inner-icon="comment ? 'close' : ''"
                      @click:append-inner="comment = null"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>
      <v-card>
        <v-dialog persistent class="mt-2 pa-2" v-model="filterModal" @keyup="closeFilterModal">
          <v-card
              style="border: 2px solid #3ab700"
              min-width="600"
              class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
              rounded="xl"
          >
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Фильтр</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                </div>
              </div>
            </div>
            <v-form class="d-flex w-100">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <div class="d-flex justify-space-between ga-6 mb-3">
                    <v-text-field
                        v-model="filterForm.name"
                        color="green"
                        :base-color="FIELD_COLOR"
                        rounded="md"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="Наименование"
                        label="Наименование"
                        autofocus
                        clear-icon="close"
                        clearable
                        hide-details
                    />
                  </div>
                  <div class="d-flex ga-2 mb-3">
                    <v-text-field
                        variant="outlined"
                        label="Дата создания"
                        type="date"
                        :base-color="FIELD_COLOR"
                        style="max-width: 30%"
                        v-model="filterForm.date"
                        density="compact"
                        rounded="md"
                        color="green"
                        :append-inner-icon="filterForm.date ? 'close' : ''"
                        @click:append-inner="filterForm.date = null"
                        hide-details
                    />
                    <v-text-field
                        v-model="filterForm.bill_number"
                        variant="outlined"
                        label="Номер счёта"
                        density="compact"
                        rounded="md"
                        :base-color="FIELD_COLOR"
                        color="green"
                        :append-inner-icon="filterForm.bill_number ? 'close' : ''"
                        @click:append-inner="filterForm.bill_number = null"
                        hide-details
                    />
                    <v-autocomplete
                        style="max-width: 40%; min-width: 40%"
                        v-model="filterForm.currency_id"
                        :items="currencies"
                        item-title="name"
                        :base-color="FIELD_COLOR" 
                        item-value="id"
                        label="Валюта"
                        variant="outlined"
                        color="green"
                        density="compact"
                        hide-details
                    />
                  </div>
                  <v-autocomplete
                      v-model="filterForm.organization_id"
                      :items="organizations"
                      item-title="name"
                      :base-color="FIELD_COLOR"
                      item-value="id"
                      label="Организация"
                      color="green"
                      variant="outlined"
                      density="compact"
                  />
                  <v-textarea
                      variant="outlined"
                      label="Комментарий"
                      :base-color="FIELD_COLOR"
                      v-model="filterForm.comment"
                      density="compact"
                      rounded="md"
                      color="green"
                      hide-details
                      :append-inner-icon="filterForm.comment ? 'close' : ''"
                      @click:append-inner="filterForm.comment = null"
                  />
                  <div class="d-flex justify-end ga-2 mt-2">
                  <v-btn color="red" class="btn" @click="closeFilterModal">сбросить</v-btn>
                  <v-btn color="green" class="btn"  @click="getOrganizationBillData">применить</v-btn>
                </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
        <div v-if="showModal">
          <ConfirmModal :showModal="true" @close="toggleModal()" @closeClear="closeDialogWithoutSaving()" @closeWithSaving="closingWithSaving()"/>
        </div>
      </v-card>
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
