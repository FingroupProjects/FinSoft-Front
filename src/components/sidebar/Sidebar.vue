<script setup>
import { ref, defineProps, } from 'vue'
import { useRouter } from 'vue-router';
const props = defineProps(['rale'])
const drawer = ref(true)
const router = useRouter();

const menu = ref([
  { id: 1, title: 'Планирование', icon: 'home', link: '/planning' },
  { id: 2, title: 'Закупки товаров', link: '/procurementOfGoods' },
  { id: 3, title: 'Продажа товаров ', link: '/sellingGoods' },
  { id: 4, title: 'Учет складов', link: '/sklad' },
  { id: 5, title: 'Касса и банки', link: '/cash' },
  { id: 6, title: 'Зарплата и кадры', link: '' },
  { id: 7, title: 'Финансы и анализ', icon: 'attach_money', link: '' },
])

const admins = ref([
  { id: 1, title: 'Справочники', link: '' },
  { id: 2, title: 'Настройки программы', link: '' },
  { id: 3, title: 'Настройка разделов', link: '' },
]);

function push(route) {
  router.push(route)
}

</script>

<template>
  <v-card class="sidebar">
    <v-layout>
      <v-navigation-drawer v-model="drawer" :rail="props.rale">
        <v-list density="compact" nav>

          <v-list-item v-for="item in menu" color="info" :key="item.id" @click="push(item.link)" :title="item.title"
            :value="item.title">
            <template v-slot:prepend>
              <v-icon color="info" :class="props.rale ? '' : 'pl-3'" :icon="item.icon"></v-icon>
            </template>
          </v-list-item>

          <v-list-group value="Admin" class="admin">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Админ-панель">
                <template v-slot:prepend>
                  <v-icon :class="props.rale ? '' : 'pl-3'" color="info">analytics</v-icon>
                </template>
              </v-list-item>
            </template>

            <div class="list">
              <v-list-item class="mb-0" v-for="admin in admins" :title="admin.title" :key="admin.id" color="info"
                variant="plain" :value="admin.title"></v-list-item>
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

.admin:hover .icon {
  animation: 0.3s tremor ease;
}

@keyframes tremor {

  0%,
  25% {
    transform: rotate(5deg);
  }

  50% {
    transform: rotate(-5deg);
  }

  60% {
    transform: rotate(-5deg);
  }

  80% {
    transform: rotate(5deg);
  }

  100% {
    transform: rotate(0deg);
  }
}
</style>
