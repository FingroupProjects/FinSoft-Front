<script setup>
import {
  computed,
  defineEmits,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";
import { useRoute, useRouter } from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import storageApi from "../../../api/list/storage.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import saleApi from "../../../api/documents/sale.js";
import goodApi from "../../../api/list/goods.js";
import {
  addMessage,
  selectOneItemMessage,
} from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import {
  BASE_COLOR,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import { useConfirmDocumentStore } from "../../../store/confirmDocument.js";
import { useHasOneOrganization } from "../../../store/hasOneOrganization.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import currentDateWithTime from "../../../composables/date/currentDateWithTime.js";
import Button from "../../../components/button/button.vue";
import formatNumber from "../../../composables/format/formatNumber.js";
import validateNumberInput from "../../../composables/mask/validateNumberInput.js";
import ButtonGoods from "../../../components/button/buttonGoods.vue";
import getDataBased from "../../../composables/otherQueries/getDataBased.js";
import CustomSearchableSelect from "../../../components/formElements/CustomSearchableSelect.vue";
import formatInputAmount from "../../../composables/format/formatInputAmount.js";
import formatInputPrice from "../../../composables/format/formatInputPrice.js";

const useOrganization = ref(useHasOneOrganization());
const router = useRouter();
const route = useRoute();
const emits = defineEmits(["changed"]);
const confirmDocument = useConfirmDocumentStore();

const form = reactive({
  date: null,
  organization: null,
  counterparty: null,
  cpAgreement: null,
  storage: null,
  saleInteger: null,
  salePercent: null,
  comment: null,
  currency: null,
});

const loading = ref(false);
const author = ref(null);
const markedID = ref([]);
const goods = ref([
  {
    id: 1,
    good_id: null,
    amount: "1",
    price: null,
  },
]);

const organizations = ref([]);
const counterparties = ref([]);
const cpAgreements = ref([]);
const storages = ref([]);
const currencies = ref([]);
const listGoods = ref([]);
const FIELD_GOODS = ref("#274D87");
const hoveredRowId = ref(null);

const headers = ref([
  { title: "Товары", key: "goods", sortable: false },
  { title: "Количество", key: "currency.name", sortable: false },
  { title: "Цена", key: "currency.name", sortable: false },
  { title: "Сумма", key: "currency.name", sortable: false },
]);

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const getCounterparties = async () => {
  try {
    const { data } = await counterpartyApi.get({
      page: 1,
      itemsPerPage: 100000,
      sortBy: "name",
    });
    counterparties.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
};

const getCpAgreements = async (id) => {
  cpAgreements.value = [];
  const { data } = await cpAgreementApi.getCounterpartyById(id);
  cpAgreements.value = data.result.data;
  if (cpAgreements.value.length === 1) {
    form.cpAgreement = cpAgreements.value[0];
  }
};

const getStorages = async () => {
  const { data } = await storageApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  storages.value = data.result.data;
};

const getGoods = async (good_storage_id, good_organization_id) => {
  const search = "";
  const { data } = await goodApi.get(
    {
      page: 1,
      itemsPerPage: 100000,
      sortBy: "name",
    },
    search,
    good_storage_id,
    good_organization_id,
    1
  );
  listGoods.value = data.result.data;
};

const decreaseCountOfGoods = () => {
  if (markedID.value.length === 0) {
    return showToast(selectOneItemMessage, "warning");
  }
  if (markedID.value.length === goods.value.length) {
    goods.value = [];
    return goods.value.push([
      { id: 1, good_id: null, amount: "1", price: null },
    ]);
  }
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
  if (item.price === null) {
    showToast("Поле Цена не может быть пустым", "warning");
    return true;
  }
  return false;
};

const addNewSale = async () => {
  if (
    validate(
      form.date,
      form.counterparty,
      form.cpAgreement,
      form.storage,
      form.currency
    ) !== true
  )
    return;

  const missingData = goods.value.some(validateItem);
  if (missingData) return;

  if (useOrganization.value.getIsHasOneOrganization) {
    form.organization = useOrganization.value.getOrganization;
  }

  const body = {
    date: formatDateTime(form.date),
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    counterparty_id:
      typeof form.counterparty === "object"
        ? form.counterparty.id
        : form.counterparty,
    counterparty_agreement_id:
      typeof form.cpAgreement === "object"
        ? form.cpAgreement.id
        : form.cpAgreement,
    storage_id: form.storage,
    saleInteger: Number(form.saleInteger),
    salePercent: Number(form.salePercent),
    currency_id:
      typeof form.currency === "object" ? form.currency.id : form.currency,
    goods: goods.value.map((item) => ({
      good_id: Number(item.good_id),
      amount: Number(item.amount),
      price: Number(item.price),
    })),
  };

  try {
    const res = await saleApi.add(body);
    if (res.status === 201) {
      showToast(addMessage);
      window.open(`/sellingGoods/${res.data.result.id}`, "_blank");
    }
  } catch (e) {
    console.error(e);
  }
};

const isChanged = () => {
  const {
    saleInteger,
    salePercent,
    counterparty,
    cpAgreement,
    storage,
    currency,
    date,
    comment,
  } = form;

  const goodsValues = goods.value.flatMap((good) => [
    good.good_id,
    good.amount,
    good.price,
  ]);

  const cleanedGoodsValues = goodsValues.filter((val) => val !== undefined);
  const valuesToCheck = [
    saleInteger,
    salePercent,
    counterparty,
    cpAgreement,
    storage,
    currency,
    date,
    comment,
    ...cleanedGoodsValues,
  ];

  return valuesToCheck.every(
    (val) =>
      val === null || val === "" || val === currentDateWithTime() || val === "1"
  );
};

const totalPrice = computed(() => {
  let sum = 0;
  goods.value.forEach((item) => {
    sum += item.price * item.amount;
  });
  return formatNumber(sum);
});

const totalCount = computed(() =>
  goods.value.reduce((acc, item) => acc + Number(item.amount || 0), 0)
);

watch(
  () => form.counterparty,
  async (id) => {
    form.cpAgreement = null;
    const counterpartyId = typeof id === "object" ? id.id : id;
    await getCpAgreements(counterpartyId);
  }
);

watch(
  () => form.cpAgreement,
  (newValue) => {
    if (newValue !== null) {
      const cpAgreement = cpAgreements.value.find((el) =>
        (el.id === typeof newValue) === "object" ? newValue.id : newValue
      );
      form.currency = cpAgreement.currency_id;
    }
  }
);

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    addNewSale();
  }
});

watch([form, goods.value], () => {
  if (!isChanged()) {
    emits("changed", true);
  } else {
    emits("changed", false);
  }
});

watch(
  () => [form.storage, form.organization],
  (newValue) => {
    if (newValue[0] !== null && newValue[1] !== null) {
      const storage_id =
        typeof newValue[0] === "object" ? newValue[0].id : newValue[0];
      const organization_id =
        typeof newValue[1] === "object" ? newValue[1].id : newValue[1];
      getGoods(storage_id, organization_id);
    }
  }
);

onUnmounted(() => {
  emits("changed", false);
});

onMounted(() => {
  form.date = currentDateWithTime();
  author.value = JSON.parse(localStorage.getItem("user")).name || null;
  form.organization =
    JSON.parse(localStorage.getItem("user")).organization || null;

  getDataBased(route.query.id, form, goods, route.query.isClient);
  getOrganizations();
  getCounterparties();
  getStorages();
});
</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          Продажа (создание)
        </span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2 py-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3">
            <Button @click="addNewSale" name="save1" />
            <Button @click="router.push('/sellingGoods')" name="close" />
          </div>
        </div>
      </v-card>
    </div>
    <v-divider />
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field readonly value="Номер" v-model="form.number" />
          <custom-text-field
            label="Дата"
            type="datetime-local"
            class="date"
            v-model="form.date"
          />
          <custom-autocomplete
            v-if="!useOrganization.getIsHasOneOrganization"
            label="Организация"
            :items="organizations"
            v-model="form.organization"
          />
          <custom-autocomplete
            label="Клиент"
            :items="counterparties"
            v-model="form.counterparty"
          />
          <custom-autocomplete
            :disabled="!form.counterparty"
            label="Договор"
            :items="cpAgreements"
            v-model="form.cpAgreement"
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
                <tr
                  :key="index"
                  @mouseenter="hoveredRowId = item.id"
                  @mouseleave="hoveredRowId = null"
                >
                  <td>
                    <CustomCheckbox
                      v-model="markedID"
                      @change="lineMarking(item)"
                      :checked="markedID.includes(item.id)"
                    >
                      <span class="fz-12">{{ index + 1 }}</span>
                    </CustomCheckbox>
                  </td>
                  <td style="width: 40%">
                    <custom-searchable-select
                      :organization="form.organization"
                      :storage="form.storage"
                      v-model="item.good_id"
                      :items="listGoods"
                      :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                      :isAmount="true"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.amount"
                      :value="formatInputAmount(item.amount)"
                      :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                      min-width="50"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      v-model="item.price"
                      :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                      min-width="80"
                      :value="validateNumberInput(item.price)"
                      @input="formatInputPrice(item.price, $event)"
                    />
                  </td>
                  <td>
                    <custom-text-field
                      readonly
                      :value="formatNumber(item.amount * item.price)"
                      :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                      min-width="100"
                    />
                  </td>
                </tr>
                <tr v-if="index === goods.length - 1">
                  <td></td>
                  <td style="width: 150%" class="d-flex ga-2" colspan="10">
                    <ButtonGoods name="add" @click="increaseCountOfGoods" />
                    <ButtonGoods
                      v-if="goods.length !== 1"
                      name="delete"
                      @click="decreaseCountOfGoods"
                    />
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
        <div
          class="d-flex flex-wrap ga-4 justify-space-between w-100 mt-2 bottomField"
        >
          <div class="d-flex ga-10">
            <custom-text-field
              readonly
              v-model="author"
              label="Автор"
              min-width="110"
            />
            <custom-text-field
              label="Комментарий"
              v-model="form.comment"
              min-width="310"
            />
          </div>
          <div class="d-flex ga-6">
            <custom-text-field
              readonly
              label="Количество"
              v-model="totalCount"
              min-width="130"
            />
            <custom-text-field
              readonly
              label="Общая сумма:"
              v-model="totalPrice"
              min-width="180"
              max-width="110"
            />
            <custom-autocomplete
              readonly
              v-model="form.currency"
              label="Валюта"
              :items="currencies"
              min-width="190"
              maxWidth="190px"
            />
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped>
@import "../../../assets/css/procurement.css";
</style>
