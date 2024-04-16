<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";
import usersApi from "../../../api/list/user.js";
import { useRouter } from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import storageApi from "../../../api/list/storage.js";
import invertorApi from "../../../api/documents/invertor.js";
import goodApi from "../../../api/list/goods.js";
import { addMessage } from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import { BASE_COLOR } from "../../../composables/constant/colors.js";

const router = useRouter();

const form = reactive({
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
    amount: 1,
    price: null,
  },
]);

const organizations = ref([]);
const storages = ref([]);
const users = ref([]);
const listGoods = ref([]);

const headers = ref([
  { title: "Товары", key: "goods", sortable: false },
  { title: "Количество по учету", key: "currency.name", sortable: false },
  { title: "Количество по факту", key: "currency.name", sortable: false },
  { title: "Разница", key: "currency.name", sortable: false },
]);

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

const getUsers = async () => {
  const { data } = await usersApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  users.value = data.result.data;
  console.log(data);
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

const addNewInvertor = async () => {
  if (validate(form.date, form.organization, form.storage) !== true) return;

  const missingData = goods.value.some(validateItem);
  if (missingData) return;

  const body = {
    date: form.date,
    organization_id: form.organization,
    storage_id: form.storage,
    responsible_person_id: form.user,
    comment: form.comment,
    goods: goods.value.map((item) => ({
      good_id: Number(item.good_id),
      accounting_quantity: Number(item.accounting_quantity),
      actual_quantity: Number(item.actual_quantity),
      difference: Number(item.difference),
    })),
  };

  console.log(body);

  try {
    const res = await invertorApi.add(body);
    if (res.status === 201) {
      showToast(addMessage);
      router.push("/invertory");
    }
  } catch (e) {
    console.log(e);
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
  getOrganizations();
  getStorages();
  getGoods();
  getUsers();
});

watch(
  () => form.counterparty,
  async (id) => {
    form.cpAgreement = null;

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
          <span>Перемещение товаров</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="addNewInvertor" name="add" />
              <Icons title="Скопировать" name="copy" />
              <Icons title="Удалить" name="delete" />
            </div>
          </div>
        </v-card>
      </div>
    </v-col>
    <v-divider />
    <v-divider />
    <div style="background: #fff">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field disabled value="Номер" v-model="form.number" />
          <custom-text-field label="Дата" type="date" v-model="form.date" />
          <custom-autocomplete
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
              style="height: 78vh"
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
