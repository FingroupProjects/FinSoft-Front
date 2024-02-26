<script setup>
import {onMounted, onUnmounted, ref} from "vue";
import {useRouter} from "vue-router";
import FlagRU from '../../assets/svg/flags/flag-ru.svg'
import FlagUS from '../../assets/svg/flags/flag-us.svg'
import auth from "../../api/auth.js";
import {deleteToken, deleteUser} from "../../composables/auth";

const isDialog = ref(false)
const router = useRouter()
const isFastAdd = ref(false)
const fastAddItems = ref([{title: 'Продажа',value: 1,},{title: "Возврат",value: 2,},{title: 'Клиент',value: 3,},{title: 'Заказ',  value: 4,},{title: 'Запросы на закупку',  value: 5,},{title: 'Заказ на закупку',  value: 6,},{title: 'Закуп',value: 7,},])

const isQuestion = ref(false)
const questionItems = ref([{title: 'Продажа'}])

const isNotification = ref(false)
const notificationsItems = ref([{person: 'Рустам', title: 'Закупил 500 ноутбуков'}, {person: 'Хусрав', title: 'Внёс все данные в систему'}])

const isLanguage = ref(false)
const isProfile = ref(false)
const profileItems = ref([{val: 'Профиль', link: 'profile'}, {val: 'Изменение пароль', link: 'change_password'}, {val: 'Изменить пин-код', link: 'change_pin_code'}, {val: 'Выйти', link: 'logout'}])

const listProfile = async (item) => {
  if (item === 'profile') {
     await router.push('/profile')
  }

  if (item === 'logout') {
    await router.push('/login')
    await auth.logout()
    deleteUser()
    deleteToken()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
})

const handleKeyDown = (event) => {
  if (event.ctrlKey && event.key === 'm') {
    isDialog.value = true
  }
}


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

    <v-app-bar-title class="text-sm-body-1">Клиент</v-app-bar-title>

    <template v-slot:append>
      <v-btn density="comfortable" variant="tonal" color="#70C94633" class="d-flex justify-space-between ga-3  text-sm-body-2 bg-white rounded-lg py-1 cursor-pointer">
        <template v-slot:prepend>
          <v-icon>search</v-icon>
          <span class="ms-2">Поиск...</span>
        </template>

        <template v-slot:append>
          <span class="bg-black rounded-lg px-1">Ctrl+M</span>
        </template>

        <v-dialog
            v-model="isDialog"
            activator="parent"
            width="600"
            class="rounded-lg"
        >
          <v-card>
            <div class="d-flex align-center">
              <div class="d-flex align-center w-100">
                <span class="pa-3">
                  <v-icon color="#70C946" size="15">search</v-icon>
                </span>
                <input type="text" class="custom_input" placeholder="Поиск...">
              </div>
              <v-btn @click="isDialog = false" :ripple="false" size="x-small" text="esc" color="#70C946 bg-#70C946 me-2"/>
            </div>
            <v-divider/>
            <v-card-text style="height: 300px">
              <div class="text-center h-auto">
                На этой платформе вы можете легко находить товары, функции и клиентов
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-btn>

<!--      <v-menu-->
<!--          v-model="isFastAdd"-->
<!--          :close-on-content-click="false"-->
<!--      >-->
<!--        <template v-slot:activator="{ props }">-->
<!--          <v-btn :variant="isFastAdd ? 'tonal' : 'text'" size="55" class="ms-2" v-bind="props">-->
<!--            <v-icon size="20">add_circle_outline</v-icon>-->
<!--            <v-icon size="20">{{ isFastAdd ? 'expand_less' : 'expand_more' }}</v-icon>-->
<!--          </v-btn>-->
<!--        </template>-->

<!--        <v-card rounded :min-width="300">-->
<!--          <div class="pa-3 text-sm-body-2">-->
<!--            Быстрое создание-->
<!--          </div>-->
<!--          <v-divider></v-divider>-->
<!--          <div>-->
<!--            <v-list>-->
<!--              <v-list-item-->
<!--                v-for="(item, index) in fastAddItems"-->
<!--                :key="index"-->
<!--                :value="index"-->
<!--              >-->
<!--                <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>-->
<!--              </v-list-item>-->
<!--            </v-list>-->
<!--          </div>-->
<!--        </v-card>-->
<!--      </v-menu>-->

<!--      <v-menu-->
<!--          v-model="isQuestion"-->
<!--          :close-on-content-click="false"-->
<!--      >-->
<!--        <template v-slot:activator="{ props }">-->
<!--          <v-btn :variant="isQuestion ? 'tonal' : 'text'" size="55" v-bind="props">-->
<!--            <v-icon size="20">help_outline</v-icon>-->
<!--            <v-icon size="20">{{ isQuestion ? 'expand_less' : 'expand_more' }}</v-icon>-->
<!--          </v-btn>-->
<!--        </template>-->

<!--        <v-card class="rounded-lg" :min-width="200">-->
<!--          <div class="pa-3 text-sm-body-2">-->
<!--            Инструкция-->
<!--          </div>-->
<!--          <v-divider></v-divider>-->
<!--          <div>-->
<!--            <v-list>-->
<!--              <v-list-item-->
<!--                v-for="(item, index) in questionItems"-->
<!--                :key="index"-->
<!--                :value="index"-->
<!--              >-->
<!--                <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>-->
<!--              </v-list-item>-->
<!--            </v-list>-->
<!--          </div>-->
<!--        </v-card>-->
<!--      </v-menu>-->

<!--      <v-menu-->
<!--          v-model="isNotification"-->
<!--          :close-on-content-click="false"-->
<!--      >-->
<!--        <template v-slot:activator="{ props }">-->
<!--          <v-btn :variant="isNotification ? 'tonal' : 'text'" size="55" v-bind="props">-->
<!--            <v-badge color="red" dot content="3">-->
<!--              <v-icon  size="20">notifications</v-icon>-->
<!--            </v-badge>-->
<!--            <v-icon size="20">{{ isNotification ? 'expand_less' : 'expand_more' }}</v-icon>-->
<!--          </v-btn>-->
<!--        </template>-->

<!--        <v-card class="rounded-lg" :min-width="400">-->
<!--          <v-card variant="tonal" class="pa-3 text-sm-body-2 rounded-0">-->
<!--            <div class="d-flex justify-space-between">-->
<!--              <span class="text-subtitle-1 font-weight-bold">Уведомление</span>-->
<!--              <div>-->
<!--                <v-icon class="me-2">done_all</v-icon>-->
<!--                <div class="pa-2 bg-red rounded-circle d-inline-block">84</div>-->
<!--              </div>-->
<!--            </div>-->
<!--            <div class="d-flex align-center justify-space-between">-->
<!--              <span>Показать только не прочитанные</span>-->
<!--              <span>-->
<!--                <v-checkbox-btn color="#70C946"></v-checkbox-btn>-->
<!--              </span>-->
<!--            </div>-->
<!--          </v-card>-->
<!--          <div v-for="item in notificationsItems" :key="item.person">-->
<!--            <v-divider></v-divider>-->
<!--            <v-card-title class="d-flex flex-column">-->
<!--              <div class="d-flex w-100">-->
<!--                <div class="w-auto pr-4">-->
<!--              <span class="rounded-circle pa-1 px-2 py-2 border bg-grey-lighten-4">-->
<!--                <v-icon size="25" color="#70C946">groups</v-icon>-->
<!--              </span>-->
<!--                </div>-->
<!--                <div class="w-100">-->
<!--                  <div class="d-flex flex-column w-100 text-caption ">-->
<!--                    <div class="d-flex justify-space-between ">-->
<!--                      <span class="text-blue text-subtitle-2 font-weight-bold">CRM</span>-->
<!--                      <span>30.01.2024 23:59</span>-->
<!--                    </div>-->
<!--                    <div class="d-flex justify-space-between ">-->
<!--                      <span class="text-end font-weight-bold">Время напоминания</span>-->
<!--                      <span class="text-end text-blue-grey-lighten-4 cursor-pointer">Отметить, как прочитанное</span>-->
<!--                    </div>-->
<!--                  </div>-->
<!--                  <div class="d-flex align-center mt-2">-->
<!--                    <span class="font-weight-bold text-subtitle-2 me-2">{{ item.person }}:</span>-->
<!--                    <span class="text-caption">{{ item.title }}</span>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </div>-->
<!--            </v-card-title>-->
<!--          </div>-->
<!--        </v-card>-->
<!--      </v-menu>-->


<!--      <v-menu-->
<!--          v-model="isLanguage"-->
<!--          :close-on-content-click="false"-->
<!--      >-->
<!--        <template v-slot:activator="{ props }">-->
<!--          <v-btn :variant="isLanguage ? 'tonal' : 'text'" class="d-flex justify-space-between" v-bind="props">-->
<!--            <v-icon size="20">language</v-icon>-->
<!--            <span class="text-sm-body-2 mx-2">Русский</span>-->
<!--            <v-icon size="20">{{ isLanguage ? 'expand_less' : 'expand_more' }}</v-icon>-->
<!--          </v-btn>-->
<!--        </template>-->

<!--        <v-card class="rounded-lg">-->
<!--          <div class="d-flex">-->
<!--            <div class="pa-3 d-flex ga-2 text-subtitle-2 align-center cursor-pointer">-->
<!--              <FlagRU />-->
<!--              <span>Русский</span>-->
<!--            </div>-->
<!--          </div>-->
<!--            <v-divider></v-divider>-->
<!--          <div class="d-flex">-->
<!--            <div class="pa-3 d-flex ga-2 text-sm-body-2 align-center cursor-pointer">-->
<!--              <FlagUS />-->
<!--              <span>English</span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </v-card>-->
<!--      </v-menu>-->


      <v-menu
          v-model="isProfile"
          :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn :variant="isProfile ? 'tonal' : 'text'" class="d-flex justify-space-between" v-bind="props" rounded="2">
            <span class="text-sm-body-2 mx-2">Admin</span>
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