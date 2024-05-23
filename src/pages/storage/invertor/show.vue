<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";

import { useRoute, useRouter } from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import storageApi from "../../../api/list/storage.js";
import invertorApi from "../../../api/documents/invertor.js";
import goodApi from "../../../api/list/goods.js";
import { editMessage } from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import { BASE_COLOR, TITLE_COLOR } from "../../../composables/constant/colors.js";
import {useHasOneOrganization} from '../../../store/hasOneOrganization.js'
import formatDateTime from "../../../composables/date/formatDateTime.js";
import goToHistory from "../../../composables/movementByPage/goToHistory.js";
import goToPrint from "../../../composables/movementByPage/goToPrint.js";
import showDate from "../../../composables/date/showDate.js";



const useOrganization = ref(useHasOneOrganization())
 const router = useRouter();
const route = useRoute();
const doc_name = ref('Инвентаризация товаров')

const form = reactive({
  doc_number: null,
  date: null,
  organization: null,
  organizations: [],
  storage: null,
  user: null,
  storages: [],
  comment: null,
  currency: null,
  accounting_quantity: null,
  actual_quantity: null,
  difference: null,
});

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
  form.date = showDate(data.result.date, '-', true);
  form.organization = {
    id: data.result.organization.id,
    name: data.result.organization.name,
  };
  form.storage = {
    id: data.result.storage.id,
    name: data.result.storage.name,
  };
  form.comment = data.result.comment;
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
    amount: 1,
    price: null,
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

const updateInvertor = async () => {
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
      router.push("/invertory");
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

const totalPriceWithSale = computed(() => {
  let sum = 0;
  if (form.salePercent !== null) {
    sum = totalPrice.value - (totalPrice.value * form.salePercent) / 100;
  } else {
    goods.value.forEach((item) => {
      sum += item.price * item.amount;
    });
    sum -= form.saleInteger;
  }

  return sum;
});

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

watch(
  () => form.counterparty,
  async (data) => {
    form.cpAgreement = null;

    const id = typeof data === "object" ? data.id : data;

    try {
      const res = await cpAgreementApi.getById(id);
      form.currency = {
        id: res.data.result.currency_id.id,
        name: res.data.result.currency_id.name,
      };

      const array =
        Object.prototype.toString.call(res.data.result) === "[object Array]";
      const obj =
        Object.prototype.toString.call(res.data.result) === "[object Object]";

      cpAgreements.value = array
        ? res.data.result
        : obj
        ? [res.data.result]
        : [];
    } catch (e) {
      cpAgreements.value = [];
    }
  }
);

const getHistory = () => {
  router.push({
    name: "documentHistory",
    params: route.params.id,
  });
};

const closeWindow = () => {
  window.close()
}

const isSaleIntegerDisabled = computed(() => !!form.salePercent);
const isSalePercentDisabled = computed(() => !!form.saleInteger);

watch(
  () => form.saleInteger,
  (newValue) => {
    if (!newValue) {
      form.salePercent = "";
    }
  }
);

watch(
  () => form.salePercent,
  (newValue) => {
    if (!newValue) {
      form.saleInteger = "";
    }
  }
);
</script>
<template>
  <div class="document">
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>{{ doc_name }} (просмотр)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex w-100">
            <div class="d-flex items-center ga-2 mt-1 me-3">
              <Button
                  name="history"
                  @click="goToHistory(router, route)"
              />
              <Button
                  name="print"
                  @click="goToPrint(router, route, doc_name)"
              />
              <Button name="save" @click="updateInvertor" />
              <Button name="close" @click="closeWindow" />
            </div>
          </div>
          </div>
        </v-card>
      </div>
    </v-col>
    <v-divider />
    <v-divider />
    <div style="height: calc(99vh - 116px); background: #fff">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field readonly v-model="form.doc_number" />
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
        <div :style="`border: 1px solid ${BASE_COLOR}`" class="rounded">
          <div class="d-flex pa-1 ga-1">
            <Icons
              name="add"
              title="Добавить поле"
              @click="increaseCountOfGoods"
            />
            <Icons name="delete" @click="decreaseCountOfGoods" />
          </div>
          <div class="d-flex flex-column w-100 goods">
            <v-data-table
              style="height: calc(100vh - 250px)"
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
                <tr :key="index">
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
                    <custom-autocomplete
                      v-model="item.good_id"
                      :items="listGoods"
                      min-width="150"
                      max-width="100%"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.accounting_quantity"
                      v-mask="'########'"
                      min-width="50"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.actual_quantity"
                      v-mask="'########'"
                      min-width="50"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.difference"
                      v-mask="'########'"
                      min-width="50"
                    />
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
