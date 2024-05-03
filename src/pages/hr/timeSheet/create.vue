<script setup>
import {defineEmits, onMounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import {useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import {addMessage} from "../../../composables/constant/buttons.js";
import {BASE_COLOR} from "../../../composables/constant/colors.js";
import "../../../assets/css/procurement.css";
import {useConfirmDocumentStore} from "../../../store/confirmDocument.js";
import schedule from "../../../api/list/schedule.js";
import timeSheet from "../../../api/hr/timeSheet.js";
import validate from "../../../composables/validate/validate.js";

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


const organizations = ref([])
const months = ref([])
const cpAgreements = ref([])
const storages = ref([])
const currencies = ref([])
const listGoods = ref([])
const employees = ref([])

const headers = ref([
  {title: 'Сотрудники', key: 'goods', sortable: false},
  {title: 'Кол-во часов по норме', key: 'currency.name', sortable: false},
  {title: 'Кол-во часов по факту', key: 'currency.name', sortable: false},
])

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getMonths = async () => {
  const {data} = await schedule.month({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  months.value = data.result.data
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


const addNewProcurement = async () => {

  const body = {
    organization_id: form.organization,
    month_id: form.month,
    date: form.date,
    comment: form.comment,
    data: employees.value.map((item) => ({
      employee_id: item.id,
      standart_hours: Number(item.number_of_hours),
      fact_hours:  Number(item.number_of_hours_in_fact),
      schedule_id: item.schedule_id,
      salary: item.salary
    }))
  }

  try {
    const res = await timeSheet.add(body)
    if (res.status === 201) {
      showToast(addMessage)
      router.push('/hr/timeSheet')
    }
  } catch (e) {
    console.log(e)
  }
}

const isChanged = () => {
  const {organization, month, date, comment} = form;
  const valuesToCheck = [organization, month, date, comment];
  console.log(valuesToCheck)
  return valuesToCheck.every(val => val === null || val === '' || val === currentDate() || JSON.stringify(val) === JSON.stringify(JSON.parse(localStorage.getItem('user')).organization));
}

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    addNewProcurement()
  }
})

watch([form, employees.value], () => {
  console.log(!isChanged())
  if (!isChanged()) {
    emits('changed', true);
  } else {
    emits('changed', false);
  }
});

onMounted(() => {
  form.date = currentDate()
  form.organization = JSON.parse(localStorage.getItem('user')).organization || null
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
          <v-btn :color="BASE_COLOR" class="text-none" @click="reportCard">Заполнить</v-btn>
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
                    <custom-text-field readonly v-model="item.name" min-width="150" max-width="100%"/>
                  </td>
                  <td>
                    <custom-text-field readonly v-model="item.number_of_hours" v-mask="'########'" min-width="50"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.number_of_hours_in_fact" v-mask="'##########'" min-width="80"/>
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