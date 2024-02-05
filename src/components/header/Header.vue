<script setup>
import {onMounted, onUnmounted, ref} from "vue";

const isDialog = ref(false)

const isFastAdd = ref(false)
const fastAddItems = ref([{title: 'Продажа',value: 1,},{title: "Возврат",value: 2,},{title: 'Клиент',value: 3,},{title: 'Заказ',  value: 4,},{title: 'Запросы на закупку',  value: 5,},{title: 'Заказ на закупку',  value: 6,},{title: 'Закуп',value: 7,},])

const isQuestion = ref(false)
const questionItems = ref([{title: 'Продажа'}])

const isNotification = ref(false)
const notificationsItems = ref([{title: 'Продажа'}])

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
})

const handleKeyDown = (event) => {
  if (event.ctrlKey && event.key === 'm' || event.key === 'M') {
    isDialog.value = true
  }
}


</script>

<template>
  <v-app-bar
      :elevation="2"
      color="info"
      height="45"
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="$emit('rale')"></v-app-bar-nav-icon>
      <v-icon size="18" class="text-grey-lighten-3" @click="$router.push('/')">home</v-icon>
      <v-icon size="12" class="ms-1">chevron_right</v-icon>
    </template>

    <v-app-bar-title class="text-sm-body-1">Клиент</v-app-bar-title>

    <template v-slot:append>
      <v-btn density="comfortable" variant="tonal" color="info" class="d-flex justify-space-between ga-3  text-sm-body-2 bg-white rounded-lg py-1 cursor-pointer">
        <template v-slot:prepend>
          <v-icon>search</v-icon>
          <span class="ms-2">Поиск...</span>
        </template>

        <template v-slot:append>
          <span class="bg-blue rounded-lg px-1">Ctrl+M</span>
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
                  <v-icon color="info" size="15">search</v-icon>
                </span>
                <input type="text" class="custom_input" placeholder="Поиск...">
              </div>
              <v-btn @click="isDialog = false" :ripple="false" size="x-small" text="esc" color="info bg-info me-2"/>
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

      <v-menu
          v-model="isFastAdd"
          :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn variant="text" size="55" class="ms-2" v-bind="props">
            <v-icon size="20">add_circle_outline</v-icon>
            <v-icon size="20">{{ isFastAdd ? 'expand_less' : 'expand_more' }}</v-icon>
          </v-btn>
        </template>

        <v-card rounded :min-width="300">
          <div class="pa-3 text-sm-body-2">
            Быстрое создание
          </div>
          <v-divider></v-divider>
          <div>
            <v-list>
              <v-list-item
                v-for="(item, index) in fastAddItems"
                :key="index"
                :value="index"
              >
                <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-menu>

      <v-menu
          v-model="isQuestion"
          :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn variant="text" size="55" v-bind="props">
            <v-icon size="20">help_outline</v-icon>
            <v-icon size="20">{{ isQuestion ? 'expand_less' : 'expand_more' }}</v-icon>
          </v-btn>
        </template>

        <v-card class="rounded-lg" :min-width="200">
          <div class="pa-3 text-sm-body-2">
            Инструкция
          </div>
          <v-divider></v-divider>
          <div>
            <v-list>
              <v-list-item
                v-for="(item, index) in questionItems"
                :key="index"
                :value="index"
              >
                <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-menu>

      <v-menu
          v-model="isNotification"
          :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn variant="text" size="55" v-bind="props">
            <v-badge color="red" dot content="3">
              <v-icon  size="20">notifications</v-icon>
            </v-badge>
            <v-icon size="20">expand_more</v-icon>
          </v-btn>
        </template>

        <v-card class="rounded-lg" :min-width="400">
          <v-card variant="tonal" class="pa-3 text-sm-body-2 rounded-0">
            <div class="d-flex justify-space-between">
              <span class="text-subtitle-1 font-weight-bold">Уведомление</span>
              <div>
                <v-icon class="me-2">done_all</v-icon>
                <div class="pa-2 bg-red rounded-circle d-inline-block">84</div>
              </div>
            </div>
            <div class="d-flex align-center justify-space-between">
              <span>Показать только не прочитанные</span>
              <span>
                <v-checkbox-btn color="info"></v-checkbox-btn>
              </span>
            </div>
          </v-card>
          <v-divider></v-divider>
          <div>
            <v-list>
              <v-list-item
                v-for="(item, index) in notificationsItems"
                :key="index"
                :value="index"
              >
                <v-list-item-title class="font-weight-bold">{{ item.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-menu>

    

      <v-btn variant="text" class="d-flex justify-space-between">
        <v-icon size="20">language</v-icon>
        <span class="text-sm-body-2 mx-2">Русский</span>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

      <v-btn variant="text" class="d-flex justify-space-between" rounded="2">
        <v-icon size="20">account_circle</v-icon>
        <span class="text-sm-body-2 mx-2">Hello</span>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

    </template>
  </v-app-bar>
</template>

<style scoped>

</style>