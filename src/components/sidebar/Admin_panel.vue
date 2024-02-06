<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { useRouter } from 'vue-router';

const props = defineProps(['rale'])
const router = useRouter();
const emit = defineEmits();

const admins = ref([
  { id: 1, title: 'Настройки программы', link: '' },
  { id: 2, title: 'Настройка разделов', link: '' },
]);

const lists = ref([
  {
    id: 1, title: 'Справочник', child: [
      { id: 1, title: 'Банковские Счета Организаций' },
      { id: 2, title: 'Валюты', link: '/list/currency' },
      { id: 3, title: 'Виды Цен' },
      { id: 4, title: 'Договоры Контрагентов' },
      { id: 5, title: 'Кассы' },
      { id: 6, title: 'Контрагенты' },
      { id: 7, title: 'Наборы Упаковок' },
      { id: 8, title: 'Номенклатура' },
      { id: 9, title: 'Организации' },
      { id: 10, title: 'Пользователи' },
      { id: 11, title: 'Прочие Расходы' },
      { id: 12, title: 'Склады' },
      { id: 13, title: 'Сотрудники' },
      { id: 14, title: 'Должность' },
    ]
  }
]);

function push(item) {
  emit('close')
  router.push(item.link)
}

const admin_panel_width = computed(() => {
  return props.rale === true ? 'calc(100vw - 65px)' : 'calc(100vw - 255px)';
});

</script>

<template>
  <div class="admin_panel" :style="{ width: admin_panel_width }">
    <div class="d-flex justify-end">
      <v-icon color="info" icon="close" @click="emit('close')"></v-icon>
    </div>
    <div class="d-flex align-start ga-10">
      <div>
        <ul v-for="list in lists" :key="list.id">
          <h3>{{ list.title }}</h3>
          <span nav v-for="child in list.child" :key="child.id">
            <li class="text-body-2" @click="push(child)">
              {{ child.title }}
            </li>
          </span>
        </ul>
      </div>
      <div>
        <ul nav v-for="admin in admins" :key="admin.id">
          <h3>{{ admin.title }}</h3>
          <li class="mb-10 text-body-2" @click="push(admin)">{{ admin.title }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin_panel {
  position: absolute;
  top: 45px;
  right: 0;
  transition: width 250ms;
  height: calc(100vh - 45px);
  background: white;
  border-left: 1px rgb(152, 146, 146) solid;
  z-index: 10;
  padding: 20px;
  overflow: auto;
}

ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
}

li {
  padding: 6px 10px;
  border-radius: 5px;
}

li:hover {
  color: #2196f3;
}
</style>