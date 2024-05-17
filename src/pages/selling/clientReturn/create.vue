<script setup>
import {computed, defineEmits, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";
import Button from "../../../components/button/button.vue";
import {useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import storageApi from "../../../api/list/storage.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import clientReturnApi from "../../../api/documents/clientReturn.js";
import goodApi from "../../../api/list/goods.js";
import {addMessage,selectOneItemMessage} from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import {BASE_COLOR, FIELD_GOODS} from "../../../composables/constant/colors.js";
import {useConfirmDocumentStore} from "../../../store/confirmDocument.js";
import {useHasOneOrganization} from '../../../store/hasOneOrganization.js'
import currentDateWithTime from "../../../composables/date/currentDateWithTime.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import formatNumber from "../../../composables/format/formatNumber.js";
import validateNumberInput from "../../../composables/mask/validateNumberInput.js";
import ButtonGoods from "../../../components/button/buttonGoods.vue";

const useOrganization = ref(useHasOneOrganization())
const router = useRouter()
const emits = defineEmits(['changed'])
const confirmDocument = useConfirmDocumentStore()
const hoveredRowId = ref(null);

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
})

const loading = ref(false)
const author = ref(null)
const markedID = ref([])
const goods = ref([{
  id: 1,
  good_id: null,
  amount: "1",
  auto_sale_percent: null,
  auto_sale_sum: null,
  price: null,
}])

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

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getCounterparties = async () => {
  const { data } = await counterpartyApi.getClientCounterparty({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterparties.value = data.result.data
}

const getCpAgreements = async (id) => {
  cpAgreements.value = [];
  const { data } = await cpAgreementApi.getCounterpartyById(id);
  cpAgreements.value = data.result.data;
  if (cpAgreements.value.length === 1) {
    form.cpAgreement = cpAgreements.value[0];
  }
}

const getStorages = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  storages.value = data.result.data
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

const addNewClientReturn = async () => {
  if (validate(form.date, form.counterparty, form.cpAgreement, form.storage, form.currency) !== true) return

  const missingData = goods.value.some(validateItem)
  if (missingData) return

  if (useOrganization.value.getIsHasOneOrganization) {
    form.organization = useOrganization.value.getOrganization
  }


  const body = {
    date: formatDateTime(form.date),
    organization_id: typeof form.organization === "object" ? form.organization.id : form.organization,
    counterparty_id: typeof form.counterparty === "object" ? form.counterparty.id : form.counterparty,
    counterparty_agreement_id: typeof form.cpAgreement === "object" ? form.cpAgreement.id : form.cpAgreement,
    storage_id: form.storage ,
    saleInteger: Number(form.saleInteger),
    salePercent: Number(form.salePercent),
    currency_id: typeof form.currency === 'object' ? form.currency.id : form.currency,
    goods: goods.value.map((item) => ({
      good_id: Number(item.good_id),
      amount: Number(item.amount),
      auto_sale_percent: Number(item.auto_sale_percent),
      auto_sale_sum: Number(item.auto_sale_sum),
      price: Number(item.price),
    }))
 }

 try {
   const res = await clientReturnApi.add(body)
   if (res.status === 201) {
     showToast(addMessage)
     router.push('/clientReturn')
   }
 } catch (e) {
   console.error(e)
 }
}

const isChanged = () => {
  const {date, counterparty, cpAgreement, comment, storage, saleInteger, salePercent, currency} = form;

  const goodsValues = goods.value.flatMap(good => [good.good_id, good.amount, good.price, good.price, good.auto_sale_percent, good.auto_sale_sum]);
  const cleanedGoodsValues = goodsValues.filter(val => val !== undefined)

  const valuesToCheck = [date, counterparty, cpAgreement, comment, storage, saleInteger, salePercent, currency, ...cleanedGoodsValues];

  return valuesToCheck.every(val => val === null || val === '' || val === currentDateWithTime() || val === "1");
}

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

const isSaleIntegerDisabled = computed(() => !!form.salePercent);
const isSalePercentDisabled = computed(() => !!form.saleInteger);

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

watch(
    () => form.counterparty,
    async (id) => {
      form.cpAgreement = null;
      await getCpAgreements(id);
    }
)

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
    addNewClientReturn()
  }
})

watch([form, goods.value], () => {
  console.log(!isChanged())
  if (!isChanged()) {
    emits('changed', true);
  } else {
    emits('changed', false);
  }
});

onUnmounted(() => {
  emits('changed', false);
})

onMounted(() => {
  form.date = currentDateWithTime()
  form.organization = JSON.parse(localStorage.getItem('user')).organization || null
  author.value = JSON.parse(localStorage.getItem('user')).name || null

  getOrganizations()
  getCounterparties()
  getStorages()
  getGoods()
})

</script>
<template>
  <div class="document">
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Возврат от клиента (создание)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Button @click="addNewClientReturn" name="save" />
              <Button
                  @click="router.push('/clientReturnСreate')"
                  name="close"
              />
            </div>
          </div>

        </v-card>
      </div>
    </v-col>
    <v-divider/>
    <v-divider/>
    <div style="background: #fff;">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field disabled value="Номер" v-model="form.number"/>
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date"/>
          <custom-autocomplete v-if="!useOrganization.getIsHasOneOrganization" label="Организация" :items="organizations"  v-model="form.organization"/>
          <custom-autocomplete label="Клиент" :items="counterparties" v-model="form.counterparty"/>
          <custom-autocomplete :disabled="!form.counterparty" label="Договор" :items="cpAgreements" v-model="form.cpAgreement"/>
          <custom-autocomplete label="Склад" :items="storages" v-model="form.storage"/>
          <custom-text-field label="Руч. скидка (сумма)" v-mask="'###'" v-model="form.saleInteger" :disabled="isSaleIntegerDisabled"/>
          <custom-text-field label="Руч. скидка (процент)" v-mask="'###'" v-model="form.salePercent" :disabled="isSalePercentDisabled"/>
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
                <tr :key="index" @mouseenter="hoveredRowId = item.id" @mouseleave="hoveredRowId = null">
                  <td>
                    <CustomCheckbox
                      v-model="markedID"
                      @change="lineMarking(item)"
                      :checked="markedID.includes(item.id)"
                    >
                      <span>{{ index + 1}}</span>
                    </CustomCheckbox>
                  </td>
                  <td style="width: 40%">
                    <custom-autocomplete 
                    v-model="item.good_id" 
                    :items="listGoods" 
                    :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                    min-width="150" 
                    max-width="100%"
                    :isAmount="true"
                    />
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.amount" 
                    v-mask="'########'" 
                    min-width="50" 
                    :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                    max-width="130" />
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.auto_sale_percent" 
                    :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                    v-mask="'##########'" 
                    min-width="80" 
                    max-width="150"/>
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.auto_sale_sum" 
                    :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                    v-mask="'##########'" 
                    min-width="80" 
                    max-width="140"/>
                  </td>
                  <td>
                    <custom-text-field 
                    v-model="item.price" 
                    :value="validateNumberInput(item.price)"
                    :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                    v-mask="'##########'" 
                    min-width="80" 
                    max-width="150"/>
                  </td>
                  <td>
                    <custom-text-field 
                    readonly 
                    :value="formatNumber(item.amount * item.price)"  
                    min-width="100" 
                    :base-color="hoveredRowId === item.id ? FIELD_GOODS : '#fff'"
                    max-width="150"/>
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
  </div>
</template>

<style scoped>

</style>