<script setup>
import {defineEmits, onMounted, onUnmounted, reactive, ref,} from "vue";
import {TITLE_COLOR } from "@/composables/constant/colors.js";
import {useRoute, useRouter} from "vue-router";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../../api/list/organizations.js";
import Button from "../../../../components/button/button.vue";
import {useHasOneOrganization} from "@/store/hasOneOrganization.js";
import monthApi from "../../../../api/list/schedule.js";
import plan from "@/api/plans/employees.js"
import showToast from "../../../../composables/toast/index.js";
import employeeApi from "../../../../api/list/employee.js"

const router = useRouter();
const useOrganization = ref(useHasOneOrganization())
const emits = defineEmits(["changed"]);
const route = useRoute()
const organizations = ref([]);
const getEmployeeList = ref([])
const months = ref([]);
const listEmployees = ref([])
const form = reactive({
  year: null,
  organization: null,
});

const getEmployeeById = async () => {
  const {data} = await plan.getById(route.params.id);
  form.organization = data.result.organization_id.id
  form.year = data.result.year
  const employeesMap = new Map()

  data.result.employees.forEach(item => {
    const employeeId = item.employee.id
    const monthId = item.month.id;

    if(!employeesMap.has(employeeId)) {
      employeesMap.set(employeeId, {
        id: item.id,
        name: item.storage.name,
        months: {}
      })
     for (let i = 1; i <= 12; i++) {
       employeesMap.get(employeeId).months[i] = null;
     }
     const employeesItem = employeesMap.get(employeeId);
     employeesItem.months[monthId] = item.sum || null

    }
    getEmployeeList.value = Array.from(employeesMap.values()).map(item => {
      const months = {}
      Object.keys(item.months).forEach(monthId => {
        months[monthId] = item.months[monthId] || 0;
      });
      return{
        ...item,
        months
      }
    })
  })
};

const handleInput = (id, monthId, event) =>{
  const value = parseInt(event.target.value);
  const index = getEmployeeList.value.findIndex(
      (item) => item.id === id && monthId in item.months
  )
  if(index !== -1){
    getEmployeeList.value[index].months[monthId] = value;
  }else{
    console.error(`Item with id ${id} not found in getEmployeeList.value`);
  }
}


const getOrganization = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  })
  organizations.value = data.result.data;
}

const getMonth = async () => {
  try {
    const { data } = await monthApi.month()
    months.value = data.result.data;
  }catch (e) {
    console.error(e);
  }

}

onMounted(()=>{
  getMonth()
  getOrganization()
  getEmployeeById()
})

</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4" >
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж сотрудников (просмотр)</span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button @click="updatePlan() " name="save1"  />
            <Button
                @click="router.push('/planningShops')"
                name="close"
            />
          </div>
        </div>
      </v-card>
    </div>
    <div class="documentHeight documentCalcWidth">
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex ga-2 ">
          <custom-autocomplete
              v-if="!useOrganization.getIsHasOneOrganization"
              label="Организация"
              :items="organizations"
              v-model="form.organization"
          />
          <custom-text-field
              label="Год"
              v-model="form.year"
          />
        </div>
      </v-col>
      <v-col>
        <table class="table">
          <thead>
          <tr style="font-weight: 400 !important;">
            <th>Склад</th>
            <th
                v-for="{ id, name } in months" :key="id">
              {{ name }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="{ id, name, months } in getEmployeeList" :key="id">
            <td class="fz-14">{{ name }}</td>
            <td v-for="(sum, monthId) in months" :key="monthId">
              <custom-text-field
                  min-width="20"
                  v-model="months[monthId]"
                  @input="handleInput(id, monthId, $event)"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </v-col>
    </div>
  </div>
</template>

<style scoped>
@import "../../../../assets/css/procurement.css";

.table {
  width: 100%;
  margin-bottom: 20px;
  border: 1px solid #dddddd;
  border-collapse: collapse;
}
.table th {
  font-weight: bold;
  padding: 5px;
  background: #efefef;
  border: 1px solid #dddddd;
}
.table td {
  border: 1px solid #dddddd;
  padding: 5px;
}
</style>