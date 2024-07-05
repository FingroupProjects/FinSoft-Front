<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import validate from "./validate.js";

import {useRoute, useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import storageApi from "../../../api/list/storage.js";
import moveApi from "../../../api/documents/move.js";
import goodApi from "../../../api/list/goods.js";
import {approveDocument, editMessage} from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import {FIELD_GOODS, TITLE_COLOR} from "../../../composables/constant/colors.js";
import {useHasOneOrganization} from '../../../store/hasOneOrganization.js'
import formatDateTime from "../../../composables/date/formatDateTime.js";
import Button from "../../../components/button/button.vue";
import goToHistory from "../../../composables/movementByPage/goToHistory.js";
import goToPrint from "../../../composables/movementByPage/goToPrint.js";
import showDate from "../../../composables/date/showDate.js";
import getStatus from "../../../composables/displayed/getStatus.js";
import formatInputAmount from "../../../composables/format/formatInputAmount.js";
import ButtonGoods from "../../../components/button/buttonGoods.vue";
import CustomSearchableSelect from "../../../components/formElements/CustomSearchableSelect.vue";
import {useFilterCanvasVisible} from "../../../store/canvasVisible.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import GoodErrorCanvas from "../../../components/Errors/goodErrorCanvas.vue";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";

const useOrganization = ref(useHasOneOrganization()) 
const router = useRouter()
const doc_name = ref('Перемещение товаров')
const route = useRoute()

const form = reactive({
  doc_number: null,
  date: null,
  organization: null,
  storage: null,
  sender_storage: null,
  recipient_storage: null,
  comment: null,
})

const loading = ref(false)
const author = ref(null)
const hoveredRowId = ref(null)
const isApproveError = ref(false)
const approveError = ref([])
const markedID = ref([])
const goods = ref([{
  id: 1,
  good_id: null,
  amount: 1,
}])

const organizations = ref([])
const storages = ref([])
const listGoods = ref([])

const headers = ref([
  {title: 'Товары', key: 'goods', sortable: false},
  {title: 'Количество', key: 'currency.name', sortable: false}
])


const getMoveDetails = async () => {
  const { data } = await moveApi.getById(route.params.id)
  form.doc_number = data.data.doc_number
  form.date = getDateTimeInShow(data.data.date, '-', true);
  form.organization = {
    id: data.data.organization_id.id,
    name: data.data.organization_id.name
  }
  form.sender_storage = {
    id: data.data.sender_storage_id.id,
    name: data.data.sender_storage_id.name
  }
  form.recipient_storage = {
    id: data.data.recipient_storage_id.id,
    name: data.data.recipient_storage_id.name
  }
  form.comment = data.data.comment
  form.active = data.data.active;
  form.deleted_at = data.data.deleted_at;
  goods.value = data.data.goods.map(item => ({
    id: item.id,
    good_id: item.good.id,
    amount: item.amount,
  }))
}

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
  storages.value = data.result.data
}

const getRecipientStorage = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  storages.value = data.result.data
}
const getGoods = async () => {
  const { data } = await goodApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  listGoods.value = data.result.data
}

const approve = async () => {
  try {
    await moveApi.approve({ ids: [route.params.id] });
    showToast(approveDocument);
    await getMoveDetails();
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
    await moveApi.unApprove({ ids: [route.params.id] });
    showToast(approveDocument);
    await getMoveDetails();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
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
}

const decreaseCountOfGoods = () => {
  goods.value = goods.value.filter((item) => !markedID.value.includes(item.id))
}

const increaseCountOfGoods = () => {
  const missingData = goods.value.some(validateItem)
  if (missingData) return

  goods.value.push({id: goods.value.length + 1, good_id: null, amount: 1, price: null })
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
  return false
}

const updateMove = async () => {
  if (validate(form.date,form.sender_storage, form.recipient_storage ) !== true) return

  const missingData = goods.value.some(validateItem)
  if (missingData) return
 
  if (useOrganization.value.getIsHasOneOrganization) {
    form.organization = useOrganization.value.getOrganization
  }

   const body = {
    date: formatDateTime(form.date),
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
    sender_storage_id: typeof form.sender_storage === 'object' ? form.sender_storage.id : form.sender_storage,
    recipient_storage_id: typeof form.recipient_storage === 'object' ? form.recipient_storage.id : form.recipient_storage,
    goods: goods.value.map((item) => ({
      id: Number(item.id),
      good_id: Number(item.good_id),
      amount: Number(item.amount),
    }))
   }

   try {
     const res = await moveApi.update(route.params.id ,body)
     if (res.status === 200) {
       showToast(editMessage)
     }
   } catch (e) {
     console.error(e)
   }
}

const totalPrice = computed(() => {
  let sum = 0
  goods.value.forEach(item => {
    sum += item.price * item.amount
  })
  return sum
})

const closeWindow = () => {
  window.close()
}

watch(isApproveError, (newVal) => {
  if (newVal) {
    useFilterCanvasVisible().toggleFilterCanvas();
  }
});

onMounted( () => {
  author.value = JSON.parse(localStorage.getItem('user')).name || null

   Promise.all([
     getOrganizations(),
     getStorages(),
     getGoods(),
     getMoveDetails()
  ])
})

</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth ">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          {{ doc_name }} (просмотр) -
          {{ getStatus(form.active, form.deleted_at) }}
        </span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2 py-2">
        <div class="d-flex w-100">
          <div class="d-flex items-center ga-2 mt-1 me-3">
            <Button name="history" @click="goToHistory(router, route)" />
            <Button name="approve" @click="approve" />
            <Button name="cancel" @click="unApprove" />
            <Button name="print" @click="goToPrint(router, route, doc_name)" />
            <Button name="save1" @click="updateMove" />
            <Button name="close" @click="closeWindow" />
          </div>
        </div>
      </v-card>
    </div>
    <v-divider/>
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field label="Номер" readonly v-model="form.doc_number"/>
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date"/>
          <custom-autocomplete v-if="!useOrganization.getIsHasOneOrganization" label="Организация" :items="organizations"  v-model="form.organization"/>
          <custom-autocomplete label="Склад-отп" :items="storages" v-model="form.sender_storage"/>
          <custom-autocomplete label="Склад-пол" :items="storages" v-model="form.recipient_storage"/>
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
                      <span class="fz-12">{{ index + 1}}</span>
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
                        v-model="item.amount"
                        :value="formatInputAmount(item.amount)"
                        :base-color="
                          hoveredRowId === item.id ? FIELD_GOODS : '#fff'
                        "
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
            <custom-text-field readonly :value="author" min-width="140" max-width="110"/>
            <custom-text-field label="Комментарий" v-model="form.comment" min-width="310"/>
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