<script setup>
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import showToast from "../../../composables/toast";
import Icons from "@/composables/Icons/Icons.vue";
import CustomCheckbox from "@/components/checkbox/CustomCheckbox.vue";
import counterpartyAgreement from "@/api/list/counterpartyAgreement.js";
import showDate from "@/composables/date/showDate.js";
import ConfirmModal from "../../../components/confirm/ConfirmModal.vue";
import {
  createAccess,
  updateAccess,
  removeAccess,
} from "../../../composables/access/access";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  warningMessage,
} from "@/composables/constant/buttons.js";
import currencyApi from "../../../api/list/currency.js";
import organizationApi from "@/api/list/organizations.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import priceTypeApi from "@/api/list/priceType.js";
import validate from "./validate.js";
import {
  FIELD_COLOR,
  BASE_COLOR,
} from "../../../composables/constant/colors.js";
const props = defineProps([
  "isOpen",
  "isEdit",
  "item",
  "createOnBase",
  "counterparty",
]);
const emits = defineEmits(["toggleIsOpen", "computeCounterparty"]);

const form = ref({
  name: "",
  date: null,
  currency_id: null,
  organization_id: null,
  counterparty_id: null,
  price_type_id: null,
  contact_person: "",
  comment: "",
  contract_number: "",
});
const editID = ref(null);
const name = ref("");
const date = ref("дд.мм.гггг");
const phone = ref("");
const address = ref("");
const email = ref("");
const search = ref("");
const modalTitle = ref("");

const showModal = ref(false);
const showModalAgreement = ref(false);
const showConfirmDialog = ref(false);

const pagination = ref([]);
const roles = ref([]);
const result = ref([]);
const markedID = ref([]);
const markedItem = ref([]);
const currencies = ref([]);
const organizations = ref([]);
const priceTypes = ref([]);
const counterparties = ref([]);
const counterpartyAgreements = ref([]);

const editAgreementDialog = ref(false);
const agreementDialog = ref(false);
const loading = ref(true);
const isValid = ref(false);
const dialog = ref(false);
const isDocumentEdit = ref(false);
const a = ref(false);
const b = ref(false);
const c = ref(false);

const idAgreement = ref(null);
const hoveredRowIndex = ref(null);

const headers = ref([
  { title: "Номер договора", key: "contract_number" },
  { title: "Валюта", key: "currency_id.name" },
  { title: "Баланс", key: "balance" },
]);

watch(
  () => dialog.value,
  (newValue, oldValue) => {
    if (newValue === false) {
      emits("toggleIsOpen");
      isValid.value = false;
    }
  }
);

const isOrganizationFieldDisabled = computed(() => {
  return !createAccess("organization") && !updateAccess("organization");
});

const isCurrencyFieldDisabled = computed(() => {
  return !createAccess("currency") && !updateAccess("currency");
});

const isPriseTypesFieldDisabled = computed(() => {
  return !createAccess("priceType") && !updateAccess("priceType");
});

watch(
  () => props.isOpen,
  (newValue, oldValue) => {
    if (newValue === true || oldValue === true) {
      dialog.value = newValue;
    }
  }
);

watch(
  () => props.createOnBase,
  (newValue, oldValue) => {
    if (newValue === true || oldValue === true) {
      getId();
    }
  }
);

watch(
  () => agreementDialog.value,
  (newValue, oldValue) => {
    if (newValue === false) {
      clearInputs();
      isValid.value = false;
      editAgreementDialog.value = false;
      isDocumentEdit.value = false;
    }
  }
);

watch(
  () => props.isEdit,
  (newValue) => {
    clearForm();
    if (newValue === true) {
      getId();
    } else {
      a.value = false;
      b.value = false;
      c.value = false;
    }
  }
);

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = result.value.find(
      (el) => el.id === markedID.value[0]
    );
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, "warning");
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, "warning");
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
};

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return restore({ page, itemsPerPage, sortBy });
  } else {
    return del({ page, itemsPerPage, sortBy, search });
  }
};

const openAgreementDialog = () => {
  getDated();
};

const toggleModal = () => {
  showModal.value = !showModal.value;
};
const toggleModalAgreement = () => {
  showModalAgreement.value = !showModalAgreement.value;
};

const getDated = () => {
  agreementDialog.value = true;
  const page = 1;
  const Items = 100;
  form.value.counterparty_id = editID.value;
  getOrganization(page, Items);
  getPriceType({ page, Items });
  getCounterparties({ page, Items });
  getCurrencies({ page, itemsPerPage: 1000 });
};

const clearForm = () => {
  name.value = "";
  phone.value = "";
  address.value = "";
  email.value = "";
  roles.value = [];
};

const clearInputs = () => {
  form.value = {
    name: "",
    date: null,
    currency_id: null,
    organization_id: null,
    counterparty_id: null,
    price_type_id: null,
    contact_person: "",
    comment: "",
  };
};
const editDialog = (item) => {
  editID.value = item;
  isDocumentEdit.value = true;
  editAgreementDialog.value = true;
  agreementDialog.value = true;
  getDated();
  cpAgreementGetById(item);
};

const cpAgreementGetById = async (item) => {
  try {
    // const { data } = await counterpartyAgreement.getById(id);
    form.value = {
      ...item,
      date: item.date,
      currency_id: item.currency_id.id,
      organization_id: item.organization_id.id,
      counterparty_id: item.counterparty_id.id,
      price_type_id: item.price_type_id.id,
    };
    counterpartyAgreements.value = form.value
  } catch (e) {
    console.log(e);
  }
};

const getOrganization = async (page, items) => {
  try {
    const { data } = await organizationApi.get({ page, items });
    organizations.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const getPriceType = async ({ page, itemsPerPage }) => {
  try {
    const { data } = await priceTypeApi.get({ page, itemsPerPage });
    priceTypes.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const getCounterparties = async ({ page, itemsPerPage }) => {
  try {
    const { data } = await counterpartyApi.get({ page, itemsPerPage });
    counterparties.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const getCurrencies = async ({ page, itemsPerPage }) => {
  try {
    const { data } = await currencyApi.get({ page, itemsPerPage });
    currencies.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const getId = async () => {
  try {
    // const { data } = await counterpartyApi.getById(props.item);
    const counterparty = props.item;
    name.value = counterparty.name;
    modalTitle.value = counterparty.name;
    date.value = counterparty.created_at;
    address.value = counterparty.address;
    phone.value = counterparty.phone;
    email.value = counterparty.email;

    const transformedRoles = counterparty.roles.map((role) => {
      switch (role) {
        case "Клиент":
          return 1;
        case "Поставщик":
          return 2;
        case "Прочие":
          return 3;
        default:
          return null;
      }
    });

    roles.value = transformedRoles;

    if (roles.value) {
      roles.value.forEach((roleIndex) => {
        if (roleIndex === 1) a.value = true;
        if (roleIndex === 2) b.value = true;
        if (roleIndex === 3) c.value = true;
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const CreateCounterparty = async () => {
  isValid.value = true;
  if (validate(name, phone, address, email, roles) !== true) return;

  try {
    const body = {
      name: name.value,
      phone: phone.value,
      address: address.value,
      email: email.value,
      roles: roles.value,
    };
    await counterpartyApi.create(body);
    showToast("Успешно добавлена", "green");
    emits("toggleIsOpen");
    clearForm();
  } catch (error) {
    console.log(error);
    if (error.response.data.errors.email) {
      showToast("Такой email уже существует", "warning");
    } else if (error.response.data.errors.phone) {
      showToast("Такой номер телефона уже существует", "warning");
    }
  } finally {
    isValid.value = false;
  }
};

const getDocuments = async ({ page, itemsPerPage, sortBy, search }) => {
  if (props.isEdit === false) {
    loading.value = false;
    result.value = [];
    return;
  }

  try {
    loading.value = true;

    if (props.isEdit === true) {
      const { data } = await counterpartyAgreement.getCounterpartyById(
        props.item.id,
        { page, itemsPerPage, sortBy },
        search
      );
      result.value = data.result.data.map((item) => ({
        ...item,
        date: showDate(item.date),
      }));
      pagination.value = data.result.pagination;
    }

    loading.value = false;
  } catch (e) {
    console.log(e);
  }
};

const del = async ({ page, itemsPerPage, sortBy, search }) => {
  if (markedID.value.length === 0) {
    showToast(warningMessage, "warning");
    return;
  }
  const body = {
    ids: markedID.value,
  };
  try {
    const { status } = await counterpartyAgreement.massDeletion(body);
    if (status === 200) {
      showToast(removeMessage, "red");
      await getDocuments({ page, itemsPerPage, sortBy });
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const restore = async ({ page, itemsPerPage, sortBy }) => {
  if (markedID.value.length === 0) {
    showToast(warningMessage, "warning");
    return;
  }
  try {
    const body = {
      ids: markedID.value,
    };
    const { status } = await counterpartyAgreement.massRestore(body);
    if (status === 200) {
      showToast(restoreMessage, "green");
      await getDocuments({ page, itemsPerPage, sortBy });
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const updateCounterparty = async () => {
  if (validate(name, phone, address, email, roles) !== true) return;
  try {
    isValid.value = true;
    const body = {
      name: name.value,
      phone: phone.value,
      address: address.value,
      email: email.value,
      roles: roles.value,
    };
    if (roles.value.length === 0) {
      showToast("Выберите одну роль!", "warning");
      return;
    }
    console.log(body);
    await counterpartyApi.update(props.item.id, body);
    showToast("Успешно изменено", "green");
    emits("toggleIsOpen");
  } catch (error) {
    console.log(error);
  }
};

const handleCheckboxChange = (index) => {
  if (roles.value.includes(index + 1)) {
    roles.value = roles.value.filter((role) => role !== index + 1);
  } else {
    roles.value.push(index + 1);
  }
};

const isDataChanged = () => {
  const item = props.counterparty.find((item) => item.id === props.item.id);

  const isChanged =
    name.value !== item.name ||
    address.value !== item.address ||
    phone.value !== item.phone ||
    email.value !== item.email;

  return isChanged;
};

const closingWithSaving = async () => {
  if (props.isEdit) {
    await updateCounterparty({
      page: 1,
      itemsPerPage: 10,
      sortBy: "id",
      search: null,
    });
    showModal.value = false;
  } else {
    const isValid = validate(name, address, phone, email);
    showModal.value = false;
    if (isValid === true) {
      await CreateCounterparty({
        page: 1,
        itemsPerPage: 10,
        sortBy: "id",
        search: null,
      });
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

const checkAndClose = () => {
  if (
    name.value ||
    phone.value ||
    email.value ||
    address.value ||
    roles.value.length > 0
  ) {
    showModal.value = true;
  } else {
    dialog.value = false;
  }
};

const closeDialogWithoutSaving = () => {
  dialog.value = false;
  showModal.value = false;
  clearForm();
};

const isDataChangedAgreement = () => {
  const item = counterpartyAgreements.value
  console.log(item);
  console.log(form.value);
  const isChanged =
    form.value.name !== item.name ||
    form.value.currency_id !== item.currency_id ||
    form.value.organization_id !== item.organization_id ||
    form.value.price_type_id !== item.price_type_id ||
    form.value.contact_person !== item.contact_person ||
    form.value.date !== item.date;
  return isChanged;
};

const closingWithSavingAgreement = async () => {
  if (props.isEdit) {
    await updateCpAgreement({
      page: 1,
      itemsPerPage: 10,
      sortBy: "id",
      search: null,
    });
    showModalAgreement.value = false;
  } else {
    const isValid = validate(
      name,
      currencies,
      organizations,
      priceTypes,
      counterparties,
      date
    );
    showModalAgreement.value = false;
    if (isValid === true) {
      await createCpAgreement({
        page: 1,
        itemsPerPage: 10,
        sortBy: "id",
        search: null,
      });
      dialog.value = false;
      showModalAgreement.value = false;
      showConfirmDialog.value = false;
    }
  }
};

const checkUpdateAgreement = () => {
  if (isDataChangedAgreement()) {
    showModalAgreement.value = true;
  } else {
    agreementDialog.value = false;
  }
};

const checkAndCloseAgreement = () => {
  if (
    name.value ||
    currencies.value ||
    organizations.value ||
    priceTypes.value ||
    counterparties.value ||
    date.value
  ) {
    showModalAgreement.value = true;
  } else {
    agreementDialog.value = false;
  }
};

const closeDialogWithoutSavingAgreement = () => {
  agreementDialog.value = false;
  showModalAgreement.value = false;
  clearForm();
};

const createCpAgreement = async () => {
  try {
    const body = {
      name: form.value.name,
      currency_id: form.value.currency_id,
      organization_id: form.value.organization_id,
      counterparty_id: form.value.counterparty_id,
      price_type_id: form.value.price_type_id,
      contact_person: form.value.contact_person,
      comment: form.value.comment,
      date: form.value.date,
    };
    await counterpartyAgreement.create(body);
    showToast("Успешно добавлена", "green");
    agreementDialog.value = false;
    getDocuments({});

    clearInputs();
  } catch (error) {
    isValid.value = true;
    if (error.response && error.response.status === 422) {
      showToast("Заполните все поля!", "warning");
    }
    console.log(error);
  }
};

const updateCpAgreement = async () => {
  try {
    const body = {
      name: form.value.name,
      currency_id: form.value.currency_id,
      organization_id: form.value.organization_id,
      counterparty_id: form.value.counterparty_id,
      price_type_id: form.value.price_type_id,
      contact_person: form.value.contact_person,
      comment: form.value.comment,
      date: form.value.date,
      contract_number: form.value.contract_number,
      payment_id: 2,
    };

    await counterpartyAgreement.update(editID.value.id, body);
    showToast("Успешно изменено", "green");
    agreementDialog.value = false;
    editAgreementDialog.value = false;
  } catch (e) {
    console.log(e);
  }
};

const rules = {
  required: (v) => !!v,
  email: (v) => /.+@.+\..+/.test(v),
  phone: (v) => v.length === 13,
};

const price_typeProps = (item) => {
  return {
    title: item.name,
  };
};

const organizationProps = (item) => {
  return {
    title: item.name,
  };
};

const counterpartyProps = (item) => {
  return {
    title: item.name,
  };
};

const currencyProps = (item) => {
  return {
    title: item.name,
  };
};
</script>

<template>
  <div>
    <v-dialog
      persistent
      v-model="dialog"
      class="mt-2 pa-2"
      @keyup.esc="isEdit ? checkUpdate() : checkAndClose()"
    >
      <v-card
        :style="`border: 2px solid ${BASE_COLOR}`"
        min-width="350"
        class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
        rounded="xl"
      >
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{
            isEdit && !createOnBase ? `Контрагент: ${modalTitle}` : "Добавление"
          }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center mt-2 me-4">
              <Icons
                v-if="removeAccess('counterparty') && isEdit && !createOnBase"
                class="me-4"
                @click="$emit('computeCounterparty')"
                title="Удалить"
                name="delete"
              ></Icons>
              <Icons
                v-if="createAccess('counterparty') && isEdit"
                title="Сохранить"
                @click="
                  isEdit && !createOnBase
                    ? updateCounterparty()
                    : CreateCounterparty()
                "
                name="save"
              />
            </div>
            <v-btn
              @click="isEdit ? checkUpdate() : checkAndClose()"
              variant="text"
              title="Закрыть"
              :size="32"
              class="pt-2 pl-1"
            >
              <Icons name="close" />
            </v-btn>
          </div>
        </div>
        <v-form
          class="d-flex w-100"
          :disabled="!updateAccess('counterparty') && isEdit"
          @submit.prevent="CreateCounterparty"
        >
          <v-row class="w-100">
            <v-col class="d-flex flex-column w-100">
              <div class="d-flex justify-space-between ga-6">
                <v-text-field
                  v-model="name"
                  max-length="25"
                  :rules="isValid ? [rules.required] : []"
                  :color="BASE_COLOR"
                  :base-color="FIELD_COLOR"
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Контрагент"
                  label="Наименование"
                  clear-icon="close"
                  autofocus
                  clearable
                  hide-details
                />
                <span
                  v-if="isEdit"
                  style="color: red; font-weight: bolder"
                  class="mr-4 mt-1"
                  >{{ props.item.balance }}</span
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
                  :base-color="FIELD_COLOR"
                  :rules="isValid ? [rules.required, rules.phone] : []"
                  label="Тел номер"
                  v-model.trim="phone"
                  density="compact"
                  v-mask="'+992#########'"
                  rounded="md"
                  :color="BASE_COLOR"
                  clear-icon="close"
                  hide-details
                  clearable
                  @click:append-inner="phone = ''"
                />
                <v-text-field
                  variant="outlined"
                  :base-color="FIELD_COLOR"
                  :rules="isValid ? [rules.required, rules.email] : []"
                  label="Почта"
                  v-model="email"
                  density="compact"
                  rounded="md"
                  :color="BASE_COLOR"
                  clear-icon="close"
                  hide-details
                  clearable
                  @click:append-inner="email = ''"
                />
              </div>
              <v-text-field
                variant="outlined"
                :base-color="FIELD_COLOR"
                :rules="isValid ? [rules.required] : []"
                label="Адрес"
                v-model="address"
                density="compact"
                clear-icon="close"
                rounded="md"
                :color="BASE_COLOR"
                hide-details
                clearable
                @click:append-inner="address = ''"
              />
            </v-col>
          </v-row>
        </v-form>
        <v-card class="table mt-3" :style="`border: 2px solid ${BASE_COLOR}`">
          <div
            class="d-flex w-100 rounded-t-md mb-1 align-center"
            :style="`border-bottom: 2px solid ${BASE_COLOR}`"
          >
            <div
              class="d-flex justify-space-between w-100 ga-2 pt-1 me-2"
              style="padding-top: 4px !important"
            >
              <span>Договоры</span>
              <span style="display: flex">
                <Icons
                  v-if="removeAccess('counterparty') && isEdit"
                  v-show="isEdit"
                  @click="compute"
                  class="mr-3"
                  name="delete"
                  title="Удалить"
                />

                <Icons
                  v-if="createAccess('counterparty') && isEdit"
                  v-show="isEdit"
                  @click="openAgreementDialog"
                  name="add"
                  title="Добавить"
                />
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
            show-select
            v-model="markedID"
            page-text="{0}-{1} от {2}"
            :items-per-page-options="[
              { value: 25, title: '25' },
              { value: 50, title: '50' },
              { value: 100, title: '100' },
            ]"
          >
            <template v-slot:item="{ item, index }">
              <tr
                @mouseenter="hoveredRowIndex = index"
                @mouseleave="hoveredRowIndex = null"
                @dblclick="editDialog(item)"
                :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
              >
                <td>
                  <template
                    v-if="
                      hoveredRowIndex === index || markedID.includes(item.id)
                    "
                  >
                    <CustomCheckbox
                      v-model="markedID"
                      :checked="markedID.includes(item.id)"
                      @click="lineMarking(item)"
                      @change="lineMarking(item)"
                    >
                      <span>{{ item.id }}</span>
                    </CustomCheckbox>
                  </template>

                  <template v-else>
                    <span class="d-flex align-center">
                      <Icons
                        style="margin-right: 10px; margin-top: 4px"
                        :name="item.deleted_at === null ? 'valid' : 'inValid'"
                      />
                      <span>{{ item.id }}</span>
                    </span>
                  </template>
                </td>
                <td>{{ item.contract_number }}</td>
                <td>{{ item.currency_id.name }}</td>
                <td>{{ 2500 }}</td>
              </tr>
            </template>
          </v-data-table-server>
        </v-card>
      </v-card>
    </v-dialog>

    <!--Create Agreement-->
    <v-dialog persistent v-model="agreementDialog" class="mt-2 pa-2">
      <v-card
        :style="`border: 2px solid ${BASE_COLOR}`"
        min-width="650"
        class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
        rounded="xl"
      >
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{ editAgreementDialog ? "Изменение" : "Добавление" }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex ga-3 align-center mt-2 me-4">
              <Icons
                v-if="createAccess('counterpartyAgreement') && !editAgreementDialog"
                @click="
                  editAgreementDialog
                    ? updateCpAgreement()
                    : createCpAgreement()
                "
                name="save"
              />
            </div>
            <v-btn
              @click="
                editAgreementDialog
                  ? checkUpdateAgreement()
                  : checkAndCloseAgreement()
              "
              variant="text"
              :size="32"
              class="pt-2 pl-1"
            >
              <Icons name="close" />
            </v-btn>
          </div>
        </div>
        <v-form
          class="d-flex w-100"
          :disabled="!updateAccess('counterpartyAgreement') && isEdit"
          @submit.prevent="createCpAgreement"
        >
          <v-row class="w-100">
            <v-col class="d-flex flex-column w-100">
              <div class="d-flex justify-space-between ga-6">
                <v-text-field
                  v-model="form.name"
                  :rules="[rules.required]"
                  :base-color="FIELD_COLOR"
                  :color="BASE_COLOR"
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Наименование"
                  label="Наименование"
                  lear-icon="close"
                  clear-icon="close"
                  clearable
                  hide-details
                />
                <span style="color: red; font-weight: bolder" class="mr-4 mt-1"
                  >2500,00</span
                >
              </div>
              <div class="d-flex justify-space-between ga-5 align-center my-3">
                <div
                  v-if="isDocumentEdit"
                  style="
                    border: 1.5px solid #cbc8c8;
                    border-radius: 4px;
                    padding: 6px 12px;
                    width: 110px;
                    height: 40px;
                  "
                >
                  <span>
                    {{ date }}
                  </span>
                </div>
                <!-- <v-text-field
                  v-model="form.date"
                  :rules="[rules.required]"
                  :base-color="FIELD_COLOR"
                  :color="BASE_COLOR"
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Дата создания"
                  label="Дата создания"
                  lear-icon="close"
                  type="date"
                  hide-details
                /> -->
                <v-autocomplete
                  :color="BASE_COLOR"
                  class="w-75"
                  variant="outlined"
                  label="Валюта"
                  v-model="form.currency_id"
                  :disabled="isCurrencyFieldDisabled"
                  :base-color="FIELD_COLOR"
                  :items="currencies"
                  item-title="name"
                  item-value="id"
                  clear-icon="close"
                  clearable
                  hide-details
                  :item-props="currencyProps"
                />
              </div>
              <v-autocomplete
                :color="BASE_COLOR"
                variant="outlined"
                label="Организация"
                v-model="form.organization_id"
                :disabled="isOrganizationFieldDisabled"
                :base-color="FIELD_COLOR"
                :items="organizations"
                item-title="name"
                item-value="id"
                clearable
                clear-icon="close"
                :item-props="organizationProps"
                hide-details
              />
              <div class="d-flex ga-4 my-3">
                <v-autocomplete
                  :color="BASE_COLOR"
                  class="w-50"
                  variant="outlined"
                  label="Контрагент"
                  v-model="form.counterparty_id"
                  :base-color="FIELD_COLOR"
                  :items="counterparties"
                  item-title="name"
                  item-value="id"
                  clearable
                  clear-icon="close"
                  hide-details
                  :item-props="counterpartyProps"
                />
                <v-autocomplete
                  :color="BASE_COLOR"
                  :item-props="price_typeProps"
                  v-model="form.price_type_id"
                  :disabled="isPriseTypesFieldDisabled"
                  :base-color="FIELD_COLOR"
                  :items="priceTypes"
                  variant="outlined"
                  item-title="name"
                  label="Вид цены"
                  item-value="id"
                  clearable
                  clear-icon="close"
                  hide-details
                  class="w-25"
                />
              </div>
              <v-text-field
                v-model="form.contact_person"
                :base-color="FIELD_COLOR"
                variant="outlined"
                :rules="isValid ? [rules.required] : []"
                label="Контактное лицо"
                density="compact"
                rounded="md"
                clear-icon="close"
                clearable
                :color="BASE_COLOR"
                hide-details
              />
              <v-container class="pa-0 mt-3">
                <v-textarea
                  v-model="form.comment"
                  variant="outlined"
                  :base-color="FIELD_COLOR"
                  :color="BASE_COLOR"
                  label="Комментарий"
                  clear-icon="close"
                  clearable
                  :rules="isValid ? [rules.required] : []"
                />
              </v-container>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-dialog>
    <div v-if="showModal">
      <ConfirmModal
        :showModal="true"
        @close="toggleModal()"
        @closeClear="closeDialogWithoutSaving()"
        @closeWithSaving="closingWithSaving()"
      />
    </div>
    <div v-if="showModalAgreement">
      <ConfirmModal
        :showModal="true"
        @close="toggleModalAgreement()"
        @closeClear="closeDialogWithoutSavingAgreement()"
        @closeWithSaving="closingWithSavingAgreement()"
      />
    </div>
  </div>
</template>
