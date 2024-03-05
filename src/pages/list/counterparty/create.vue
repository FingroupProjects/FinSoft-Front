<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import showToast from "../../../composables/toast";
import Icons from "@/composables/Icons/Icons.vue";
import CustomCheckbox from "@/components/checkbox/CustomCheckbox.vue";
import counterpartyAgreement from "@/api/counterpartyAgreement.js";
import showDate from "@/composables/date/showDate.js";
import { removeMessage, restoreMessage } from "@/composables/constant/buttons.js";
import currencyApi from '../../../api/currency.js'
import organizationApi from "@/api/organizations.js";
import counterpartyApi from "../../../api/counterparty.js";
import priceTypeApi from "@/api/priceType.js";

const props = defineProps(['isOpen', 'isEdit', 'item'])
const emits = defineEmits()

const form = ref({
  name: '',
  currency_id: null,
  organization_id: null,
  counterparty_id: null,
  price_type_id: null,
  contact_person: '',
  comment: '',
})
const name = ref("");
const date = ref("");
const phone = ref("");
const address = ref("");
const email = ref("");
const search = ref("")
const modalTitle = ref("")

const pagination = ref([])
const roles = ref([]);
const result = ref([])
const markedID = ref([])
const markedItem = ref([])
const currencies = ref([])
const organizations = ref([])
const priceTypes = ref([])
const counterparties = ref([])

const agreementDialog = ref(false)
const loading = ref(true)
const isValid = ref(false)
const dialog = ref(false)
const isDocumentEdit = ref(false)
const a = ref(false);
const b = ref(false);
const c = ref(false);

const idAgreement = ref(null)
const hoveredRowIndex = ref(null)

const headers = ref([
  { title: '№', key: 'id', align: 'start', },
  { title: 'Номер договора', key: 'contract_number' },
  { title: 'Валюта', key: 'currency_id.name' },
  { title: 'Платеж', key: 'payment_id.name' },
]);

watch(() => dialog.value, (newValue, oldValue) => {
  if (newValue === false) {
    emits('toggleIsOpen');
  }
});

watch(() => props.isOpen, (newValue, oldValue) => {
  if (newValue === true || oldValue === true) {
    dialog.value = newValue;
  }
});

watch(() => props.isEdit, (newValue) => {
  if (newValue === true) {
    clearForm()
    getId()
  }if(!newValue){
    clearForm()
  }
});

const lineMarking = (item) => {
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
}

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if(markedItem.value.deleted_at) {
    return restore({ page, itemsPerPage, sortBy })
  }
  else{
    return del({ page, itemsPerPage, sortBy, search })
  }
}

const openAgreementDialog = () => {
  agreementDialog.value = true
  const page = 1
  const Items = 100
  getOrganization(page, Items)
  getPriceType({page, Items})
  getCounterparties({page, Items})
  getCurrencies({page, Items})
}

const clearForm = () => {
  name.value = ""
  phone.value = ""
  address.value = ""
  email.value = ""
  roles.value = []
}

const editDialog = (item) => {
  console.log(item)
}

const getOrganization = async (page, items) => {
  try{
    const { data } = await organizationApi.get(page, items)
    organizations.value = data.result.data
  }catch (e){
    console.log(e)
  }
}

const getPriceType = async ({page, itemsPerPage}) => {
  try{
    const { data } = await priceTypeApi.get({page, itemsPerPage})
    console.log(data, 'priceTypes')
    priceTypes.value = data.result.data
  }catch (e){
    console.log(e)
  }
}

const getCounterparties = async ({page, itemsPerPage}) => {
  try{
    const { data } = await counterpartyApi.get({page, itemsPerPage})
    console.log(data, 'counterparties')
    counterparties.value = data.result.data
  }catch (e){
    console.log(e)
  }
}

const getCurrencies = async ({page, itemsPerPage}) => {
  try{
    const { data } = await currencyApi.get({page, itemsPerPage})
    console.log(data, 'currencies')
    currencies.value = data.result.data
  }catch (e){
    console.log(e)
  }
}

const getId = async () => {
  try {
    const { data } = await counterpartyApi.getById(props.item);
    name.value = data.result.name;
    modalTitle.value = data.result.name
    date.value = showDate(data.result.created_at)
    address.value = data.result.address;
    phone.value = data.result.phone;
    email.value = data.result.email;
    roles.value = data.result.roles
    if(roles.value) {
      roles.value.forEach((roleIndex) => {
        if (roleIndex === 1) a.value = true;
        else if (roleIndex === 2) b.value = true;
        else if (roleIndex === 3) c.value = true;
      });
    }
  } catch (e) {
    console.error(e);
  }
};

const CreateCounterparty = async () => {
  try {
    isValid.value = true;
    const body = {
      name: name.value,
      phone: phone.value,
      address: address.value,
      email: email.value,
      roles: roles.value,
    };
    const { response } = await counterpartyApi.create(body);
    showToast("Успешно добавлена", "green");
    emits('toggleIsOpen');
    clearForm();
  } catch (error) {
    isValid.value = true;
    if (error.response && error.response.status === 422) {
      showToast("Заполните поля!", "warning");
    } else {
      console.error(error);
    }
  }
};

const getDocuments = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    loading.value = true
    if(props.isEdit === true) {
      const { data } = await counterpartyAgreement.getCounterpartyById(props.item,{ page, itemsPerPage, sortBy }, search)
      result.value = data.result.data.map(item => ({
        ...item,
        date: showDate(item.date)
      }))
      pagination.value = data.result.pagination
    }else{
      const { data } = await counterpartyAgreement.get({ page, itemsPerPage, sortBy }, search)
      result.value = data.result.data.map(item => ({
        ...item,
        date: showDate(item.date)
      }))
      pagination.value = data.result.pagination
    }

    loading.value = false
  }
  catch (e) {
    console.log(e);
  }
}

const del = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value
  }
  try{
    const { status } = await counterpartyAgreement.massDeletion(body)
    if (status === 200) {
      showToast(removeMessage, 'red')
      await getDocuments({ page, itemsPerPage, sortBy })
      markedID.value = []
    }
  }catch(e){
    console.log(e)
  }
}

const restore = async ({ page, itemsPerPage, sortBy }) => {
  try{
    const body = {
      ids: markedID.value
    }
    const { status } = await  counterpartyAgreement.massRestore(body)
    if (status === 200) {
      showToast(restoreMessage, 'green')
      await getDocuments({ page, itemsPerPage, sortBy })
      markedID.value = []
    }
  }catch (e) {
    console.log(e)
  }
}

const updateCounterparty = async () => {
  try {
    const body = {
      name: name.value,
      address: address.value,
      phone: phone.value,
      email: email.value,
      roles: roles.value
    }
    await counterpartyApi.update(props.item, body);
    showToast("Успешно изменено", "#");
    emits('toggleIsOpen');
  } catch (e) {
    console.error(e);
  }
};

const handleCheckboxChange = (index) => {
  if (roles.value.includes(index + 1)) {
    roles.value = roles.value.filter((role) => role !== index + 1);
  } else {
    roles.value.push(index + 1);
  }
};

const createCpAgreement = async () =>{
  try{

    const body = {
      name: form.value.name,
      currency_id: form.value.currency_id,
      organization_id: form.value.organization_id,
      counterparty_id: form.value.counterparty_id,
      price_type_id: form.value.price_type_id,
      contact_person: form.value.contact_person,
      comment: form.value.comment,
      contract_number: '00007',
      date: '05.02.2024',
      payment_id: 3
    }
    const { data } = await counterpartyAgreement.create(body)
    showToast("Успешно добавлена", "green");
  }catch (e) {
    console.log(e)
  }
}

const removeCurrency = () => {
    console.log('remove')
}

const rules = {
  required: v => !!v ,
  email: v => (/.+@.+\..+/.test(v)) ,
  phone: v => v.length === 13 ,
}

</script>

<template>
  <div>
    <v-dialog v-model="dialog" class="mt-2 pa-2">
      <v-card style="border: 2px solid #3AB700" min-width="350" class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0" rounded="xl">
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{ isEdit ? `Контрагент: ${modalTitle}` : 'Добавление' }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center mt-2 me-4">
              <Icons @click="isEdit ? updateCounterparty() : CreateCounterparty" name="save"/>
            </div>
            <v-btn @click="dialog = false"  variant="text" :size="32" class="pt-2 pl-1">
              <Icons name="close" />
            </v-btn>
          </div>
        </div>
        <v-form class="d-flex w-100">
          <v-row class="w-100">
            <v-col class="d-flex flex-column w-100">
              <div class="d-flex justify-space-between ga-6">
              <v-text-field
                v-model="name"
                :rules="[rules.required]"
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
              <span style="color: red; font-weight: bolder" class="mr-4 mt-1">2500,00</span>
              </div>
              <div :class="isEdit ? 'justify-space-between' : 'justify-end' " class="d-flex justify-space-between ga-5 align-center my-3">
                <div v-if="isEdit" style="border: 1.5px solid #cbc8c8; border-radius: 4px; padding: 2px 12px">
                  <span>
                    {{ date }}
                  </span>
                </div>
                <CustomCheckbox :checked="a" @change="handleCheckboxChange(0)" >Клиент</CustomCheckbox>
                <CustomCheckbox :checked="b" @change="handleCheckboxChange(1)" >Поставщик</CustomCheckbox>
                <CustomCheckbox :checked="c" @change="handleCheckboxChange(2)" >Прочее</CustomCheckbox>
              </div>
              <div class="d-flex ga-4 mb-3">
                <v-text-field
                  variant="outlined"
                  :rules="isValid? [rules.required, rules.phone]  : []"
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
      <v-card class="table mt-3" style="border: 1px solid #3AB700">
        <div class="d-flex w-100 rounded-t-md mb-1 align-center " style="border-bottom: 1px solid #3AB700">
          <div class="d-flex justify-space-between w-100 ga-2 pt-1 me-2" style="padding-top: 4px !important;">
            <span>Договоры</span>
            <span>
              <Icons @click="compute" class="mr-3" name="delete"/>
              <Icons @click="openAgreementDialog" name="add"/>
            </span>
          </div>
        </div>
        <v-data-table-server
            fixed-header
            style="height: 38vh"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            v-model:items-per-page="pagination.per_page"
            :loading="loading"
            :headers="headers"
            :items-length="pagination.total || 0"
            :items="result"
            :item-value="headers.title"
            :search="search"
            @update:options="getDocuments({}, idAgreement)"
            fixed-footer
            hover
        >
          <template v-slot:item="{ item, index }">
            <tr @mouseenter="hoveredRowIndex = index" @mouseleave="hoveredRowIndex = null" @click="lineMarking(item)" @dblclick="editDialog(item)" :class="{'bg-grey-lighten-2': markedID.includes(item.id)}">
              <td class="d-flex align-center">
                <Icons class="mt-2 me-2" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>
                <span>{{ index + 1 }}</span>
              </td>
              <td>{{ item.contract_number }}</td>
              <td>{{ item.currency_id.name }}</td>
              <td>{{ item.payment_id.name }}</td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
      </v-card>

    </v-dialog>



<!--Create Agreement-->
    <v-dialog v-model="agreementDialog" class="mt-2 pa-2">
      <v-card style="border: 2px solid #3AB700" min-width="650" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{ isDocumentEdit ? 'Изменение' : 'Добавление' }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex ga-3 align-center mt-2 me-4">
              <Icons @click="compute" class="mr-3" name="delete"/>
              <Icons @click="createCpAgreement" name="save"/>
            </div>
            <v-btn @click="agreementDialog = false"  variant="text" :size="32" class="pt-2 pl-1">
              <Icons name="close" />
            </v-btn>
          </div>
        </div>
        <v-form class="d-flex w-100">
          <v-row class="w-100">
            <v-col class="d-flex flex-column w-100">
              <div class="d-flex justify-space-between ga-6">
                <v-text-field
                  v-model="form.name"
                  :rules="[rules.required]"
                  color="green"
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Наименование"
                  label="Наименование"
                  clear-icon="close"
                  clearable
                  hide-details
                />
                <span style="color: red; font-weight: bolder" class="mr-4 mt-1">2500,00</span>
              </div>
              <div class="d-flex justify-space-between ga-5 align-center my-3">
                <div v-if="isDocumentEdit" class="w-25" style="border: 1.5px solid #cbc8c8; border-radius: 4px; padding: 2px 12px">
                  <span>
                    {{ date }}
                  </span>
                </div>
                <div v-if="isDocumentEdit" class="w-25" style="border: 1.5px solid #cbc8c8; border-radius: 4px; padding: 2px 12px">
                  <span>
                    {{ date }}
                  </span>
                </div>
                <v-select
                  variant="outlined"
                  label="Валюта"
                  v-model="form.currency_id"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  hide-details
                />
              </div>
                <v-select
                  variant="outlined"
                  label="Организация"
                  v-model="form.organization_id"
                  :items="organizations"
                  item-title="name"
                  item-value="id"
                  hide-details
                />
              <div class="d-flex ga-4 my-3">
                <v-select
                  class="w-50"
                  variant="outlined"
                  label="Контрагент"
                  v-model="form.counterparty_id"
                  :items="counterparties"
                  item-title="name"
                  item-value="id"
                  hide-details
                />
                <v-select
                  class="w-25"
                  variant="outlined"
                  label="Виды цен"
                  v-model="form.price_type_id"
                  :items="priceTypes"
                  item-title="name"
                  item-value="id"
                  hide-details
                />
              </div>
                <v-text-field
                  v-model="form.contact_person"
                  variant="outlined"
                  :rules="isValid ? [rules.required] : []"
                  label="Контактное лицо"
                  density="compact"
                  rounded="md"
                  color="info"
                  hide-details
                />
              <v-container class="pa-0 mt-3">
                <v-textarea
                  v-model="form.comment"
                  variant="outlined"
                  label="Комментарий"
                ></v-textarea>
              </v-container>
            </v-col>

          </v-row>
        </v-form>
      </v-card>
    </v-dialog>


  </div>
</template>