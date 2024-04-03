<script setup>
import {FIELD_COLOR} from "../../composables/constant/colors.js"

</script>

<template>
  <v-autocomplete
      style="max-width: 250px; min-width: 250px;"
      variant="outlined"
      color="green"
      rounded="lg"
      no-data-text="Нет данных"
      :base-color="FIELD_COLOR"
      item-title="name"
      item-value="id"
  />
</template>

<style scoped>

</style>