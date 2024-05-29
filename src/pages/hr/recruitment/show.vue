<script setup>
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import {BASE_COLOR, FIELD_COLOR} from "../../../composables/constant/colors.js";
import {onMounted, reactive, ref} from "vue";
import organizationApi from "../../../api/list/organizations.js";
import employee from "../../../api/list/employee.js";
import recruitment from "../../../api/hr/recruitment.js";
import changeTheDateForSending from "../../../composables/date/changeTheDateForSending.js";
import {useRoute, useRouter} from "vue-router";
import {editMessage} from "../../../composables/constant/buttons.js";
import validate from "../../../composables/validate/validate.js";
import showToast from "../../../composables/toast/index.js";
import showDate from "../../../composables/date/showDate.js";
import schedule from "../../../api/list/schedule.js";

const router = useRouter()
const route = useRoute()

const form = reactive({
  date: null,
  dateOfReceipt: null,
  organization: null,
  position: null,
  department: null,
  employee: null,
  salary: null,
  basis: null,
  schedule: null,
  comment: null,
  author: null,
})

const organizations = ref([])
const employees = ref([])
const positions = ref([])
const departments = ref([])
const schedules = ref([])

const getDismissalDetails = async () => {
  try {
    const {data} = await recruitment.getById(route.params.id)
    form.date = showDate(data.data.date, '-', true)
    form.dateOfReceipt = showDate(data.data.hiring_date, '-', true)
    form.organization = data.data.organization
    form.position = data.data.position
    form.department = data.data.department
    form.employee = data.data.employee
    form.salary = data.data.salary
    form.basis = data.data.basis
    form.comment = data.data.comment
  } catch (e) {
    console.log(e)
  }
}

const getOrganizations = async () => {
  const {data} = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getEmployees = async () => {
  const {data} = await employee.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  employees.value = data.result.data
}

const getPositions = async () => {
  const {data} = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  positions.value = data.result.data
}

const getDepartments = async () => {
  const {data} = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  departments.value = data.result.data
}

const getSchedules = async () => {
  const {data} = await schedule.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  schedules.value = data.result.data
}

const updateRecruitment = async () => {

  const validateValue = [
    {
      "Дата": form.date
    },
    {
      "Организация": form.organization
    },
    {
      "Сотрудник": form.employee
    },
    {
      "Оклад": form.salary
    },
    {
      "Дата приёма": form.dateOfReceipt
    },
    {
      "Должность": form.position
    },
    {
      "Отдел": form.department
    },
    {
      "График работы": form.schedule
    },
    {
      "Основание": form.basis
    },
  ]

  if (validate(validateValue) !== true ) return

  const body = {
    "date": changeTheDateForSending(form.date, '-'),
    "organization_id": typeof(form.organization) === 'object' ? form.organization.id : form.organization,
    "basis": form.basis,
    "department_id": 1,
    "position_id": 1,
    "employee_id": typeof(form.employee) === 'object' ? form.employee.id : form.employee,
    "salary": Number(form.salary),
    "schedule_id": Number(form.schedule),
    "hiring_date": changeTheDateForSending(form.date, '-'),
    "comment": form.comment
  }

  try {
    const res = await recruitment.update(route.params.id, body)
    console.log(res)
    if (res.status === 200) {
      showToast(editMessage)
      router.push('/hr/recruitment')
    }
  } catch (e) {
    console.log(e)
  }

  console.log(body)
}

onMounted(() => {
  form.author = JSON.parse(localStorage.getItem('user')).name || null
  getDismissalDetails()
  getOrganizations()
  getEmployees()
  getPositions()
  getDepartments()
  getSchedules()
})
</script>

<template>
  <div class="document">
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Приём на работу (изменение)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1">
              <Icons title="Добавить" @click="updateRecruitment" name="add"/>
            </div>
          </div>
        </v-card>
      </div>
    </v-col>
    <v-divider/>
    <v-divider/>
    <div style="height: 82.4vh; background: #fff;">
      <v-col style="height: 72vh" class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field disabled value="Номер"/>
          <custom-text-field label="Дата" type="date" v-model="form.date"/>
          <custom-autocomplete label="Организация" :items="organizations" v-model="form.organization"/>
          <custom-autocomplete label="Сотрудник" :items="employees" v-model="form.employee"/>
          <custom-text-field label="Оклад" v-model="form.salary"/>
          <custom-text-field label="Дата приёма" type="date" v-model="form.dateOfReceipt"/>
          <custom-autocomplete label="Должность" :items="positions" v-model="form.position"/>
          <custom-autocomplete label="Отдел" :items="departments" v-model="form.department"/>
          <custom-autocomplete label="График работы" :items="schedules" v-model="form.schedule"/>
        </div>
        <v-textarea
            label="Основание"
            :color="BASE_COLOR"
            :base-color="FIELD_COLOR"
            v-model="form.basis"
            hide-details
            rounded="lg"
            variant="outlined"
            class="w-auto text-sm-body-1"
            density="compact"
        />
      </v-col>
      <v-col class="d-flex ga-2">
        <custom-text-field :value="form.author" readonly/>
        <custom-text-field label="Комментарий" v-model="form.comment" min-width="500" max-width="200"/>
      </v-col>
    </div>
  </div>
</template>

<style scoped>

</style>