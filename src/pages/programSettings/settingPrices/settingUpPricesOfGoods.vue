<script setup>

import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const form = reactive({
  
});


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
        
      </div>
      <div class="d-flex ga-4">
        <v-btn @click="$router.push('settingProcesCreate')">Сбросить</v-btn>
        <v-btn @click="create()">Применить</v-btn>
      </div>
    </div>
  </div>
</template>
