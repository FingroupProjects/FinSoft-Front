<script setup>
import {ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../composables/toast'
import Icons from "../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../components/checkbox/CustomCheckbox.vue";
import {FIELD_COLOR, FIELD_OF_SEARCH} from "../../composables/constant/colors.js";
import {
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  restoreMessage
} from "../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import saleApi from '../../api/documents/sale.js';

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
const sales = ref([])
const paginations = ref([])
const showConfirmDialog = ref(false);
const showModal = ref(false);
const count = ref(0);


const filterForm = ref({
  name: null,
  description: null,
  currency_id: null
})


const headers = ref([
  {title: 'Номер', key: 'name'},
  {title: 'Дата', key: 'date'},
  {title: 'Клиент', key: 'counterparty.name'},
  {title: 'Организация', key: 'organization.name'},
  {title: 'Склад', key: 'storage.name'},
  {title: 'Автор', key: 'author.name'},
  {title: 'Валюта', key: 'currency.name'},
])

const rules = {
  required: v => !!v,
}


const getSellingGoods = async ({page, itemsPerPage, sortBy, search}) => {
  count.value = 0;
  countFilter()
  const filterData = filterForm.value
  filterModal.value = false
  loading.value = true
  try {
    const { data } = await saleApi.get({page, itemsPerPage, sortBy}, search, filterData)
    paginations.value = data.result.pagination
    sales.value = data.result.data
    loading.value = false
  } catch (e) {
    console.error(e);
  }
}

function countFilter() {

  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }

  return count;
}

const editDocument = item => {
  router.push({name: 'SellingGoodsEdit', params: {id: item.id}})
}


const massDel = async () => {

  try {
    const {status} = await saleApi.massDeletion({ids: markedID.value})

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getSellingGoods({})
      markedID.value = []
      dialog.value = false
    }

  } catch (e) {

  }
}


const massRestore = async () => {

  try {
    const {status} = await saleApi.massRestore({ids: markedID.value})

    if (status === 200) {
      showToast(restoreMessage)
      await getSellingGoods({})
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
    const firstMarkedItem = sales.value.find(el => el.id === markedID.value[0]);
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
  await getSellingGoods({page, itemsPerPage, sortBy, search})

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
  markedItem.value = sales.value.find((el) => el.id === newVal[0]);
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
          <span>Продажа</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="$router.push('/sellingGoodsCreate')" name="add"/>
              <Icons title="Скопировать" name="copy"/>
              <Icons title="Удалить" @click="compute" name="delete"/>
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
            :items="sales"
            :item-value="headers.title"
            :search="debounceSearch"
            v-model="markedID"
            @update:options="getSellingGoods"
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
                @dblclick="editDocument(item)"
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
              <td>{{ item.date }}</td>
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
          <v-card style="border: 2px solid #3AB700" min-width="450"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Фильтр</span>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="filterForm.name"
                      color="green"
                      rounded="md"
                      :base-color="FIELD_COLOR"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Наименование"
                      label="Наименование"
                      clear-icon="close"
                      clearable
                      autofocus
                  />
                  <div class="d-flex justify-end ga-2">
                    <v-btn color="red" class="btn" @click="closeFilterModal">сбросить</v-btn>
                    <v-btn color="green" class="btn"  @click="getSellingGoods">применить</v-btn>
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