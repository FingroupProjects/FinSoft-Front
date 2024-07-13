<script setup>
import {defineEmits, onMounted, reactive, ref,} from "vue";
import {TITLE_COLOR} from "@/composables/constant/colors.js";
import {useRoute, useRouter} from "vue-router";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../../api/list/organizations.js";
import Button from "../../../../components/button/button.vue";
import "../../../../assets/css/procurement.css";
import {useHasOneOrganization} from "@/store/hasOneOrganization.js";
import monthApi from "../../../../api/list/schedule.js";
import plan from "../../../../api/plans/shops.js"
import showToast from "../../../../composables/toast/index.js";
import storages from "../../../../api/list/storage.js"

const router = useRouter();
const useOrganization = ref(useHasOneOrganization())
const emits = defineEmits(["changed"]);
const route = useRoute()
const organizations = ref([]);
const getStorageList = ref([])
const months = ref([]);
const listStorages = ref([])
const listNameStorages = ref([])
const isAdded = ref(false)
const form = reactive({
  year: null,
  organization: null,
});

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

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
    
    for (const item of listStorages.value) {
        listNameStorages.value.push(item)
    }
}

const getShopById = async () =>{
    const {data} = await plan.getById(route.params.id)
    form.organization = data.result.organization_id.id
    form.year = data.result.year
    const shopsMap = new Map()

    data.result.storages.forEach(item => {
        const storageId = item.storage.id
        const monthId = item.month.id;

        if (!shopsMap.has(storageId)) {
            shopsMap.set(storageId, {
                id: item.id,
                name: item.storage.name,
                months: {}
            })
        for (let i = 1; i <= 12; i++) {
            shopsMap.get(storageId).months[i] = null; 
        }
        }

        const StorageItem = shopsMap.get(storageId)
        StorageItem.months[monthId] = item.sum || null
    });

    getStorageList.value = Array.from(shopsMap.values()).map(item =>{
        const months = {};
        Object.keys(item.months).forEach(monthId => {
        months[monthId] = item.months[monthId] || 0; 
        });
        return {
        ...item,
        months
        };
    })
};

const handleInput = (id, monthId, event) => {
    const value = parseInt(event.target.value);
    const index = getStorageList.value.findIndex(
        (item) => item.id === id && monthId in item.months
    )
    if (index !== -1) {
    getStorageList.value[index].months[monthId] = value;
  } else {
    console.error(`Item with id ${id} and monthId ${monthId} not found in getStorageList.value`);
  }
}


const updatePlan = async () =>{
    try {
        const id = route.params.id

        const payload = {
            year: form.year,
            organization_id: form.organization,
            storages: getStorageList.value.map(item=>{
                const storages = []
                Object.keys(item.months).forEach(monthId =>{
                    storages.push({
                        storage_id: item.id,
                        month_id: monthId,
                        sum: item.months[monthId]
                    });
                });
                return storages
            }).flat()
        }
        showToast("Успешно обновлено", 'green')
        const response = await plan.update(id, payload)
        console.log( response.data);
        
        
    } catch (error) {
        console.error('Error updating plan:', error);
        showToast("Ошибка при обновлении плана:", 'red')
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    }
}



onMounted(()=>{
    getOrganizations()
    getMonths()
    getShopById()
    getStorage()
})

</script>
<template>
    <div class="document">
        <div class="d-flex justify-space-between documentCalcWidth">
            <div class="d-flex align-center ga-2 pe-2 ms-4" >
                <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж магазинов (просмотр)</span>
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
                    <tr v-for="{ id, name, months } in getStorageList" :key="id">
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