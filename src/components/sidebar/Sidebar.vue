<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { useRouter } from 'vue-router';

const props = defineProps(['rale'])
const drawer = ref(true)
const router = useRouter();
const emit = defineEmits();

const menu = ref([
  { id: 1, title: 'Планирование', icon: 'widgets', link: '/planning' },
  { id: 2, title: 'Закупки товаров', icon: 'assignment_return', link: '/procurementOfGoods' },
  { id: 3, title: 'Продажа товаров ', icon: 'content_paste_go', link: '/sellingGoods' },
  { id: 4, title: 'Учет складов', icon: 'save_as', link: '/storage' },
  { id: 5, title: 'Касса и банки', icon: 'account_balance', link: '/cash' },
  { id: 6, title: 'Зарплата и кадры', icon: 'payments', link: '/salary' },
  { id: 7, title: 'Финансы и  анализ', icon: 'attach_money', link: '/financeAnalysis' },
  { id: 8, title: 'Админ - панель', icon: 'analytics', },
]);

function push(item) {
  if (item.id === 8) {
    emit('toggleAdmin')
  }
  else {
    router.push(item.link)
    emit('closeAdmin')
  }
}

</script>

<template>
  <v-card class="sidebar ">
    <v-layout class="side">

      <v-navigation-drawer :width="320" v-model="drawer" permanent :rail="props.rale">
        <v-list density="compact">

          <v-list-item v-for="item in menu" color="info" :key="item.id" @click="push(item)" :title="item.title"
            :value="item.title" class="admin" @mouseover="isHovering = true" @mouseleave="isHovering = false">
            <template v-slot:prepend>
              <v-icon class="icon" color="info" :icon="item.icon"></v-icon>
            </template>
          </v-list-item>

        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 100vh"> </v-main>
    </v-layout>
  </v-card>
</template>

<style scoped>
.sidebar {
  border: none;
  border-radius: none;
  box-shadow: none;
  /* height: 100%; */
}

/* .side {
  position: sticky;
  top: 45px;
  left: 0px;
} */

.admin:hover .icon {
  animation: 0.2s tremor ease;
}

@keyframes tremor {

  0%,
  100% {
    transform: rotate(0deg);
  }

  25% {
    transform: rotate(15deg);
  }

  75% {
    transform: rotate(-15deg);
  }
}
</style>
