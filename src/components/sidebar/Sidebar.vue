<script setup>
import {ref, defineProps, onMounted} from 'vue'
import Icons from "../../composables/Icons/Icons.vue";
import { useRouter } from 'vue-router';

const props = defineProps(['rale'])
const drawer = ref(true)
const router = useRouter();const users = ref([])
const filteredLists = ref([])


const menu = ref([
  { id: 1, title: 'Планирование', icon: 'planning', link: '/planning' },
  { id: 2, title: 'Закупки товаров', icon: 'procurementOfGoods', link: '/procurementOfGoods' },
  { id: 3, title: 'Продажа товаров ', icon: 'sellingGoods', link: '/sellingGoods' },
  { id: 4, title: 'Учет складов', icon: 'storage', link: '/warehouseAccounting' },
  { id: 5, title: 'Касса и банки', icon: 'cash', link: '/cash' },
  { id: 6, title: 'Зарплата и кадры', icon: 'salary', link: '/salary' },
  { id: 7, title: 'Финансы и  анализ', icon: 'financeAnalysis', link: '/financeAnalysis' },
  { id: 8, title: 'Админ - панель', icon: 'adminPanel', link: '/adminPanel' },
]);



onMounted(() => {
  users.value = JSON.parse(localStorage.getItem('user'));

  filteredLists.value = menu.value.filter(item => users.value.permissions.includes(item.link.slice(1)));

  console.log(filteredLists.value);
});

function push(item) {
  router.push(item.link)
}

</script>

<template>
  <v-card class="sidebar">
    <v-layout class="side">

      <v-navigation-drawer :width="320" v-model="drawer" color="#70C94633" permanent :rail="props.rale">
          <v-list density="comfortable">

            <v-list-item
                v-for="item in filteredLists"
                color="info"
                :key="item.id"
                @click="push(item)"
                class="admin"
            >
              <template v-slot:default>
                  <v-list-item-title>{{ item.title.toUpperCase() }}</v-list-item-title>
              </template>
              <template v-slot:prepend>
                <Icons class="icons" :name="item.icon" />
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
  box-shadow: none;
}

.icons{
  margin-right: 20px;
}

.admin:hover .icons {
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
