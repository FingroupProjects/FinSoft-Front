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
  { id: 4, title: 'Учет складов', icon: 'save_as', link: '/sklad' },
  { id: 5, title: 'Касса и банки', icon: 'account_balance', link: '/cash' },
  { id: 6, title: 'Зарплата и кадры', icon: 'payments', link: '' },
  { id: 7, title: 'Финансы и  анализ', icon: 'attach_money', link: '' },
  { id: 8, title: 'Админ - панель', icon: 'analytics', link: '' },
]);

function push(item) {
  if (item.id === 8) {
    emit('toggleAdmin')
  }
  else {
    router.push(item.link)
  }
}

</script>

<template>
  <v-card class="sidebar ">
    <v-layout>

      <v-navigation-drawer v-model="drawer" permanent :rail="props.rale" expand-on-hover>
        <v-list density="compact" nav>

          <v-list-item v-for="item in menu" color="info" :key="item.id" @click="push(item)" :title="item.title"
            :value="item.title">
            <template v-slot:prepend>
              <v-icon color="info" :icon="item.icon"></v-icon>
            </template>
          </v-list-item>

          <!-- <v-list-group value="Admin" class="admin">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Админ-панель">
                <template v-slot:prepend>
                  <v-icon color="info">analytics</v-icon>
                </template>
              </v-list-item>
            </template>

            <v-list-group v-for="list in lists" :key="list.id" value="List">
              <template v-slot:activator="{ props }">
                <v-list-item v-bind="props" :title="list.title">
                </v-list-item>
              </template>

              <div>
                <v-list-item class="mb-0 " v-for="list_child in list.child" :key="list_child.id"
                  @click="push(list_child.link)" color="info" variant="plain" :title="list_child.title"
                  :value="list_child.title">
                </v-list-item>
              </div>
            </v-list-group>


            <v-list-item class="mb-0" v-for="admin in admins" :title="admin.title" @click="push(admin.link)"
              :key="admin.id" color="info" variant="plain" :value="admin.title">
            </v-list-item>

          </v-list-group> -->

        </v-list>
      </v-navigation-drawer>
      <v-main style="height: 45vw"> </v-main>
    </v-layout>
  </v-card>
</template>

<style scoped>
.sidebar {
  height: auto;
  max-height: calc(100vh - 45px);
  border: none;
  border-radius: none;
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
