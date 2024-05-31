<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import {createAccess, removeAccess, updateAccess} from '../../../composables/access/access.js'
import {
  addMessage,
  editMessage,
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";
import Icons from "../../../composables/Icons/Icons.vue";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import validate from "../../../composables/validate/validate.js";
import {BASE_COLOR, FIELD_COLOR, FIELD_OF_SEARCH, TITLE_COLOR} from "../../../composables/constant/colors.js";
import debounce from "lodash.debounce";
import schedule from "../../../api/list/schedule.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import Button from "../../../components/button/button.vue";
import FilterCanvas from "@/components/canvas/filterCanvas.vue";
import {useFilterCanvasVisible} from "@/store/canvasVisible.js";
import CustomFilterTextField from "@/components/formElements/CustomFilterTextField.vue";
import {LABEL_MARKED_FOR_DELETION} from "../../../composables/constant/labels.js";
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import {markedForDeletion} from "../../../composables/constant/items.js";
import getExcel from "../../../composables/otherQueries/getExcel.js";
import getListColor from "../../../composables/displayed/getListColor.js";
import getListStatus from "../../../composables/displayed/getListStatus.js";

const router = useRouter()
const loading = ref(false);
const loadingMonth = ref(false)
const dialog = ref(false)

const showConfirmDialog = ref(false);
const isExistsSchedule = ref(false)
const idSchedule = ref(null)
const scheduleInDialogTitle = ref(null)
const search = ref('')
const debounceSearch = ref('')
const filterModal = ref(null)
const count = ref(0)

const hoveredRowIndex = ref(null)
const markedItem = ref(null)
const markedID = ref([])

const nameRef = ref(null)
const showModal = ref(false);
const weeks = reactive([
  {
    week_num: 0,
    week: 'пн',
    hour: 0
  },
  {
    week_num: 1,
    week: 'вт',
    hour: 0
  },
  {
    week_num: 2,
    week: 'ср',
    hour: 0
  },
  {
    week_num: 3,
    week: 'чт',
    hour: 0
  },
  {
    week_num: 4,
    week: 'пт',
    hour: 0
  },
  {
    week_num: 5,
    week: 'сб',
    hour: 0
  },
  {
    week_num: 6,
    week: 'вс',
    hour: 0
  }
]);

const countMonths = ref(12)


const toggleModal = () => {
  showModal.value = !showModal.value
}

const filterForm = ref({
  name: null,
  deleted: null,
})

const months = ref([])
const schedules = ref([]);
const paginationsMonth = ref([])
const paginations = ref([]);

const headers = ref([
  {title: 'Наименование', key: 'name'},
  {title: 'Статус', key: 'status', sortable: false},
])

const headersMonths = ref([
  {title: '№', key: 'month', sortable: false},
  {title: 'Месяц', key: 'month', sortable: false},
  {title: 'Кол. часов', key: 'hours', sortable: false},
])

const rules = {
  required: v => !!v,
  date: v => (v && /^\d{2}-\d{2}-\d{4}$/.test(v)) || 'Формат даты должен быть DD-MM-YYYY',
}


const countFilter = () => {
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      count.value++;
    }
  }
}

const getScheduleData = async ({page, itemsPerPage, sortBy, search} = {}) => {
  filterModal.value = false
  const filterData = filterForm.value
  count.value = 0
  countFilter()

  loading.value = true;
  try {
    const {data} = await schedule.get({page, itemsPerPage, sortBy}, search, filterData);
    paginations.value = data.result.pagination;
    schedules.value = data.result.data;
    markedID.value = []
  } catch (e) {

  } finally {
    loading.value = false;
  }
}

const isDataChanged = () => {
  const item = schedules.value.find(elem => elem.id === idSchedule.value)
  return nameRef.value !== item.name
}

const checkAndClose = () => {
  if (nameRef.value) {
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

const closingWithSaving = async () => {
  if (isExistsSchedule.value) {
    await update();
    showModal.value = false
  } else {
    const isValid = validate(
      nameRef,
      );
      showModal.value = false
    if (isValid === true) {
      await addSchedule();
      dialog.value = false;
      showModal.value = false;
      showConfirmDialog.value = false;
    }
  }
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
};

const  closeFilterModal = async () => {
  filterModal.value = false
  filterForm.value = {}
  await getScheduleData()
}

const addSchedule = async () => {

  const validateValue = [
    {
      "Наименование": nameRef.value
    }
  ]

  if (validate(validateValue) !== true) return
  if (months.value.length === 0) return showToast('С начала вычислите!', "warning")

  const body = {
    "name" : nameRef.value,
    "data" : months.value.map((item, index) => ({
      "month_id": index + 1,
      "number_of_hours" : item.hours
    })),
    "weeks": weeks.map(item => ({
      week: item.week_num,
      hour: Number(item.hour)
    }))
  }

  try {
    const res = await schedule.add(body)
    if (res.status === 201) {
      await getScheduleData()
      showToast(addMessage)
      idSchedule.value = res.data.result.id
      scheduleInDialogTitle.value = res.data.result.name
      markedID.value.push(res.data.result.id)
      isExistsSchedule.value = true
    }
  } catch (e) {
    console.error(e);
  } finally {
   dialog.value = false
  }
}

const update = async () => {
  const body = {
    "name" : nameRef.value,
    "data" : months.value.map((item) => ({
      id: item.id,
      month_id: item.month_id,
      number_of_hours : item.hours
    })),
    "weeks": weeks
  }
  try {
    const {status} = await schedule.update(idSchedule.value, body)
    if (status === 200) {
      await getScheduleData()
      showToast(editMessage)
      cleanForm()
      dialog.value = false
    }
  } catch (e) {
    console.error(e)
  }
}


const removeSchedule = async () => {
  try {
    const {status} = await schedule.remove({ids: markedID.value})
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getScheduleData()
      dialog.value = false
      markedID.value = []
    }
  } catch (e) {
    console.error(e)
  }
}

const restoreSchedule = async () => {
  try {
    const {status} = await schedule.restore({ids: markedID.value})
    if (status === 200) {
      showToast(restoreMessage)
      await getScheduleData()
      markedID.value = []
    }
  } catch (e) {
    console.error(e)
  }
}

const openDialog = (item) => {
  dialog.value = true
  if (item === 0) {
    idSchedule.value = 0
    isExistsSchedule.value = false
  } else {
    months.value.push(...item.workerSchedule.map(el => (
      {
        id: el.id,
        month_id: el.month.id,
        name: el.month.name,
        hours: el.number_of_hours
      }
    )));
    weeks.splice(0, weeks.length, ...item.weekHours.map(el => (
        {
          id: el.id,
          week: el.week,
          week_num: el.week,
          hour: el.hours
        }
    )));

    markedID.value.push(item.id)
    idSchedule.value = item.id
    isExistsSchedule.value = true
    nameRef.value = item.name
    scheduleInDialogTitle.value = nameRef.value
  }
}

const addBasedSchedule = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true
  const item = schedules.value.find(item => item.id === markedID.value[0])

  nameRef.value = item.name
  months.value.push(...item.workerSchedule.map(el => (
      {
        id: el.id,
        month_id: el.month.id,
        name: el.month.name,
        hours: el.number_of_hours
      }
  )));
  weeks.splice(0, weeks.length, ...item.weekHours.map(el => (
      {
        id: el.id,
        week: el.week,
        week_num: el.week,
        hour: el.hours
      }
  )));

  markedID.value = []
}


const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = schedules.value.find(el => el.id === markedID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, 'warning')
        return;
      }
    }
  }

  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
  markedItem.value = item;
}

const compute = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')

  if (markedItem.value.deleted_at) {
    return restoreSchedule()
  } else {
    return removeSchedule()
  }
}

const calculate = async () => {

 const validateWeeks = weeks.map(item => {
    if (item.hour === '') return 'заполнить'
    if (Number(item.hour) > 24) return '+24'
    return true
  })

  if (validateWeeks.includes('+24')) return showToast('Кол-во часов должно быть меньше 24', 'warning')
  if (validateWeeks.includes('заполнить')) return showToast('Поля "Кол-во часов" должны быть заполнены', 'warning')

  const body = weeks.map(item => ({
    week: item.week_num,
    hour: Number(item.hour)
  }))

  try {
    const {data} = await schedule.calculateHours({weeks: body})
    const tempMonths = months.value
    months.value = data.result.map((item, index) => ({
      id: tempMonths[index]?.id,
      month_id: tempMonths[index]?.month_id,
      name: item.month,
      hours: item.hours
    }))
    showToast('Кол-во часов успешно вычислено!')
  } catch (e) {
    console.log(e)
  }
}


onMounted(async () => {
  await getScheduleData()
})

watch(markedID, (newVal) => {
  markedItem.value = schedules.value.find((el) => el.id === newVal[0]);
})

watch(dialog, newVal => {
  if (!newVal) {
    nameRef.value = null;
    loadingMonth.value = false;
    isExistsSchedule.value = false;
    months.value = [];
    const defaultValueWeeks = JSON.parse(localStorage.getItem('weeks'))
    weeks.splice(0, weeks.length, ...defaultValueWeeks)
  } else {
    markedID.value = [markedID.value[markedID.value.length - 1]];
  }
})

watch(search, debounce(newValue => {
  debounceSearch.value = newValue
}, 500))

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between calcWidth ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">График работы</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex justify-end w-100">
            <div class="d-flex ga-2 me-3 mb-1 ">
              <Button name="create" v-if="createAccess('currency')" @click="openDialog(0)" />
              <Button name="copy" v-if="createAccess('currency')" @click="addBasedSchedule" />
              <Button name="delete" v-if="removeAccess('currency')" @click="compute" />
              <Button name="excel" @click="getExcel(schedule, 'График_работы')" />
            </div>
            <v-text-field
               style="max-width: 190px !important; width: 190px"
               v-model="search"
               prepend-inner-icon="search"
               density="compact"
               label="Поиск..."
               variant="outlined"
               :color="BASE_COLOR"
               :base-color="FIELD_OF_SEARCH"
               rounded="lg"
               clear-icon="close"
               hide-details
               single-line
               clearable
               flat
           />
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
            :items="schedules"
            :item-value="headers.title"
            :search="debounceSearch"
            v-model="markedID"
            @update:options="getScheduleData"
            page-text='{0}-{1} от {2}'
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
              @dblclick="openDialog(item)"
            >
              <td style="width: 150px;">
                <div class="d-flex ga-2 align-center">
                  <CustomCheckbox
                      v-model="markedID"
                      :checked="markedID.includes(item.id)"
                      @click="lineMarking(item)"
                  >
                  </CustomCheckbox>
                  <span>{{ item.id }}</span>
                </div>
              </td>
              <td style="width: 250px;">{{ item.name }}</td>
              <td>
                <v-chip
                    style="height: 50px; width: 200px;"
                    class="d-flex justify-center"
                    :color="getListColor(item.deleted_at)"
                >
              <span class="padding: 5px;">{{
                  getListStatus(item.deleted_at)
                }}</span>
                </v-chip>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
      <!-- Modal -->
      <v-card>
        <v-dialog persistent class="mt-2 pa-2" v-model="dialog" @keyup.esc="isExistsSchedule ? checkUpdate() : checkAndClose()">
          <v-card :style="`border: 2px solid ${BASE_COLOR}`" min-width="300"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsSchedule ? 'График работы: ' + scheduleInDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2">
                  <Icons title="Удалить" v-if="removeAccess('currency') && isExistsSchedule" @click="compute" name="delete"/>
                  <Icons title="Сохранить" v-if="createAccess('currency') && !isExistsSchedule" @click="addSchedule" name="save"/>
                  <Icons title="Сохранить" v-if="updateAccess('currency') && isExistsSchedule" @click="update" name="save"/>
                  <Icons name="close" @click="isExistsSchedule ? checkUpdate() : checkAndClose()" title="Закрыть" />
                </div>
              </div>
            </div>
            <v-form class="d-flex w-100" :disabled="!updateAccess('unit') && isExistsSchedule" @submit.prevent="addSchedule">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100 mt-2">
                  <v-text-field
                      v-model="nameRef"
                      :rules="[rules.required]"
                      :color="BASE_COLOR"
                      :base-color="FIELD_COLOR"
                      class="w-auto text-sm-body-1"
                      rounded="md"
                      variant="outlined"
                      density="compact"
                      placeholder="График работы"
                      label="Наименование"
                      clear-icon="close"
                      hide-details
                      clearable
                      autofocus
                  />
                  <div class="d-flex ga-8 mt-4">
                    <custom-text-field v-for="week in weeks" v-model="week.hour" min-width="10px" max-width="10px" />
                  </div>
                  <div class="d-flex my-3 justify-end">
                    <v-btn :color="BASE_COLOR" class="text-none" @click="calculate">Вычислить</v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>

            <v-card class="table" :style="`border: 2px solid ${BASE_COLOR}`">
              <v-data-table-server
                  style="height: 38vh"
                  items-per-page-text="Элементов на странице:"
                  loading-text="Загрузка"
                  no-data-text="Нет данных"
                  v-model:items-per-page="countMonths"
                  :loading="loadingMonth"
                  :headers="headersMonths"
                  :items-length="paginationsMonth.total || 0"
                  :items="months"
                  :item-value="headersMonths.title"
                  page-text='{0}-{1} от {2}'
                  :items-per-page-options="[
                      {value: 25, title: '25'},
                      {value: 50, title: '50'},
                      {value: 100, title: '100'},
                  ]"
                  fixed-footer
                  fixed-header
                  hover
              >
                <template v-slot:item="{ item, index }">
                  <tr>
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.name }}</td>
                    <td style="width: 120px;">
                      <custom-text-field min-width="20px" max-width="20px" v-model="item.hours"/>
                    </td>
                  </tr>
                </template>
              </v-data-table-server>
            </v-card>
          </v-card>
        </v-dialog>
      </v-card>

     <filter-canvas tabindex="-1">
       <div class="d-flex w-100 ga-2">
         <custom-filter-text-field  label="Наименование" v-model="filterForm.name" />
         <custom-filter-autocomplete
             :label="LABEL_MARKED_FOR_DELETION"
             v-model="filterForm.deleted"
             :items="markedForDeletion"
         />
       </div>
       <div class="d-flex justify-end ga-2" style="margin-right: -6%;">
         <v-btn
             color="red"
             class="btn"
             @click="() => {closeFilterModal(); useFilterCanvasVisible().closeFilterCanvas()}"
         >
           сбросить
         </v-btn>
         <v-btn
             :color="BASE_COLOR"
             class="btn"
             @click="() => {getScheduleData(); useFilterCanvasVisible().closeFilterCanvas()}"
         >
           применить
         </v-btn>
       </div>
     </filter-canvas>


      <div v-if="showModal">
        <ConfirmModal :showModal="true" @close="toggleModal()" @closeClear="closeDialogWithoutSaving()"   @closeWithSaving="closingWithSaving()"/>
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