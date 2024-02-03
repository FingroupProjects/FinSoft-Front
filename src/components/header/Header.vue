<script setup>
import {onMounted, onUnmounted, ref} from "vue";

const dialog = ref(false)
const fav = ref(true)
const menu = ref(false)
const message = ref(false)
const hints = ref(true)
const items = ref(
    [
          {
            title: 'Продажа',
            value: 1,
          },
          {
            title: "Возврат",
            value: 2,
          },
          {
            title: 'Клиент',
            value: 3,
          },
          {
            title: 'Заказ',
            value: 4,
          },
          {
            title: 'Запросы на закупку',
            value: 5,
          },
          {
            title: 'Заказ на закупку',
            value: 6,
          },
          {
            title: 'Закуп',
            value: 7,
          },
        ])

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
})

const handleKeyDown = (event) => {
  if (event.ctrlKey && event.key === 'm' || event.key === 'M') {
    dialog.value = true
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
      <v-icon size="18" class="text-grey-lighten-3">home</v-icon>
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
            v-model="dialog"
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
              <v-btn @click="dialog = false" :ripple="false" size="x-small" text="esc" color="info bg-info me-2"/>
            </div>
            <v-divider/>
            <v-card-text style="height: 300px">
              <div class="text-center h-auto">
                На этой платформе вы можете легко находить товары, функии и клиентов
              </div>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-btn>

<!--      start menu -->
      <v-menu
          v-model="menu"
          :close-on-content-click="false"
      >
        <template v-slot:activator="{ props }">
          <v-btn variant="text" size="55" class="ms-2" v-bind="props">
            <v-icon size="20">add_circle_outline</v-icon>
            <v-icon size="20">expand_more</v-icon>
          </v-btn>
        </template>

        <v-card rounded :min-width="300">
          <div class="pa-3 text-sm-body-2">
            Быстрое создание
          </div>
          <v-divider></v-divider>
          <div>
            <v-list :max-height="300" :items="items"></v-list>
          </div>
        </v-card>
      </v-menu>
<!--      end menu-->

      <v-btn variant="text" size="55" >
        <v-icon size="20">help_outline</v-icon>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

      <v-btn variant="text" size="55" >
        <v-badge color="red" dot content="3">
          <v-icon  size="20">notifications</v-icon>
        </v-badge>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

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