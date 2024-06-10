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
  approveDocument,
  copyMessage,
  documentAprove,
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
import {markedForDeletion, statusOptions} from "../../../composables/constant/items.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import {useFilterCanvasVisible} from "../../../store/canvasVisible.js";
import getColor from "../../../composables/displayed/getColor.js";
import getStatus from "../../../composables/displayed/getStatus.js";
import copyDocument from "../../../api/documents/copyDocument.js";
import procurementApi from "../../../api/documents/procurement.js";
import GoodErrorCanvas from "../../../components/Errors/goodErrorCanvas.vue";

const router = useRouter()
const modalCreateBased = useModalCreateBased()
const loading = ref(true)
const filterModal = ref(false)
const hoveredRowIndex = ref(null)
const isApproveError = ref(false);

const markedID = ref([]);
const approveError = ref([]);
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

const headers = ref([
  {title: 'Номер', key: 'doc_number'},
  {title: 'Дата', key: 'date'},
  { title: "Статус", key: "active" },
  {title: 'Склад-отправитель', key: 'storage.name'},
  {title: 'Склад-получатель', key: 'storage.name'},
  {title: 'Организация', key: 'organization.name'},
  {title: 'Автор', key: 'author.name'},
])

const rules = {
  required: v => !!v,
}


const getMoveData = async ({page, itemsPerPage, sortBy, search} = {}) => {
  count.value = 0;
  countFilter()
  filterModal.value = false
  loading.value = true
  try {
    const { data } = await moveApi.get({page, itemsPerPage, sortBy}, search, filterForm.value)
    console.log(data);
    paginations.value = data.result.pagination
    moves.value = data.result.data

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
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
        return showToast(selectOneItemMessage, "warning");
      }
      if (markedItem.value.active === false) {
        return showToast(documentAprove, "warning");
      }

      modalCreateBased.isModal();
    },
  },
  {
    name: "copy",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }

      try {
        const res = await copyDocument.copy(markedID.value[0]);
        if (res.status === 200) {
          showToast(copyMessage);
          window.open(`/moveOfGoods/${res.data.result.id}`, "_blank");
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    name: "approve",
    function: () => {
      approve();
    },
  },
  {
    name: "cancel",
    function: () => {
      unApprove();
    },
  },
  {
    name: "delete",
    function: () => {
      compute()
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



function countFilter() {

  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }

  return count;
}

const approve = async () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");
  try {
    await moveApi.approve({ ids: markedID.value })
    showToast(approveDocument)
    await getMoveData()
    markedID.value = []
  } catch (e) {
    console.error(e)
    if (e.response.status === 400) {
      approveError.value = e.response.data.errors;
      isApproveError.value = true;
    }
  }
};

const unApprove = async () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning")
  try {
    await moveApi.unApprove({ ids: markedID.value })
    showToast(approveDocument)
    await getMoveData()
    markedID.value = []
  } catch (e) {
    console.error(e)

  }
};

const massDel = async () => {
  try {
    const {status} = await moveApi.remove({ids: markedID.value})

    if (status === 200) {
      showToast(removeMessage, 'red')
      await getMoveData({})
      markedID.value = []
    }

  } catch (e) {
    console.error(e)
  }
}

const massRestore = async () => {
  try {
    const {status} = await moveApi.restore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getMoveData({})
      markedID.value = []
    }
  } catch (e) {
    console.error(e)
  }
}

const compute = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value.deleted_at) {
    return massRestore()
  }
  else{
    return massDel()
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

watch(isApproveError, (newVal) => {
  if (newVal) {
    useFilterCanvasVisible().toggleFilterCanvas();
  }
});

onMounted(() => {
  getOrganizations()
  getStorages()
  getSenderStorage()
  getRecipientStorage()
})

</script>

<template>
  <div class="pa-4"> 
      <div class="d-flex justify-space-between calcWidth">
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
          <div class="filterElement">
            <Icons
              name="filter"
              title="Фильтр"
              @click="useFilterCanvasVisible().toggleFilterCanvas()"
              class="mt-1"
            />
            <span v-if="count !== 0" class="countFilter">{{
              count
            }}</span>
          </div>
        </div>
      </div>
      <v-card class="table calcWidth">
        <v-data-table-server
            style="height: calc(100vh - 150px)"
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
              <td>
                <v-chip
                    style="height: 50px !important"
                    class="w-100 d-flex justify-center"
                    :color="getColor(item.active, item.deleted_at)"
                >
                <span class="padding: 5px;">{{
                    getStatus(item.active, item.deleted_at)
                  }}</span>
                </v-chip>
              </td>
              <td>{{ item.sender_storage_id.name }}</td>
              <td>{{ item.recipient_storage_id.name }}</td>
              <td>{{ item.organization_id.name }}</td>
              <td>{{ item.author_id.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>

    <filter-canvas @closeCanvas="isApproveError = false" :isApproveError="isApproveError">
      <div v-if="isApproveError">
        <goodErrorCanvas :approveError="approveError"/>
      </div>
      <div v-else class="d-flex flex-column w-100 ga-2">
          <div class="d-flex flex-column w-100 ga-2">
            <custom-filter-text-field min-width="106" class="date" label="От" type="date" v-model="filterForm.startDate"/>
            <custom-filter-text-field min-width="106" class="date" label="По" type="date" v-model="filterForm.endDate"/>
          </div>
          <div class="d-flex ga-2">
            <custom-filter-autocomplete label="Статус" :items="statusOptions" v-model="filterForm.active"/>
            <custom-filter-autocomplete label="Удалён" :items="markedForDeletion" v-model="filterForm.deleted"/>
          </div>
          <div class="d-flex flex-column w-100 ga-2">
            <custom-filter-autocomplete min-width="106" label="Огранизация" :items="organizations"  v-model="filterForm.organization_id"/>
            <custom-filter-autocomplete min-width="106" label="Склад-отправитель" :items="storages" v-model="filterForm.storage_id"/>
          </div>
          <custom-filter-autocomplete min-width="106" label="Склад-получатель" :items="storages" v-model="filterForm.storage_id"/>
          <div class="d-flex justify-end">
            <div class="d-flex ga-2" style="margin-right: -6%">
              <v-btn tabindex="-1" color="red" class="btn" @click="closeFilterModal"
              >сбросить</v-btn
              >
              <v-btn
                  tabindex="-1"
                  :color="BASE_COLOR"
                  class="btn"
                  @click="
                () => {
                  getMoveData();
                  useFilterCanvasVisible().closeFilterCanvas();
                }
              "
              >применить</v-btn
              >
            </div>
          </div>
      </div>
      </filter-canvas>
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