<script setup>
import { ref } from 'vue'


const name = ref('')


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
    </v-col>
  </div>
</template>

<style scoped>

</style>