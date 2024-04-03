<script setup>
import {FIELD_COLOR} from "../../composables/constant/colors.js";

</script>

<template>
  <v-text-field
      style="min-width: 250px; max-width: 250px"
      color="green"
      rounded="lg"
      :base-color="FIELD_COLOR"
      variant="outlined"
      class="w-auto text-sm-body-1"
      density="compact"
      clear-icon="close"
      clearable
  />
</template>

<style scoped>

</style>