<script setup>
import {defineEmits, onMounted, onUnmounted, reactive, ref,} from "vue";
import {FIELD_COLOR, FIELD_OF_SEARCH, BASE_COLOR, TITLE_COLOR } from "../../../../composables/constant/colors.js";
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
import plan from "../../../../api/plans/installment.js"
import groupApi from "../../../../api/list/goodGroup.js";
import { forIn } from "lodash";
import showToast from "@/composables/toast/index.js";

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
const addedGoods = ref([])
const getListGood = ref([])
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

const getMonths = async () => {
  try {
    const { data } = await monthApi.month();
    months.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
}

const getGoods = async (good_storage_id, good_organization_id) => {
  const { data } = await goodApi.get({ page: 1, itemsPerPage: 100000 });
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

const getGoodsById = async () => {
  const { data } = await plan.getById(route.params.id);
  form.organization = data.result.organization_id;
  form.year = data.result.year;

  const goodsMap = new Map();
  data.result.goods.forEach(item => {
    const goodId = item.goods.name;
    const monthId = item.month.id;

    if (!goodsMap.has(goodId)) {
      goodsMap.set(goodId, {
        id: item.id,
        name: item.goods.name,
        months: {}
      });
      for (let i = 1; i <= 12; i++) {
        goodsMap.get(goodId).months[i] = null;
      }
    }
    const goodItem = goodsMap.get(goodId);
    goodItem.months[monthId] = item.quantity || null;
  });
  getListGood.value = Array.from(goodsMap.values()).map(item => {
    const months = {};
    Object.keys(item.months).forEach(monthId => {
      months[monthId] = item.months[monthId] || 0;
    });
    return {
      ...item,
      months
    };
  });

  console.log(getListGood.value);
};

const isAdded = () =>{
  viewAdd.value = true
  console.log(getListGood.value)
  console.log(goods.value)
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
  getListGood.value.forEach(item => {
    Object.keys(item.months).forEach(monthId => {
      if (item.months[monthId] !== null) {
        item.months[monthId] += incValue;
      }
    });
  });
};

const handleInput = (id, monthId, event) => {
  const value = parseInt(event.target.value);
  const index = getListGood.value.findIndex(
      (item) => item.id === id && monthId in item.months
  );

  if (index !== -1) {
    getListGood.value[index].months[monthId] = value;
  } else {
    console.error(`Item with id ${id} and monthId ${monthId} not found in getListGood.value`);
  }
};

const updatePlan = async () => {
  try {
    const id = route.params.id

    const payload = {
      year: form.year,
      organization_id: form.organization,
      goods: getListGood.value.map(item => {
        const goods = [];
        Object.keys(item.months).forEach(monthId => {
          goods.push({
            good_id: item.id,
            month_id: parseInt(monthId),
            quantity: item.months[monthId]
          });
        });
        return goods;
      }).flat()
    };

    const response = await plan.update(id, payload)
    console.log( response.data);
    showToast("Успешно обновлено", 'green')
  } catch (error) {
    console.error('Error updating plan:', error);
    showToast("Ошибка при обновлении плана:", 'red')
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
  getGoodsById()
})
</script>
<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4" >
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж в рассрочку товаров (просмотр)</span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button @click="updatePlan() " name="save1"  />
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
            <th
                v-for="{ id, name } in months" :key="id">
              {{ name }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="{ id, name, months } in getListGood" :key="id">
            <td class="fz-14">{{ name }}</td>
            <td v-for="(quantity, monthId) in months" :key="monthId">
              <custom-text-field
                  min-width="20"
                  v-model="months[monthId]"
                  @input="handleInput(id, monthId, $event)"
              />
            </td>
          </tr>
          </tbody>
        </table>
        <div v-if="viewAdd === true">
          <v-autocomplete
              style="max-width: 12%; min-width: 12%; border-radius: 12px"
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
