<script setup>
import { ref } from "vue"
import counterpartyApi from "../../../api/counterparty"

const name = ref('')
const phone = ref('')
const address = ref('')
const email = ref('')
const roles = ref([])

const CreateCounterparty = async () => {
  try {
    const body = {
      name: name.value,
      phone: phone.value,
      address: address.value,
      email: email.value,
      roles: roles.value,
    }
    console.log(body, 'body');
    const res = await counterpartyApi.createCounterparty(body)
    console.log(res, ' ответ')
  } catch (error) {
    console.error(error)
  }
}

</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" color="info" @click="$router.push('counterparty')">Назад</v-btn>
    </div>
    <div class="block">

      <div class="d-flex ga-5">
        <v-text-field variant="outlined" label="Наименование контрагента" v-model="name" />
        <v-text-field variant="outlined" label="Тел номер" v-model="phone" />
        <v-text-field variant="outlined" label="Адрес" v-model="address" />
        <v-text-field variant="outlined" label="Почта" v-model="email" />
      </div>
      <div class="d-flex w-75">
        <v-checkbox-btn label="Клиент" color="info" v-model="roles[0]"></v-checkbox-btn>
        <v-checkbox-btn label="Поставщик" color="info" v-model="roles[1]"></v-checkbox-btn>
        <v-checkbox-btn label="Прочие отношения" color="info" v-model="roles[2]"></v-checkbox-btn>
      </div>
      <div class="d-flex justify-end mt-4">
        <v-btn rounded="lg" color="info" @click="CreateCounterparty()">Создать</v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block {
  background: white;
  border-radius: 6px;
  padding: 20px;

}
</style>