<script setup>
import { onMounted, ref } from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import resourcesApi from "../../../api/resources";
import subsystemApi from "../../../api/subsystem";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { useRoute } from "vue-router";
import {all} from "axios";

const route = useRoute();
const hoveredRowIndex = ref(null);

const loading = ref(true);

const search = ref("");

const arr = ref([]);
const markedID = ref([]);
const markedItem = ref([]);
const resources = ref([]);
const subsystem = ref([]);
const pagination = ref([]);

const body = ref({
  resource: [],
});

const headers = ref([
  { title: "Наименование", key: "name", align: "start" },
  { title: "Просмотр", key: "read", align: "start" },
  { title: "Добавление", key: "create", align: "start" },
  { title: "Обновление", key: "update", align: "start" },
  { title: "Удаление", key: "delete", align: "start" },
]);

const reportHeaders = ref([
  { title: "Наименование", key: "name", align: "start" },
  { title: "Использование", key: "read", align: "start" },
]);

const lineMarking = (item, type) => {
  console.log(1)
  markedItem.value = item;
  if (markedItem.value.access.includes(type)) return;
  markedItem.value.access.push(type);
  body.value.resource.push(markedItem.value);

};

const getRecources = async () => {
  try {
    loading.value = true;
    const { data } = await resourcesApi.get(route.params.id);
    resources.value = data.result;
    loading.value = false;
  } catch (e) {
    console.log(e);
  }
};

const getSubSystem = async () => {
  try {
    loading.value = true;
    const { data } = await subsystemApi.get(route.params.id);
    console.log(data);
    subsystem.value = data.result;
    // resources.value = data.result;
    loading.value = false;
  } catch (e) {
    console.log(e);
  }
};

const createAccess = async () => {
  try {

    const allAccess = [];

    body.value.resource.forEach(item => {
        allAccess.push(item);
    });

    resources.value.forEach(access => {

      if (!allAccess.some(item => item.title === access.title)) {
        allAccess.push(access);
      }
    });


    const res = await resourcesApi.create(route.params.id, { resource: allAccess });
    console.log(res);

    getRecources()

  } catch (e) {
    console.log(e);
  }
};


const get = async () => {
  return;
};

onMounted(() => {
  getRecources();
  getSubSystem();
});
</script>
<template>
  <div>
    <v-col>
      <div class="d-flex ga-4 w-100">
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Справочник</span
            ><Icons @click="createAccess()" name="save"></Icons
          ></v-card-title>
          <v-table density="compact">
            <thead>
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.title"
                  class="text-left"
                >
                  {{ header.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in resources" :key="item.name">
                <td>{{ item.ru_title }}</td>
                <td>
                  <CustomCheckbox
                      @click="lineMarking(item, 'read')"
                    :checked="item.access.includes('read')"
                  ></CustomCheckbox>
                </td>
                <td>
                  <CustomCheckbox
                      @click="lineMarking(item, 'create')"
                    :checked="item.access.includes('create')"
                  ></CustomCheckbox>
                </td>
                <td>
                  <CustomCheckbox
                    :checked="item.access.includes('update')"
                  ></CustomCheckbox>
                </td>
                <td>
                  <CustomCheckbox
                    :checked="item.access.includes('delete')"
                  ></CustomCheckbox>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Документ</span><Icons name="save"></Icons
          ></v-card-title>
          <v-table density="compact">
            <thead>
              <tr>
                <th
                  v-for="header in headers"
                  :key="header.title"
                  class="text-left"
                >
                  {{ header.title }}
                </th>
              </tr>
            </thead>
            <!-- <tbody>
              <tr v-for="item in resources" :key="item.name">
                <td>{{ item.title }}</td>
                <td>
                  <span
                    ><CustomCheckbox @click="lineMarking(item)"></CustomCheckbox
                  ></span>
                </td>
                <td>
                  <span><CustomCheckbox></CustomCheckbox></span>
                </td>
                <td>
                  <span><CustomCheckbox></CustomCheckbox></span>
                </td>
                <td>
                  <span><CustomCheckbox></CustomCheckbox></span>
                </td>
              </tr>
            </tbody> -->
          </v-table>
        </v-card>
      </div>
      <div class="d-flex ga-4 w-100 mt-2">
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Отчет</span><Icons name="save"></Icons
          ></v-card-title>
          <v-data-table-server
            style="height: 78vh"
            fixed-header
            :items="arr"
            :headers="reportHeaders"
            :loading="loading"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            :search="search"
            @update:options="get"
            v-model:items-per-page="pagination.per_page"
            :items-length="pagination.total || 0"
            :item-value="headers.title"
            hover
            fixed-footer
            page-text="{0}-{1} от {2}"
            :items-per-page-options="[
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
          >
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
            </template>
            <template v-slot:item="{ item, index }">
              <tr
                @mouseenter="hoveredRowIndex = index"
                @mouseleave="hoveredRowIndex = null"
                @dblclick="editItem(item.id)"
                :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
              >
                <td>
                  <span class="d-flex align-center">
                    <span>{{ item.id }}</span>
                  </span>
                </td>
                <td>
                  <span>{{ item.name }}</span>
                </td>
                <td>
                  <span><CustomCheckbox></CustomCheckbox></span>
                </td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Справочник</span
            ><Icons @click="createAccess()" name="save"></Icons
          ></v-card-title>
          <v-table density="compact">
            <thead>
              <tr>
                <th
                  v-for="header in reportHeaders"
                  :key="header.title"
                  class="text-left"
                >
                  {{ header.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in subsystem" :key="item.name">
                <td>{{ item.ru_title }}</td>
                <td>
                  <CustomCheckbox
                    :checked="item.access.includes('read')"
                  ></CustomCheckbox>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </div>
    </v-col>
  </div>
</template>
