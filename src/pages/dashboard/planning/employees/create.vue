<script setup>
import {defineEmits, onMounted, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../../api/list/organizations.js";
import Button from "../../../../components/button/button.vue";
import {useHasOneOrganization} from "../../../../store/hasOneOrganization.js";
import monthApi from "../../../../api/list/schedule.js";
import employeeApi from "../../../../api/list/employee.js"
import {TITLE_COLOR} from "@/composables/constant/colors.js";
import plan from "../../../../api/plans/employees.js"
import showToast from "@/composables/toast/index.js";

const useOrganization = ref(useHasOneOrganization())
const router = useRouter();
const emits = defineEmits(["changed"]);
const organizations = ref([]);
const months = ref([]);
const listEmployees = ref([])
const employees = ref([
  {
    employee_id: null,
    month_id: null,
    quantity: null
  }
])

const form = reactive({
  year: null,
  organization: null,
});

const getMonths = async () => {
  try {
    const { data } = await monthApi.month();
    months.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const getEmployees = async () =>{
  const {data} = await employeeApi.get({page: 1, itemsPerPage: 100});
  listEmployees.value = data.result.data.map(item => ({
      id:item.id,
      name: item.name
  }));
  console.log('list', listEmployees);
}

const handleInput = (employeeId, monthId, event) =>{
  const value = event.target.value;

  const index = employees.value.findIndex((item) =>
      item.employee_id === employeeId && item.month_id === monthId
  );
  if (index !== -1) {
    employees.value[index].quantity = value;
  }else {
    employees.value.push({
      employee_id: employeeId,
      month_id: monthId,
      quantity: value
    })
    console.log(employees.value)
  }
}

const createPlan = async () =>{
  try {
    const updatedEmployee = employees.value
        .filter(item=> item.employee_id !== null && item.month_id !== null && item.quantity !== null)
        .map(item=>({
          employee_id: item.employee_id,
          month_id: item.month_id,
          sum: item.quantity
        }))
      const payload = {
        year: form.year,
        organization_id: form.organization,
        employees: updatedEmployee
      }

      const response = await plan.add(payload);
    console.log(response.data);
    showToast("Успешно добавлено!", "green")
  }catch (e) {
    console.log("Error creating plan", e)
    showToast("Ошибка при создании плана:", 'red')
    if (e.response) {
      console.error('Response data:', e.response.data);
    }
  }
}


onMounted(()=>{
  getMonths()
  getEmployees()
  getOrganizations()
})
</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4" >
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж сотрудников (создание)</span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button @click="createPlan() " name="save1"  />
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
            <th>Сотрудники</th>
            <th v-for="{ id, name } in months" :key="id">
              {{ name }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="{ id: storageId, name: name } in listEmployees" :key="storageId">
            <td class="fz-14">{{ name }}</td>
            <td v-for="{ id: monthId } in months" :key="monthId">
              <custom-text-field
                  min-width="20"
                  @input="handleInput(storageId, monthId, $event)"
              />
            </td>
          </tr>
          </tbody>
        </table>
      </v-col>
    </div>
    <v-divider />
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