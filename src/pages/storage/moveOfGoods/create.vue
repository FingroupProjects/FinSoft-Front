<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import validate from "./validate.js";

import {useRoute, useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import storageApi from "../../../api/list/storage.js";
import moveApi from "../../../api/documents/move.js";
import goodApi from "../../../api/list/goods.js";
import { addMessage } from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import {BASE_COLOR, TITLE_COLOR} from "../../../composables/constant/colors.js";
import {useHasOneOrganization} from '../../../store/hasOneOrganization.js'
import currentDateWithTime from "../../../composables/date/currentDateWithTime.js";
import Button from "../../../components/button/button.vue";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import getDataBased from "../../../composables/otherQueries/getDataBased.js";

const useOrganization = ref(useHasOneOrganization())
const router = useRouter()
const route = useRoute()

const form = reactive({
  date: null,
  organization: null,
  storage: null,
  sender_storage: null,
  sender_storages: [],
  recipient_storage: null,
  recipient_storages: [],
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
  price: null,
}])

const organizations = ref([])
const storages = ref([])
const sender_storages = ref([])
const recipient_storages = ref([])
const listGoods = ref([])

const headers = ref([
  {title: 'Товары', key: 'goods', sortable: false},
  {title: 'Количество', key: 'currency.name', sortable: false},
])

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getStorages = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  storages.value = data.result.data
}
const getSenderStorage = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  sender_storages.value = data.result.data
}
const getRecipientStorage = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  recipient_storages.value = data.result.data
}

const getGoods = async () => {
  const { data } = await goodApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  listGoods.value = data.result.data
}

const decreaseCountOfGoods = () => {
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

  goods.value.push({id: goods.value.length + 1, good_id: null, amount: 1, price: null })
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
  return false;
};

const addNewMove = async () => {
  if (validate(form.date, form.sender_storage, form.recipient_storage) !== true) return

  const missingData = goods.value.some(validateItem)
  if (missingData) return

  if (useOrganization.value.getIsHasOneOrganization) {
    form.organization = useOrganization.value.getOrganization
  }

  const body = {
    date: formatDateTime(form.date),
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
    sender_storage_id: form.sender_storage,
    recipient_storage_id: form.recipient_storage,
    comment : form.comment, 
    goods: goods.value.map((item) => ({
      good_id: Number(item.good_id),
      amount: Number(item.amount),
    }))
 }

 try {
   const res = await moveApi.add(body)
   if (res.status === 201) {
     showToast(addMessage)
     router.push('/moveOfGoods')
   }
 } catch (e) {
   console.error(e)
 }
}


onMounted(() => {
  form.date = currentDateWithTime()
  form.organization = JSON.parse(localStorage.getItem('user')).organization || null
  author.value = JSON.parse(localStorage.getItem('user')).name || null

  getDataBased(route.query.id, form, goods, route.query.isClient)
  getOrganizations()
  getStorages()
  getGoods()
})
</script>
<template>
  <div class="document">
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="`color: ${TITLE_COLOR}`">Перемещение товаров (создание)</span> 
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">              
              <Button @click="addNewMove" name="save1" />
              <Button
                  @click="router.push('/moveOfGoods')"
                  name="close"
              />
            </div>
          </div>
        </v-card>
      </div>
    </v-col>
    <v-divider/>
    <v-divider/>
    <div style="height: calc(99vh - 116px); background: #fff">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field disabled value="Номер" v-model="form.number"/>
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date"/>
          <custom-autocomplete v-if="!useOrganization.getIsHasOneOrganization" label="Организация" :items="organizations"  v-model="form.organization"/>
          <custom-autocomplete label="Склад-отп" :items="storages" v-model="form.sender_storage"/>
          <custom-autocomplete label="Склад-пол" :items="storages" v-model="form.recipient_storage"/>
        </div>
      </v-col>
      <v-col>
        <div :style="`border: 1px solid ${BASE_COLOR}`" class="rounded">
          <div class="d-flex pa-1 ga-1">
            <Icons name="add" title="Добавить поле" @click="increaseCountOfGoods"/>
            <Icons name="delete" @click="decreaseCountOfGoods"/>
          </div>
          <div class="d-flex flex-column w-100 goods">
            <v-data-table
                style="height: calc(100vh - 305px)"
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
                <tr :key="index" >
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
                    <custom-autocomplete v-model="item.good_id" :items="listGoods"  max-width="200"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.amount" v-mask="'########'" min-width="50" max-width="120" />
                  </td>
                 
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
        <div class="d-flex justify-space-between w-100 mt-2 bottomField">
          <div class="d-flex ga-10">
            <custom-text-field readonly :value="author"  min-width="140" max-width="110"/>
            <custom-text-field label="Комментарий" v-model="form.comment" min-width="310"/>
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped>

</style>