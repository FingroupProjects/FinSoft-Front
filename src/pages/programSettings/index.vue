<script setup>
import { ref } from 'vue'
import programSettingsApi from "../../api/programSettingsApi.js";


const name = ref('')

const nameOrganization = async () => {
  try{
    const body = {
      name: name.value
    }
    await programSettingsApi.create(body)
  }catch (e){
    console.log(e)
  }
}

</script>

<template>
  <div>
    <v-col>
      <div class="w-25">
        <v-text-field
          v-model="name"
          variant="outlined"
          label="Название организации"
          rounded="lg"
        />
      </div>
      <v-btn @click="nameOrganization()">Добавить</v-btn>
    </v-col>
  </div>
</template>

<style scoped>

</style>