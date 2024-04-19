<script setup>
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import {BASE_COLOR, FIELD_COLOR} from "../../../composables/constant/colors.js";
import {onMounted, reactive, ref} from "vue";
import organizationApi from "../../../api/list/organizations.js";
import employee from "../../../api/list/employee.js";
import currentDate from "../../../composables/date/currentDate.js";

const form = reactive({
  date: null,
  dateOfReceipt: null,
  organization: null,
  position: null,
  department: null,
  employee: null,
  salary: null,
  description: null,
  comment: null,
  author: null,
})

const organizations = ref([])
const employees = ref([])
const positions = ref([])
const departments = ref([])


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

const addRecruitment = async () => {
  const body = {
    ...form
  }

  console.log(body)
}

onMounted(() => {
  form.date = form.dateOfReceipt = currentDate()
  form.author = JSON.parse(localStorage.getItem('user')).name || null

  getOrganizations()
  getEmployees()
  getPositions()
  getDepartments()
})
</script>

<template>
  <div class="document">
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Кадровое перемещение (создание)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1">
              <Icons title="Добавить" @click="addRecruitment" name="add"/>
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
          <custom-text-field label="Дата приёма" type="date" v-model="form.dateOfReceipt"/>
          <custom-autocomplete label="Должность" :items="positions" v-model="form.position"/>
          <custom-autocomplete label="Отдел" :items="departments" v-model="form.department"/>
          <custom-autocomplete label="График работы" :items="[]"/>
        </div>
        <v-textarea
            label="Описание"
            :color="BASE_COLOR"
            :base-color="FIELD_COLOR"
            v-model="form.description"
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