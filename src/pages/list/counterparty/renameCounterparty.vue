<script setup>
import { ref, onMounted } from "vue"
import counterpartyApi from "../../../api/counterparty"
import { useRoute } from 'vue-router';

const route = useRoute();
const counterparty = ref([])

const body = ref({
  address: "",
  created_at: "",
  email: "",
  id: null,
  name: "",
  phone: "",
  roles: [],
})

const id = ref(null)
const renameCounterparty = async () => {
  try {
    const res = await counterpartyApi.rename(id, body)

  } catch (e) {
    console.log(e);
  }
}
const getId = async () => {
  try {
    const { data } = await counterpartyApi.getById(id.value)
    body.value = data.result
    console.log(counterparty.value);
  } catch (e) {
    console.log(e);
  }
}
const handleCheckboxChange = (index) => {
  if (roles.value.includes(index + 1)) {
    roles.value = roles.value.filter(role => role !== index + 1);
  } else {
    roles.value.push(index + 1);
  }
}
onMounted(() => {
  id.value = route.params.id;
  getId()
})
</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" color="info" @click="$router.push({ name: 'counterparty' })">Назад</v-btn>
    </div>
    <v-card class="px-4 py-4">
      <div class="d-flex ga-5">
        <v-text-field v-model="body.name" variant="outlined" label="Наименование контрагента" />
        <v-text-field v-model="body.phone" variant="outlined" label="Тел номер" />
        <v-text-field v-model="body.address" variant="outlined" label="Адрес" />
        <v-text-field v-model="body.email" variant="outlined" type="email" label="Почта" />
      </div>
      <div class="d-flex w-75">
        <v-checkbox-btn label="Клиент" color="info" @change="handleCheckboxChange(0)"></v-checkbox-btn>
        <v-checkbox-btn label="Поставщик" color="info" @change="handleCheckboxChange(1)"></v-checkbox-btn>
        <v-checkbox-btn label="Прочие отношения" color="info" @change="handleCheckboxChange(2)"></v-checkbox-btn>
      </div>
      <div class="d-flex justify-end mt-4">
        <v-btn rounded="lg" color="info" @click="renameCounterparty()">Изменить</v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped></style>