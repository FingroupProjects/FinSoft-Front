<script setup>
import {ref} from "vue";
import auth from "../../api/auth.js";
import {useRouter} from "vue-router";
import setToken from "../../composables/tokenAuth/token.js";

const visible = ref(false)
const loginRef = ref('')
const passwordRef = ref('')
const router = useRouter()

const authentication = async () => {
  const body = {
    login: loginRef.value,
    password: passwordRef.value,
  }

  try {
    const res = await auth.login(body)
    console.log(res)
    if (res.status === 200) {
      setToken(res.data.token)
      await router.push('/')
    }
  } catch (e) {
    console.log(e)
  } finally {
    body.login = ''
    body.password = ''
  }
}
</script>

<template>
  <div class="w-100">
    <v-card class="mx-auto pa-10 pb-8" elevation="8" max-width="448" rounded="lg">
      <v-card-title class="text-center text-h5">
        Войти
      </v-card-title>
      <div class="text-subtitle-1 text-medium-emphasis">Аккаунт</div>

      <v-text-field  v-model="loginRef" density="compact" placeholder="Логин" prepend-inner-icon="email" base-color="blue" variant="solo" />
      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Пароль
      </div>

      <v-text-field v-model="passwordRef" :append-inner-icon="visible ? 'visibility_off' : 'visibility'"
                    :type="visible ? 'text' : 'password'"
                    density="compact" placeholder="Введите пароль" prepend-inner-icon="lock" variant="solo"
                    @click:append-inner="visible = !visible" base-color="blue"></v-text-field>

      <v-btn block class="mb-8 text-subtitle-1" color="blue" size="large" variant="tonal" @click="$router.push('/')">
        Войти
      </v-btn>

    </v-card>
  </div>
</template>

<style scoped>

</style>