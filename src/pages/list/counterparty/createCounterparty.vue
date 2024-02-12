<script setup>
import { ref, } from "vue"
import { useRouter } from "vue-router";
import counterpartyApi from "../../../api/counterparty"

const router = useRouter()
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
    const res = await counterpartyApi.create(body)
    router.push('counterparty')
  } catch (error) {
    console.error(error)
  }
}

const handleCheckboxChange = (index) => {
  if (roles.value.includes(index + 1)) {
    roles.value = roles.value.filter(role => role !== index + 1);
  } else {
    roles.value.push(index + 1);
  }
}

</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" color="info" @click="$router.push('counterparty')">Назад</v-btn>
    </div>
    <v-card class="block">

      <div class="d-flex ga-5">
        <v-text-field variant="outlined" label="Наименование контрагента" v-model="name" />
        <v-text-field variant="outlined" label="Тел номер" v-model.trim="phone" v-mask="'+992 ### ## ##'" />
        <v-text-field variant="outlined" label="Адрес" v-model="address" />
        <v-text-field variant="outlined" type="email" label="Почта" v-model="email" />
      </div>
      <div class="d-flex w-75">
        <v-checkbox-btn label="Клиент" color="info" @change="handleCheckboxChange(0)"></v-checkbox-btn>
        <v-checkbox-btn label="Поставщик" color="info" @change="handleCheckboxChange(1)"></v-checkbox-btn>
        <v-checkbox-btn label="Прочие отношения" color="info" @change="handleCheckboxChange(2)"></v-checkbox-btn>
      </div>
      <div class="d-flex justify-end mt-4">
        <v-btn rounded="lg" color="info" @click="CreateCounterparty()">Создать</v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.block {
  border-radius: 6px;
  padding: 20px;

}
</style>