<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import counterpartyApi from "../../../api/counterparty";
import showToast from "../../../composables/toast";
import Icons from "@/composables/Icons/Icons.vue";
import CustomCheckbox from "@/components/checkbox/CustomCheckbox.vue";
import counterpartyAgreement from "@/api/counterpartyAgreement.js";
import showDate from "@/composables/date/showDate.js";
import {removeMessage, restoreMessage} from "@/composables/constant/buttons.js";

const props = defineProps(['isOpen', 'isEdit', 'item'])
const emits = defineEmits()

const name = ref("");
const phone = ref("");
const address = ref("");
const email = ref("");
const error_message = ref('')
const search = ref('')

const pagination = ref([])
const roles = ref([]);
const result = ref([])
const markedID = ref([])
const markedItem = ref([])

const agreementDialog = ref(false)
const loading = ref(true)
const isValid = ref(false)
const dialog = ref(false)
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

const getId = async () => {
  try {
    const { data } = await counterpartyApi.getById(id.value);
    console.log(data)
    // form.value = data.result;
    // form.value.roles.forEach((roleIndex) => {
    //   if (roleIndex === 1) a.value = true;
    //   else if (roleIndex === 2) b.value = true;
    //   else if (roleIndex === 3) c.value = true;
    // });
  } catch (e) {
    console.error(e);
  }
};

const CreateCounterparty = async () => {
  try {
    isValid.value = true;
    error_message.value = '';
    const body = {
      name: name.value,
      phone: phone.value,
      address: address.value,
      email: email.value,
      roles: roles.value,
    };
    if (roles.value.length === 0) {
      error_message.value = 'Выберите хотя бы одну роль!';
    }
    const { response } = await counterpartyApi.create(body);
    console.log(response);
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
    const { data } = await counterpartyAgreement.get({ page, itemsPerPage, sortBy }, search)
    result.value = data.result.data.map(item => ({
      ...item,
      date: showDate(item.date)
    }))
    pagination.value = data.result.pagination
    loading.value = false
    console.log(data)
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

const handleCheckboxChange = (index) => {
  if (roles.value.includes(index + 1)) {
    roles.value = roles.value.filter((role) => role !== index + 1);
  } else {
    roles.value.push(index + 1);
  }
};

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
      <v-card style="border: 2px solid #3AB700" min-width="350" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{ isEdit ? 'Изменение' : 'Добавление' }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center mt-2 me-4">
              <Icons @click="CreateCounterparty" name="save"/>
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
                label="Название"
                clear-icon="close"
                clearable
                hide-details
              />
              <span style="color: red; font-weight: bolder" class="mr-4 mt-1">2500,00</span>
              </div>
              <div class="d-flex justify-space-between ga-5 align-center my-3">
              <v-text-field
                  :rules="isValid ? [rules.required] : []"
                  color="green"
                  rounded="md"
                  variant="outlined"
                  class="text-sm-body-1"
                  density="compact"
                  label="Дата"
                  clear-icon="close"
                  type="date"
                  clearable
                  hide-details
              />
                <CustomCheckbox v-model="a" @change="handleCheckboxChange(0)" >Клиент</CustomCheckbox>
                <CustomCheckbox v-model="b" @change="handleCheckboxChange(1)" >Поставщик</CustomCheckbox>
                <CustomCheckbox v-model="c" @change="handleCheckboxChange(2)" >Прочее</CustomCheckbox>
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
              <Icons @click="agreementDialog = true" name="add"/>
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
      <v-card style="border: 2px solid #3AB700" min-width="350" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{ isEdit ? 'Изменение' : 'Добавление' }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex ga-3 align-center mt-2 me-4">
              <Icons @click="compute" class="mr-3" name="delete"/>
              <Icons @click="CreateCounterparty" name="save"/>
            </div>
            <v-btn @click="agreementDialog = false"  variant="text" :size="32" class="pt-2 pl-1">
              <Icons name="close" />
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.block {
  border-radius: 16px;
  padding: 20px;
}
.error_message{
  color:  darkred;
  font-size: 14px;
  opacity: 0.9;
}
</style>