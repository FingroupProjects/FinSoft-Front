<script setup>
import {onMounted, ref, watch, computed} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import priceType from '../../../api/list/priceType.js';
import currency from '../../../api/list/currency.js';
import {createAccess, updateAccess, removeAccess} from "../../../composables/access/access.js";
import {FIELD_COLOR, FIELD_OF_SEARCH ,BASE_COLOR, TITLE_COLOR} from "../../../composables/constant/colors.js";
import Button from "../../../components/button/button.vue";
import validate from "./validate.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import {useFilterCanvasVisible} from "../../../store/canvasVisible.js";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import {markedForDeletion} from "../../../composables/constant/items.js";

import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage
} from "../../../composables/constant/buttons.js";
import debounce from "lodash.debounce";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus";
import procurement from "../../../api/documents/procurement.js";

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
const debounceSearch = ref('')
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
  { title: "Статус", key: "deleted_at" },
  {title: 'Валюта', key: 'currency.name'}
])


const isCurrencyFieldDisabled = computed(() => {
  return !createAccess('currencies') && !updateAccess('currencies');
});

const rules = {
  required: v => !!v,
}

const getProcurement = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    const response = await procurement.get({page, itemsPerPage, sortBy}, search, {})
    paginations.value = response.data.pagination
    console.log(response)
  } catch (e) {
    console.log(e)
  }
}

const getPriceTypeData = async ({page, itemsPerPage, sortBy, search}) => {
  count.value = 0;
  countFilter()
  const filterData = filterForm.value
  filterModal.value = false
  loading.value = true
  try {
    
    const { data } = await priceType.get({page, itemsPerPage, sortBy}, search, filterData)
    console.log(1)
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

const compute = (params ={}) => {
  const {page, itemsPerPage, sortBy, search} = params
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
  useFilterCanvasVisible().closeFilterCanvas()
}

const cleanFilterForm = () => {
  filterForm.value = {}
}

const getExcel = async () => {
  if(priceType.value === null) {
    return showToast('Выберите поставщика', 'warning')
  }
  try {
    const { data } = await priceType.excel(priceType.value);
    const url = window.URL.createObjectURL(
      new Blob([data], { type: "application/vnd.ms-excel" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Отчет.xls");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    console.error(e);
  }
};

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

const closingWithSaving = async () => {
  if (isExistsPriceType.value) {
    await update({ page: 1, itemsPerPage: 10, sortBy: 'id', search: null });
    showModal.value = false
  } else {
    const isValid = validate(
      nameRef,
      currencyAdd,
      descriptionRef
      );
      showModal.value = false
    if (isValid === true) {
      await addPriceType({ page: 1, itemsPerPage: 10, sortBy: 'id', search: null });
      dialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
    }
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

watch(search, debounce((newValue) => {
  debounceSearch.value = newValue
}, 500))

onMounted(async () => {
  await getCurrencies()
})


</script>

<template>
  <div>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Виды цен</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button @click="openDialog(0)" name="create" />
            <Button @click="addBasedOnPriceType" name="copy"/>
            <Button @click="compute" name="delete"/>
            <Button name="excel" @click="getExcel()" />
          </div>
        </div>

        <div class="custom_search">
          <v-text-field
            style="width: 190px; margin-top: 10px;"
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
          </div>
          <div class="filterElement">
            <Icons
              name="filter"
              title="фильтр"
              @click="useFilterCanvasVisible().toggleFilterCanvas()"
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
            :search="debounceSearch"
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
            <tr
                @mouseenter="hoveredRowIndex = index"
                @mouseleave="hoveredRowIndex = null"
                @dblclick="openDialog(item)"
                :class="{'bg-grey-lighten-2': markedID.includes(item.id) }"
            >
              <td>
                  <CustomCheckbox
                      v-model="markedID"
                      :checked="markedID.includes(item.id)"
                      @change="handleCheckboxClick(item)"
                  >
                    <span>{{ item.id }}</span>
                  </CustomCheckbox>
                </td>
                <td><span><td>{{ item.name }}</td></span></td>
                <td>
              <v-chip
                style="height: 50px !important; max-width: 200px"
                class="d-flex justify-center"
                :color="getListColor(item.deleted_at)"
              >
                <span class="padding: 5px;">{{
                  getListStatus(item.deleted_at)
                }}</span>
              </v-chip>
            </td>
              <td>{{ item.currency.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
      <!-- Modal -->
      <v-card>
        <v-dialog persistent class="mt-2 pa-2" v-model="dialog" @keyup.esc="isExistsPriceType ? checkUpdate() : checkAndClose({ page, itemsPerPage, sortBy, search, filterData})">
          <v-card :style="`border: 2px solid ${BASE_COLOR}`" min-width="500"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>Вид цены: {{ isExistsPriceType ? priceTypeInDialogTitle  : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons title="Удалить" v-if="removeAccess('priceType') && isExistsPriceType"  @click="compute" name="delete"/>
                  <Icons title="Сохранить" v-if="createAccess('priceType') && !isExistsPriceType" @click="addPriceType" name="save"/>
                  <Icons title="Сохранить" v-if="updateAccess('priceType') && isExistsPriceType" @click="update" name="save"/>
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
            <v-form class="d-flex w-100" :disabled="!updateAccess('priceType') && isExistsPriceType" @submit.prevent="addPriceType">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100 ga-4">
                  <v-text-field
                      v-model="nameRef"
                      :base-color="FIELD_COLOR"
                      :rules="[rules.required]"
                      :color="BASE_COLOR"
                      hide-details
                      autofocus
                      rounded="md"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Названия"
                      label="Название"
                      clear-icon="close"
                      clearable
                  />
                  <v-autocomplete
                      variant="outlined"
                      hide-details
                      no-data-text="Нет данных"
                      :color="BASE_COLOR"
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
                      :color="BASE_COLOR"
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

      <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="toggleModal" @closeClear="closeDialogWithoutSaving"  @closeWithSaving="closingWithSaving()"/>
      </div>
    <filter-canvas >
        <div class="d-flex flex-column ga-4 w-100">
          <custom-filter-text-field min-width="106" v-model="filterForm.name" label="Наименование"/>
          <custom-filter-autocomplete min-width="106"  label="Валюта" v-model="filterForm.currency_id" :items="currencies"/>
          <custom-filter-text-field min-width="106" v-model="filterForm.description" label="Описание"/>
          <custom-filter-autocomplete min-width="106"  label="Помечен на удаление" v-model="filterForm.deleted" :items="markedForDeletion"/>
        </div>      
        <div class="d-flex justify-end ">
          <div class="d-flex ga-2" style="margin-right: -6%;">
            <v-btn color="red" class="btn" @click="closeFilterModal"
            >сбросить</v-btn>
            <v-btn
                :color="BASE_COLOR"
                class="btn"
                @click="() => {getPriceTypeData({}); useFilterCanvasVisible().closeFilterCanvas()}"
            >применить</v-btn>
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