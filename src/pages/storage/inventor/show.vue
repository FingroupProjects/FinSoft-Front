<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";

import {useRoute, useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import storageApi from "../../../api/list/storage.js";
import invertorApi from "../../../api/documents/invertor.js";
import goodApi from "../../../api/list/goods.js";
import {approveDocument, editMessage} from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import {FIELD_GOODS, TITLE_COLOR} from "../../../composables/constant/colors.js";
import {useHasOneOrganization} from '../../../store/hasOneOrganization.js'
import formatDateTime from "../../../composables/date/formatDateTime.js";
import goToHistory from "../../../composables/movementByPage/goToHistory.js";
import goToPrint from "../../../composables/movementByPage/goToPrint.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import getStatus from "../../../composables/displayed/getStatus.js";
import Button from "../../../components/button/button.vue";
import CustomSearchableSelect from "../../../components/formElements/CustomSearchableSelect.vue";
import ButtonGoods from "../../../components/button/buttonGoods.vue";


const useOrganization = ref(useHasOneOrganization())
const router = useRouter();
const route = useRoute();
const doc_name = ref('Инвентаризация товаров')

const form = reactive({
  doc_number: null,
  date: null,
  organization: null,
  storage: null,
  user: null,
  comment: null,
  currency: null,
  accounting_quantity: null,
  actual_quantity: null,
  difference: null,
});

const hoveredRowId = ref(null)
const loading = ref(false);
const author = ref(null);
const markedID = ref([]);
const goods = ref([
  {
    id: 1,
    good_id: null,
    difference: 1,
    actual_quantity: 1,
    accounting_quantity: 1,
  },
]);

const organizations = ref([]);
const storages = ref([]);
const listGoods = ref([]);
const users = ref([]);

const headers = ref([
  { title: "Товары", sortable: false },
  { title: "Количество по учету", sortable: false },
  { title: "Количество по факту", sortable: false },
  { title: "Разница", sortable: false },
]);

const getInvertorDetail = async () => {
  const { data } = await invertorApi.getById(route.params.id);
  form.doc_number = data.result.doc_number;
  form.date = getDateTimeInShow(data.result.date, '-', true);
  form.organization = {
    id: data.result.organization.id,
    name: data.result.organization.name,
  };
  form.storage = {
    id: data.result.storage.id,
    name: data.result.storage.name,
  };
  form.comment = data.result.comment;
  form.active = data.result.active;
  form.deleted_at = data.result.deleted_at;
  goods.value = data.result.inventoryGoods.map((item) => ({
    id: item.id,
    good_id: item.good.id,
    difference: item.difference,
    actual_quantity: item.actual_quantity,
    accounting_quantity: item.accounting_quantity,
  }));
  form.user = data.result.responsiblePerson;
};

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const getStorages = async () => {
  const { data } = await storageApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  storages.value = data.result.data;
};

const getSenderStorage = async () => {
  const { data } = await storageApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  storages.value = data.result.data;
};

const getRecipientStorage = async () => {
  const { data } = await storageApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  storages.value = data.result.data;
};

const getGoods = async () => {
  const { data } = await goodApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  listGoods.value = data.result.data;
};

const approve = async () => {
  try {
    await invertorApi.approve({ ids: [route.params.id] });
    showToast(approveDocument);
    await getInvertorDetail();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const unApprove = async () => {
  try {
    await invertorApi.unApprove({ ids: [route.params.id] });
    showToast(approveDocument);
    await getInvertorDetail();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const decreaseCountOfGoods = () => {
  goods.value = goods.value.filter((item) => !markedID.value.includes(item.id));
};

const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
};

const increaseCountOfGoods = () => {
  const missingData = goods.value.some(validateItem);
  if (missingData) return;

  goods.value.push({
    id: goods.value.length + 1,
    good_id: null,
    difference: 1,
    actual_quantity: 1,
    accounting_quantity: 1,
  });
};

const validateItem = (item) => {
  if (item.good_id === null) {
    showToast("Поле Товар не может быть пустым", "warning");
    return true;
  }
  if (item.amount === null) {
    showToast("Поле Количество не может быть пустым", "warning");
    return true;
  }
  return false;
};

const updateInventory = async () => {
  if (validate(form.date, form.organization, form.storage) !== true) return;

  const missingData = goods.value.some(validateItem);
  if (missingData) return;
  if (useOrganization.value.getIsHasOneOrganization) {
    form.organization = useOrganization.value.getOrganization
  }
  const body = {
    date: formatDateTime(form.date),
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    storage_id:
      typeof form.storage === "object" ? form.storage.id : form.storage,
    responsible_person_id:
      typeof form.user === "object" ? form.user.id : form.user,
    goods:
      goods.value.length > 0
        ? goods.value
        : goods.value.map((item) => ({
            good_id: Number(item.good_id),
            difference: Number(item.difference),
            actual_quantity: Number(item.actual_quantity),
            accounting_quantity: Number(item.accounting_quantity),
          })),
    comment: form.comment,
  };
  if (body.goods.length === 0)
    return showToast("Товар объязателен для заполнения", "warning");
  try {
    const res = await invertorApi.update(route.params.id, body);
    if (res.status === 200) {
      showToast(editMessage);
    }
  } catch (e) {
    console.error(e);
  }
};

const totalPrice = computed(() => {
  let sum = 0;
  goods.value.forEach((item) => {
    sum += item.price * item.amount;
  });
  return sum;
});

const closeWindow = () => {
  window.close()
}

onMounted(() => {
  form.date = currentDate();
  author.value = JSON.parse(localStorage.getItem("user")).name || null;

  Promise.all([
    getInvertorDetail(),
    getOrganizations(),
    getStorages(),
    getGoods(),
  ]);
});
</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          {{ doc_name }} (просмотр) -
          {{ getStatus(form.active, form.deleted_at) }}
        </span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2 py-2">
        <div class="d-flex w-100">
          <div class="d-flex w-100">
          <div class="d-flex items-center ga-2 mt-1 me-3">
            <Button name="history" @click="goToHistory(router, route)" />
            <Button name="approve" @click="approve" />
            <Button name="cancel" @click="unApprove" />
            <Button name="print" @click="goToPrint(router, route, doc_name)" />
            <Button name="save" @click="updateInventory" />
            <Button name="close" @click="closeWindow" />
          </div>
        </div>
        </div>
      </v-card>
    </div>
    <v-divider />
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field label="Номер" readonly v-model="form.doc_number" />
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date" />
          <custom-autocomplete
          v-if="!useOrganization.getIsHasOneOrganization"
            label="Организация"
            :items="organizations"
            v-model="form.organization"
          />
          <custom-autocomplete
            label="От.лицо"
            :items="users"
            v-model="form.user"
          />
          <custom-autocomplete
            label="Склад"
            :items="storages"
            v-model="form.storage"
          />
        </div>
      </v-col>
      <v-col>
        <div class="rounded">
          <div class="d-flex flex-column w-100">
            <v-data-table
              class="documentTable"
              items-per-page-text="Элементов на странице:"
              loading-text="Загрузка"
              no-data-text="Нет данных"
              :headers="headers"
              :items="goods"
              v-model="markedID"
              item-value="id"
              page-text="{0}-{1} от {2}"
              :items-per-page-options="[
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
              ]"
              show-select
              fixed-header
            >
              <template v-slot:item="{ item, index }">
                <tr :key="index" @mouseenter="hoveredRowId = item.id" @mouseleave="hoveredRowId = null">
                  <td>
                    <CustomCheckbox
                      v-model="markedID"
                      @change="lineMarking(item)"
                      :checked="markedID.includes(item.id)"
                    >
                      <span>{{ index + 1 }}</span>
                    </CustomCheckbox>
                  </td>
                  <td style="width: 40%">
                    <custom-searchable-select
                        v-model="item.good_id"
                        :items="listGoods"
                        :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                        :organization="form.organization"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.accounting_quantity"
                      :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                      v-mask="'########'"
                      min-width="50"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.actual_quantity"
                      :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                      v-mask="'########'"
                      min-width="50"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.difference"
                      :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                      v-mask="'########'"
                      min-width="50"
                    />
                  </td>
                </tr>
                <tr v-if="index === goods.length - 1">
                  <td></td>
                  <td style="width: 150%" class="d-flex ga-2" colspan="10">
                    <ButtonGoods name="add" @click="increaseCountOfGoods"/>
                    <ButtonGoods v-if="goods.length !== 1" name="delete" @click="decreaseCountOfGoods"/>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
        <div class="d-flex justify-space-between w-100 mt-2 bottomField">
          <div class="d-flex ga-10">
            <custom-text-field
              readonly
              :value="author"
              min-width="140"
              max-width="110"
            />
            <custom-text-field
              label="Комментарий"
              v-model="form.comment"
              min-width="310"
            />
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped></style>
