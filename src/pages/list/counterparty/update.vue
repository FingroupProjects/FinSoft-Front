<script setup>
import { ref, onMounted, watch } from "vue";
import counterpartyApi from "../../../api/counterparty";
import { useRoute, useRouter } from "vue-router";
import showToast from "../../../composables/toast";
import { edit, prevIcon } from "../../../composables/constant/buttons.js";

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

const a = ref(false);
const b = ref(false);
const c = ref(false);
const id = ref(null);

const error_message = ref('')

const updateCounterparty = async () => {
  try {
    error_message.value = ''
    console.log(form.value)
    if(form.value.roles.length === 0) {
      error_message.value = 'Выберите хотя бы одну роль!'
      return
    }
    await counterpartyApi.update(id.value, form.value);
    router.push({ name: "counterparty" });
    showToast("Успешно изменено", "#");
  } catch (e) {
    console.error(e);
  }
};

const getId = async () => {
  try {
    const { data } = await counterpartyApi.getById(id.value);
    form.value = data.result;
    form.value.roles.forEach((roleIndex) => {
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
  if (roleIndex === 0) {
    if (a.value === true) {
      if (index === -1) {
        form.value.roles.push(roleIndex);
      }
    } else {
      if (index !== -1) {
        form.value.roles.splice(index, 1);
      }
    }
  } else if (roleIndex === 1) {
    if (b.value === true) {
      if (index === -2) {
        form.value.roles.push(roleIndex);
      }
    } else {
      if (index !== -2) {
        form.value.roles.splice(index, 1);
      }
    }
  } else if (roleIndex === 2) {
    if (c.value === true) {
      if (index === -3) {
        form.value.roles.push(roleIndex);
      }
    } else {
      if (index !== -3) {
        form.value.roles.splice(index, 1);
      }
    }
  }
};


onMounted(async () => {
  id.value = route.params.id;
  await getId();
});

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения',
  email: v => (/.+@.+\..+/.test(v)) || 'Введите валидную почту',
  phone: v => v.length === 13 || "Введите валидный номер телефона",
}

</script>

<template>
  <div>
    <div class="d-flex justify-start mb-4">
      <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push({name:'counterparty'})">
        <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
      </v-btn>
    </div>
    <v-card class="block">
      <v-form @submit.prevent="updateCounterparty">
        <div class="d-flex ga-5">
          <v-text-field
              variant="outlined"
              :rules="[rules.required]"
              v-model="form.name"
              density="compact"
              label="Наименование"
              rounded="lg"
              color="info"
              :append-inner-icon="form.name.length > 1 ? 'cancel' : ''"
              @click:append-inner="form.name = ''"
          />
          <v-text-field
              variant="outlined"
              :rules="[rules.required, rules.phone]"
              label="Тел номер"
              v-model.trim="form.phone"
              density="compact"
              v-mask="'+992#########'"
              rounded="lg"
              color="info"
              :append-inner-icon="form.phone.length > 1 ? 'cancel' : ''"
              @click:append-inner="form.phone = ''"
          />
          <v-text-field
              variant="outlined"
              :rules="[rules.required]"
              label="Адрес"
              v-model="form.address"
              density="compact"
              rounded="lg"
              color="info"
              :append-inner-icon="form.address.length > 1 ? 'cancel' : ''"
              @click:append-inner="form.address = ''"
          />
          <v-text-field
              variant="outlined"
              prepend-inner-icon="email"
              :rules="[rules.required, rules.email]"
              label="Почта"
              v-model="form.email"
              density="compact"
              rounded="lg"
              color="info"
              :append-inner-icon="form.email.length > 1 ? 'cancel' : ''"
              @click:append-inner="form.email = ''"
          />
        </div>
        <div class="d-flex ga-16 flex-wrap">
          <v-switch v-model="a" label="Клиент" base-color="info" color="info" @change="handleCheckboxChange(0)" />
          <v-switch v-model="b" label="Поставщик" base-color="info" color="info" @change="handleCheckboxChange(1)" />
          <v-switch v-model="c" label="Прочие отношения" base-color="info" color="info" @change="handleCheckboxChange(2)" />
        </div>
        <div class="error_message">
          {{ error_message }}
        </div>
        <div class="d-flex justify-end">
          <v-btn rounded="lg" color="info" type="submit">{{ edit }}</v-btn>
        </div>
      </v-form>
    </v-card>
  </div>
</template>

<style scoped>
.block {
  border-radius: 16px;
  padding: 20px;
}
.error_message{
   color:  darkred;
   font-size: 14px;
   opacity: 0.9;
 }

</style>
