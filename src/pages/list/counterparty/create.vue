<script setup>
import { ref, defineProps, defineEmits, watch } from "vue";
import counterpartyApi from "../../../api/counterparty";
import showToast from "../../../composables/toast";
import Icons from "@/composables/Icons/Icons.vue";
import CustomCheckbox from "@/components/checkbox/CustomCheckbox.vue";


const props = defineProps(['isOpen', 'isEdit', 'item'])
const emits = defineEmits()

const name = ref("");
const phone = ref("");
const address = ref("");
const email = ref("");
const roles = ref([]);
const error_message = ref('')

const isValid = ref(false)
const dialog = ref(false)
const a = ref(false);
const b = ref(false);
const c = ref(false);

watch(() => dialog.value, (newValue, oldValue) => {
  if (newValue === false) {
    emits('toggleIsOpen');
  }
});

watch(() => isValid.value, (newValue, oldValue) => {
  console.log(newValue, 'new')
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


const clearForm = () => {
  name.value = ""
  phone.value = ""
  address.value = ""
  email.value = ""
  roles.value = []

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
    <v-dialog max-width="500px" v-model="dialog" class="mt-2 pa-2">
      <v-card style="border: 2px solid #3AB700" width="500" class="d-flex pa-5 pt-2  justify-center flex-column mx-auto my-0" rounded="xl">
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{ isEdit ? 'Изменение' : 'Добавление' }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex ga-3 align-center mt-2 me-4">
              <Icons @click="removeCurrency" name="delete"/>
              <Icons  @click="CreateCounterparty" name="save"/>
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
<!--              <v-text-field-->
<!--                variant="outlined"-->
<!--                :rules="[rules.required, rules.phone]"-->
<!--                label="Тел номер"-->
<!--                v-model.trim="phone"-->
<!--                density="compact"-->
<!--                v-mask="'+992#########'"-->
<!--                rounded="lg"-->
<!--                color="info"-->
<!--                :append-inner-icon="phone.length > 1 ? 'cancel' : ''"-->
<!--                @click:append-inner="phone = ''"-->
<!--              />-->
<!--              <v-text-field-->
<!--                variant="outlined"-->
<!--                :rules="[rules.required]"-->
<!--                label="Адрес"-->
<!--                v-model="address"-->
<!--                density="compact"-->
<!--                rounded="lg"-->
<!--                color="info"-->
<!--                :append-inner-icon="address.length > 1 ? 'cancel' : ''"-->
<!--                @click:append-inner="address = ''"-->
<!--              />-->
<!--              <v-text-field-->
<!--                variant="outlined"-->
<!--                prepend-inner-icon="email"-->
<!--                :rules="[rules.required, rules.email]"-->
<!--                label="Почта"-->
<!--                v-model="email"-->
<!--                density="compact"-->
<!--                rounded="lg"-->
<!--                color="info"-->
<!--                :append-inner-icon="email.length > 1 ? 'cancel' : ''"-->
<!--                @click:append-inner="email = ''"-->
<!--              />-->
<!--              <v-text-field-->
<!--                  v-model="symbolRef"-->
<!--                  :rules="[rules.required]"-->
<!--                  color="green"-->
<!--                  rounded="lg"-->
<!--                  variant="outlined"-->
<!--                  density="compact"-->
<!--                  placeholder="USD"-->
<!--                  v-mask="'AAA'"-->
<!--                  label="Символный код"-->
<!--                  clear-icon="close"-->
<!--                  clearable-->
<!--              />-->
<!--              <v-text-field-->
<!--                  v-model="digitalRef"-->
<!--                  :rules="[rules.required]"-->
<!--                  color="green"-->
<!--                  rounded="lg"-->
<!--                  density="compact"-->
<!--                  variant="outlined"-->
<!--                  placeholder="132"-->
<!--                  v-mask="'###'"-->
<!--                  label="Цифровой код"-->
<!--                  clear-icon="close"-->
<!--                  clearable-->
<!--              />-->
            </v-col>
          </v-row>
        </v-form>

<!--        <v-card class="table" style="border: 1px solid #3AB700">-->
<!--          <div class="d-flex w-100 rounded-t-lg mb-1 align-center " style="border-bottom: 1px solid #3AB700">-->
<!--            <div class="d-flex justify-end w-100 ga-2 pt-1 me-2" style="padding-top: 4px !important;">-->
<!--              <Icons @click="removeCurrencyRate" name="delete"/>-->
<!--              <Icons @click="addDialogRate" name="add"/>-->
<!--            </div>-->
<!--          </div>-->
<!--          <v-data-table-server-->
<!--              style="height: 38vh"-->
<!--              items-per-page-text="Элементов на странице:"-->
<!--              loading-text="Загрузка"-->
<!--              no-data-text="Нет данных"-->
<!--              v-model:items-per-page="paginationsRate.per_page"-->
<!--              :loading="loadingRate"-->
<!--              :headers="headersRate"-->
<!--              :items-length="paginationsRate.total || 0"-->
<!--              :items="rates"-->
<!--              :item-value="headersRate.title"-->
<!--              :search="search"-->
<!--              @update:options="getCurrencyRateData"-->
<!--              fixed-footer-->
<!--              hover-->
<!--          >-->
<!--            <template v-slot:item="{ item, index }">-->
<!--              <tr @dblclick="editDialogRate(item)">-->
<!--                <td class="d-flex align-center">-->
<!--                  <Icons class="mt-2 me-2" :name="item.deleted_at === null ? 'valid' : 'inValid'"/>-->
<!--                  <span>{{ index + 1 }}</span>-->
<!--                </td>-->
<!--                <td>{{ item.date }}</td>-->
<!--                <td>{{ item.value }}</td>-->
<!--              </tr>-->
<!--            </template>-->
<!--          </v-data-table-server>-->
<!--        </v-card>-->
      </v-card>
    </v-dialog>

<!--    <v-col>-->
<!--      <div class="d-flex justify-start mb-2 ">-->
<!--        <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push({name: 'counterparty'})">-->
<!--          <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>-->
<!--        </v-btn>-->
<!--      </div>-->
<!--      <v-card class="block">-->
<!--        <v-form @submit.prevent="CreateCounterparty">-->
<!--          <div class="d-flex ga-5">-->
<!--            <v-text-field-->
<!--              variant="outlined"-->
<!--              :rules="[rules.required]"-->
<!--              v-model="name"-->
<!--              density="compact"-->
<!--              label="Наименование"-->
<!--              rounded="lg"-->
<!--              color="info"-->
<!--              :append-inner-icon="name.length > 1 ? 'cancel' : ''"-->
<!--              @click:append-inner="name = ''"-->
<!--            />-->
<!--            <v-text-field-->
<!--              variant="outlined"-->
<!--              :rules="[rules.required, rules.phone]"-->
<!--              label="Тел номер"-->
<!--              v-model.trim="phone"-->
<!--              density="compact"-->
<!--              v-mask="'+992#########'"-->
<!--              rounded="lg"-->
<!--              color="info"-->
<!--              :append-inner-icon="phone.length > 1 ? 'cancel' : ''"-->
<!--              @click:append-inner="phone = ''"-->
<!--            />-->
<!--            <v-text-field-->
<!--              variant="outlined"-->
<!--              :rules="[rules.required]"-->
<!--              label="Адрес"-->
<!--              v-model="address"-->
<!--              density="compact"-->
<!--              rounded="lg"-->
<!--              color="info"-->
<!--              :append-inner-icon="address.length > 1 ? 'cancel' : ''"-->
<!--              @click:append-inner="address = ''"-->
<!--            />-->
<!--            <v-text-field-->
<!--              variant="outlined"-->
<!--              prepend-inner-icon="email"-->
<!--              :rules="[rules.required, rules.email]"-->
<!--              label="Почта"-->
<!--              v-model="email"-->
<!--              density="compact"-->
<!--              rounded="lg"-->
<!--              color="info"-->
<!--              :append-inner-icon="email.length > 1 ? 'cancel' : ''"-->
<!--              @click:append-inner="email = ''"-->
<!--            />-->
<!--          </div>-->
<!--          <div class="d-flex ga-16 flex-wrap">-->
<!--            <v-switch label="Клиент" base-color="info" color="info" @change="handleCheckboxChange(0)" />-->
<!--            <v-switch label="Поставщик" base-color="info" color="info" @change="handleCheckboxChange(1)" />-->
<!--            <v-switch label="Прочие отношения" base-color="info" color="info" @change="handleCheckboxChange(2)" />-->
<!--          </div>-->
<!--          <div class="error_message">-->
<!--            {{ error_message }}-->
<!--          </div>-->
<!--          <div class="d-flex justify-end">-->
<!--            <v-btn rounded="lg" color="info" type="submit">{{ add }}</v-btn>-->
<!--          </div>-->
<!--        </v-form>-->
<!--      </v-card>-->
<!--    </v-col>-->
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