<script setup>
import {computed, defineEmits, onMounted, onUnmounted, reactive, ref, watch,} from "vue";
import {useConfirmDocumentStore} from "../../../../store/confirmDocument.js";
import {TITLE_COLOR} from "../../../../composables/constant/colors.js";
import {useRoute, useRouter} from "vue-router";
import formatNumber from "../../../../composables/format/formatNumber.js";
import showToast from "../../../../composables/toast/index.js";
import validate from "./validate.js";
import currentDateWithTime from "../../../../composables/date/currentDateWithTime.js";
import formatDateTime from "../../../../composables/date/formatDateTime.js";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../../components/checkbox/CustomCheckbox.vue";
import organizationApi from "../../../../api/list/organizations.js";
import cpAgreementApi from "../../../../api/list/counterpartyAgreement.js";
import procurementApi from "../../../../api/documents/procurement.js";
import goodApi from "../../../../api/list/goods.js";
import Button from "../../../../components/button/button.vue";
import "../../../../assets/css/procurement.css";
import {useHasOneOrganization} from "../../../../store/hasOneOrganization.js";
import getDataBased from "../../../../composables/otherQueries/getDataBased.js";
import CustomSearchableSelect from "../../../../components/formElements/CustomSearchableSelect.vue";
import toDecimal from "../../../../composables/format/toDecimal.js";
import validateNumberInput from "../../../../composables/mask/validateNumberInput.js";
import formatInputAmount from "../../../../composables/format/formatInputAmount.js";
import monthApi from "../../../../api/list/schedule.js";
import plan from "../../../../api/plans/goods.js"
import groupApi from "../../../../api/list/goodGroup.js";

const useOrganization = ref(useHasOneOrganization())
const router = useRouter();
const emits = defineEmits(["changed"]);
const confirmDocument = useConfirmDocumentStore();
const route = useRoute()
const inputValues = ref({});
const good_groups = ref([]);

const form = reactive({
  year: null,
  organization: null,
});

const author = ref(null);

const goods = ref([
  {
    good_id: null,
    month_id: null,
    quantity: null, 
  }

]);


const organizations = ref([]);
const listGoods = ref([]);
const months = ref([]);
const FIELD_GOODS = ref("#274D87");
const hoveredRowId = ref(null);
const readyData = ref([]); 

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


const getGoods = async (good_storage_id, good_organization_id) => {
  const search = "";
  const { data } = await goodApi.get(
    {
      page: 1,
      itemsPerPage: 100000,
      sortBy: "name",
    },
    search,
    good_storage_id,
    good_organization_id,
    1,
  )
  listGoods.value = data.result.data;
}

const getCategotyGoods = async (id) => {
  try {
    const {
      data: {
        result: { data },
      },
    } = await groupApi.get({});
    good_groups.value = data;
    console.log(good_groups.value);
  } catch (e) {
    console.error(e);
  }
};


const handleInput = (goodId, monthId) => {
  goods.value.forEach(item => {
    item.good_id = goodId;
    item.month_id = monthId;
    readyData.value.push({
      good_id: item.good_id,
      month_id: item.month_id,
      quantity: item.quantity
    });
  });

  console.log(readyData.value); 
};
  
const createPlan = async () => {
  try {
    const payload = {
      year: form.year,
      organization_id: form.organization.id,
      goods: readyData.value

    };

    const response = await plan.add(payload);
    console.log(response.data); 
  } catch (error) {
    console.error('Error creating plan:', error);
    if (error.response) {
      console.error('Response data:', error.response.data); 
    }
  }
};



watch(
  () => form.cpAgreement,
  (newValue) => {
    if (newValue !== null) {
      const cpAgreement = cpAgreements.value.find((el) =>
          (el.id === typeof newValue) === "object" ? newValue.id : newValue
      );
      form.currency = cpAgreement.currency_id;
    }
  }
);

watch(
  () => [form.storage, form.organization],
  (newValue) => {
    if (newValue[0] !== null && newValue[1] !== null) {
      const storage_id = typeof newValue[0] === "object" ? newValue[0].id : newValue[0];
      const organization_id = typeof newValue[1] === "object" ? newValue[1].id : newValue[1];
      getGoods(storage_id, organization_id);
    }
  }
);



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
        <div class="d-flex flex-wrap ga-4">
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
            min-width="106"
            :label="'Список групп товаров'"
            maxWidth="350px"
            :items="good_groups"
            v-model="form.good_group"
            multiple
            @blur="getCategotyGoods()"
          />

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
    <tr v-for="{ id: goodId, name: goodName } in good_group" :key="goodId">
      <td class="fz-14">{{ goodName }}</td> 
      <td v-for="{ id: monthId } in months" :key="monthId">
        <custom-text-field 
          min-width="20"
          @input="handleInput(goodId, monthId)"
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
