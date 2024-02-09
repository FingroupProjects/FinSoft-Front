<script setup>
import { ref, onMounted } from "vue"
import counterpartyApi from "../../../api/counterparty"

const counterparty = ref([])

const fetchCounterparty = async () => {
  try {
    const { data } = await counterpartyApi.getCounterparty()
    counterparty.value = data.result
    console.log(counterparty.value)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchCounterparty()
})
</script>

<template>
  <div class="d-flex justify-end">
    <v-btn rounded="lg" color="info" @click="$router.push('createCounterparty')">Создать</v-btn>
    <div>
     
    </div>       
    </div>
</template>

<style scoped></style>