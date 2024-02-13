<script setup>
import { ref, onMounted } from "vue";
import counterpartyApi from "../../../api/counterparty";
import { useRoute, useRouter } from 'vue-router';
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

const renameCounterparty = async () => {
  try {
    const res = await counterpartyApi.rename(id.value, form.value);
    router.push({ name: 'counterparty' })
  } catch (e) {
    console.error(e);
  }
};

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

onMounted(() => {
  id.value = route.params.id;
  getId();
});
</script>

<template>
  <div>
    <div class="d-flex justify-end mb-4">
      <v-btn rounded="lg" color="info" @click="$router.push({ name: 'counterparty' })">Назад</v-btn>
    </div>
    <v-card class="px-4 py-4">
      <div class="d-flex ga-5">
        <v-text-field v-model="form.name" variant="outlined" label="Наименование контрагента" />
        <v-text-field v-model="form.phone" variant="outlined" label="Тел номер" v-mask="'+992 ### ## ##'" />
        <v-text-field v-model="form.address" variant="outlined" label="Адрес" />
        <v-text-field v-model="form.email" variant="outlined" type="email" label="Почта" />
      </div>
      <div class="d-flex w-75">
        <v-checkbox-btn v-model="a" label="Клиент" color="info" @change="handleCheckboxChange(1)"></v-checkbox-btn>
        <v-checkbox-btn v-model="b" label="Поставщик" color="info" @change="handleCheckboxChange(2)"></v-checkbox-btn>
        <v-checkbox-btn v-model="c" label="Прочие отношения" color="info"
          @change="handleCheckboxChange(3)"></v-checkbox-btn>
      </div>
      <div class="d-flex justify-end mt-4">
        <v-btn rounded="lg" color="info" @click="renameCounterparty()">Изменить</v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped></style>
