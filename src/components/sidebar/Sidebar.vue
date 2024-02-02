<script setup>
import { ref, defineProps, onMounted } from 'vue'

const props = defineProps(['rale'])
const drawer = ref(true)

const menu = ref([
  { id: 1, title: 'Планирование', icon: 'home' },
  { id: 2, title: 'Закупки товаров' },
  { id: 3, title: 'Продаж товаров ' },
  { id: 4, title: 'Учет складов' },
  { id: 5, title: 'Касса и банка' },
  { id: 6, title: 'Зарплата и кадры' },
  { id: 7, title: 'Финансов и анализ' },
])

const admins = ref([
  { id: 1, title: 'Справочники' },
  { id: 2, title: 'Настройки программы' },
  { id: 3, title: 'Настройка разделов' },
]);

</script>

<template>
  <v-card class="sidebar">
    <v-layout>
      <v-navigation-drawer v-model="drawer" :rail="props.rale">
        <v-list density="compact" nav>

          <v-list-item v-for="item in menu" :key="item.id">
            <v-icon class="mr-2" color="info" size="30">{{ item.icon }}</v-icon>{{ item.title }}
          </v-list-item>

          <v-list-group value="Admin" class="admin">
            <template v-slot:activator="{ props }">
              <v-list-item class="d-flex" v-bind="props">
                <v-icon class="icon mr-2" color="info" size="30">analytics</v-icon>Админ-панель
              </v-list-item>
            </template>

            <div class="list">
              <v-list-item class="mb-0" v-for="title in admins" :title="title.title" :key="title.id" color="info"
                variant="plain" :value="title"></v-list-item>
            </div>
          </v-list-group>

        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 100vw"></v-main>
    </v-layout>
  </v-card>
</template>

<style scoped>
.sidebar {
  height: calc(100vh - 45px);
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.list {
  padding-left: 30px;
}

.admin:hover .icon {
  -webkit-animation: 0.2s tremor ease;
  animation: 0.2s tremor ease;
  transition: transform 0.5s;
}

@keyframes tremor {

  0%,
  25% {
    transform: rotate(20deg) translateX(-4%);
  }

  50% {
    transform: rotate(-20deg) translateX(-4%);
  }

  75% {
    transform: rotate(-20deg) translateX(-4%);
  }

  100% {
    transform: rotate(0deg) translateX(4%);
  }
}
</style>
