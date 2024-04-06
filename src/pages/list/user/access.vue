<script setup>
import { onMounted, ref } from "vue";
import Icons from "../../../composables/Icons/Icons.vue";
import permissionApi from "../../../api/permission";
import subsystemApi from "../../../api/subsystem";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { useRoute } from "vue-router";
import { editMessage } from "../../../composables/constant/buttons";
import showToast from "../../../composables/toast";

const route = useRoute();

const allSelected = ref(false);
const allSelectedSystem = ref(false);
const allSelectedDocuments = ref(false);
const loading = ref(true);

const markedItem = ref([]);
const resources = ref([]);
const documents = ref([]);
const reports = ref([]);
const subsystem = ref([]);

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

const isAllChecked = (access, tableNumber) => {
  if (tableNumber === 1) {
    return (
      allSelected.value &&
      resources.value.every((item) => item.access.includes(access))
    );
  } else if (tableNumber === 2) {
    return (
      allSelectedDocuments.value &&
      documents.value.every((item) => item.access.includes(access))
    );
  } else if (tableNumber === 3) {
    return (
      allSelectedSystem.value &&
      subsystem.value.every((item) => item.access.includes(access))
    );
  } else if (tableNumber === 4) {
    return (
      allSelectedSystem.value &&
      subsystem.value.every((item) => item.access.includes(access))
    );
  }
};

const toggleColumnSelection = (index, tableNumber) => {
  if (index === 0) return;
  if (tableNumber === 1) {
    allSelected.value = !allSelected.value;
  } else if (tableNumber === 2) {
    allSelectedDocuments.value = !allSelectedDocuments.value;
  } else if (tableNumber === 3) {
    allSelectedSystem.value = !allSelectedSystem.value;
  } else if (tableNumber === 4) {
    allSelectedSystem.value = !allSelectedSystem.value;
  }

  const dataSets = {
    1: resources.value,
    2: documents.value,
    3: reports.value,
    4: subsystem.value,
  };

  const resourcesArray = dataSets[tableNumber];

  const allChecked = resourcesArray.every((item) =>
    item.access.includes(headers.value[index].key)
  );

  if (allChecked) {
    resourcesArray.forEach((item) => {
      const keyIndex = item.access.indexOf(headers.value[index].key);
      if (keyIndex !== -1) {
        item.access.splice(keyIndex, 1);
      }
    });
    allSelected.value = false;
  } else {
    resourcesArray.forEach((item) => {
      if (!item.access.includes(headers.value[index].key)) {
        item.access.push(headers.value[index].key);
      }
    });
    allSelected.value = true;
  }
};

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
    const { data } = await permissionApi.get(route.params.id);
    resources.value = data.result;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const getSubSystem = async () => {
  try {
    loading.value = true;
    const { data } = await subsystemApi.get(route.params.id);
    subsystem.value = data.result;
    loading.value = false;
  } catch (e) {
    console.error(e);
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

    await permissionApi.create(route.params.id, {
      resource: allAccess,
    });

    getRecources();
  } catch (e) {
    console.error(e);
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
    await subsystemApi.create(route.params.id, {
      resource: allAccess,
    });

    getSubSystem();
  } catch (e) {
    console.error(e);
  }
};

const applyAccess = async () => {
  const promises = [];
  promises.push(createAccess());
  promises.push(createSubsystem());

  await Promise.all(promises)
    .then(() => {
      showToast("Доступ обновлен", "green");
    })
    .catch((e) => {
      console.error(e);
    });
};

onMounted(() => {
  getRecources();
  getSubSystem();
});

</script>
<template>
  <div>
    <v-col>
      <div class="d-flex justify-end mb-1">
        <v-btn @click="applyAccess()" color="green">ПРИМЕНИТЬ</v-btn>
      </div>
      <div class="d-flex ga-4 w-100">
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between">
            <span>Справочник</span>
          </v-card-title>
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
                    v-for="(header, index) in headers"
                    :key="header.title"
                    class="text-left"
                    :class="
                      header.title !== 'Наименование' ? 'cursor-pointer' : ''
                    "
                    @click="toggleColumnSelection(index, 1)"
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
                      :checked="
                        loading
                          ? false
                          : isAllChecked('read', 1) ||
                            item.access.includes('read')
                      "
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'create')"
                      :checked="
                        loading
                          ? false
                          : isAllChecked('create', 1) ||
                            item.access.includes('create')
                      "
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'update')"
                      :checked="
                        loading
                          ? false
                          : isAllChecked('update', 1) ||
                            item.access.includes('update')
                      "
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'delete')"
                      :checked="
                        loading
                          ? false
                          : isAllChecked('delete', 1) ||
                            item.access.includes('delete')
                      "
                    ></CustomCheckbox>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-table>
        </v-card>
        <v-card class="table mt-2 w-100">
          <v-card-title class="d-flex justify-space-between"
            ><span>Документ</span>
          </v-card-title>
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
                    v-for="(header, index) in headers"
                    :key="header.title"
                    class="text-left"
                    :class="
                      header.title !== 'Наименование' ? 'cursor-pointer' : ''
                    "
                    @click="toggleColumnSelection(index, 2)"
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
                      :checked="
                        loading
                          ? false
                          : isAllChecked('read', 1) ||
                            item.access.includes('read')
                      "
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'create')"
                      :checked="
                        loading
                          ? false
                          : isAllChecked('create', 1) ||
                            item.access.includes('create')
                      "
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'update')"
                      :checked="
                        loading
                          ? false
                          : isAllChecked('update', 1) ||
                            item.access.includes('update')
                      "
                    ></CustomCheckbox>
                  </td>
                  <td>
                    <CustomCheckbox
                      @change="lineMarking(item, 'delete')"
                      :checked="
                        loading
                          ? false
                          : isAllChecked('delete', 1) ||
                            item.access.includes('delete')
                      "
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
            ><span>Отчет</span>
          </v-card-title>
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
            ><span>Подсистема</span>
          </v-card-title>
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
                    v-for="(header, index) in reportHeaders"
                    :key="header.title"
                    class="text-left"
                    :class="
                      header.title !== 'Наименование' ? 'cursor-pointer' : ''
                    "
                    @click="toggleColumnSelection(index, 4)"
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
                      :checked="
                        isAllChecked('read', 4) || item.access.includes('read')
                      "
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
