<script setup>
import {approveDocument, editMessage, selectOneItemMessage} from "../../../composables/constant/buttons.js";
import {computed, defineEmits, defineProps, onMounted, reactive, ref, watch} from "vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import validateNumberInput from "../../../composables/mask/validateNumberInput.js";
import {FIELD_GOODS, TITLE_COLOR} from "../../../composables/constant/colors.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import goToHistory from "../../../composables/movementByPage/goToHistory.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {useConfirmDocumentStore} from "../../../store/confirmDocument.js";
import formatInputPrice from "../../../composables/format/formatInputPrice.js";
import goToPrint from "../../../composables/movementByPage/goToPrint.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import formatNumber from "../../../composables/format/formatNumber.js";
import ButtonGoods from "../../../components/button/buttonGoods.vue";
import getStatus from "../../../composables/displayed/getStatus.js";
import equipmentApi from "../../../api/documents/equipment.js";
import organizationApi from "../../../api/list/organizations.js";
import showToast from "../../../composables/toast/index.js";
import Button from "../../../components/button/button.vue";
import storageApi from "../../../api/list/storage.js";
import {useRoute, useRouter} from "vue-router";
import goodApi from "../../../api/list/goods.js";
import "../../../assets/css/procurement.css";
import validate from "./validate.js";
import goodsDelete from "../../../composables/goods/goodsDel"
import CustomSearchableSelect from "../../../components/formElements/CustomSearchableSelect.vue";
import toDecimal from "../../../composables/format/toDecimal.js";
import formatInputAmount from "../../../composables/format/formatInputAmount.js";

const router = useRouter();
const route = useRoute();
const count = ref(0);
const emits = defineEmits(["changed", "click"]);
const props = defineProps(["isUpdateOrCreateDocument"]);
const confirmDocument = useConfirmDocumentStore();

const tempForm = ref({});

const form = reactive({
  doc_number: null,
  date: null,
  organization: null,
  counterparty: null,
  cpAgreement: null,
  storage: null,
  saleInteger: null,
  salePercent: null,
  comment: null,
  currency: null,
  active: null,
  deleted_at: null,
  totalPrice: 0,
  good: null,
});

const itemsPerPage = ref(10000);
const author = ref(null);
const markedID = ref([]);
const goods = ref([]);
const doc_name = ref("Комплектация");

const deletedGoods = ref([]);
const organizations = ref([]);
const counterparties = ref([]);
const cpAgreements = ref([]);
const storages = ref([]);
const currencies = ref([]);
const listGoods = ref([]);
const prevForm = ref({});
const prevGoods = ref([]);
const hoveredRowId = ref(null);

const headers = ref([
  { title: "Товары", key: "goods", sortable: false },
  { title: "Количество", key: "currency.name", sortable: false },
  { title: "Цена", key: "currency.name", sortable: false },
  { title: "Сумма", key: "currency.name", sortable: false },
]);

const approve = async () => {
  try {
    await equipmentApi.approve({ ids: [route.params.id] });
    showToast(approveDocument);
    await getEquipmentDetails();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const unApprove = async () => {
  try {
    await equipmentApi.unApprove({ ids: [route.params.id] });
    showToast(approveDocument);
    await getEquipmentDetails();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const getEquipmentDetails = async () => {
  try {
    const { data } = await equipmentApi.getById(route.params.id);
    console.log(data)
    form.doc_number = data.result.doc_number;
    form.date = getDateTimeInShow(data.result.date, "-", true);
    form.organization = {
      id: data.result.organization.id,
      name: data.result.organization.name,
    };
    form.storage = {
      id: data.result.storage.id,
      name: data.result.storage.name,
    };
    form.good = {
      id: data.result.good.id,
      name: data.result.good.name,
    };
    goods.value = data.result.goods.map((item) => ({
      id: item.id,
      good_id: item.good.id,
      amount: item.amount,
      price: item.price,
    }));
    form.comment = data.result.comment;
    form.active = data.result.active;
    form.deleted_at = data.result.deleted_at;
  } catch (e) {
    console.error(e);
  }
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


const getGoods = async () => {
  const { data } = await goodApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
    search: '',
  });
  listGoods.value = data.result.data;
};

const decreaseCountOfGoods = () => {
  deletedGoods.value = markedID.value;
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
  const { id } = item;
  if (id === null || id === undefined) {
    return;
  }
  const index = markedID.value.indexOf(id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(id);
  }
};

const increaseCountOfGoods = () => {
  const missingData = goods.value.some(validateItem);
  if (missingData) return;

  goods.value.push({
    id: null,
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

const updateEquipment = async () => {
  if (
    validate(
      form.date,
      form.organization,
      form.storage,
      form.good,
      form.totalPrice,
      goods.value
    ) !== true
  )
    return;

  const missingData = goods.value.some(validateItem);
  if (missingData) return;

  try {
    const body = {
      date: formatDateTime(form.date),
      organization_id:
        typeof form.organization === "object"
          ? form.organization.id
          : form.organization,
      storage_id:
        typeof form.storage === "object" ? form.storage.id : form.storage,
      good_id:
          typeof form.good === "object" ? form.good.id : form.good,
      amount: 1,
      sum: Number(form.totalPrice),
      comment: form.comment,
      goods: goods.value.map((item) => ({
        id: item.id,
        good_id: Number(item.good_id),
        amount: Number(item.amount),
        price: toDecimal(item.price),
        sum: Number(item.price) * Number(item.amount),
      })),
    }

    if(deletedGoods.value.length > 0){
      goodsDelete(deletedGoods.value)
    }
    const res = await equipmentApi.update(route.params.id, body);
    console.log(res)
    if (res.status === 200) {
      showToast(editMessage);
    }
  } catch (e) {
    console.error(e);
  }
};

const totalCount = computed(() =>
  goods.value.reduce((acc, item) => acc + Number(item.amount || 0), 0)
);

const arraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return true;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (JSON.stringify(arr1[i]) !== JSON.stringify(arr2[i])) {
      return true;
    }
  }

  return false;
};

const checkDataChanges = () => {
  count.value++;
  const formDataChanged =
    JSON.stringify(tempForm.value) !== JSON.stringify(prevForm.value);
  const isArraysEqual = arraysEqual(goods.value, prevGoods.value);
  return formDataChanged || isArraysEqual;
};

watch(form, () => {
  if (count.value === 0) {
    checkDataChanges();
  } else {
    if (checkDataChanges()) {
      emits("changed", true);
    } else {
      emits("changed", false);
    }
  }
});

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    updateEquipment();
  }
});

const closeWindow = () => {
  window.close()
}

onMounted(() => {
  author.value = JSON.parse(localStorage.getItem("user")).name || null;
  getEquipmentDetails();

  Promise.all([
    getOrganizations(),
    getStorages(),
    getGoods()
  ])
})

</script>
<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          Комплектация (просмотр) - {{ getStatus(form.active, form.deleted_at) }}
        </span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button name="history" @click="goToHistory(router, route)" />
            <Button name="approve" @click="approve" />
            <Button name="cancel" @click="unApprove" />
            <Button name="print" @click="goToPrint(router, route, doc_name)" />
            <Button name="save1" @click="updateEquipment" />
            <Button name="close" @click="closeWindow" />
          </div>
        </div>
      </v-card>
    </div>
    <v-divider />
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field label="Номер" readonly v-model="form.doc_number" />
          <custom-text-field
            class="date"
            label="Дата"
            type="datetime-local"
            v-model="form.date"
          />
          <custom-autocomplete
            label="Организация"
            :items="organizations"
            v-model="form.organization"
          />
          <custom-autocomplete
            label="Склад"
            :items="storages"
            v-model="form.storage"
          />
          <custom-autocomplete
            label="Товар"
            :items="listGoods"
            v-model="form.good"
          />
          <custom-text-field
              label="Цена"
              v-model="form.totalPrice"
          />
        </div>
      </v-col>
      <v-col>
        <div class="rounded">
          <div class="d-flex flex-column">
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
              v-model:items-per-page="itemsPerPage"
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
                        :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                        :items="listGoods"
                        v-model="item.good_id"
                    />
                  </td>
                  <td>
                    <custom-text-field
                        v-model="item.amount"
                        :base-color="
                           hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                        "
                        min-width="50"
                        :value="formatInputAmount(item.amount)"
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
                      v-model="item.summa"
                      :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                      :value="formatNumber(item.amount * item.price)"
                      min-width="100"
                    />
                  </td>
                </tr>
                <tr
                  v-if="index === goods.length - 1"
                  style="height: 60px !important"
                >
                  <td></td>
                  <td style="width: 150%" class="d-flex ga-2 pt-3" colspan="10">
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
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped>

</style>
