<script setup>
import { BASE_COLOR, FIELD_COLOR } from "../../composables/constant/colors.js";

defineProps({
  minWidth: {
    type: String,
    default: "250",
    required: false,
  },
  maxWidth: {
    type: String,
    default: "250px",
    required: false,
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  isAmount: {
    type: Boolean,
    default: false,
    required: false,
  }
});
</script>

<template>
  <v-autocomplete
    :disabled="disabled"
    :style="[
      `max-width: ${maxWidth}`,
      `min-width: ${minWidth}px`,
      'max-height: 40px !important',
    ]"
    variant="outlined"
    :color="BASE_COLOR"
    hide-details
    rounded="lg"
    no-data-text="Нет данных"
    :base-color="FIELD_COLOR"
    item-title="name"
    item-value="id"
  >
    <template v-if="isAmount" v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :subtitle="'Кол-во: ' + item.raw.amount"
        :title="item.raw.name"
      ></v-list-item>
    </template>
  </v-autocomplete>
</template>

<style scoped></style>
