<script setup>
import {computed, onMounted, reactive, ref, watch, defineEmits} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";
import {useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import storageApi from "../../../api/list/storage.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import currencyApi from "../../../api/list/currency.js";
import procurementApi from "../../../api/documents/procurement.js";
import goodApi from "../../../api/list/goods.js";
import {addMessage} from "../../../composables/constant/buttons.js";
import {BASE_COLOR} from "../../../composables/constant/colors.js";
import "../../../assets/css/procurement.css";
import { useConfirmDocumentStore } from "../../../store/confirmDocument.js";
import schedule from "../../../api/list/schedule.js";

const router = useRouter()
const emits = defineEmits(['changed'])
const confirmDocument = useConfirmDocumentStore()

const form = reactive({
  date: null,
  organization: null,
  month: null,
  cpAgreement: null,
  storage: null,
  saleInteger: null,
  salePercent: null,
  comment: null,
  currency: null,
})

const author = ref(null)
const markedID = ref([])
const goods = ref([{
  id: 1,
  good_id: null,
  amount: "1",
  price: null,
}])

const organizations = ref([])
const months = ref([])
const cpAgreements = ref([])
const storages = ref([])
const currencies = ref([])
const listGoods = ref([])

const headers = ref([
  {title: 'Сотрудники', key: 'goods', sortable: false},
  {title: 'Кол-во часов по норме', key: 'currency.name', sortable: false},
  {title: 'Кол-во часов по факту', key: 'currency.name', sortable: false},
])

const getOrganizations = async () => {
  const {data} = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getMonths = async () => {
  const {data} = await schedule.month({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  months.value = data.result.data
  console.log(data)
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

const addNewProcurement = async () => {
  if (validate(form.date, form.organization, form.month, form.cpAgreement, form.storage, form.currency) !== true) return

  const missingData = goods.value.some(validateItem)
  if (missingData) return

  const body = {
    date: form.date,
    organization_id: form.organization,
    counterparty_id: form.month,
    counterparty_agreement_id: form.cpAgreement,
    storage_id: form.storage,
    currency_id: typeof form.currency === 'object' ? form.currency.id : form.currency,
    goods: goods.value.map((item) => ({
      good_id: Number(item.good_id),
      amount: Number(item.amount),
      price: Number(item.price),
    }))
  }

  try {
    const res = await procurementApi.add(body)
    if (res.status === 201) {
      showToast(addMessage)
      router.push('/procurementOfGoods')
    }
  } catch (e) {
    console.log(e)
  }
}

const isChanged = () => {
  const {saleInteger, salePercent, organization, month, cpAgreement, storage, currency, date} = form;

  const goodsValues = goods.value.flatMap(good => [good.good_id, good.amount, good.price]);

  const cleanedGoodsValues = goodsValues.filter(val => val !== undefined);
  const valuesToCheck = [saleInteger, salePercent, organization, month, cpAgreement, storage, currency, date, ...cleanedGoodsValues];

  return valuesToCheck.every(val => val === null || val === '' || val === currentDate() || val === "1");
}

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    addNewProcurement()
  }
})

watch([form, goods.value], () => {
  if (!isChanged()) {
    emits('changed', true);
  } else {
    emits('changed', false);
  }
});

onMounted(() => {
  form.date = currentDate()
  author.value = JSON.parse(localStorage.getItem('user')).name || null

  getOrganizations()
  getMonths()
})

</script>
<template>
  <div class="document">
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Табель (создание)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="addNewProcurement" name="add"/>
              <Icons title="Скопировать" @click="" name="copy"/>
              <Icons title="Удалить" @click="" name="delete"/>
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
          <custom-text-field disabled value="Номер" v-model="form.number" max-width="180" min-width="90"/>
          <custom-text-field label="Дата" type="date" v-model="form.date" max-width="180" min-width="90"/>
          <custom-autocomplete label="Организация" :items="organizations" v-model="form.organization" max-width="180px" min-width="90"/>
          <custom-autocomplete label="Месяц" :items="months" v-model="form.month" max-width="180px" min-width="90"/>
          <v-btn :color="BASE_COLOR" class="text-none" @click="">Заполнить</v-btn>
        </div>
      </v-col>
      <v-col>
        <div :style="`border: 1px solid ${BASE_COLOR}`" class="rounded">

          <div class="d-flex flex-column w-100">
            <v-data-table
                style="height: 50vh"
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
                  <td style="width: 40%;">
                    <custom-autocomplete v-model="item.good_id" :items="listGoods" min-width="150" max-width="100%"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.amount" v-mask="'########'" min-width="50"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.price" v-mask="'##########'" min-width="80"/>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
        <div class="d-flex justify-space-between w-100 mt-2 bottomField">
          <div class="d-flex ga-10">
            <custom-text-field readonly :value="author" min-width="110"/>
            <custom-text-field label="Комментарий" v-model="form.comment" min-width="310"/>
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped>
@import "../../../assets/css/procurement.css";

</style>