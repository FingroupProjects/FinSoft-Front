<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast/index.js'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import {BASE_COLOR, FIELD_OF_SEARCH, TITLE_COLOR} from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import organizationApi from "../../../api/list/organizations.js";
import storageApi from "../../../api/list/storage.js";
import moveApi from '../../../api/documents/move.js';
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import Button from "../../../components/button/button.vue";
import CreateBase from "../../../components/modal/CreateBase.vue";
import {useModalCreateBased} from "../../../store/modalCreateBased.js";

const router = useRouter()
const modalCreateBased = useModalCreateBased()
const loading = ref(true)
const filterModal = ref(false)
const hoveredRowIndex = ref(null)

const markedID = ref([]);
const markedItem = ref([])
const search = ref('')
const debounceSearch = ref('')
const nameRef = ref(null)
const descriptionRef = ref(null)
const moves = ref([])
const paginations = ref([])
const showConfirmDialog = ref(false);
const showModal = ref(false);
const count = ref(0);

const organizations = ref([])
const storages = ref([])
const sender_storages = ref([])
const recipient_storages = ref([])

const filterForm = ref({
  date: null,
  startDate: null,
  endDate: null,
  active: null,
  deleted: null,
  organization_id: null,
  sender_storage_id: null,
  recipient_storage_id: null,
  storage_id: null,
  comment: null,
})

const statusOptions = ['проведён', 'не проведён'];
  const deletionStatuses = ['не удален', 'удален'];


const headers = ref([
  {title: 'Номер', key: 'doc_number'},
  {title: 'Дата', key: 'date'},
  {title: 'Склад-отправитель', key: 'storage.name'},
  {title: 'Склад-получатель', key: 'storage.name'},
  {title: 'Организация', key: 'organization.name'},
  {title: 'Автор', key: 'author.name'},
])

const rules = {
  required: v => !!v,
}


const getMoveData = async ({page, itemsPerPage, sortBy, search}) => {
  count.value = 0;
  countFilter()
  const filterData = {
      ...filterForm.value,
      active: filterForm.value.active === 'проведён' ? 1 : 0,
      deleted: filterForm.value.deleted === 'удален' ? 1 : 0 ,
    };
  filterModal.value = false
  loading.value = true
  try {
    const { data } = await moveApi.get({page, itemsPerPage, sortBy}, search, filterData)
    console.log(data);
    paginations.value = data.result.pagination
    moves.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}

const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "moveOfGoodsCreate" }),
  },
  {
    name: "createBasedOn",
    function: () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, 'warning')
      }

      modalCreateBased.isModal()
    },
  },
  {
    name: "copy",
  },
 
   
  {
    name: "delete",
    function: () => {
      massDel({});
    },
  },
]);

const show = (item) => {
  window.open(`/moveOfGoods/${item.id}`, "_blank");
};

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getStorages = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  storages.value = data.result.data
}

const getSenderStorage = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  sender_storages.value = data.result.data
}
const getRecipientStorage = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  recipient_storages.value = data.result.data
}

onMounted(() => {
  getOrganizations()
  getStorages()
  getSenderStorage()
  getRecipientStorage()
})


function countFilter() {

  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }

  return count;
}

const massDel = async () => {
  try {
    const {status} = await moveApi.massDeletion({ids: markedID.value})

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getMoveData({})
      markedID.value = []
      dialog.value = false
    }

  } catch (e) {

  }
}
const massRestore = async () => {

  try {
    const {status} = await moveApi.massRestore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getMoveData({})
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if(markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if(markedItem.value.deleted_at) {
    return massRestore({ page, itemsPerPage, sortBy })
  }
  else{
    return massDel({ page, itemsPerPage, sortBy, search })
  }
}

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = moves.value.find(el => el.id === markedID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if(item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if(item.deleted_at !== null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
  }

  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
}

const  closeFilterModal = async ({page, itemsPerPage, sortBy, search}) => {
  filterModal.value = {}
  cleanFilterForm()
  await getMoveData({page, itemsPerPage, sortBy, search})
}

const cleanFilterForm = () => {
  filterForm.value = {}
}

watch(markedID, (newVal) => {
  markedItem.value = moves.value.find((el) => el.id === newVal[0]);
})

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))

</script>

<template>
  <div class="pa-4"> 
      <div class="d-flex justify-space-between">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Перемещение товаров</span>
        </div>
        <div class="d-flex align-center ga-2">
          <div class="d-flex w-100 justify-end mb-3">
            <div class="d-flex ga-2 position-relative">
              <Button
                v-for="(button, idx) in headerButtons"
                :name="button.name"
                :key="idx"
                @click="button.function"
              />
              <create-base :marked-i-d="markedID[0]" />
          </div>
        </div>
        <div class="custom_search">
          <v-text-field
            style="width: 190px"
            class="mb-3"
            v-model="search"
            prepend-inner-icon="search"
            density="compact"
            label="Поиск..."
            variant="outlined"
            :color="BASE_COLOR"
            rounded="lg"
            :base-color="FIELD_OF_SEARCH"
            clear-icon="close"
            hide-details
            single-line
            :append-inner-icon="search ? 'close' : ''"
            @click:append-inner="search = ''"
            flat
          />
        </div>
          <div class=" filterElement">
            <Icons
              name="filter"
              title="Фильтр"
              @click="filterModal = true"
              class="mt-1"
            />
            <span v-if="count !== 0" class="countFilter">{{
              count
            }}</span>
          </div>
        </div>
      </div>
      <v-card class="table">
        <v-data-table-server
            style="height: 78vh"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            v-model:items-per-page="paginations.per_page"
            :loading="loading"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="moves"
            :item-value="headers.title"
            :search="debounceSearch"
            v-model="markedID"
            @update:options="getMoveData"
            page-text =  '{0}-{1} от {2}'
            :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
            show-select
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr
                @mouseenter="hoveredRowIndex = index"
                @mouseleave="hoveredRowIndex = null"
                @dblclick="show(item)"
                :class="{'bg-grey-lighten-2': markedID.includes(item.id) }"
                style="font-size: 12px"
            >
              <td>
                  <CustomCheckbox
                      v-model="markedID"
                      :checked="markedID.includes(item.id)"
                      @change="lineMarking(item)"
                  >
                  </CustomCheckbox>
              </td>
                 
              <td>{{ item.doc_number }}</td>
              <td>{{ getDateTimeInShow(item.date) }}</td>
              <td>{{ item.sender_storage_id.name }}</td>
              <td>{{ item.recipient_storage_id.name }}</td>
              <td>{{ item.organization_id.name }}</td>
              <td>{{ item.author_id.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
      <v-card>
        <v-dialog persistent class="mt-2 pa-2" v-model="filterModal" @keyup.esc="closeFilterModal">
          <v-card :style="`border: 2px solid ${BASE_COLOR}`" min-width="450"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Фильтр</span>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100 ga-4">
                  <div class="d-flex flex-column ga-2 w-100">
                    <custom-text-field label="От" type="date" min-width="508"  v-model="filterForm.startDate"/>
                    <custom-text-field label="По" type="date" min-width="508"  v-model="filterForm.endDate"/>
                    </div>
                    <div class="d-flex ga-2">                
                      <custom-autocomplete min-width="250" label="Статус" :items="statusOptions" v-model="filterForm.active"/>
                      <custom-autocomplete min-width="250" label="Удалён" :items="deletionStatuses" v-model="filterForm.deleted"/>               
                  </div>
                  <div class="d-flex ga-2">
                    <custom-autocomplete min-width="250" label="Огранизация" :items="organizations"  v-model="filterForm.organization_id"/>
                    <custom-autocomplete min-width="250" label="Склад-отправитель" :items="storages" v-model="filterForm.storage_id"/>               
                  </div>
                  <custom-autocomplete min-width="508" label="Склад-получатель" :items="storages" v-model="filterForm.storage_id"/>               
                  <div class="d-flex justify-end ga-2">
                    <v-btn color="red" class="btn" @click="closeFilterModal">сбросить</v-btn>
                    <v-btn :color="BASE_COLOR" class="btn"  @click="getMoveData">применить</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>
  </div>


</template>

<style scoped>
.filterElement {
  position: relative;
  margin-bottom: 10px;  
}
.countFilter {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #82abf6;
  border-radius: 50%;
  font-size: 10px;
  color: white;
}
</style>