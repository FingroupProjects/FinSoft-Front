<script setup>
import {computed, defineEmits, onMounted, reactive, ref, watch} from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast/index.js";
import currentDate from "../../../composables/date/currentDate.js";
import {useRouter} from "vue-router";
import organizationApi from "../../../api/list/organizations.js";
import {addMessage} from "../../../composables/constant/buttons.js";
import {BASE_COLOR, TITLE_COLOR} from "../../../composables/constant/colors.js";
import "../../../assets/css/procurement.css";
import {useConfirmDocumentStore} from "../../../store/confirmDocument.js";
import schedule from "../../../api/list/schedule.js";
import payroll from "../../../api/hr/payroll.js";
import validate from "../../../composables/validate/validate.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import Button from "../../../components/button/button.vue";
import currentDateWithTime from "../../../composables/date/currentDateWithTime.js";

const router = useRouter()
const emits = defineEmits(['changed'])
const confirmDocument = useConfirmDocumentStore()

const form = reactive({
  date: null,
  organization: null,
  month: null,
  comment: null,
  salary: null,
  standart_hours: null,
  employee_id: null,
  employee_name: null,
  fact_hours: null,
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
  {title: 'Оклад', key: 'currency.name', sortable: false},
  {title: 'Рабочие часы', key: 'currency.name', sortable: false},
  {title: 'Зарплата', key: 'currency.name', sortable: false},
  {title: 'Другие оплаты', key: 'currency.name', sortable: false},
  {title: 'Удержание от зарплаты', key: 'currency.name', sortable: false},
  {title: 'Зарплата к оплате', key: 'currency.name', sortable: false},
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
  console.log(1)
  console.log(form.month)
  const body = {
    month_id: form.month,
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
  }

  try {
    const { data } = await payroll.reportCard(body)
    console.log(data.result.data)
    employees.value = data.result.data.map(item => {
      return {
        employee: {
          id: item.employee_id,
          name: item.employee_name,
        },
        fact_salary: factSalary(item),
        other_payments: 0,
        salary_deduction: 0,
        ...item
      }
    })
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


const addNewPayroll = async () => {

  console.log(form.date)
  const body = {
    date: formatDateTime(form.date),
    organization_id: typeof form.organization === 'object' ? form.organization.id : form.organization,
    month_id: form.month,
    comment: form.comment,
    data: employees.value.map((item) => ({
      employee_id: item.employee_id,
      oklad: Number(item.salary),
      salary: Number(item.fact_salary),
      worked_hours:  Number(item.fact_hours),
      another_payments: Number(item.other_payments),
      takes_from_salary: Number(item.salary_deduction),
      payed_salary: totalPrice(item),
    })),
  }
  try {
    const res = await payroll.add(body)
    if (res.status === 201) {
      showToast(addMessage)
      router.push('/hr/payroll')
    }
  } catch (e) {
    console.error(e)
  }
}

const isChanged = () => {
  const {saleInteger, salePercent, organization, month, cpAgreement, storage, currency, date} = form;

  const employeeValues = employees.value.flatMap(good => [good.name, good.number_of_hours, good.number_of_hours_in_fact]);

  const cleanedGoodsValues = employeeValues.filter(val => val !== undefined);
  const valuesToCheck = [saleInteger, salePercent, organization, month, cpAgreement, storage, currency, date, ...cleanedGoodsValues];

  return valuesToCheck.every(val => val === null || val === '' || val === currentDate() || val === "1");
}

const totalPrice = item => {
  return Number(item.fact_salary) - Number(item.salary_deduction) + Number(item.other_payments)
}

const factSalary = item => {
  return Number(item.salary) / 100 * ((100 / Number(item.fact_hours)) * Number(item.standart_hours))
}

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    addNewPayroll()
  }
})

watch([form, employees.value], () => {
  if (!isChanged()) {
    emits('changed', true);
  } else {
    emits('changed', false);
  }
});

onMounted(() => {
  form.date = currentDateWithTime()
  author.value = JSON.parse(localStorage.getItem('user')).name || null
  form.organization = JSON.parse(localStorage.getItem('user')).organization || null

  getOrganizations()
  getMonths()
})

</script>
<template>
  <div class="document">
      <div class="d-flex justify-space-between documentCalcWidth">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Начисление зарплаты (создание)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3 py-2">
              <Button @click="addNewPayroll" name="save1" />
              <Button @click="router.push('/payroll')" name="close" />
            </div>
          </div>
        </v-card>
      </div>
    <v-divider/>
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field disabled value="Номер" v-model="form.number" max-width="180" min-width="90"/>
          <custom-text-field label="Дата" type="datetime-local" class="date" v-model="form.date" max-width="200" min-width="120"/>
          <custom-autocomplete label="Организация" :items="organizations" v-model="form.organization" max-width="180px" min-width="90"/>
          <custom-autocomplete label="Месяц" :items="months" v-model="form.month" max-width="180px" min-width="90"/>
          <span style="height: 10px;">
            <Button name="fill" @click="reportCard()" />
          </span>
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
                    <custom-text-field readonly v-model="item.employee.name" min-width="100" max-width="100%"/>
                  </td>
                  <td>
                    <custom-text-field readonly v-model="item.salary" v-mask="'########'" min-width="80"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.standart_hours" v-mask="'##########'" min-width="80"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.fact_salary"  min-width="80"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.other_payments"  min-width="80"/>
                  </td>
                  <td>
                    <custom-text-field v-model="item.salary_deduction"  min-width="80"/>
                  </td>
                  <td>
                    <custom-text-field readonly :value="totalPrice(item)"  min-width="80"/>
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