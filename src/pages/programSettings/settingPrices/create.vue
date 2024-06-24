<script setup>
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import { TITLE_COLOR } from "../../../composables/constant/colors.js";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const form = reactive({
  date: null,
  author: null,
  comment: null,
  doc_number: null,
  organization: null,
});

const organizations = ref([]);
</script>
<template>
  <div class="pa-4 bg-white">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          {{ $t("titles.settingProces") }}
        </span>
      </div>
    </div>
    <div>
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field
            disabled
            :value="t('headers.number')"
            v-model="form.doc_number"
          />
          <custom-text-field
            class="date"
            :label="t('headers.date')"
            type="datetime-local"
            v-model="form.date"
          />
          <custom-autocomplete
            :label="t('headers.organization')"
            :items="organizations"
            v-model="form.organization"
          />
          <button style="border: 1px solid #ADBBD1; padding: 0px 12px; border-radius: 8px;" @click="$router.push('/settingUpPricesOfGoods')">
            {{ $t('headers.setting') }}
          </button>
        </div>
      </v-col>
      <div>
        <table>
          <tr>
            <th rowspan="2">Товары</th>
            <th colspan="3">АНИС</th>
            <th style="width: 60%" rowspan="2">ОАЗИС</th>
          </tr>
          <tr>
            <th>Старая</th>
            <th>Новая</th>
            <th>+-</th>
          </tr>
          <tr>
            <td>Non</td>
            <td></td>
            <td></td>
            <td><div class="green-dot">f</div></td>
            <td></td>
          </tr>
          <tr style="height: 30vh">
            <td>Non</td>
            <td></td>
            <td></td>
            <td><div class="red-dot">+</div></td>
            <td></td>
          </tr>
          <tr class="tall-row">
            <th>Итого</th>
            <td>100</td>
            <td>80</td>
            <td>3</td>
            <td></td>
          </tr>
        </table>
      </div>
      <div class="d-flex ga-10 mt-4">
        <custom-text-field
          readonly
          v-model="form.author"
          :label="t('headers.author')"
          min-width="110"
        />
        <custom-text-field
          :label="t('headers.comment')"
          v-model="form.comment"
          min-width="310"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid black;
  text-align: start;
  vertical-align: top;
  padding: 8px;
}
th {
  padding: 8px 8px 8px 20px;
}
.green-dot {
  height: 20px;
  width: 20px;
  background-color: green;
  color: green;
  text-align: center;
  border-radius: 50%;
}
.red-dot {
  height: 20px;
  width: 20px;
  background-color: red;
  color: red;
  text-align: center;
  border-radius: 50%;
}
.tall-row td {
  height: 100px;
}
</style>
