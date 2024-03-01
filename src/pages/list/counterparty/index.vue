<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import counterpartyApi from "../../../api/counterparty";
import showDate from "../../../composables/date/showDate"
import { removeMessage, restoreMessage} from "../../../composables/constant/buttons.js";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import createCounterparty from "./create.vue"

const router = useRouter();

const loading = ref(true);
const isCreate = ref(false)

const hoveredRowIndex = ref(null)

const markedID = ref([])
const markedItem = ref([])
const counterparty = ref([]);
const paginations = ref([]);

const search = ref('')

const headers = ref([
  { title: "№", key: "id", align: "start" },
  { title: "Наименование", key: "name" },
  { title: "Адрес", key: "address" },
  { title: "Тип контрагента", key: "roles" },
  { title: "Телефон", key: "phone" },
  { title: "Эл. почта", key: "email" },
  { title: "Дата создания", key: "created_at" },
]);

const formatRole = (roles) => {
  const roleMap = {
    1: "Клиент",
    2: "Поставщик",
    3: "Прочие",
  };

  return roles.map((role) => roleMap[role] || "Неизвестная роль").join(", ");
};

const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
}

const handleCheckboxClick = function (item) {
  lineMarking(item)
}

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if(markedItem.value.deleted_at) {
    return massRestoreCounterparty({ page, itemsPerPage, sortBy })
  }
  else{
    return massDel({ page, itemsPerPage, sortBy, search })
  }
}

const getCounterparty = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true;
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

const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value
  }
  try{
    const { status } = await counterpartyApi.massDeletion(body)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getCounterparty({page, itemsPerPage, sortBy}, search)
      markedID.value = []
    }
  }catch(e){
    console.log(e)
  }
}

const massRestoreCounterparty = async ({ page, itemsPerPage, sortBy }) => {
  try{
    const body = {
      ids: markedID.value
    }
    const { status } = await  counterpartyApi.massRestore(body)
    if (status === 200) {
      showToast(restoreMessage, 'green')
      await getCounterparty({ page, itemsPerPage, sortBy })
      markedID.value = []
    }
  }catch (e) {
    console.log(e)
  }
}

</script>

<template>
  <div>
    <v-col>

      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Контрагенты</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons @click="isCreate = true" name="add"/>
              <Icons name="copy"/>
              <Icons @click="compute({ page, itemsPerPage, sortBy, search })" name="delete"/>
            </div>
            <div class="w-100">
              <v-text-field
                  v-model="search"
                  prepend-inner-icon="search"
                  density="compact"
                  label="Поиск..."
                  variant="outlined"
                  color="info"
                  rounded="lg"
                  clear-icon="close"
                  hide-details
                  single-line
                  clearable
                  flat
              ></v-text-field>
            </div>
          </div>
          <Icons name="filter" class="mt-1"/>
        </v-card>
      </div>

      <v-card class="table mt-2">

        <v-data-table-server
          style="height: 78vh"
          fixed-header
          :items="counterparty"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :search="search"
          @update:options="getCounterparty"
          v-model:items-per-page="paginations.per_page"
          :items-length="paginations.total || 0"
          :item-value="headers.title"
          hover
          fixed-footer
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)" :class="{'bg-grey-lighten-2': markedID.includes(item.id)}">
              <td>
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)" @change="handleCheckboxClick(item)">
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <span class="">
                  <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                  <span>{{ index + 1 }}</span>
                    </span>
                </template>
              </td>
              <td>
                <span>{{ item.name }}</span>
              </td>
              <td>
                <span>{{ item.address }}</span>
              </td>
              <td>
                <span>{{ item.roles }}</span>
              </td>
              <td>
                <span>{{ item.phone }}</span>
              </td>
              <td>
                <span>{{ item.email }}</span>
              </td>
              <td>
                <span>{{ item.created_at }}</span>
              </td>
            </tr>
          </template>

        </v-data-table-server>

      </v-card>
        <create-counterparty :isOpen="isCreate" @toggleIsOpen="isCreate = false"/>
    </v-col>
  </div>
</template>