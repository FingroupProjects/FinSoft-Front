<script setup>
import { ref, onMounted } from "vue"
import counterpartyApi from "../../../api/counterparty"

const fetchCounterparty = async () => {
  try {
    const res = await counterpartyApi.getCounterparty()
    console.log('Контрагент получен:', res)
  } catch (error) {
    console.error('Ошибка при получении контрагента:', error)
  }
}

onMounted(() => {
  fetchCounterparty()
})
</script>

<template>
  <div>

  </div>
</template>

<style scoped></style>