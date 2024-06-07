<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast/index.js'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {BASE_COLOR, FIELD_OF_SEARCH, TITLE_COLOR} from "../../../composables/constant/colors.js";
import { markedForDeletion, statusOptions } from "../../../composables/constant/items.js"
import {
  approveDocument,
  copyMessage,
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import providerOrderApi from '../../../api/documents/providerOrder.js';
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import storageApi from "../../../api/list/storage.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import currencyApi from "../../../api/list/currency.js";
import user from "../../../api/list/user.js";
import Button from "../../../components/button/button.vue";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import {useModalCreateBased} from "../../../store/modalCreateBased.js";
import CreateBase from "../../../components/modal/CreateBase.vue";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import {useFilterCanvasVisible} from "../../../store/canvasVisible.js";
import copyDocument from "../../../api/documents/copyDocument.js";
import getColor from "../../../composables/displayed/getColor.js";
import getStatus from "../../../composables/displayed/getStatus.js";

const router = useRouter()

const loading = ref(true)
const loadingRate = ref(true)
const dialog = ref(false)
const filterModal = ref(false)
const hoveredRowIndex = ref(null)
const modalCreateBased = useModalCreateBased()

const markedID = ref([]);
const markedItem = ref([])
const search = ref('')
const debounceSearch = ref('')
const nameRef = ref(null)
const descriptionRef = ref(null)
const providerOrders = ref([])
const paginations = ref([])
const showConfirmDialog = ref(false);
const showModal = ref(false);
const count = ref(0);


const organizations = ref([])
const providers = ref([])
const storages = ref([])
const authors = ref([])
const currencies = ref([])
const counterparties = ref([])
const counterpartyAgreements = ref([])

const filterForm = ref({
  date: null,
  startDate: null,
  endDate: null,
  active: null,
  deleted: null,
  provider_id: null,
  counterparty_id: null,
  counterparty_agreement_id: null,
  organization_id: null,
  storage_id: null,
  author_id: null,
  currency_id: null
})


const headers = ref([
  {title: 'Номер', key: 'doc_number'},
  {title: 'Дата', key: 'date'},
  { title: "Статус", key: "active" },
  {title: 'Поставщик', key: 'counterparty.name'},
  {title: 'Организация', key: 'organization.name'},
  {title: 'Автор', key: 'author.name'},
  {title: 'Валюта', key: 'currency.name'},
])
  
const getProviderOrderData = async ({page, itemsPerPage, sortBy, search} = {}) => {
  count.value = 0;
  countFilter()
  filterModal.value = false
  loading.value = true
  try {
    const { data } = await providerOrderApi.get({page, itemsPerPage, sortBy}, search, filterForm.value)
    paginations.value = data.result.pagination
    providerOrders.value = data.result.data
    loading.value = false
  } catch (e) {
    console.error(e)
  }
}

const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "providerOrderCreate" }),
  },
  {
    name: "createBasedOn",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }
      if (markedItem.value.active === false) {
        return showToast("Сначало проведите документ", "warning");
      }

      modalCreateBased.isModal()
    }
  },
  {
    name: "copy",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }

      try {
        const res = await copyDocument.copyOrder(markedID.value[0]);
        if (res.status === 200) {
          showToast(copyMessage);
          window.open(`/providerOrder/${res.data.result.id}`, "_blank");
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
      compute();
    },
  },
]);

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }
}

const massDel = async () => {

  try {
    const {status} = await providerOrderApi.remove({ids: markedID.value})

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getProviderOrderData({})
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {
    console.error(e)
  }
}


const massRestore = async () => {

  try {
    const {status} = await providerOrderApi.restore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getProviderOrderData({})
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {
    console.error(e)
  }
}

const compute = () => {
  if(markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if(markedItem.value.deleted_at) {
    return massRestore()
  }
  else{
    return massDel()
  }
}

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = providerOrders.value.find(el => el.id === markedID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
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

const closeFilterModal = async ({page, itemsPerPage, sortBy, search}) => {
  filterModal.value = false
  cleanFilterForm()
  await getProviderOrderData({page, itemsPerPage, sortBy, search})
}

const cleanFilterForm = () => {
  filterForm.value = {}
}


watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    descriptionRef.value = null
    loadingRate.value = true
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
})


const getAuthors = async () => {
  const { data } = await user.getAuthors();
  
  authors.value = data.result.data
}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getStorages = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  storages.value = data.result.data
}
const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterparties.value = data.result.data
}

const getCpAgreements = async () => {
  const { data } = await cpAgreementApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterpartyAgreements.value = data.result.data
}


const getCurrencies = async () => {
  const { data } = await currencyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  currencies.value = data.result.data
}

const show = (item) => {
  window.open(`/providerOrder/${item.id}`, '_blank')
}

const approve = async () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");

  try {
    const res = await providerOrderApi.approve({ ids: markedID.value });
    showToast(approveDocument);
    await getProviderOrderData();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

const unApprove = async () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");

  try {
    await providerOrderApi.unApprove({ ids: markedID.value });
    showToast(approveDocument);
    await getProviderOrderData();
    markedID.value = [];
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  getOrganizations()
  getCounterparties()
  getCpAgreements()
  getStorages()
  getCurrencies()
  getAuthors()
})

watch(markedID, (newVal) => {
  markedItem.value = providerOrders.value.find((el) => el.id === newVal[0]);
})

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))

</script>

<template>
  <div class="pa-4">
      <div class="d-flex justify-space-between calcWidth">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Заказ поставщику</span>
        </div>
        <div class="d-flex justify-end ga-2">
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
          
        <div class="mt-1 filterElement">
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
            style="height: 78vh"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            v-model:items-per-page="paginations.per_page"
            :loading="loading"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="providerOrders"
            :item-value="headers.title"
            :search="debounceSearch"
            v-model="markedID"
            @update:options="getProviderOrderData"
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
              <td>{{ item.counterparty.name }}</td>
              <td>{{ item.organization.name }}</td>
              <td>{{ item.author.name }}</td>
              <td>{{ item.currency.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <filter-canvas>
        <div class="d-flex flex-column ga-2 w-100">
          <custom-filter-text-field label="Дата от" class="date" type="date" min-width="106"  v-model="filterForm.startDate"/>
          <custom-filter-text-field label="Дата до" class="date" type="date" min-width="106"  v-model="filterForm.endDate"/>
        </div>
        <div class="d-flex ga-2">
          <custom-filter-autocomplete label="Статус" :items="statusOptions" v-model="filterForm.active"/>
          <custom-filter-autocomplete label="Удалён" :items="markedForDeletion" v-model="filterForm.deleted"/>
        </div>
        <div class="d-flex ga-2">
          <custom-filter-autocomplete label="Организация" :items="organizations"  v-model="filterForm.organization_id"/>
          <custom-filter-autocomplete label="Поставщик" :items="counterparties" v-model="filterForm.counterparty_id"/>
        </div>
        <div class="d-flex ga-2">
          <custom-filter-autocomplete label="Склад" :items="storages" v-model="filterForm.storage_id"/>
          <custom-filter-autocomplete label="Валюта" :items="currencies" v-model="filterForm.currency_id"/>
        </div>
        <div class="d-flex ga-2">
          <custom-filter-autocomplete label="Автор" :items="authors" v-model="filterForm.author_id"/>
          <custom-filter-autocomplete label="Договор" :items="counterpartyAgreements" v-model="filterForm.counterparty_agreement_id"/>
        </div>
        <div class="d-flex justify-end ga-2">
          <div class="d-flex ga-2" style="margin-right: -6%;">
            <v-btn tabindex="-1" color="red" class="btn" @click="closeFilterModal">сбросить</v-btn>
            <v-btn tabindex="-1" :color="BASE_COLOR" class="btn"  @click="() => {getProviderOrderData(); useFilterCanvasVisible().closeFilterCanvas()}">применить</v-btn>
          </div>
        </div>
      </filter-canvas>
  </div>


</template>

<style scoped>
.filterElement {
  position: relative;
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