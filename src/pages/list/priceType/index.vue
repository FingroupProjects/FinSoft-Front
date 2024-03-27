<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import priceType from '../../../api/priceType.js';
import currency from '../../../api/currency.js';
import {FIELD_COLOR, FIELD_OF_SEARCH} from "../../../composables/constant/colors.js";
import validate from "./validate.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage
} from "../../../composables/constant/buttons.js";
import { tr } from "vuetify/lib/locale/index.mjs";

const router = useRouter()

const loading = ref(true)
const loadingRate = ref(true)
const dialog = ref(false)
const filterModal = ref(false)
const idPriceType = ref(null)
const hoveredRowIndex = ref(null)

const currencyAdd = ref(null)
const currencyUpdate = ref([])
const currencies = ref([])

const isExistsPriceType = ref(false)
const markedID = ref([]);
const markedItem = ref([])
const priceTypeInDialogTitle = ref(null)
const search = ref('')
const selected = ref([])
const nameRef = ref(null)
const descriptionRef = ref(null)
const priceTypes = ref([])
const paginations = ref([])
const showConfirmDialog = ref(false);
const showModal = ref(false);
const count = ref(0);


const toggleModal = () => {
  showModal.value = !showModal.value;
};

const filterForm = ref({
    name: null,
    description: null,
    currency_id: null
})


const headers = ref([
  {title: 'Наименование', key: 'name'},
  {title: 'Валюта', key: 'currency.name'}
])

const rules = {
  required: v => !!v,
}


const getPriceTypeData = async ({page, itemsPerPage, sortBy, search}) => {
  count.value = 0;
  countFilter()
  const filterData = filterForm.value
  filterModal.value = false
  loading.value = true
  try {
    
    const { data } = await priceType.get({page, itemsPerPage, sortBy}, search, filterData)
    
    paginations.value = data.result.pagination
    priceTypes.value = data.result.data
    loading.value = false
  } catch (e) {
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


const addPriceType = async ({page, itemsPerPage, sortBy}) => {
  if (validate(nameRef,currencyAdd,descriptionRef) !== true) return
  const body = {
    name: nameRef.value,
    currency_id: currencyAdd.value,
    description: descriptionRef.value
  }

  try {
    const res = await priceType.add(body)

    if (res.status === 201) {
      await getPriceTypeData({page, itemsPerPage, sortBy})
      showToast(addMessage)
      currencyAdd.value = null
      descriptionRef.value = null
      idPriceType.value = res.data.result.id
      dialog.value = false

      markedID.value = []
      markedItem.value = []
    }
  }
  catch (error) {
  console.log(error);
}

}

const massDel = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedID.value
  }

  try {
    const {status} = await priceType.massDeletion(body)

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getPriceTypeData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
      dialog.value = false
    }

  } catch (e) {

  }
}


const massRestore = async ({page, itemsPerPage, sortBy, search}) => {
  const body = {
    ids: markedID.value
  }

  try {
    const {status} = await priceType.massRestore(body)

    if (status === 200) {
      showToast(restoreMessage)
      await getPriceTypeData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}


const update = async ({page, itemsPerPage, sortBy}) => {
  if (validate(nameRef,currencyAdd,descriptionRef) !== true) return

  const body = {
    name: nameRef.value,
    currency_id: currencyAdd.value,
    description: descriptionRef.value
  }

  try {
    const {status} = await priceType.update(idPriceType.value, body)
    if (status === 200) {
      nameRef.value = null
      descriptionRef.value = null;
      currencyUpdate.value = null;

      dialog.value = null
      cleanForm()
      await getPriceTypeData({page, itemsPerPage, sortBy})
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}


const getCurrencies = async () => {
  try {
    const {data} = await currency.get({page: 1, itemsPerPage: 100000})

    currencies.value = data.result.data.map(item => {
      return {
        id: item.id,
        name: item.name
      }
    })

  } catch (e) {

  }
}




const handleCheckboxClick = (item) => {
  lineMarking(item)
}

const openDialog = (item) => {
  dialog.value = true

  if (item === 0) {
    idPriceType.value = 0
    isExistsPriceType.value = false
  } else {
    idPriceType.value = item.id
    markedID.value.push(item.id);
    isExistsPriceType.value = true
    nameRef.value = item.name
    descriptionRef.value = item.description
    currencyAdd.value = item.currency.id
    priceTypeInDialogTitle.value = nameRef.value
  }

}


const addBasedOnPriceType = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true

  priceTypes.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name
      currencyAdd.value = item.currency.id
      descriptionRef.value = item.description
    }
  })

  isExistsPriceType.value = false
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
    const firstMarkedItem = priceTypes.value.find(el => el.id === markedID.value[0]);
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

const  closeFilterModal = async ({page, itemsPerPage, sortBy, search, filterData}) => {
  filterModal.value = {}
  cleanFilterForm()
  await getPriceTypeData({page, itemsPerPage, sortBy, search})
  
}

const cleanFilterForm = () => {
  filterForm.value = {}
}

const isDataChanged = () => {
  const item = priceTypes.value.find(elem => elem.id === idPriceType.value);

  return nameRef.value !== item.name ||
    currencyAdd.value !== item.currency.id ||
    descriptionRef.value.id !== item.descriptionRef
};


const checkAndClose = () => {
  if (
    nameRef.value ||
    currencyAdd.value ||
    descriptionRef.value
  ) {
    showModal.value = true;
  } else {
    dialog.value = false;
    showModal.value = false;
  }
};

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false
  showConfirmDialog.value = false;
  cleanForm();
};

const checkUpdate = () => {
  if (isDataChanged()) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }
};


const cleanForm = () => {
  nameRef.value = null;
  currencyAdd.value = null
  descriptionRef.value = null
};

watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    currencyUpdate.value = null
    currencyAdd.value = null
    descriptionRef.value = null
    loadingRate.value = true
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
})

watch(markedID, (newVal) => {
  markedItem.value = priceTypes.value.find((el) => el.id === newVal[0]);
});


onMounted(async () => {
  await getCurrencies()
})


</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Виды цен</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="openDialog(0)" name="add"/>
              <Icons title="Скопировать" @click="addBasedOnPriceType" name="copy"/>
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
                  clearable
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
            :items="priceTypes"
            :item-value="headers.title"
            :search="search"
            show-select
            v-model="markedID"
            @update:options="getPriceTypeData"
            page-text =  '{0}-{1} от {2}'
            :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)" @dblclick="openDialog(item)"
                :class="{'bg-grey-lighten-2': markedID.includes(item.id) }">
              <td>
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)"
                                  @change="handleCheckboxClick(item)">
                    <span>{{ item.id }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <div class="d-flex align-center">
                    <Icons
                        style="margin-right: 10px; margin-top: 4px"
                        :name="item.deleted_at === null ? 'valid' : 'inValid'"
                    />
                    <span>{{ item.id }}</span>
                  </div>
                </template>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.currency.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="500"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Вид цены: {{ isExistsPriceType ? priceTypeInDialogTitle  : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons title="Удалить" v-if="isExistsPriceType"  @click="compute" name="delete"/>
                  <Icons title="Сохранить" v-if="isExistsPriceType" @click="update" name="save"/>
                  <Icons title="Сохранить" v-else @click="addPriceType" name="save"/>
                </div>
                <v-btn
                @click="isExistsPriceType ? checkUpdate() : checkAndClose({ page, itemsPerPage, sortBy, search, filterData})"
                
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
              </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addPriceType">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100 ga-4">
                  <v-text-field
                      v-model="nameRef"
                      :base-color="FIELD_COLOR"
                      :rules="[rules.required]"
                      color="green"
                      hide-details
                      rounded="md"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Доллар"
                      label="Название"
                      clear-icon="close"
                      clearable
                  />
                  <v-autocomplete
                      variant="outlined"
                      hide-details
                      label="Выберите валюту"
                      :base-color="FIELD_COLOR"
                      v-model="currencyAdd"
                      :items="currencies"
                      item-title="name"
                      item-value="id"
                  />
                  <v-textarea
                      v-model="descriptionRef"
                      :base-color="FIELD_COLOR"
                      hide-details
                      :rules="[rules.required]"
                      color="green"
                      rounded="md"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Описание..."
                      label="Описание"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>

      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="filterModal">
          <v-card style="border: 2px solid #3AB700" min-width="450"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Фильтр</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons @click="getPriceTypeData" title="Сохранить" name="save"/>
                </div>
                <v-btn @click="filterModal = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons title="Закрыть" @click="closeFilterModal" name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addPriceType">
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
                  />
                  <v-autocomplete
                      variant="outlined"
                      label="Валюта"
                      v-model="filterForm.currency_id"
                      :items="currencies"
                      :base-color="FIELD_COLOR"
                      item-title="name"
                      item-value="id"
                  />
                  <v-textarea
                      v-model="filterForm.description"
                      color="green"
                      rounded="md"
                      variant="outlined"
                      :base-color="FIELD_COLOR"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Описание"
                      label="Описание"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-dialog>
      </v-card>
      <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="toggleModal" @closeClear="closeDialogWithoutSaving" />
      </div>
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