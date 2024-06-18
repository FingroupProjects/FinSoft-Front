<script setup>
import {computed, defineEmits, defineProps, onMounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import validate from "./validate.js";
import {useRoute, useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import storageApi from "../../../api/list/storage.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import currencyApi from "../../../api/list/currency.js";
import procurementApi from "../../../api/documents/procurement.js";
import goodApi from "../../../api/list/goods.js";
import { editMessage } from "../../../composables/constant/buttons.js";
import "../../../assets/css/procurement.css";
import {BASE_COLOR, TITLE_COLOR} from "../../../composables/constant/colors.js";
import showDate from "../../../composables/date/showDate.js";
import { useConfirmDocumentStore } from "../../../store/confirmDocument.js";
import timeSheet from "../../../api/hr/timeSheet.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import Button from "../../../components/button/button.vue";

const router = useRouter()
const route = useRoute()
const count = ref(0)
const emits = defineEmits(['changed'])
const props = defineProps(['isUpdateOrCreateDocument'])
const confirmDocument = useConfirmDocumentStore()

const form = reactive({
  doc_number: null,
  date: null,
  organization: null,
  month: null,
  comment: null,
})

const author = ref(null)
const markedID = ref([])
const employees = ref([])
const organizations = ref([])
const months = ref([])

const headers = ref([
  {title: 'Сотрудники', key: 'goods', sortable: false},
  {title: 'Кол-во часов по норме', key: 'currency.name', sortable: false},
  {title: 'Кол-во часов по факту', key: 'currency.name', sortable: false},
])

const getTimeSheetDetails = async () => {
  try {
    const { data } = await timeSheet.getById(route.params.id)
    console.log(data)
    form.doc_number = data.data.doc_number
    form.date = getDateTimeInShow(data.data.date, '-', true)
    form.organization = {
      id: data.data.organization.id,
      name: data.data.organization.name
    }
    form.comment = data.data.comment
    employees.value = data.data.employees
  } catch (e) {
    console.log(e)
  }

}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const reportCard = async () => {
  const body = {
    month_id: form.month,
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
  }

  try {
    const { data } = await timeSheet.reportCard(body)
    employees.value = data.result.map(item => ({
      id: item.id,
      name: item.name,
      number_of_hours: item.number_of_hours,
      number_of_hours_in_fact: item.number_of_hours,
      schedule_id: item.schedule_id,
      salary: item.salary
    }))

  } catch (e) {
    console.error(e)
  }
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

const updateTimeSheet = async () => {
  if (validate(form.date, form.organization) !== true) return

 try {
   const body = {
     date: formatDateTime(form.date),
     organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
     comment: form.comment,
   }

   const res = await timeSheet.update(route.params.id, body)
   if (res.status === 200) {
     showToast(editMessage)
     router.push('/timeSheet')
   }
 } catch (e) {
   console.log(e)
 }

}

const closeWindow = () => {
  window.close()
}

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    updateTimeSheet()
  }
})

onMounted( () => {
  author.value = JSON.parse(localStorage.getItem('user')).name || null
  getTimeSheetDetails()

  getOrganizations()
})



</script>
<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4" >
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Табель (просмотр)</span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button @click="updateTimeSheet" name="save1" />
            <Button @click="closeWindow" name="close" />
          </div>
        </div>
      </v-card>
    </div>
    <v-divider />
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field disabled value="Номер" v-model="form.number" max-width="180" min-width="90"/>
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date" max-width="180" min-width="90"/>
          <custom-autocomplete label="Организация" :items="organizations" v-model="form.organization" max-width="180px" min-width="90"/>
          <custom-autocomplete label="Месяц" :items="months" v-model="form.month" max-width="180px" min-width="90"/>
          <Button name="fill" @click="reportCard" />
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
                :items="employees"
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
                    <custom-text-field readonly v-model="item.employee.name" min-width="150" max-width="100%"/>
                  </td>
                  <td>
                    <custom-text-field readonly v-model="item.standart_hours" v-mask="'########'" min-width="50"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.fast_hours" v-mask="'##########'" min-width="80"/>
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
  </div>
</template>

<style scoped>

</style>