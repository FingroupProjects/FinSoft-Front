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
  <div class="bg-blue-accent-2 h-screen">
    <div style="padding-top: 10% !important;">
      <v-card class="mx-auto pa-12 pb-8" elevation="8" max-width="448" rounded="lg">
        <div class="text-subtitle-1 text-medium-emphasis">Аккаунт</div>

        <v-text-field v-model="loginRef" density="compact" placeholder="Логин" prepend-inner-icon="email"
                      variant="outlined"></v-text-field>

        <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
          Пароль

          <a class="text-caption text-decoration-none text-blue" href="#">
            Забыли пароль?</a>
        </div>

        <v-text-field v-model="passwordRef" :append-inner-icon="visible ? 'visibility_off' : 'visibility'" :type="visible ? 'text' : 'password'"
                      density="compact" placeholder="Введите пароль" prepend-inner-icon="lock" variant="outlined"
                      @click:append-inner="visible = !visible"></v-text-field>

        <v-btn block class="mb-8 text-subtitle-1" color="blue" size="large" variant="tonal" @click="authentication()">
          Войти
        </v-btn>

      </v-card>
    </div>
  </div>
</template>

<style scoped>

</style>