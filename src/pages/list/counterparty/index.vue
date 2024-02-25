<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import counterpartyApi from "../../../api/counterparty";
import showDate from "../../../composables/date/showDate"
import { addIcon, prevIcon, showIcon, editIcon, removeIcon, remove, cancel, removeMessage } from "../../../composables/constant/buttons.js";
import showToast from '../../../composables/toast'

const loading = ref(true);
const deleteDialog = ref( false)

const router = useRouter();

const counterparty = ref([]);
const paginations = ref([]);

const search = ref('')
const removeItemId = ref(null)

const headers = ref([
  { title: "№", key: "id", align: "start" },
  { title: "Наименование", key: "name" },
  { title: "Адрес", key: "address" },
  { title: "Тип контрагента", key: "roles" },
  { title: "Телефон", key: "phone" },
  { title: "Эл. почта", key: "email" },
  { title: "Дата создания", key: "created_at" },
  { title: "#", key: "icons", align: "center", sortable: false },
]);

const formatRole = (roles) => {
  const roleMap = {
    1: "Клиент",
    2: "Поставщик",
    3: "Прочие отношения",
  };

  return roles.map((role) => roleMap[role] || "Неизвестная роль").join(", ");
};

const rename = item => {
  router.push({ name: "renameCounterparty", params: { id: item.id } });
};

const showDetail = item => {
  router.push({ name: "detailCounterparty", params: { id: item.id } });
};

const showDelModal = item => {
  deleteDialog.value = true
  removeItemId.value = item.id
}
const fetchCounterparty = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await counterpartyApi.get({ page, itemsPerPage, sortBy }, search);
    counterparty.value = data.result.data.map((item) => ({
      ...item,
      created_at: showDate(item.created_at),
      roles: formatRole(item.roles),
    }));
    paginations.value = data.result.pagination;
    loading.value = false;
  } catch (error) {
    console.error(error);
  }
};

const removeCounterparty = async () => {
  try{
    await counterpartyApi.delete(removeItemId.value)
    deleteDialog.value = false
    showToast(removeMessage, 'red')
  }catch (e) {
    console.log(e)
  }
}
</script>

<template>
  <div>
    <v-col>

      <div class="d-flex justify-space-between">
        <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push('/adminPanel')">
          <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
        </v-btn>
        <v-btn class="rounded-circle pa-2 mb-1" color="green" size="40" @click="$router.push('createCounterparty')">
          <v-icon size="25">{{ addIcon }}</v-icon>
        </v-btn>
      </div>

      <v-card class="table mt-2">

        <v-card-title class="d-flex align-center pe-2">
          Список контрагентов
          <v-spacer />
          <v-spacer />
          <v-spacer />
          <v-text-field
            v-model="search"
            prepend-inner-icon="search"
            clearable
            density="compact"
            label="Поиск..."
            color="info"
            rounded="lg"
            single-line
            flat
            hide-details
            variant="outlined"
          />
        </v-card-title>

        <v-data-table-server
          style="height: 58vh"
          fixed-header
          :items="counterparty"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :search="search"
          @update:options="fetchCounterparty"
          v-model:items-per-page="paginations.per_page"
          :items-length="paginations.total || 0"
          :item-value="headers.title"
          hover
          theme="red"
          fixed-footer
        >
          <template v-slot:item.id="{ item, index }">
            <span>{{ index + 1 }}</span>
          </template>
          <template #item.icons="{ item }">
            <div class="d-flex ga-1">
              <v-icon color="info" class="icon" @click="showDetail(item)">{{ showIcon }}</v-icon>
              <v-icon color="orange" class="icon" @click="rename(item)">{{ editIcon }}</v-icon>
              <v-icon color="red" class="icon" @click="showDelModal(item)">{{ removeIcon }}</v-icon>
            </div>
          </template>
        </v-data-table-server>

      </v-card>

      <v-card>
        <v-dialog v-model="deleteDialog" activator="parent">
          <v-card width="350px" class="d-flex  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-end align-center pr-5 pt-3">

              <v-btn @click="deleteDialog = false" color="info" variant="tonal" :size="38">
                <v-icon size="22">close</v-icon>
              </v-btn>
            </div>
            <v-card class="d-flex flex-column w-100 pr-5 pl-5 pb-5 mt-2 justify-space-between h-100 " min-height="240">
              <div class="d-flex justify-center align-center flex-column text-center">
                <v-icon size="60" color="warning">error</v-icon>
                <span class="mt-4 text-h6">Вы точно хотите удалить?</span>
              </div>
              <div class="d-flex flex-column justify-end ga-2 flex-grow-1 w-100 align-center">
                <v-btn :loading="loading" size="small" color="red" rounded="xl" height="35" class="mt-2 w-100" @click="removeCounterparty">
                  {{ remove }}
                </v-btn>
                <v-btn :loading="loading" size="small" color="info" rounded="xl" height="35" class="mt-1 w-100" @click="deleteDialog = false">
                  {{ cancel }}
                </v-btn>
              </div>
            </v-card>
          </v-card>
        </v-dialog>
      </v-card>

    </v-col>
  </div>
</template>

<style scoped></style>