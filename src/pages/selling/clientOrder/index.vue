<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast/index.js'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import organizationApi from "../../../api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import user from "../../../api/list/user.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {BASE_COLOR, FIELD_OF_SEARCH} from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  warningMessage
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import clientOrderApi from '../../../api/documents/clientOrder.js';
import showDate from "../../../composables/date/showDate.js";

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
const nameRef = ref(null)
const descriptionRef = ref(null)
const procurements = ref([])
const paginations = ref([])
const showConfirmDialog = ref(false);
const showModal = ref(false);
const count = ref(0);
const authors = ref([]);
const counterparties = ref([])
const organizations = ref([])

const filterForm = ref({
  date: null,
  counterparty_id: null,
  organization_id: null,
  author_id: null,
})
const headers = ref([
  {title: 'Номер', key: 'name'},
  {title: 'Дата', key: 'currency.name'},
  {title: 'Поставщик', key: 'currency.name'},
  {title: 'Организация', key: 'currency.name'},
  {title: 'Дата отгрузки', key: 'currency.name'},
  {title: 'Автор', key: 'currency.name'},
  {title: 'Валюта', key: 'currency.name'},
])

const rules = {
  required: v => !!v,
}


const getClientOrderData = async ({page, itemsPerPage, sortBy, search}) => {
  count.value = 0
  countFilter()
  const filterData = filterForm.value
  filterModal.value = false
  loading.value = true
  try {
    const { data } = await clientOrderApi.get({page, itemsPerPage, sortBy}, search, filterData)
    paginations.value = data.result.pagination
    procurements.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}

function countFilter() {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++
    }
  }
  return count
}




const massDel = async () => {

  try {
    const {status} = await clientOrderApi.massDeletion({ids: markedID.value})

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getClientOrderData({})
      markedID.value = []
      dialog.value = false
    }

  } catch (e) {

  }
}


const massRestore = async () => {

  try {
    const {status} = await clientOrderApi.massRestore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getClientOrderData({})
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

const  closeFilterModal = async ({page, itemsPerPage, sortBy, search}) => {
  filterModal.value = {}
  cleanFilterForm()
  await getClientOrderData({page, itemsPerPage, sortBy, search})

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

watch(markedID, (newVal) => {
  markedItem.value = procurements.value.find((el) => el.id === newVal[0]);
})

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))


const getAuthors = async () => {
  const { data } = await user.getAuthors();
  
  authors.value = data.result
  
}

const getOrganizations = async () => {
  const { data } = await organizationApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  organizations.value = data.result.data
}

const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({page: 1, itemsPerPage: 100000, sortBy: 'name'});
  counterparties.value = data.result.data
}

onMounted(() => {
  getOrganizations()
  getCounterparties()
  getAuthors()
 
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Заказ от клиента</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="$router.push('/clientOrder/create')" name="add"/>
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
            <span v-if="count !== 0" class="countFilter">{{ count }}</span>
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
            @update:options="getClientOrderData"
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
                @dblclick="$router.push(`/clientOrder/${item.id}`)"
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
              <td>{{ item.counterparty.name }}</td>
              <td>{{ item.organization.name }}</td>
              <td>{{ showDate(item.shippingDate) }}</td>
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
                <v-col class="d-flex flex-column w-100">
                  <div class="d-flex ga-2 w-100">
                  <custom-text-field label="Дата" type="date" min-width="508"  v-model="filterForm.date"/>
                  </div>
                  <div class="d-flex ga-2">
                    <custom-autocomplete label="Организация" :items="organizations"  v-model="filterForm.organization_id"/>
                  <custom-autocomplete label="Клиент" :items="counterparties" v-model="filterForm.counterparty_id"/>               
                 </div>
                 
                <div class="d-flex ga-2 w-100">
                  <custom-autocomplete label="Автор" :items="authors" v-model="filterForm.author_id"/>
                </div>
                  <div class="d-flex justify-end ga-2">
                    <v-btn color="red" class="btn" @click="closeFilterModal">сбросить</v-btn>
                    <v-btn :color="BASE_COLOR" class="btn"  @click="getProviderData">применить</v-btn>
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