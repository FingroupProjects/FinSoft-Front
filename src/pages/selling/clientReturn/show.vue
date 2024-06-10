<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import {useRoute, useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import storageApi from "../../../api/list/storage.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import currencyApi from "../../../api/list/currency.js";
import clientReturnApi from "../../../api/documents/clientReturn.js";
import Button from "../../../components/button/button.vue";
import goodApi from "../../../api/list/goods.js";
import {approveDocument, editMessage, selectOneItemMessage} from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import ButtonGoods from "../../../components/button/buttonGoods.vue";
import validateNumberInput from "../../../composables/mask/validateNumberInput.js";
import formatNumber from "../../../composables/format/formatNumber.js";
import showDate from "../../../composables/date/showDate.js";
import {BASE_COLOR, FIELD_GOODS,TITLE_COLOR} from "../../../composables/constant/colors.js";
import goToPrint from "../../../composables/movementByPage/goToPrint.js";
import goToHistory from "../../../composables/movementByPage/goToHistory.js";
import saleApi from "../../../api/documents/sale.js";
import getStatus from "../../../composables/displayed/getStatus.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import GoodErrorCanvas from "../../../components/Errors/goodErrorCanvas.vue";
import {useFilterCanvasVisible} from "../../../store/canvasVisible.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";

const router = useRouter()
const route = useRoute()
const hoveredRowId = ref(null);

const doc_name = ref("Возврат от клиента");

const form = reactive({
  doc_number: null,
  date: null,
  organization: null,
  organizations: [],
  counterparty: null,
  counterparties: [],
  cpAgreement: null,
  cpAgreements: [],
  storage: null,
  storages: [],
  saleInteger: null,
  salePercent: null,
  comment: null,
  currency: null,
})

const loading = ref(false)
const author = ref(null)
const isApproveError = ref(false);

const markedID = ref([])
const goods = ref([])

const approveError = ref([]);
const organizations = ref([])
const counterparties = ref([])
const cpAgreements = ref([])
const storages = ref([])
const currencies = ref([])
const listGoods = ref([])

const headers = ref([
  {title: 'Товары', key: 'goods', sortable: false},
  {title: 'Количество', key: 'currency.name', sortable: false},
  {title: 'Скидка (процент)', key: 'currency.name', sortable: false},
  {title: 'Скидка (сумма)', key: 'currency.name', sortable: false},
  {title: 'Цена', key: 'currency.name', sortable: false},
  {title: 'Сумма', key: 'currency.name', sortable: false},
])


const getClientReturnDetails = async () => {
  const { data } = await clientReturnApi.getById(route.params.id)
  form.doc_number = data.result.doc_number;
  form.date = getDateTimeInShow(data.result.date, '-', true);
  form.organization = {
    id: data.result.organization.id,
    name: data.result.organization.name
  }
  form.counterparty = {
    id: data.result.counterparty.id,
    name: data.result.counterparty.name
  }
  setTimeout(() => {
    form.cpAgreement = {
      id: data.result.counterpartyAgreement.id,
      name: data.result.counterpartyAgreement.name
    }
  }, 300)
  form.storage = {
    id: data.result.storage.id,
    name: data.result.storage.name
  }
  form.saleInteger = data.result.saleInteger !== 0 ? data.result.saleInteger : null
  form.salePercent = data.result.salePercent !== 0 ? data.result.salePercent : null
  form.comment = data.result.comment
  form.currency = data.result.currency
  form.active = data.result.active;
  form.deleted_at = data.result.deleted_at;
  goods.value = data.result.goods.map(item => ({
    id: item.id,
    good_id: item.good.id,
    amount: item.amount,
    auto_sale_percent: item.auto_sale_percent,
    auto_sale_sum: item.auto_sale_sum,
    price: item.price
  }))
}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getCounterparties = async () => {
  const { data } = await counterpartyApi.getClientCounterparty({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterparties.value = data.result.data 
}

const getCpAgreements = async () => {
  const { data } = await cpAgreementApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  cpAgreements.value = data.result.data
}

const getStorages = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  storages.value = data.result.data
}

const getCurrencies = async () => {
  const { data } = await currencyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  currencies.value = data.result.data
}

const getGoods = async () => {
  const { data } = await goodApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  listGoods.value = data.result.data
}

const decreaseCountOfGoods = () => {
  if (markedID.value.length === 0) {
    return showToast(selectOneItemMessage, "warning");
  }
  if (markedID.value.length === goods.value.length) {
    goods.value = [];
    return goods.value.push([{ id: 1, good_id: null, amount: "1", price: null}])
  }
  goods.value = goods.value.filter((item) => !markedID.value.includes(item.id))
}

const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
}

const increaseCountOfGoods = () => {
  const missingData = goods.value.some(validateItem)
  if (missingData) return

  goods.value.push({id: goods.value.length + 1, good_id: null, amount: 1, auto_sale_percent: null, auto_sale_sum: null,  })
}

const validateItem = (item) => {
  if (item.good_id === null) {
    showToast("Поле Товар не может быть пустым", "warning")
    return true
  }
  if (item.amount === null) {
    showToast("Поле Количество не может быть пустым", "warning")
    return true
  }
  if (item.price === null) {
    showToast("Поле Цена не может быть пустым", "warning")
    return true
  }
  return false
}

const updateClientReturn = async () => {
  if (validate(form.date, form.organization, form.counterparty, form.cpAgreement, form.storage, form.currency) !== true) return

  const missingData = goods.value.some(validateItem)
  if (missingData) return

  const body = {
    date: formatDateTime(form.date),
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
    counterparty_id: typeof form.counterparty === 'object' ? form.counterparty.id : form.counterparty,
    counterparty_agreement_id: typeof form.cpAgreement === 'object' ? form.cpAgreement.id : form.cpAgreement,
    storage_id: typeof form.storage === 'object' ? form.storage.id : form.storage,
    saleInteger: Number(form.saleInteger),
    salePercent: Number(form.salePercent),
    currency_id: typeof form.currency === 'object' ? form.currency.id : form.currency,
    goods: goods.value.map((item) => ({
      id: item.id,
      good_id: Number(item.good_id),
      amount: Number(item.amount),
      auto_sale_percent: Number(item.auto_sale_percent),
      auto_sale_sum: Number(item.auto_sale_sum),
      price: Number(item.price),
    }))
 }

 try {
   const res = await clientReturnApi.update(route.params.id ,body)
   if (res.status === 200) {
     showToast(editMessage)
   }
 } catch (e) {
   console.error(e)
 }
}

const approve = async () => {
  try {
    await clientReturnApi.approve({ ids: [route.params.id] });
    showToast(approveDocument);
    await getClientReturnDetails();
    markedID.value = [];
  } catch (e) {
    console.error(e);
    if (e.response.status === 400) {
      approveError.value = e.response.data.errors;
      isApproveError.value = true;
    }
  }
};

const unApprove = async () => {
  try {
    await clientReturnApi.unApprove({ ids: [route.params.id] });
    showToast(approveDocument);
    await getClientReturnDetails();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const totalPrice = computed(() => {
  let sum = 0
  goods.value.forEach(item => {
    sum += item.price * item.amount
  })
  return sum
})

const totalPriceWithSale = computed(() => {
  let sum = 0
  if (form.salePercent !== null) {
      sum = totalPrice.value - (totalPrice.value * form.salePercent / 100)
  } else {
    goods.value.forEach(item => {
      sum += (item.price * item.amount)
    })
    sum -= form.saleInteger
  }

  return sum
})



const closeWindow = () => {
  window.close()
}
const count = ref(10000)

const isSaleIntegerDisabled = computed(() => !!form.salePercent);
const isSalePercentDisabled = computed(() => !!form.saleInteger);

watch(isApproveError, (newVal) => {
  if (newVal) {
    useFilterCanvasVisible().toggleFilterCanvas();
  }
});

watch(
    () => form.counterparty,
    async (id) => {
      form.cpAgreement = null;
      await getCpAgreements(id);
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

watch(() => form.saleInteger, (newValue) => {
  if (!newValue) {
    form.salePercent = ''
  }
})


watch(() => form.salePercent, (newValue) => {
  if (!newValue) {
    form.saleInteger = ''
  }
})

onMounted( () => {
  author.value = JSON.parse(localStorage.getItem('user')).name || null

  Promise.all([
    getClientReturnDetails(),
    getOrganizations(),
    getCounterparties(),
    getCpAgreements(),
    getStorages(),
    getCurrencies(),
    getGoods(),
  ])

})

</script>
<template>
  <div class="document">
      <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ms-4">
         <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          {{ doc_name }} (просмотр) -
          {{ getStatus(form.active, form.deleted_at) }}
        </span>
      </div>
        <v-card variant="text" class="d-flex align-center ga-2 py-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Button name="history" @click="goToHistory(router, route)" />
              <Button name="approve" @click="approve" />
              <Button name="cancel" @click="unApprove" />
              <Button name="print" @click="goToPrint(router, route, doc_name)" />
              <Button name="save" @click="updateClientReturn" />
              <Button name="close" @click="closeWindow" />
            </div>
          </div>
        </v-card>
      </div>
    <v-divider/>
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field  label="Номер" readonly v-model="form.doc_number"/>
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date"/>
          <custom-autocomplete label="Организация" :items="organizations"  v-model="form.organization"/>
          <custom-autocomplete label="Клиент" :items="counterparties" v-model="form.counterparty"/>
          <custom-autocomplete label="Договор" :items="cpAgreements" v-model="form.cpAgreement"/>
          <custom-autocomplete label="Склад" :items="storages" v-model="form.storage"/>
          <custom-text-field label="Руч. скидка (сумма)" v-mask="'###'" v-model="form.saleInteger" :disabled="isSaleIntegerDisabled"/>
          <custom-text-field label="Руч. скидка (процент)" v-mask="'###'" v-model="form.salePercent" :disabled="isSalePercentDisabled"/>
        </div>
      </v-col>
      <v-col>
        <div class="rounded">
          <div class="d-flex flex-column w-100">
            <v-data-table
                style="height: calc(100vh - 315px)"
                items-per-page-text="Элементов на странице:"
                loading-text="Загрузка"
                no-data-text="Нет данных"
                :headers="headers"
                :items="goods"
                v-model:items-per-page="count"
                v-model="markedID"
                item-value="id"
                page-text='{0}-{1} от {2}'
                :items-per-page-options="[
                  {value: 25, title: '25'},
                  {value: 50, title: '50'},
                  {value: 100, title: '100'},
                ]"
                show-select
                fixed-header
            >
              <template v-slot:item="{ item, index }">
                <tr :key="index"
                    @mouseenter="hoveredRowId = item.id"
                    @mouseleave="hoveredRowId = null"
                    >
                  <td>
                    <CustomCheckbox
                      v-model="markedID"
                      @change="lineMarking(item)"
                      :checked="markedID.includes(item.id)"
                    >
                      <span class="fz-12">{{ index + 1}}</span>
                    </CustomCheckbox>
                  </td>
                  <td style="width: 40%">
                    <custom-autocomplete 
                    v-model="item.good_id" 
                    :items="listGoods" 
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                    min-width="150" 
                    max-width="100%"
                    />
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.amount" 
                    v-mask="'########'" 
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                    min-width="50" 
                    max-width="130" />
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.auto_sale_percent" 
                    v-mask="'##########'" 
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                    min-width="80" 
                    max-width="150"/>
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.auto_sale_sum" 
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                    v-mask="'##########'" 
                    min-width="80" 
                    max-width="140"/>
                  </td> 
                  <td>
                    <custom-text-field 
                     @input="validateNumberInput(item.price)"
                     :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'" 
                     v-mask="'##########'"
                     min-width="80" 
                     max-width="150"/>
                  </td>
                  <td>
                    <custom-text-field 
                    readonly 
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                        :value="formatNumber(item.amount * item.price)"  
                    min-width="100" 
                    max-width="150"/>
                  </td>
                </tr>
                <tr v-if="index === goods.length - 1">
                  <td></td>
                  <td style="width: 150%" class="d-flex ga-2" colspan="10">
                    <ButtonGoods name="add" @click="increaseCountOfGoods" />
                    <ButtonGoods v-if="goods.length !== 1" name="delete" @click="decreaseCountOfGoods" />
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
            v-model="author" 
            min-width="110" 
            label="Автор"
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
            :value="'Сумма со скидкой: ' + totalPriceWithSale" 
            min-width="180" 
            />
            <custom-text-field 
            readonly  
            :value="'Сумма без скидки: ' + totalPrice" 
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
    <filter-canvas
        @closeCanvas="isApproveError = false"
        :isApproveError="isApproveError"
    >
      <goodErrorCanvas :approveError="approveError" />
    </filter-canvas>
  </div>
</template>

<style scoped>

</style>