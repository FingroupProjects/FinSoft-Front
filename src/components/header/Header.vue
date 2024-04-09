<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";
import auth from "../../api/auth.js";
import {deleteToken, deleteUser} from "../../composables/auth";
import programSettingsApi from "../../api/list/programSettingsApi.js";

const isDialog = ref(false)
const router = useRouter()
const organizationName = ref('')
const isLanguage = ref(false)
const isProfile = ref(false)
const userName = ref(null)
const profileItems = ref([{val: 'Профиль', link: 'profile'}, {val: 'Изменение пароль', link: 'change_password'}, {val: 'Изменить пин-код', link: 'change_pin_code'}, {val: 'Выйти', link: 'logout'}])

const listProfile = async (item) => {
  if (item === 'profile') {
     await router.push('/profile')
  }

  if (item === 'logout') {
    const res = await auth.logout()
    if (res.status === 200) {
      deleteUser()
      deleteToken()
      router.push('/login')
    }
  }
}

const handleKeyDown = (event) => {
  if (event.ctrlKey && event.key === 'm') {
    isDialog.value = true
  }
}

const getOrganizationName = async () => {
  try {
    const {data} = await programSettingsApi.get()
    if (data) organizationName.value = data.name
  } catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  userName.value = JSON.parse(localStorage.getItem('user')).name || null

  getOrganizationName()
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
})
</script>

<template>
  <v-app-bar
      :elevation="2"
      color="#A5EB84DD"
      height="45"
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="$emit('rale')"></v-app-bar-nav-icon>
      <v-icon size="20" color="#000"  @click="$router.push('/')">home</v-icon>
    </template>

    <v-app-bar-title class="text-sm-body-1">{{ organizationName }}</v-app-bar-title>

    <template v-slot:append>

      <v-menu
          v-model="isProfile"
          :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn :variant="isProfile ? 'tonal' : 'text'" class="d-flex justify-space-between" v-bind="props" rounded="2">
            <span class="text-sm-body-2 mx-2">{{ userName }}</span>
            <v-icon size="20">account_circle</v-icon>
            <v-icon size="20">{{ isLanguage ? 'expand_less' : 'expand_more' }}</v-icon>
          </v-btn>
        </template>

        <v-card class="rounded-lg">
          <v-list>
            <v-list-item
                v-for="(item, index) in profileItems"
                :key="index"
                :value="index"
            >
              <v-list-item-title class="font-weight-bold" @click="listProfile(item.link)">{{ item.val }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

    </template>
  </v-app-bar>
</template>

<style scoped>

</style>