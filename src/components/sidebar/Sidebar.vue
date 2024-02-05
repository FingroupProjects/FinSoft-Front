<script setup>
import { ref, defineProps, watchEffect, computed } from 'vue'
import { useRouter } from 'vue-router';
const props = defineProps(['rale'])
const drawer = ref(true)
const router = useRouter();

watchEffect(() => {
  console.log(props.rale)
})

const isClass = computed(() => {
  return props.rale ? '' : 'pr-3';
})

const menu = ref([
  { id: 1, title: 'Планирование', icon: 'widgets', link: '/planning' },
  { id: 2, title: 'Закупки товаров', icon: 'assignment_return', link: '/procurementOfGoods' },
  { id: 3, title: 'Продажа товаров ', icon: 'content_paste_go', link: '/sellingGoods' },
  { id: 4, title: 'Учет складов', icon: 'save_as', link: '/sklad' },
  { id: 5, title: 'Касса и банки', icon: 'account_balance', link: '/cash' },
  { id: 6, title: 'Зарплата и кадры', icon: 'payments', link: '' },
  { id: 7, title: 'Финансы и  анализ', icon: 'attach_money', link: '' }
]);

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
              <v-icon color="info" :class="isClass" :icon="item.icon"></v-icon>
            </template>
          </v-list-item>

          <v-list-group value="Admin" class="admin">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Админ-панель">
                <template v-slot:prepend>
                  <v-icon :class="isClass" color="info">analytics</v-icon>
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
