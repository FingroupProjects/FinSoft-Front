<script setup>
import total from "../../composables/compute/total.js"
import { defineProps } from "vue"

const props = defineProps(['approveError'])

</script>
<template>
  <div>
    <p>Недостаточно следующих товаров для проведения документа</p>
    <div
      style="border-bottom: 3px solid black"
      class="d-flex justify-space-between px-2"
    >
      <div class="my-2">
        <span style="font-weight: 600">Наименований: </span>
        <span>{{ props.approveError.length }}</span>
      </div>
      <div class="my-2">
        <span style="font-weight: 600">Кол-во: </span>
        <span>{{ total(props.approveError) }}</span>
      </div>
    </div>
    <div style="max-height: 70vh; overflow: auto">
      <div
        v-for="good in props.approveError"
        :key="good.id"
        style="box-shadow: 1px 1px 1px 1px lightgray; border-radius: 12px"
        class="d-flex flex-column ga-2 my-4 mx-1 pa-4"
      >
        <span style="font-weight: 600">{{ good.good }}</span>
        <span style="font-size: 12px; color: gray"
          >Кол-во: {{ good.amount }}</span
        >
      </div>
    </div>
  </div>
</template>
