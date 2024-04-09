<script setup>
import { onMounted, ref } from "vue";
import programSettingsApi from "../../api/list/programSettingsApi.js";
import { FIELD_COLOR } from "../../composables/constant/colors";

const name = ref("");
const loading = ref(false);

const nameOrganization = async () => {
  try {
    loading.value = true;
    const body = {
      name: name.value,
    };
    await programSettingsApi.create(body);
    loading.value = false;
    window.location.reload();
  } catch (e) {
    console.log(e);
  }
};

const getOrganizationName = async () => {
  try {
    const { data } = await programSettingsApi.get();
    if (data.name) name.value = data.name;
  } catch (e) {
    console.log(e);
  }
};

onMounted(async () => {
  getOrganizationName();
});
</script>

<template>
  <div>
    <v-col>
      <div class="w-25">
        <v-text-field
          @keypress.enter="nameOrganization()"
          label="Заголовок организации"
          :base-color="FIELD_COLOR"
          variant="outlined"
          v-model="name"
          color="green"
          rounded="lg"
          autofocus
        />
      </div>
      <v-btn :disabled="loading" color="green" @click="nameOrganization()"
        >Добавить</v-btn
      >
    </v-col>
  </div>
</template>

<style scoped></style>
