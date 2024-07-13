<script setup>
import {defineEmits, onMounted, onUnmounted, reactive, ref,} from "vue";
import {BASE_COLOR, FIELD_COLOR, TITLE_COLOR} from "../../../../composables/constant/colors.js";
import {useRoute, useRouter} from "vue-router";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../../api/list/organizations.js";
import goodApi from "../../../../api/list/goods.js";
import Button from "../../../../components/button/button.vue";
import ButtonGoods from "../../../../components/button/buttonGoods.vue"
import "../../../../assets/css/procurement.css";
import {useHasOneOrganization} from "../../../../store/hasOneOrganization.js";
import getDataBased from "../../../../composables/otherQueries/getDataBased.js";
import monthApi from "../../../../api/list/schedule.js";
import plan from "../../../../api/plans/goods.js"
import groupApi from "../../../../api/list/goodGroup.js";
import showToast from "../../../../composables/toast/index.js";

const useOrganization = ref(useHasOneOrganization())
const router = useRouter();
const emits = defineEmits(["changed"]);
const route = useRoute()
const good_groups = ref([]);
const organizations = ref([]);
const listCategoryGoods = ref([]);
const listOfGoods = ref([]);
const months = ref([]);
const selected_groups = ref([]);
const viewAdd = ref(false)
const selectedGoods = ref(null)
const addQuantity = ref()
const addedGoods = ref([])
const form = reactive({
  year: null,
  organization: null,
});

const author = ref(null)
const goods = ref([
  {
    good_id: null,
    month_id: null,
    quantity: null, 
  }
]);



  const addToArray = (selectedItem) => {
    if (selectedItem && !addedGoods.value.some(item => item.name === selectedItem)) {
    const newItem = listOfGoods.value.find(item => item.name === selectedItem);
      if (newItem) {
        listCategoryGoods.value.push(newItem);
      }
    }
  };


const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const isAdded = () =>{
  viewAdd.value = true
  console.log(form.organization)
}

const getMonths = async () => {
  try {
    const { data } = await monthApi.month();
    months.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
}


const getGoods = async (good_storage_id, good_organization_id) => {
  const { data } = await goodApi.get({ page: 1, itemsPerPage: 100 });
  listOfGoods.value = data.result.data.map((item) => ({
    id:item.id,
    name: item.name
  }))
}

const getGoodsId = async () => {
  const { data } = await plan.getGoodsByGroupId({
    ids: selected_groups.value,
  });
  
  data.result.forEach(newItem => {
    const exists = listCategoryGoods.value.some(existingItem => existingItem.name === newItem.name);
    if (!exists) {
      listCategoryGoods.value.push(newItem);
    }
  });
}

const getCategotyGoods = async (id) => {
  try {
    const {
      data: {
        result: { data },
      },
    } = await groupApi.get({});
    good_groups.value = data;
  } catch (e) {
    console.error(e);
  }
};

const addToQuantity = (incValue) => {

};


const handleInput = (goodId, monthId, event) => {

  const value = event.target.value;
  const index = goods.value.findIndex(
    (item) => item.good_id === goodId && item.month_id === monthId
  );
  if (index !== -1) {
    goods.value[index].quantity = value;
  } else {
      goods.value.push({
      good_id: goodId,
      month_id: monthId,
      quantity: value,  
    });
  }
};
  
const createPlan = async () => {
  try {
    const updatedGoods = goods.value
      .filter(item => item.good_id !== null && item.month_id !== null && item.quantity !== null)
      .map(item => ({
        good_id: item.good_id,
        month_id: item.month_id,
        quantity: item.quantity
      }));

      const payload = {
      year: form.year,
      organization_id: form.organization,
      goods: updatedGoods      
    };

    const response = await plan.add(payload);
    console.log(response.data); 
    showToast("Успешно добавлено!", 'green')
  } catch (error) {
    console.error('Error creating plan:', error);
    showToast("Ошибка при создании плана!", 'red')
    if (error.response) {
      console.error('Response data:', error.response.data); 
    }
  }
};

onUnmounted(() => {
  emits("changed", false);
});

onMounted(() => {
  form.year = new Date().getFullYear();

  form.organization = JSON.parse(localStorage.getItem("user")).organization || null;
  author.value = JSON.parse(localStorage.getItem("user")).name || null;

  getDataBased(route.query.id, form, goods, route.query.isClient)
  getMonths()
  getOrganizations()
  getCategotyGoods()
  getGoods()
})
</script>
<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4" >
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж товаров (создание)</span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button @click="createPlan() " name="save1"  />
            <Button
              @click="router.push('/procurementOfGoods')"
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
          <custom-autocomplete
            :label="'Список групп товаров'"
            :items="good_groups"
            v-model="selected_groups"
            multiple
            @blur="getGoodsId"
            
          />
            <button-goods
              name="add"
              @click="isAdded()"
            />
          <div>
            <button-goods
                name="ten"
                @click="addToQuantity(10)"
            />
          </div>
          <div>
            <button-goods
                name="thirdteen"
                @click="addToQuantity(30)"
            />
          </div>
          <div>
            <button-goods
                name="fifteen"
                @click="addToQuantity(50)"
            />
          </div>
        </div>
      </v-col>
      <v-col>
        <table class="table">
          <thead>
            <tr style="font-weight: 400 !important;">
              <th>Товар</th>
              <th v-for="{ id, name } in months" :key="id">{{ name }}</th> 
            </tr>
          </thead>
          <tbody>
              <tr v-for="{ id: goodId, name: goodName } in listCategoryGoods" :key="goodId">
                <td class="fz-14">{{ goodName }}</td>
                <td v-for="{ id:monthId } in months" :key="monthId">
                  <custom-text-field
                    min-width="20"
                    v-model="addQuantity"
                    @input="handleInput(goodId, monthId, $event)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div  v-if="viewAdd === true">
            <v-autocomplete
            style="max-width: 99%; min-width: 12%; border-radius: 12px"
            :color="BASE_COLOR"
            :base-color="FIELD_COLOR"
            :items="listOfGoods"
            item-title="name"
            item-value="name"
            variant="outlined"
            density="compact"
            hide-details
            label="Товары"
            no-data-text="Нет данных"
            v-model="selectedGoods"
            @update:modelValue="addToArray"
            @blur="viewAdd = false"
            />          
          </div>
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
