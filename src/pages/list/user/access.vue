<script setup>
import { onMounted, ref } from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import resourcesApi from "../../../api/resources";
import subsystemApi from "../../../api/subsystem";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { useRoute } from "vue-router";
import { editMessage } from "../../../composables/constant/buttons";
import showToast from "../../../composables/toast";

const route = useRoute();
const hoveredRowIndex = ref(null);

const loading = ref(true);

const markedItem = ref([]);
const resources = ref([]);
const subsystem = ref([]);
const previewItem = ref([]);

const body = ref({
  resource: [],
});

const systemBody = ref({
  permissions: [],
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
  markedItem.value = item;

  if (markedItem.value.access.includes(type)) {
    markedItem.value.access = markedItem.value.access.filter(
      (access) => access !== type
    );
  } else {
    markedItem.value.access.push(type);
  }

  const index = body.value.resource.findIndex(
    (resource) => resource.id === markedItem.value.id
  );
  if (index !== -1) {
    body.value.resource[index] = markedItem.value;
    return;
  }
  body.value.resource.push(markedItem.value);
};

// const lineMarkingSystem = (item) => {
//   const itemName = item.title;
//   const existingPermissionIndex = systemBody.value.permissions.findIndex(
//     (permission) => permission.name === itemName
//   );

//   if (existingPermissionIndex !== -1) {
//     systemBody.value.permissions.splice(existingPermissionIndex, 1);
//   } else {
//     systemBody.value.permissions.push({ name: itemName });
//   }
// };

const lineMarkingSystem = (item, type) => {
  markedItem.value = item;

  if (markedItem.value.access.includes(type)) {
    markedItem.value.access = markedItem.value.access.filter(
      (access) => access !== type
    );
  } else {
    markedItem.value.access.push(type);
  }

  const index = systemBody.value.permissions.findIndex(
    (permission) => permission.id === markedItem.value.id
  );
  if (index !== -1) {
    systemBody.value.permissions[index] = markedItem.value;
    return;
  }
  systemBody.value.permissions.push(markedItem.value);
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
    subsystem.value = data.result;
    loading.value = false;
  } catch (e) {
    console.log(e);
  }
};

const createAccess = async () => {
  try {
    const allAccess = [];

    body.value.resource.forEach((item) => {
      allAccess.push(item);
    });

    resources.value.forEach((access) => {
      if (!allAccess.some((item) => item.title === access.title)) {
        allAccess.push(access);
      }
    });

    await resourcesApi.create(route.params.id, {
      resource: allAccess,
    });
    showToast(editMessage, "green");

    getRecources();
  } catch (e) {
    console.log(e);
  }
};

const createSubsystem = async () => {
  try {
    const allAccess = [];

    systemBody.value.permissions.forEach((item) => {
      allAccess.push(item);
    });

    subsystem.value.forEach((access) => {
      if (!allAccess.some((item) => item.title === access.title)) {
        allAccess.push(access);
      }
    });
    console.log(allAccess);
    const res = await subsystemApi.create(route.params.id, {
      resource: allAccess,
    });

    showToast(editMessage, "green");

    getSubSystem();
  } catch (e) {
    console.log(e);
  }
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
            <template v-if="loading">
              <tbody>
                <tr v-for="index in 12" :key="index">
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                </tr>
              </tbody>
            </template>
            <template v-else>
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
                      @change="lineMarking(item, 'read')"
                      :checked="item.access.includes('read')"
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'create')"
                      :checked="item.access.includes('create')"
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'update')"
                      :checked="item.access.includes('update')"
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'delete')"
                      :checked="item.access.includes('delete')"
                    ></CustomCheckbox>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-card>
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Документ</span><Icons name="save"></Icons
          ></v-card-title>
          <v-table density="compact">
            <template v-if="loading">
              <tbody>
                <tr v-for="index in 12" :key="index">
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                </tr>
              </tbody>
            </template>
            <template v-else>
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
                <tr v-for="item in []" :key="item.name">
                  <td>{{ item.ru_title }}</td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'read')"
                      :checked="item.access.includes('read')"
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'create')"
                      :checked="item.access.includes('create')"
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'update')"
                      :checked="item.access.includes('update')"
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'delete')"
                      :checked="item.access.includes('delete')"
                    ></CustomCheckbox>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-card>
      </div>
      <div class="d-flex ga-4 w-100 mt-2">
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Отчет</span
            ><Icons @click="createAccess()" name="save"></Icons
          ></v-card-title>
          <v-table density="compact">
            <template v-if="loading">
              <tbody>
                <tr v-for="index in 8" :key="index">
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                </tr>
              </tbody>
            </template>
            <template v-else>
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
                <tr v-for="item in []" :key="item.name">
                  <td>{{ item.ru_title }}</td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarkingSystem(item)"
                      :checked="item.access.includes()"
                    ></CustomCheckbox>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-card>
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Подсистема</span
            ><Icons @click="createSubsystem()" name="save"></Icons
          ></v-card-title>

          <v-table density="compact">
            <template v-if="loading">
              <tbody>
                <tr v-for="index in 8" :key="index">
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                  <td>
                    <v-skeleton-loader
                      type="text"
                      height="20px"
                      class="mx-auto"
                    ></v-skeleton-loader>
                  </td>
                </tr>
              </tbody>
            </template>
            <template v-else>
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
                      @change="lineMarkingSystem(item, 'read')"
                      :checked="item.access.includes('read')"
                    ></CustomCheckbox>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-card>
      </div>
    </v-col>
  </div>
</template>
