<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import organizationBill from '../../../api/organizationBill.js';
import organization from '../../../api/organizations.js';
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
const idorganizationBill = ref(null)
const hoveredRowIndex = ref(null)

const organizationAdd = ref([])
const organizationUpdate = ref([])
const currencies = ref([])

const isExistsorganizationBill = ref(false)
const markedID = ref([]);
const markedItem = ref([])
const organizationBillInDialogTitle = ref(null)
const search = ref('')
const selected = ref([])
const nameRef = ref(null)
const descriptionRef = ref(null)
const organizationBills = ref([])
const paginations = ref([])

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
  {title: 'Валюта', key: 'organization.name'},
  {title: 'Описание', key: 'description'},
])

const rules = {
  required: v => !!v,
}


const getorganizationBillData = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  try {
    const { data } = await organizationBill.getAll({page, itemsPerPage, sortBy}, search)

    paginations.value = data.result.pagination
    organizationBills.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}


const addorganizationBill = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    organization_id: organizationAdd.value,
    description: descriptionRef.value
  }

  try {
    const res = await organizationBill.add(body)

    if (res.status === 201) {
      await getorganizationBillData({page, itemsPerPage, sortBy})
      showToast(addMessage)
      organizationAdd.value = null
      descriptionRef.value = null
      idorganizationBill.value = res.data.result.id
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
    const {status} = await organizationBill.massDeletion(body)

    if (status === 200) {

      showToast(removeMessage, 'red')
      await getorganizationBillData({page, itemsPerPage, sortBy}, search)
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
    const {status} = await organizationBill.massRestore(body)

    if (status === 200) {
      showToast(restoreMessage)
      await getorganizationBillData({page, itemsPerPage, sortBy}, search)
      markedID.value = []
      dialog.value = false
    }
  } catch (e) {

  }
}


const update = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
    organization_id: organizationAdd.value,
    description: descriptionRef.value
  }

  try {
    const {status} = await organizationBill.update(idorganizationBill.value, body)
    if (status === 200) {
      nameRef.value = null
      descriptionRef.value = null;
      organizationUpdate.value = null;

      dialog.value = null
      await getorganizationBillData({page, itemsPerPage, sortBy})
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}


const getCurrencies = async () => {
  try {
    const {data} = await organization.get({page: 1, itemsPerPage: 100000})

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
    idorganizationBill.value = 0
    isExistsorganizationBill.value = false
  } else {
    idorganizationBill.value = item.id
    markedID.value.push(item.id);
    isExistsorganizationBill.value = true
    nameRef.value = item.name
    descriptionRef.value = item.description
    organizationAdd.value = item.organization.id
    organizationBillInDialogTitle.value = nameRef.value
  }

}


const addBasedOnorganizationBill = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true

  organizationBills.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name
      organizationAdd.value = item.organization.id
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
    const firstMarkedItem = organizationBills.value.find(el => el.id === markedID.value[0]);
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
    organizationUpdate.value = null
    organizationAdd.value = null
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
              <Icons @click="addBasedOnorganizationBill" name="copy"/>
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
            :items="organizationBills"
            :item-value="headers.title"
            :search="search"
            @update:options="getorganizationBillData"
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
              <td>{{ item.organization.name }}</td>
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
              <span>{{ isExistsorganizationBill ? organizationBillInDialogTitle + ' (изменение)' : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="isExistsorganizationBill"  @click="compute" name="delete"/>
                  <Icons v-if="isExistsorganizationBill" @click="update" name="save"/>
                  <Icons v-else @click="addorganizationBill" name="save"/>
                </div>
                <v-btn @click="dialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <div class="d-flex justify-space-between ga-6">
                    <v-text-field
                        v-model="name"
                        :rules="isValid ? [rules.required] : []"
                        color="green"
                        rounded="md"
                        variant="outlined"
                        class="w-auto text-sm-body-1"
                        density="compact"
                        placeholder="Контрагент"
                        label="Наименование"
                        clear-icon="close"
                        clearable
                        hide-details
                    />
                    <span style="color: red; font-weight: bolder" class="mr-4 mt-1"
                    >2500,00</span
                    >
                  </div>
                  <div
                      :class="isEdit ? 'justify-space-between' : 'justify-end'"
                      class="d-flex justify-space-between ga-5 align-center my-3"
                  >
                    <div
                        v-if="isEdit"
                        style="
                    border: 1.5px solid #cbc8c8;
                    border-radius: 4px;
                    padding: 2px 12px;
                  "
                    >
                  <span>
                    {{ date }}
                  </span>
                    </div>
                    <CustomCheckbox :checked="a" @change="handleCheckboxChange(0)"
                    >Клиент</CustomCheckbox
                    >
                    <CustomCheckbox :checked="b" @change="handleCheckboxChange(1)"
                    >Поставщик</CustomCheckbox
                    >
                    <CustomCheckbox :checked="c" @change="handleCheckboxChange(2)"
                    >Прочее</CustomCheckbox
                    >
                  </div>
                  <div class="d-flex ga-4 mb-3">
                    <v-text-field
                        variant="outlined"
                        :rules="isValid ? [rules.required, rules.phone] : []"
                        label="Тел номер"
                        v-model.trim="phone"
                        density="compact"
                        v-mask="'+992#########'"
                        rounded="md"
                        color="info"
                        hide-details
                        :append-inner-icon="phone.length > 1 ? 'close' : ''"
                        @click:append-inner="phone = ''"
                    />
                    <v-text-field
                        variant="outlined"
                        prepend-inner-icon="email"
                        :rules="isValid ? [rules.required, rules.email] : []"
                        label="Почта"
                        v-model="email"
                        density="compact"
                        rounded="md"
                        color="info"
                        hide-details
                        :append-inner-icon="email.length > 1 ? 'close' : ''"
                        @click:append-inner="email = ''"
                    />
                  </div>
                  <v-text-field
                      variant="outlined"
                      :rules="isValid ? [rules.required] : []"
                      label="Адрес"
                      v-model="address"
                      density="compact"
                      rounded="md"
                      color="info"
                      hide-details
                      :append-inner-icon="address.length > 1 ? 'close' : ''"
                      @click:append-inner="address = ''"
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