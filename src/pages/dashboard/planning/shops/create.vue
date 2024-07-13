<script setup>
import {defineEmits, onMounted, reactive, ref,} from "vue";
import {TITLE_COLOR} from "../../../../composables/constant/colors.js";
import {useRouter} from "vue-router";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../../api/list/organizations.js";
import Button from "../../../../components/button/button.vue";
import {useHasOneOrganization} from "../../../../store/hasOneOrganization.js";
import monthApi from "../../../../api/list/schedule.js";
import plan from "../../../../api/plans/shops.js"
import storages from "../../../../api/list/storage.js"
import showToast from "../../../../composables/toast/index.js";

const useOrganization = ref(useHasOneOrganization())
const router = useRouter();
const emits = defineEmits(["changed"]);
const organizations = ref([]);
const months = ref([]);
const listStorages = ref([])
const storage = ref([
{
    storage_id: null,
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

const getStorage = async () =>{
    const {data} = await storages.get({page: 1, itemsPerPage: 100});
    listStorages.value = data.result.data.map(item =>({
        id:item.id,
        name: item.name
    }))
    console.log('lists', listStorages.name);
}


const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};


const handleInput = (storageId, monthId, event)=>{
    const value = event.target.value;
    
    const index = storage.value.findIndex(
        (item)=> item.storage_id === storageId && item.month_id === monthId
    )
    if (index !== -1) {
        storage.value[index].quantity = value
    }else{
        storage.value.push({
            storage_id: storageId,
            month_id: monthId,
            quantity: value
        })
        console.log(storage.value);
    }
}

const createPlan = async() =>{
    try {
    const updatedStorage = storage.value
      .filter(item => item.storage_id !== null && item.month_id !== null && item.quantity !== null)
      .map(item => ({
        storage_id: item.storage_id,
        month_id: item.month_id,
        sum: item.quantity
      }));

      const payload = {
      year: form.year,
      organization_id: form.organization,
      storages: updatedStorage      
    };    

    const response = await plan.add(payload);
    console.log(response.data); 
    showToast("Успешно добавлено", 'green')
  } catch (error) {
    console.error('Error creating plan:', error);
    showToast("Ошибка при создании плана:", 'red')
    if (error.response) {
      console.error('Response data:', error.response.data); 
    }
  }
}

onMounted(()=>{
    getOrganizations();
    getMonths();
    getStorage();
})

</script>

<template>
    <div class="document">
        <div class="d-flex justify-space-between documentCalcWidth">
            <div class="d-flex align-center ga-2 pe-2 ms-4" >
                <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж магазинов (создание)</span>
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
                    <th>Склад</th>
                    <th v-for="{ id, name } in months" :key="id">
                        {{ name }}
                    </th> 
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="{ id: storageId, name: name } in listStorages" :key="storageId">
                        <td class="fz-14">{{ name }}</td> 
                        <td v-for="{ id:monthId } in months" :key="monthId">
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
