<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import priceType from '../../../api/priceType.js';
import currency from '../../../api/currency.js';
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage
} from "../../../composables/constant/buttons.js";

const router = useRouter()

const loading = ref(true)
const loadingRate = ref(true)
const dialog = ref(false)
const idPriceType = ref(null)
const hoveredRowIndex = ref(null)

const currencyAdd = ref([])
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

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
  {title: 'Валюта', key: 'currency.name'},
  {title: 'Описание', key: 'description'},
])

const rules = {
  required: v => !!v,
}


const getPriceTypeData = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  try {
    const { data } = await priceType.get({page, itemsPerPage, sortBy}, search)

    paginations.value = data.result.pagination
    priceTypes.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}


const addPriceType = async ({page, itemsPerPage, sortBy}) => {

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

  if (error.response && error.response.status === 422) {
    if (error.response.data.errors.name) {
      showToast("Поле Наименование не может быть пустым", "warning")
    }
  }
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


watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null
    currencyUpdate.value = null
    currencyAdd.value = null
    descriptionRef.value = null

    loadingRate.value = true
  }
})

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
              <Icons @click="openDialog(0)" name="add"/>
              <Icons @click="addBasedOnPriceType" name="copy"/>
              <Icons @click="compute" name="delete"/>
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
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                 <div  class="d-flex">
                   <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                   <span>{{ index + 1 }}</span>
                 </div>
                </template>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.currency.name }}</td>
              <td>{{ item.description }}</td>
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
              <span>{{ isExistsPriceType ? priceTypeInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="isExistsPriceType"  @click="compute" name="delete"/>
                  <Icons v-if="isExistsPriceType" @click="update" name="save"/>
                  <Icons v-else @click="addPriceType" name="save"/>
                </div>
                <v-btn @click="dialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addPriceType">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="green"
                      rounded="md"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Доллар"
                      label="Название"
                      clear-icon="close"
                      clearable
                  />
                  <v-select
                      variant="outlined"
                      label="Выберите валюту"
                      v-model="currencyAdd"
                      :items="currencies"
                      item-title="name"
                      item-value="id"
                  />
                  <v-textarea
                      v-model="descriptionRef"
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
    </v-col>
  </div>


</template>

<style scoped>

</style>