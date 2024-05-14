<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast/index.js'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {BASE_COLOR, FIELD_COLOR, FIELD_OF_SEARCH, TITLE_COLOR} from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  warningMessage
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import clientReturnApi from '../../../api/documents/clientReturn.js';
import showDate from "../../../composables/date/showDate.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import user from "../../../api/list/user.js";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import storageApi from "../../../api/list/storage.js";
import currencyApi from "../../../api/list/currency.js";
import deleteRestoreApi from "../../../api/documents/deleteRestore.js";
import getDateTimeInShow from "../../../composables/date/getDateTimeInShow.js";
import Button from "../../../components/button/button.vue";


const router = useRouter()

const loading = ref(true)
const filterModal = ref(false)
const hoveredRowIndex = ref(null)

const markedID = ref([]);
const markedItem = ref([])
const search = ref('')
const debounceSearch = ref('')
const clientReturns = ref([])
const paginations = ref([])
const count = ref(0);

const organizations = ref([])
const storages = ref([])
const authors = ref([])
const currencies = ref([])
const counterparties = ref([])
const counterpartyAgreements = ref([])


const filterForm = ref({
  name: null,
  description: null,
  currency_id: null
})

const headers = ref([
  {title: 'Номер', key: 'name'},
  {title: 'Дата', key: 'currency.name'},
  {title: 'Поставщик', key: 'currency.name'},
  {title: 'Организация', key: 'currency.name'},
  {title: 'Склад', key: 'currency.name'},
  {title: 'Автор', key: 'currency.name'},
  {title: 'Валюта', key: 'currency.name'},
])

const rules = {
  required: v => !!v,
}


const getClientReturnData = async ({page, itemsPerPage, sortBy, search}) => {
  count.value = 0;
  countFilter()
  const filterData = filterForm.value
  filterModal.value = false
  loading.value = true
  try {
    const { data } = await clientReturnApi.get({page, itemsPerPage, sortBy}, search, filterData)
    paginations.value = data.result.pagination
    clientReturns.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}

const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "clientReturnCreate" }),
  },
  {
    name: "createBasedOn",
    function: () => {},
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
    const {status} = await deleteRestoreApi.delete({ids: markedID.value})
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getClientReturnData({})
      markedID.value = []
    }
  } catch (e) {

  }
}

const massRestore = async () => {
  try {
    const {status} = await deleteRestoreApi.restore({ids: markedID.value})
    if (status === 200) {
      showToast(restoreMessage)
      await getClientReturnData({})
      markedID.value = []
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
    const firstMarkedItem = clientReturns.value.find(el => el.id === markedID.value[0]);
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
  filterModal.value = false
  cleanFilterForm()
  await getClientReturnData({page, itemsPerPage, sortBy, search})
}

const cleanFilterForm = () => {
  filterForm.value = {}
}

const getAuthors = async () => {
  const { data } = await user.getAuthors()
  authors.value = data.result.data
}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterparties.value = data.result.data
}

const getCpAgreements = async () => {
  const { data } = await cpAgreementApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterpartyAgreements.value = data.result.data
}

const getStorages = async () => {
  const { data } = await storageApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  storages.value = data.result.data
}

const getCurrencies = async () => {
  const { data } = await currencyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  currencies.value = data.result.data
}

const show = (item) => {
  window.open(`/clientReturn/${item.id}`, '_blank')
}

watch(markedID, (newVal) => {
  markedItem.value = clientReturns.value.find((el) => el.id === newVal[0]);
})

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))

onMounted(() => {
  getOrganizations()
  getCounterparties()
  getCpAgreements()
  getStorages()
  getCurrencies()
  getAuthors()
})


</script>

<template>
  <div class="pa-4">
      <div class="d-flex justify-space-between">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Возврат от клиента</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex justify-end ga-2">
          <div class="d-flex w-100 justify-end mb-3">
          <div class="d-flex ga-2">
            <Button
              v-for="(button, idx) in headerButtons"
              :name="button.name"
              :key="idx"
              @click="button.function"
            />
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
            @click="filterModal = true"
            class="mt-1"
          />
          <span v-if="counterFilter !== 0" class="countFilter">{{
            count
          }}</span>
        </div>
        </v-card>
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
            :items="clientReturns"
            :item-value="headers.title"
            :search="debounceSearch"
            v-model="markedID"
            @update:options="getClientReturnData"
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
              <td>{{ item.counterparty.name }}</td>
              <td>{{ item.organization.name }}</td>
              <td>{{ item.storage.name }}</td>
              <td>{{ item.author.name }}</td>
              <td>{{ item.currency.name }}</td>
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
                  <div class="d-flex ga-2 w-100 ">
                    <custom-text-field label="Дата" type="date" min-width="508"  v-model="filterForm.date"/>
                  </div>
                  <div class="d-flex ga-2">
                    <custom-autocomplete label="Организация" :items="organizations"  v-model="filterForm.organization_id"/>
                    <custom-autocomplete label="Клиент" :items="counterparties" v-model="filterForm.counterparty_id"/>
                  </div>
                  <div class="d-flex ga-2">
                    <custom-autocomplete label="Склад" :items="storages" v-model="filterForm.storage_id"/>
                    <custom-autocomplete label="Валюта" :items="currencies" v-model="filterForm.currency_id"/>
                  </div>
                  <div class="d-flex ga-2">
                    <custom-autocomplete label="Автор" :items="authors" v-model="filterForm.author_id"/>
                    <custom-autocomplete label="Договор" :items="counterpartyAgreements" v-model="filterForm.counterparty_agreement_id"/>
                  </div>
                  <div class="d-flex justify-end ga-2">
                    <v-btn color="red" class="btn" @click="closeFilterModal">сбросить</v-btn>
                    <v-btn :color="BASE_COLOR" class="btn"  @click="getClientReturnData">применить</v-btn>
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