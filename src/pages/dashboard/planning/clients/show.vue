<script setup>
import {defineEmits, onMounted, reactive, ref,} from "vue";
import {TITLE_COLOR } from "../../../../composables/constant/colors.js";
import {useRoute, useRouter} from "vue-router";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../../api/list/organizations.js";
import Button from "../../../../components/button/button.vue";
import {useHasOneOrganization} from "../../../../store/hasOneOrganization.js";
import monthApi from "../../../../api/list/schedule.js";
import plan from "../../../../api/plans/client.js"
import showToast from "../../../../composables/toast/index.js";

const router = useRouter();
const useOrganization = ref(useHasOneOrganization())
const emits = defineEmits(["changed"]);
const route = useRoute()
const organizations = ref([]);
const months = ref([]);
const getClietList = ref([])
const form = reactive({
  year: null,
  organization: null,
});
const listClients = ref([
  {
    id: 1,
    name: "Новые клиенты",
    type: "new"
  },
  {
    id: 2,
    name: "Повторные клиенты",
    type: "old"
  }

]);

const getClientById = async () => {
  const {data} = await plan.getById(route.params.id);
  form.organization = data.result.organization;
  form.year = data.result.year;

  const clientMap = new Map();
  data.result.clients.forEach(item => {
    const clientType = item.type
    const monthId = item.month.id;
    console.log(item)
    console.log(item.name)
    if(!clientMap.has(clientType)) {
      clientMap.set(clientType, {
        type: clientType,
        name: item.name,
        months:{}
      });
      for (let i = 1; i <= 12; i++) {
        clientMap.get(clientType).months[i] = null;
      }
    }
    const clientItem = clientMap.get(clientType);
    clientItem.months[monthId] = item.sum || null
  })
  getClietList.value = Array.from(clientMap.values()).map(item => {
    const months = {}
    Object.keys(item.months).forEach(monthId => {
      months[monthId] = item.months[monthId] || 0;
    });
    return{
      ...item,
      months
    }
  })
}
const handleInput = (type, monthId, event) =>{
  const value = parseInt(event.target.value);
  const index = getClietList.value.findIndex(
      (item) => item.type === type && monthId in item.months
  )
  if(index !== -1){
    getClietList.value[index].months[monthId] = value;
  }else{
    console.error(`Item with id ${type} not found in getClietList.value`);
  }
}

const updatePlan = async () =>{
  try {
    const id = route.params.id;

    const payload = {
      year: form.year,
      organization_id: form.organization,
      operationTypes: getClietList.value.map(item=>{
        const clients = []

        Object.keys(item.months).forEach(monthId => {
          clients.push({
            type: item.type,
            month_id: monthId,
            amount: item.months[monthId]
          });
        });
        return clients;
      }).flat()
    }
    showToast("Успешно обновлено", 'green')
    const response = await plan.update(id, payload)
    console.log( response.data);
  }catch (error) {
    console.error('Error updating plan:', error);
    showToast("Ошибка при обновлении плана:", 'red')
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

const getOrganization = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100,
    sortBy: "name",
  });
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
  getClientById()

})

</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4" >
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План новых и повторных клиентов (просмотр)</span>
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
            <th>Клиенты</th>
            <th
                v-for="{ id, name } in months" :key="id">
              {{ name }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="{ id: operationId, name: name, type: type} in getClietList" :key="operationId">
            <td class="fz-14">{{ name }}</td>
            <td v-for="{ id: monthId } in months" :key="monthId">
              <custom-text-field
                  min-width="20"
                  @input="handleInput(monthId,type, $event)"
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