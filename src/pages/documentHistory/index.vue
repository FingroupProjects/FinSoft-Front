<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import documentHistoryApi from "../../api/documents/documentHistory";
import showDate from "../../composables/date/showDate";

const route = useRoute();

const id = ref(null);

const historyDoc = ref([]);
const balances = ref([]);

const selectedBlock = ref("История");

const seletectBlock = (name) => {
  selectedBlock.value = name;
};
const getDocumentHistory = async () => {
  try {
    const { data } = await documentHistoryApi.get(id.value);
    historyDoc.value = data.result.history.map((item) => ({
      ...item,
      date: showDate(item.date),
    }));
    console.log(data);
  } catch (e) {
    console.error(e);
  }
};

const getBalance = async () => {
  try {
    const { data } = await documentHistoryApi.balance(id.value);
    console.log(data);
    balances.value = data.result
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  id.value = route.params.id;
  await getDocumentHistory();
  await getBalance();
});
</script>

<template>
  <div class="ml-4 mt-4">
    <div class="switcher">
      <button
        @click="seletectBlock('История')"
        :class="selectedBlock === 'История' ? 'active' : ''"
        class="button"
      >
        История
      </button>
      <button
        @click="seletectBlock('Баланс')"
        :class="selectedBlock === 'Баланс' ? 'active' : ''"
        class="button"
      >
        Баланс
      </button>
      <button
        @click="seletectBlock('Учет товаров')"
        :class="selectedBlock === 'Учет товаров' ? 'active' : ''"
        class="button"
      >
        Учет товаров
      </button>
      <button
        @click="seletectBlock('Взаимодействие с поставщиками')"
        :class="
          selectedBlock === 'Взаимодействие с поставщиками' ? 'active' : ''
        "
        class="button"
      >
        Взаимодействие с поставщиками
      </button>
    </div>
    <div v-if="selectedBlock === 'История'">
      <h2>История документа : Документ</h2>
      <v-col class="d-flex flex-column ga-4">
        <v-card class="pa-4 rounded-xl" v-for="item in historyDoc" :key="item">
          <div class="w-100" style="border-bottom: 2px solid #08072e">
            <h3>{{ item.status }}</h3>
          </div>
          <div class="d-flex ga-2">
            <span style="color: #9b9b9b">Дата: {{ item.date }}</span>
            <span>{{ item.user.name }}</span>
          </div>
          <div
            v-for="(history, index) in item.changes"
            :key="index"
            class="d-flex flex-column"
          >
            <span
              class="d-flex ga-2"
              v-for="(value, key) in history.body"
              :key="key"
            >
              <div class="bg-white pa-3 rounded-lg">
                <span>{{ key }}: </span>
                <span>{{ value.previous_value }}</span> =>
                <span>{{ value.new_value }}</span>
              </div>
            </span>
          </div>
        </v-card>
      </v-col>
    </div>
    <div v-if="selectedBlock === 'Баланс'">
      <h2>Баланс</h2>
    </div>
    <div v-if="selectedBlock === 'Учет товаров'">
      <h2>Учет товаров</h2>
    </div>
    <div v-if="selectedBlock === 'Взаимодействие с поставщиками'">
      <h2>Взаимодействие с поставщиками</h2>
    </div>
  </div>
</template>

<style>
.switcher {
  background-color: #d9dce2;
  padding: 14px 16px;
  display: flex;
  gap: 10px;
  width: 640px;
  border-radius: 12px;
}

.button {
  padding: 8px 10px;
  transition: all 500ms ease-in-out;
}
.active {
  background-color: #4f4cd1;
  border-radius: 12px;
  color: white;
}
</style>
