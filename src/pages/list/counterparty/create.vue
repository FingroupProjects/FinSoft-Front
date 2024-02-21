<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import counterpartyApi from "../../../api/counterparty";
import showToast from "../../../composables/toast";

const router = useRouter();

const name = ref("");
const phone = ref("");
const address = ref("");
const email = ref("");
const roles = ref([]);

const name_validate = ref(true);
const phone_validate = ref(false);
const address_validate = ref(false);
const email_validate = ref(false);

const CreateCounterparty = async () => {
  try {
    name_validate.value = true;
    phone_validate.value = true;
    address_validate.value = true;
    email_validate.value = true;

    const body = {
      name: name.value,
      phone: phone.value,
      address: address.value,
      email: email.value,
      roles: roles.value,
    };
    console.log(body);
    await counterpartyApi.create(body);
    router.push("counterparty");
    showToast("Успешно добавлена", "green");
  } catch (error) {
    console.error(error);
  }
};

const nameRules = ref([
  (value) => {
    if (value) return true;
    return "Поле не может быть пустым";
  },
]);

const phoneRules = ref([
  (value) => {
    if (value?.length === 13) return true;
    return "Введите валидный номер телефона";
  },
]);

const emailRules = ref([
  (value) => {
    if (value) return true;
    return "Поле email объязательна";
  },
  (value) => {
    if (/.+@.+\..+/.test(value)) return true;
    return "Введите валидную почту";
  },
]);

const addressRules = ref([
  (value) => {
    if (value) return true;
    return "Поле не может быть пустым";
  },
]);

const handleCheckboxChange = (index) => {
  if (roles.value.includes(index + 1)) {
    roles.value = roles.value.filter((role) => role !== index + 1);
  } else {
    roles.value.push(index + 1);
  }
};
</script>

<template>
  <div>
    <div class="d-flex justify-start mb-4">
      <v-btn variant="outlined" color="info" @click.prevent="$router.push('counterparty')">Назад</v-btn>
    </div>
    <v-card class="block">
      <v-form @submit.prevent="CreateCounterparty">
        <div class="d-flex ga-5">
          <v-text-field variant="outlined" :rules="name_validate ? nameRules : []" label="Наименование" v-model="name" />
          <v-text-field variant="outlined" :rules="phone_validate ? phoneRules : []" label="Тел номер"
            v-model.trim="phone" v-mask="'+992#########'" />
          <v-text-field variant="outlined" :rules="address_validate ? addressRules : []" label="Адрес"
            v-model="address" />
          <v-text-field variant="outlined" :rules="email_validate ? emailRules : []" label="Почта" v-model="email" />
        </div>
        <div class="d-flex w-75">
          <v-checkbox-btn label="Клиент" color="info" @change="handleCheckboxChange(0)"></v-checkbox-btn>
          <v-checkbox-btn label="Поставщик" color="info" @change="handleCheckboxChange(1)"></v-checkbox-btn>
          <v-checkbox-btn label="Прочие отношения" color="info" @change="handleCheckboxChange(2)"></v-checkbox-btn>
        </div>
        <div class="d-flex justify-end mt-4">
          <v-btn rounded="lg" color="info" type="submit">Создать</v-btn>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<style scoped>
.block {
  border-radius: 6px;
  padding: 20px;
}
</style>