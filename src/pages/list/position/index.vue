<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '@/composables/toast'
import currentDate from "@/composables/date/currentDate.js";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import position from '../../../api/position.js'
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  selectOneItemMessage
} from "@/composables/constant/buttons.js";
import Icons from "@/composables/Icons/Icons.vue";
import binarySearch from "@/composables/binarySearch/binarySearch.js";

import {restoreMessage} from "../../../composables/constant/buttons.js";

const router = useRouter()

const loading = ref(true)
const loadingRate = ref(true)
const dialog = ref(false)
const digitalRef = ref(null)

const idPosition = ref(null)
const hoveredRowIndex = ref(null)


const isExistsPosition = ref(false)
const isExistsPositionRate = ref(false)
const markedID = ref([]);
const markedItem = ref([])
const positionInDialogTitle = ref(null)
const search = ref('')
const selected = ref([])


const nameRef = ref(null)
const valueRef = ref(null)

const positions = ref([])
const paginations = ref([])
const rates = ref([])
const paginationsRate = ref([])

const headers = ref([
  { title: '№', key: 'id', align: 'start'},
  { title: 'Наименование', key: 'name'}
])

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}


const getPositionData = async ({ page, itemsPerPage, sortBy, search }) => {
  loading.value = true
  try {
    const { data } = await position.get({page, itemsPerPage, sortBy}, search)

    paginations.value = data.result.pagination
    positions.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}



const addPosition = async ({ page, itemsPerPage, sortBy }) => {

  const body = {
    name: nameRef.value
  }

  const res = await position.add(body)
  if (res.status === 201) {
    await getPositionData({ page, itemsPerPage, sortBy })
    showToast(addMessage)
    valueRef.value = null
    idPosition.value = res.data.result.id
    dialog.value = false
    markedID.value = []
    markedItem.value = []
  }
}

const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value
  }
  console.log(body)
  try{
    const { status } = await position.massDeletion(body)

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getPositionData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
    }

  }catch(e){
    console.log(e)
  }
}


const massRestore = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value
  }

  try{
    const { status } = await position.massRestore(body)

    if (status === 200) {
      showToast(restoreMessage, 'red')
      await getPositionData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
    }
  }catch(e){
    console.log(e)
  }
}


const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value
  }

  try {
    const { status } = await position.update(idPosition.value, body)
    if (status === 200) {
      await getPositionData({page, itemsPerPage, sortBy})
      showToast(editMessage)

      dialog.value = false
    }
  } catch (e) {
    console.log(e)
  }
}


const destroy = async ({page, itemsPerPage, sortBy}) => {
  if (markedID.value === null) return showToast(warningMessage, 'warning')
  try {
    const {status} = await position.delete(markedID.value)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getPositionData({page, itemsPerPage, sortBy})
      dialog.value = false
      markedID.value = []
    }
  } catch (e) {

  }
}

const restore = async ({ page, itemsPerPage, sortBy }) => {
  try{
    const { status } = await  position.restore(markedID.value)
    if (status === 200) {
      showToast(restoreMessage, 'green')
      await getPositionData({ page, itemsPerPage, sortBy })
      markedID.value = []
    }
  }catch (e) {
    console.log(e)
  }
}


const handleCheckboxClick = function (item) {
  lineMarking(item)
}

const openDialog = (item) => {
  dialog.value = true
  console.log(dialog.value)
  if (item === 0) {
    idPosition.value = 0
    isExistsPosition.value = false
  } else {
    idPosition.value = item.id

    const index = binarySearch(positions.value, item.id)

    if (index !== 1) {
      isExistsPosition.value = true
      nameRef.value = item.name
      positionInDialogTitle.value = nameRef.value
    } else {

    }
  }

}



const addBasedOnPosition = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')

  dialog.value = true

  positions.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name
    }
  })
}

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if(markedItem.value.deleted_at) {
    return massRestore({ page, itemsPerPage, sortBy })
  }
  else{
    return massDel({ page, itemsPerPage, sortBy, search })
  }
}

const lineMarking = (item) => {
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
    rates.value = []
    loadingRate.value = true
  }
})


</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Должность</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons @click="openDialog(0)" name="add" />
              <Icons @click="addBasedOnPosition" name="copy" />
              <Icons @click="compute" name="delete" />
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
            :items="positions"
            :item-value="headers.title"
            :search="search"
            @update:options="getPositionData"
            fixed-header
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)" :class="{'bg-grey-lighten-2': markedID.includes(item.id) }" @dblclick="openDialog(item)">
              <td class="">
                <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                  <CustomCheckbox v-model="markedID" :checked="markedID.includes(item.id)" @change="handleCheckboxClick(item)">
                    <span>{{ index + 1 }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                  <span>{{ index + 1 }}</span>
                </template>
              </td>
              <td>{{ item.name }}</td>


            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2"  v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="300" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsPosition ? positionInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons  v-if="isExistsPosition"  @click="compute" name="delete"/>
                  <Icons v-if="isExistsPosition" @click="update" name="save"/>
                  <Icons v-else @click="addPosition" name="save"/>
                </div>
                <v-btn @click="dialog = false"  variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close" />
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addPosition">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      color="green"
                      rounded="lg"
                      variant="outlined"
                      class="w-auto text-sm-body-1"
                      density="compact"
                      placeholder="Бухгалтер"
                      label="Наименование"
                      clear-icon="close"
                      clearable
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