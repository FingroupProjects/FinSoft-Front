<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { useRouter } from 'vue-router';

const props = defineProps(['rale'])
const router = useRouter();
const emit = defineEmits();

const admins = ref([
  { id: 1, title: 'Настройки программы', link: '/programSettings', icon: 'settings' },
  { id: 2, title: 'Настройка разделов', link: '', icon: 'settings' },
]);

const lists = ref([
  {
    id: 1, title: 'Справочник', child: [
      { id: 1, title: 'Банковские Счета Организаций', icon: 'account_balance', link: '/list/organizationBill' },
      { id: 2, title: 'Валюты', link: '/list/currency', icon: 'currency_exchange' },
      { id: 3, title: 'Виды Цен', link: '/list/priceType', icon: 'request_quote' },
      { id: 4, title: 'Договоры Контрагентов', link: '/list/counterpartyAgreement', icon: 'contact_page' },
      { id: 5, title: 'Кассы', link: '/list/cashRegister', icon: 'savings' },
      { id: 6, title: 'Контрагенты', link: '/list/counterparty', icon: 'group' },
      { id: 7, title: 'Номенклатура', icon: 'assignment' },
      { id: 9, title: 'Пользователи', icon: 'groups', link: '/list/employee' },
      { id: 8, title: 'Организации', link: '/list/organization', icon: 'corporate_fare' },
      { id: 10, title: 'Прочие Расходы', icon: 'price_change' },
      { id: 11, title: 'Склады', link: '/list/storage', icon: 'warehouse' },
      { id: 12, title: 'Сотрудники', link: '/list/employee', icon: 'supervisor_account' },
      { id: 13, title: 'Должность', link: '/list/position', icon: 'work' },
    ]
  }
]);

function push(item) {
  router.push(item.link)
}

</script>

<template>
  <div class="">
    <div class="panel align-start ga-10 pa-4">
      <div v-for="list in lists" :key="list.id">
        <h3 class="text-uppercase mb-4">{{ list.title }}</h3>
        <ul class="list">
          <span class="d-flex align-center ga-4 cursor-pointer" nav v-for="child in list.child" :key="child.id"
            @click="push(child)">
<!--            <div class="icon"><v-icon color="info">{{ child.icon }}</v-icon></div>-->
            <li>
              {{ child.title }}
            </li>
          </span>
        </ul>
      </div>
      <div>
        <div class="mb-10" nav v-for="admin in admins" :key="admin.id">
          <h3 class="text-uppercase mb-4">{{ admin.title }}</h3>
          <ul class="list">
            <span class="d-flex align-center ga-4 cursor-pointer" @click="push(admin)">
              <li>
                {{ admin.title }}
              </li>
            </span>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 12px;
  border-radius: 50px;
}

::-webkit-scrollbar-thumb {
  background: #c7c5c5;
  border-radius: 50px;
}

.panel{
  display: grid;
  grid-template-columns: repeat(2, 1fr 1fr) ;
}
ul {
  list-style: none;
}

.list {
  display: flex;
  flex-direction: column;
}

li {
  padding: 8px 10px;
  font-size: 18px;
}

span:hover {
  color: #3AB700;
}

</style>