<script setup>
import {computed, defineEmits, onMounted, onUnmounted, reactive, ref, watch,} from "vue";
import {useConfirmDocumentStore} from "../../../../store/confirmDocument.js";
import {FIELD_COLOR, FIELD_OF_SEARCH, BASE_COLOR, TITLE_COLOR } from "../../../../composables/constant/colors.js";
import {useRoute, useRouter} from "vue-router";
import CustomTextField from "../../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../../api/list/organizations.js";
import Button from "../../../../components/button/button.vue";
import ButtonGoods from "../../../../components/button/buttonGoods.vue"
import "../../../../assets/css/procurement.css";
import {useHasOneOrganization} from "../../../../store/hasOneOrganization.js";
import getDataBased from "../../../../composables/otherQueries/getDataBased.js";
import monthApi from "../../../../api/list/schedule.js";
import groupApi from "../../../../api/list/goodGroup.js";
import { forIn } from "lodash";
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
              label="Организация"            
          />
          <custom-text-field
              label="Год"
          />
            <button-goods
              name="add"
              @click="isAdded()"
            />
        </div>
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