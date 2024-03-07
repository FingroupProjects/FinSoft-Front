<script setup>
import {onMounted, ref, watch} from "vue";
import {useRouter} from "vue-router";
import showToast from '../../../composables/toast'
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import {
  addMessage,
  editMessage,
  removeMessage,
  warningMessage,
  ErrorSelectMessage,
  selectOneItemMessage,
  restoreMessage
} from "../../../composables/constant/buttons.js";
import organization from "../../../api/organizations.js";
import priceType from "../../../api/priceType.js";
import user from "../../../api/user.js";

const router = useRouter()

const loading = ref(true)
const dialog = ref(false)
const idUser = ref(null)
const hoveredRowIndex = ref(null)

const isExistsUser = ref(false)
const markedID = ref([])
const markedItem = ref([])
const userDialogTitle = ref(null)
const search = ref('')

const nameRef = ref(null)

const users = ref([])
const organizations = ref([])
const paginations = ref([])

const headers = ref([
  {title: '№', key: 'id', align: 'start'},
  {title: 'Наименование', key: 'name'},
])

const rules = {
  required: v => !!v,
}


const getUser = async ({page, itemsPerPage, sortBy, search}) => {
  loading.value = true
  try {
    const { data } = await user.get({page, itemsPerPage, sortBy}, search)

    paginations.value = data.result.pagination
    users.value = data.result.data
    console.log(users.value)
    loading.value = false
  } catch (e) {
  }
}


const addUser = async ({page, itemsPerPage, sortBy}) => {

  const body = {
    name: nameRef.value,
  }

  const res = await priceType.add(body)

  if (res.status === 201) {
    await getUser({page, itemsPerPage, sortBy})
    showToast(addMessage)
    idUser.value = res.data.result.id
    dialog.value = false

    markedID.value = []
    markedItem.value = []
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
      await getUser({page, itemsPerPage, sortBy}, search)
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
    const {status} = await priceType.update(idUser.value, body)
    if (status === 200) {
      nameRef.value = null

      dialog.value = null
      await getPriceTypeData({page, itemsPerPage, sortBy})
      showToast(editMessage)
    }
  } catch (e) {
    console.log(e)
  }
}

const getOrganization = async () => {
  try {
    const {data} = await organization.get({page: 1, itemsPerPage: 100000})

    organizations.value = data.result.data.map(item => {
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
  console.log(item)

  if (item === 0) {
    idUser.value = 0
    isExistsUser.value = false
  } else {
    idUser.value = item.id
    markedID.value.push(item.id);
    isExistsUser.value = true
    nameRef.value = item.name
    userDialogTitle.value = nameRef.value
  }

}


const addBasedOnUser = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, 'warning')
  if (markedID.value.length > 1) return showToast(selectOneItemMessage, 'warning')
  dialog.value = true

  users.value.forEach(item => {
    if (markedID.value[0] === item.id) {
      nameRef.value = item.name
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
    const firstMarkedItem = users.value.find(el => el.id === markedID.value[0]);
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if(item.deleted_at === null) {
        showToast(ErrorSelectMessage, 'warning')
        return
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if(item.deleted_at !== null) {
        showToast(ErrorSelectMessage, 'warning')
        return
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
  }
})

onMounted(async () => {
  await getOrganization()
})


</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Пользователи</span>
        </div>
        <v-card variant="text" min-width="350" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons @click="openDialog(0)" name="add"/>
              <Icons @click="addBasedOnUser" name="copy"/>
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
            :items="users"
            :item-value="headers.title"
            :search="search"
            @update:options="getUser"
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
                  <div  class="d-flex">
                    <Icons style="margin-right: 10px;" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                    <span>{{ item.id }}</span>
                  </div>
                </template>
              </td>
              <td>{{ item.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>

      <!-- Modal -->
      <v-card>
        <v-dialog class="mt-2 pa-2" v-model="dialog">
          <v-card style="border: 2px solid #3AB700" min-width="600"
                  class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
            <div class="d-flex justify-space-between align-center mb-2">
              <span>{{ isExistsUser ?  'Пользователь: ' + userDialogTitle : 'Добавление' }}</span>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons v-if="isExistsUser"  @click="compute" name="delete"/>
                  <Icons v-if="isExistsUser" @click="update" name="save"/>
                  <Icons v-else @click="addUser" name="save"/>
                </div>
                <v-btn @click="dialog = false" variant="text" :size="32" class="pt-2 pl-1">
                  <Icons name="close"/>
                </v-btn>
              </div>
            </div>
            <v-form class="d-flex w-100" @submit.prevent="addUser">
              <v-row class="w-100">
                <v-col class="d-flex flex-column w-100">
                  <div>
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
                    <CustomCheckbox v-model="statusID">
                      <span>Активный</span>
                    </CustomCheckbox>
                  </div>
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