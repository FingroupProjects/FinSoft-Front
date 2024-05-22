<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import validate from "./validate.js";
import { useRoute, useRouter } from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import currencyApi from "../../../api/list/currency.js";
import clientOrderApi from "../../../api/documents/clientOrder.js";
import goodApi from "../../../api/list/goods.js";
import { editMessage, selectOneItemMessage } from "../../../composables/constant/buttons.js";
import {BASE_COLOR, TITLE_COLOR, FIELD_GOODS} from "../../../composables/constant/colors.js";
import "../../../assets/css/procurement.css";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import {useHasOneOrganization} from '../../../store/hasOneOrganization.js'
import showDate from "../../../composables/date/showDate.js";
import Button from "../../../components/button/button.vue";
import ButtonGoods from "../../../components/button/buttonGoods.vue";  
import validateNumberInput from "../../../composables/mask/validateNumberInput.js";
import formatNumber from "../../../composables/format/formatNumber.js";
import goToPrint from "../../../composables/movementByPage/goToPrint.js";
import goToHistory from "../../../composables/movementByPage/goToHistory.js";

const useOrganization = ref(useHasOneOrganization())

const router = useRouter()
const route = useRoute()
const hoveredRowId = ref(null);
const doc_name = ref("Заказ от клиента");

const form = reactive({
  doc_number: null,
  date: null,
  shipping_date: null,
  organization: null,
  organizations: [],
  counterparty: null,
  counterparties: [],
  cpAgreement: null,
  cpAgreements: [],
  comment: null,
  currency: null,
  status: null,
})

const loading = ref(false)
const author = ref(null)
const markedID = ref([])
const goods = ref([{
  id: 1,
  good_id: null,
  amount: 1,
  auto_sale_percent: null,
  auto_sale_sum: null,
  price: null,
}])

const organizations = ref([])
const counterparties = ref([])
const cpAgreements = ref([])
const currencies = ref([])
const listGoods = ref([])
const statuses = ref([])

const headers = ref([
  {title: 'Товары', key: 'goods', sortable: false},
  {title: 'Количество', key: 'currency.name', sortable: false},
  {title: 'Cумма без скидки', key: 'currency.name', sortable: false},
  {title: 'Сумма со скидкой', key: 'currency.name', sortable: false},
  {title: 'Цена', key: 'currency.name', sortable: false},
  {title: 'Сумма', key: 'currency.name', sortable: false},
])


const getClientOrderDetails = async () => {
  const { data } = await clientOrderApi.getById(route.params.id)

  form.doc_number = data.result.doc_number
  form.date = data.result.date
  form.shipping_date = data.result.shippingDate
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

  form.comment = data.result.comment
  form.currency = data.result.currency
  goods.value = data.result.orderGoods.map(item => ({
    id: item.id,
    good_id: item.good.id,
    amount: item.amount,
    auto_sale_percent: item.auto_sale_percent,
    auto_sale_sum: item.auto_sale_sum,
    price: item.price,
  }))
}

const getStatuses = async () => {
  const { data } = await clientOrderApi.getStatuses();
  statuses.value = data.result
}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterparties.value = data.result.data
}

const getCpAgreements = async () => {
  const { data } = await cpAgreementApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  cpAgreements.value = data.result.data
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

  goods.value.push({id: goods.value.length + 1, good_id: null, amount: 1, auto_sale_percent: null, auto_sale_sum: null, price: null })
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

const updateProcurement = async () => {
  if (validate(form.date, form.counterparty, form.cpAgreement, form.currency) !== true) return

  const missingData = goods.value.some(validateItem)
  if (missingData) return

  if (useOrganization.value.getIsHasOneOrganization) {
    form.organization = useOrganization.value.getOrganization
  }


  const body = {
    date: formatDateTime(form.date),
    shipping_date: form.shipping_date,
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
    counterparty_id: typeof form.counterparty === 'object' ? form.counterparty.id : form.counterparty,
    counterparty_agreement_id: typeof form.cpAgreement === 'object' ? form.cpAgreement.id : form.cpAgreement,
    currency_id: typeof form.currency === 'object' ? form.currency.id : form.currency,
    comment: form.comment,
    status: form.status,
    summa: totalPrice.value,
    order_status_id: 1,
    goods: goods.value.map((item) => ({
      id: Number(item.id),
      good_id: Number(item.good_id),
      amount: Number(item.amount),
      price: Number(item.price),
      auto_sale_percent: 10,
      auto_sale_sum: 100.5
    }))
 }

 try {
   const res = await clientOrderApi.update(route.params.id ,body)
   if (res.status === 200) {
     showToast(editMessage)
     router.push('/clientOrder')
   }
 } catch (e) {
   console.log(e)
 }
}


const totalPrice = computed(() => {
  let sum = 0
  goods.value.forEach(item => {
    sum += item.price * item.amount
  })
  return sum
})


onMounted( () => {
  author.value = JSON.parse(localStorage.getItem('user')).name || null

  Promise.all([
      getOrganizations(),
      getCounterparties(),
      getCpAgreements(),
      getCurrencies(),
      getStatuses(),
      getGoods(),
      getClientOrderDetails()
  ])
})

const closeWindow = () => {
  window.close();
};
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

const validatePrice = (price) => {
  if (price === 0 || price === '0' || Number(price) === 0) {
    return false;
  }
  return true;
};
const handlePriceInput = (item) => {
  if (!validatePrice(item.price)) {
    item.price = null;  
  }
};
</script>
<template>
  <div class="document">
      <div  class="d-flex justify-space-between">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"
          >{{ doc_name }} (просмотр)</span
        >
        </div>
        <v-card variant="text" style="display: flex; align-items: center">
          <div class="d-flex w-100 justify-end my-3 pr-4">
            <div class="d-flex ga-2">
              <Button
                  name="history"
                  @click="goToHistory(router, route)"
              />
              <Button
                  name="print"
                  @click="goToPrint(router, route, doc_name)"
              />
              <Button name="save" @click="updateProcurement" />
              <Button name="close" @click="closeWindow" />
            </div>
          </div>
        </v-card>
      </div>
    <v-divider/>
    <v-divider/>
    <div style="background: #fff;">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field  :value="form.doc_number"/>   
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date"/>
          <custom-autocomplete v-if="!useOrganization.getIsHasOneOrganization" label="Организация" :items="organizations"  v-model="form.organization"/>
          <custom-autocomplete label="Поставщик" :items="counterparties" v-model="form.counterparty"/>
          <custom-text-field label="Дата" type="date" v-model="form.shipping_date"/>
          <custom-autocomplete label="Договор" :items="cpAgreements" v-model="form.cpAgreement"/>
          <custom-autocomplete label="Статус заказа" :items="statuses" v-model="form.status"/>
        </div>
      </v-col>
      <v-col>
        <div class="rounded">
          <div class="d-flex flex-column w-100">
            <v-data-table
                style="height: 78vh"
                items-per-page-text="Элементов на странице:"
                loading-text="Загрузка"
                no-data-text="Нет данных"
                :headers="headers"
                :items="goods"
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
                    min-width="150" 
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
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
                     />
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.auto_sale_percent" 
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                    v-mask="'##########'" 
                    min-width="80" 
                    max-width="110"/>
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.auto_sale_sum"
                    :base-color="
                        hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                      "
                     v-mask="'##########'" 
                     min-width="80" 
                     max-width="110"/>
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.price" 
                    @input="validateNumberInput(item.price), handlePriceInput(item)"
                    :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'" 
                    min-width="80" 
                    />
                  </td>
                  <td>
                    <custom-text-field 
                    readonly
                    v-model="item.summa"
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
            :value="'Общая сумма: ' + totalPrice" 
            min-width="180" 
            max-width="110"
            />
            <custom-autocomplete 
            v-model="form.currency" 
            label="Валюта" 
            :items="currencies" 
            min-width="110" 
            max-width="110" 
            />
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped>

</style>