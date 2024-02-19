<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import counterpartyAgreement from "../../../api/counterpartyAgreement"

const router = useRouter()
const result = ref([])
const getDocuments = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { data } = await counterpartyAgreement.get(page, itemsPerPage, sortBy)
    result.value = data.result
    console.log(data);
  }
  catch (e) {
    console.log(e);
  }
}
onMounted(() => {
  getDocuments()
})

</script>

<template>
  <div>
    
  </div>
</template>
<style scoped></style>