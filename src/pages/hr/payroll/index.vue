<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast/index.js'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {BASE_COLOR, FIELD_OF_SEARCH} from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  warningMessage
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import procurementApi from '../../../api/documents/procurement.js';
import showDate from "../../../composables/date/showDate.js";
import organizationApi from "../../../api/list/organizations.js";
import timeSheet from "../../../api/hr/timeSheet.js";
import schedule from "../../../api/list/schedule.js";

const router = useRouter()

const loading = ref(true)
const loadingRate = ref(true)
const dialog = ref(false)
const filterModal = ref(false)
const hoveredRowIndex = ref(null)

const markedID = ref([]);
const markedItem = ref([])
const search = ref('')
const debounceSearch = ref('')
const procurements = ref([])
const paginations = ref([])
const showConfirmDialog = ref(false);
const showModal = ref(false);
const counterFilter = ref(0);

const organizations = ref([])
const storages = ref([])
const authors = ref([])
const currencies = ref([])
const months = ref([])

const filterForm = ref({
  date: null,
  provider_id: null,
  month_id: null,
  counterparty_agreement_id: null,
  organization_id: null,
  storage_id: null,
  author_id: null,
  currency_id: null
})

const headers = ref([
  {title: 'Номер', key: 'doc_number'},
  {title: 'Дата', key: 'date'},
])

const getProcurementData = async ({page, itemsPerPage, sortBy, search} = {}) => {
  counterFilter.value = 0;
  countFilter()
  const filterData = filterForm.value
  filterModal.value = false
  loading.value = true
  try {
    const { data } = await timeSheet.get({page, itemsPerPage, sortBy}, search, filterData)
    procurements.value = data.result.data
    paginations.value = data.result.pagination
    loading.value = false
  } catch (e) {
    console.log(e)
  }
}

const  countFilter = () => {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      counterFilter.value++;
    }
  }
}




const massDel = async () => {
  try {
    const {status} = await procurementApi.massDeletion({ids: markedID.value})
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getProcurementData({})
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}


const massRestore = async () => {

  try {
    const {status} = await procurementApi.massRestore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getProcurementData({})
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
    const firstMarkedItem = procurements.value.find(el => el.id === markedID.value[0]);
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

const closeFilterModal = async () => {
  filterModal.value = false
  cleanFilterForm()
  await getProcurementData()
}

const cleanFilterForm = () => {
  filterForm.value = {}
}


const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getMonths = async () => {
  const { data } = await schedule.month({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  months.value = data.result.data
}

const show = (item) => {
  window.open(`/hr/payroll/${item.id}`, '_blank')
}

onMounted(() => {
  getOrganizations()
  getMonths()
})

watch(dialog, newVal => {
  if (newVal) {
    markedID.value = [markedID.value[markedID.value.length - 1]]
  }
})

watch(markedID, (newVal) => {
  markedItem.value = procurements.value.find((el) => el.id === newVal[0]);
})

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Начисление запрлаты</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="$router.push('/hr/payrollCreate')" name="add"/>
              <Icons title="Скопировать" @click="" name="copy"/>
              <Icons title="Удалить" @click="compute" name="delete"/>
            </div>
            <div class="w-100">
              <v-text-field
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
              ></v-text-field>
            </div>
          </div>
          <div class="filterElement">
            <Icons
                name="filter"
                title="фильтр"
                @click="filterModal = true"
                class="mt-1"
            />
            <span v-if="counterFilter !== 0" class="countFilter">{{ counterFilter }}</span>
          </div>
        </v-card>
      </div>
      <v-card class="mt-2 table">
        <v-data-table-server
            style="height: 78vh"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            v-model:items-per-page="paginations.per_page"
            :loading="loading"
            :headers="headers"
            :items-length="paginations.total || 0"
            :items="procurements"
            :item-value="headers.title"
            :search="debounceSearch"
            v-model="markedID"
            @update:options="getProcurementData"
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
            >
              <td>
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox
                      v-model="markedID"
                      :checked="markedID.includes(item.id)"
                      @change="lineMarking(item)"
                  >
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <div class="d-flex align-center">
                    <Icons
                        style="margin-right: 10px; margin-top: 4px"
                        :name="item.deleted_at === null ? 'valid' : 'inValid'"
                    />
                    <span>{{ index + 1 }}</span>
                  </div>
                </template>
              </td>
              <td>{{ item.doc_number }}</td>
              <td>{{ showDate(item.date) }}</td>
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
            <v-form class="d-flex w-100">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100 ga-4">
                  <div class="d-flex ga-2 w-100">
                    <custom-text-field label="Дата" type="date" min-width="508"  v-model="filterForm.date"/>
                  </div>
                  <div class="d-flex ga-2">
                    <custom-autocomplete label="Организация" :items="organizations"  v-model="filterForm.organization_id"/>
                    <custom-autocomplete label="Месяц" :items="months" v-model="filterForm.month_id"/>
                  </div>
                  <div class="d-flex justify-end ga-2">
                    <v-btn color="red" class="btn" @click="closeFilterModal">сбросить</v-btn>
                    <v-btn :color="BASE_COLOR" class="btn"  @click="getProcurementData">применить</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>
    </v-col>
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