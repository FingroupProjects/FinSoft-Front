<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import documentHistoryApi from "../../api/documents/documentHistory";
import showDate from "../../composables/date/showDate";

const route = useRoute();

const id = ref(null);

const historyDoc = ref([]);

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

onMounted(async () => {
  id.value = route.params.id;
  await getDocumentHistory();
});
</script>

<template>
  <div>
    <h2 class="ml-4 mt-4">История документа : Документ</h2>
    <v-col class="d-flex flex-column ga-4">
      <v-card class="pa-4 rounded-xl" v-for="item in historyDoc" :key="item">
        <div class="w-100" style="border-bottom: 2px solid #08072E">
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
</template>

<style></style>
