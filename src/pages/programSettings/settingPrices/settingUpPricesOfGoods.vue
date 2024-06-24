<script setup>
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import { TITLE_COLOR } from "../../../composables/constant/colors.js";
import { reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const form = reactive({
  currency: null,
  price_type: null,
  good_group: null,
});

const currencies = ref([]);
const price_types = ref([]);
const good_groups = ref([]);
</script>
<template>
  <div class="pa-4 bg-white">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          {{ "Настройка установки цен товаров" }}
        </span>
      </div>
    </div>
    <div class="d-flex flex-column ga-4 pa-4">
      <div class="d-flex ga-4">
        <custom-autocomplete
          :label="t('headers.currency')"
          :items="currencies"
          v-model="form.currency"
        />
        <custom-autocomplete
          :label="'Список видов цен'"
          :items="price_types"
          v-model="form.price_type"
        />
        <custom-autocomplete
          :label="'Список групп товаров'"
          :items="good_groups"
          v-model="form.good_group"
        />
      </div>
      <div class="d-flex ga-4">
        <custom-text-field
          minWidth="220"
          label="Изменить на X%"
          v-model="form.doc_number"
        />
        <custom-text-field
          minWidth="220"
          label="Изменить на X сумму"
          v-model="form.doc_number"
        />
      </div>
      <div class="d-flex ga-4">
        <v-btn @click="$router.push('settingProcesCreate')">Сбросить</v-btn>
        <v-btn>Применить</v-btn>
      </div>
    </div>
  </div>
</template>
