<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import counterpartyApi from "../../../api/counterparty";
import showToast from "../../../composables/toast";
import { add, prevIcon } from "../../../composables/constant/buttons.js";

const router = useRouter();

const name = ref("");
const phone = ref("");
const address = ref("");
const email = ref("");
const roles = ref([]);
const error_message = ref('')
const CreateCounterparty = async () => {
  try {
    error_message.value = ''
    const body = {
      name: name.value,
      phone: phone.value,
      address: address.value,
      email: email.value,
      roles: roles.value,
    };
    if(roles.value.length === 0) {
      error_message.value = 'Выберите хотя бы одну роль!'
    }
    console.log(body);
    await counterpartyApi.create(body);
    router.push("counterparty");
    showToast("Успешно добавлена", "green");
  } catch (error) {
    console.error(error);
  }
};

const handleCheckboxChange = (index) => {
  if (roles.value.includes(index + 1)) {
    roles.value = roles.value.filter((role) => role !== index + 1);
  } else {
    roles.value.push(index + 1);
  }
};

const rules = {
  required: v => !!v || 'Поле обязательно для заполнения',
  email: v => (/.+@.+\..+/.test(v)) || 'Введите валидную почту',
  phone: v => v.length === 13 || "Введите валидный номер телефона",
}

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-start mb-2 ">
        <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push('counterparty')">
          <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
        </v-btn>
      </div>
      <v-card class="block">
        <v-form @submit.prevent="CreateCounterparty">
          <div class="d-flex ga-5">
            <v-text-field
              variant="outlined"
              :rules="[rules.required]"
              v-model="name"
              density="compact"
              label="Наименование"
              rounded="lg"
              color="info"
              clearable
            />
            <v-text-field
              variant="outlined"
              :rules="[rules.required, rules.phone]"
              label="Тел номер"
              v-model.trim="phone"
              density="compact"
              v-mask="'+992#########'"
              rounded="lg"
              color="info"
              clearable
            />
            <v-text-field
              variant="outlined"
              :rules="[rules.required]"
              label="Адрес"
              v-model="address"
              density="compact"
              rounded="lg"
              color="info"
              clearable
            />
            <v-text-field
              variant="outlined"
              prepend-inner-icon="email"
              :rules="[rules.required, rules.email]"
              label="Почта"
              v-model="email"
              density="compact"
              rounded="lg"
              color="info"
              clearable
            />
          </div>
          <div class="d-flex ga-16 flex-wrap">
            <v-switch label="Клиент" base-color="info" color="info" @change="handleCheckboxChange(0)" />
            <v-switch label="Поставщик" base-color="info" color="info" @change="handleCheckboxChange(1)" />
            <v-switch label="Прочие отношения" base-color="info" color="info" @change="handleCheckboxChange(2)" />
          </div>
          <div class="error_message">
            {{ error_message }}
          </div>
          <div class="d-flex justify-end">
            <v-btn rounded="lg" color="info" type="submit">{{ add }}</v-btn>
          </div>
        </v-form>
      </v-card>
    </v-col>
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