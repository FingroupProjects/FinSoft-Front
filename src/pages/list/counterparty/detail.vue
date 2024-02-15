<script setup>
import { ref, onMounted } from "vue";
import counterpartyApi from "../../../api/counterparty";
import { useRoute, useRouter } from 'vue-router';
import showToast from '../../../composables/toast'

const router = useRouter();
const route = useRoute();

const form = ref({
  address: "",
  created_at: "",
  email: "",
  id: null,
  name: "",
  phone: "",
  roles: [],
});

const a = ref(false)
const b = ref(false)
const c = ref(false)
const id = ref(null);

const getId = async () => {
  try {
    const { data } = await counterpartyApi.getById(id.value);
    form.value = data.result;
    form.value.roles.forEach(roleIndex => {
      if (roleIndex === 1) a.value = true;
      else if (roleIndex === 2) b.value = true;
      else if (roleIndex === 3) c.value = true;
    });
  } catch (e) {
    console.error(e);
  }
};

const handleCheckboxChange = (roleIndex) => {
  const index = form.value.roles.indexOf(roleIndex);
  if (index > -1) {
    form.value.roles.splice(index, 1);
  } else {
    form.value.roles.push(roleIndex);
  }
};

onMounted(async () => {
  id.value = route.params.id;
  await getId();
});

const nameRules = ref([
  value => {
    if (value) return true
    return 'Поле не может быть пустым'
  },
])

const phoneRules = ref([
  value => {
    if (value?.length === 13) return true
    return 'Введите валидный номер телефона'
  },
])

const emailRules = ref([
  value => {
    if (value) return true
    return 'Поле email объязательна'
  },
  value => {
    if (/.+@.+\..+/.test(value)) return true
    return 'Введите валидную почту'
  },
])

const addressRules = ref([
  value => {
    if (value) return true
    return 'Поле не может быть пустым'
  },
])

</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" color="info" @click="$router.push({ name: 'counterparty' })">Назад</v-btn>
    </div>
    <v-card class="px-4 py-6">
      <div class="d-flex ga-5">
        <v-text-field v-model="form.name" disabled :rules="nameRules" variant="outlined"
          label="Наименование контрагента" />
        <v-text-field v-model="form.phone" disabled :rules="phoneRules" variant="outlined" label="Тел номер"
          v-mask="'+992#########'" />
        <v-text-field v-model="form.address" disabled :rules="addressRules" variant="outlined" label="Адрес" />
        <v-text-field v-model="form.email" disabled :rules="emailRules" variant="outlined" type="email" label="Почта" />
      </div>
      <div class="d-flex w-75">
        <v-checkbox-btn v-model="a" disabled label="Клиент" color="info"
          @change="handleCheckboxChange(1)"></v-checkbox-btn>
        <v-checkbox-btn v-model="b" disabled label="Поставщик" color="info"
          @change="handleCheckboxChange(2)"></v-checkbox-btn>
        <v-checkbox-btn v-model="c" disabled label="Прочие отношения" color="info"
          @change="handleCheckboxChange(3)"></v-checkbox-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped></style>
