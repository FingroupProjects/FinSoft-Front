<script setup>
import {
  BASE_COLOR,
  FIELD_COLOR,
} from "../../../composables/constant/colors.js";
import validate from "./validate.js";
import { useRoute, useRouter } from "vue-router";
import bankApi from "../../../api/documents/bank.js";
import { ref, reactive, onMounted, watch } from "vue";
import employeeApi from "../../../api/list/employee.js";
import Icons from "../../../composables/Icons/Icons.vue";
import showToast from "../../../composables/toast/index.js";
import incomeItemApi from "../../../api/list/incomeItem.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import cashRegisterApi from "../../../api/list/cashRegister.js";
import organizationApi from "../../../api/list/organizations.js";
import currentDate from "../../../composables/date/currentDate.js";
import organizationBillApi from "../../../api/list/organizationBill.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import { add, addMessage } from "../../../composables/constant/buttons.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import showDate from "../../../composables/date/showDate.js";

const route = useRoute();
const router = useRouter();

const author = ref("");

const id = ref(null);

const typeOperations = ref([]);

const form = reactive({
  sum: null,
  user: null,
  base: null,
  date: null,
  cash: null,
  comment: null,
  employee: null,
  incomeItem: null,
  doc_number: "Номер",
  balanceItem: null,
  cpAgreement: null,
  sender_cash: null,
  counterparty: null,
  organization: null,
  organization_bill: null,
  typeOperation: null,
});

const employees = ref([]);
const incomeItems = ref([]);
const cpAgreements = ref([]);
const cashRegisters = ref([]);
const organizations = ref([]);
const counterparties = ref([]);
const organizationBills = ref([]);

watch(
  () => form.typeOperation,
  (newValue) => {
    resetFields();
  }
);

watch(
  () => form.counterparty,
  (newValue) => {
    if (form.counterparty === null) return;
    form.cpAgreement = null;
    cpAgreements.value = [];
    getCpAgreements(
      typeof form.counterparty === "object"
        ? form.counterparty.id
        : form.counterparty
    );
  }
);

const resetFields = () => {
  form.employee = null;
  form.incomeItem = null;
  form.balanceItem = null;
  form.cpAgreement = null;
  form.organization_bill = null;
  form.sender_cash = null;
  form.cpAgreement = null;
  form.counterparty = null;
};

const getTypes = async () => {
  try {
    const {
      data: { result },
    } = await bankApi.getTypes("PKO");
    typeOperations.value = result;
  } catch (e) {
    console.error(e);
  }
};

const getBangComing = async () => {
  try {
    const {
      data: { result },
    } = await bankApi.getById(route.params.id);
    form.typeOperation = result.operationType;
    (form.sum = result.sum), (author.value = result.author.name);
    (form.base = result.basis),
      (form.doc_number = result.doc_number),
      (form.date = showDate(result.created_at, "-", true)),
      (form.cash = result.cashRegister),
      (form.comment = result.comment),
      (form.employee = result.employee),
      (form.incomeItem = result.incomeItem),
      (form.balanceItem = result.balanceItem),
      (form.counterparty = result.counterparty),
      (form.sender_cash = result.sender_cash),
      (form.organization = result.organization),
      (form.organization_bill = result.organization_bill),
      setTimeout(() => {
        form.cpAgreement = result.counterpartyAgreement;
      });
  } catch (e) {
    console.error(e);
  }
};

const firstAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    counterparty_id:
      typeof form.counterparty === "object"
        ? form.counterparty.id
        : form.counterparty,
    counterparty_agreement_id:
      typeof form.cpAgreement === "object"
        ? form.cpAgreement.id
        : form.cpAgreement,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updatePaymentFromClient(id.value, body);
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const secondAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.organization_bill, "Банковский счет") !== true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    organization_bill_id:
      typeof form.organization_bill === "object"
        ? form.organization_bill.id
        : form.organization_bill,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateWriteOff(id.value, body);
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};
const thirdAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.sender_cash, "Касса отправителя") !== true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    sender_cash_register_id:
      typeof form.sender_cash === "object"
        ? form.sender_cash.id
        : form.sender_cash,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateAnotherCashRegister(
      id.value,
      body
    );
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};
const fourthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    counterparty_id:
      typeof form.counterparty === "object"
        ? form.counterparty.id
        : form.counterparty,
    counterparty_agreement_id:
      typeof form.cpAgreement === "object"
        ? form.cpAgreement.id
        : form.cpAgreement,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateInvestment(id.value, body);
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const fifthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    counterparty_id:
      typeof form.counterparty === "object"
        ? form.counterparty.id
        : form.counterparty,
    counterparty_agreement_id:
      typeof form.cpAgreement === "object"
        ? form.cpAgreement.id
        : form.cpAgreement,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateCreditReceive(id.value, body);
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const sixthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    counterparty_id:
      typeof form.counterparty === "object"
        ? form.counterparty.id
        : form.counterparty,
    counterparty_agreement_id:
      typeof form.cpAgreement === "object"
        ? form.cpAgreement.id
        : form.cpAgreement,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateProviderRefund(id.value, body);
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const seventhAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.employee, "Сотрудник") !== true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    employee_id:
      typeof form.employee === "object" ? form.employee.id : form.employee,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateAccountablePersonRefund(
      id.value,
      body
    );
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const eighthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.incomeItem, "Статья дохода") !== true
  ) {
    return;
  }
  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    balance_article_id:
      typeof form.incomeItem === "object"
        ? form.incomeItem.id
        : form.incomeItem,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateOtherExpenses(id.value, body);
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const ninthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash) ||
    isValid(form.balanceItem, "Статья баланса") !== true
  ) {
    return;
  }

  const body = {
    date: form.date,
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    cash_register_id: typeof form.cash === "object" ? form.cash.id : form.cash,
    sum: form.sum,
    balance_article_id:
      typeof form.balanceItem === "object"
        ? form.balanceItem.id
        : form.balanceItem,
    basis: form.base,
    comment: form.comment,
    type: "PKO",
  };
  try {
    const res = await bankApi.updateOtherIncomes(id.value, body);
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const getAccess = () => {
  switch (form.typeOperation) {
    case "Оплата от клиента":
      firstAccess();
      break;
    case "Снятие с P/C":
      secondAccess();
      break;
    case "Получение с другой кассы":
      thirdAccess();
      break;
    case "Вложение":
      fourthAccess();
      break;
    case "Получение кредита":
      fifthAccess();
      break;
    case "Возврат от поставщика":
      sixthAccess();
      break;
    case "Возврат от подотчетника":
      seventhAccess();
      break;
    case "Прочие доходы":
      eighthAccess();
      break;
    case "Прочие приходы":
      ninthAccess();
      break;
  }
};

const isValid = (
  firstField,
  firstFieldName,
  secondField = undefined,
  secondFieldName
) => {
  if (!firstField) {
    showToast(`Поле ${firstFieldName} не может быть пустым`, "warning");
    return false;
  }
  if (secondField !== undefined && !secondField) {
    showToast(`Поле ${secondFieldName} не может быть пустым`, "warning");
    return false;
  }
  return true;
};

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const getOrganizationBills = async () => {
  const { data } = await organizationBillApi.getAll({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizationBills.value = data.result.data;
};

const getCashregisters = async () => {
  const { data } = await cashRegisterApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  cashRegisters.value = data.result.data;
};

const getCounterparties = async () => {
  const { data } = await counterpartyApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  counterparties.value = data.result.data;
};

const getCpAgreements = async (id) => {
  try {
    const { data } = await cpAgreementApi.getCounterpartyById(id);
    cpAgreements.value = data.result.counterparty_id.counterpartyAgreement;
  } catch (e) {}
};

const getIncomeItems = async () => {
  try {
    const { data } = await incomeItemApi.get({
      page: 1,
      itemsPerPage: 100000,
      sortBy: "name",
    });
    incomeItems.value = data.result.data;
  } catch (e) {}
};

const getEmployees = async () => {
  const { data } = await employeeApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  employees.value = data.result.data;
};

onMounted(async () => {
  id.value = route.params.id;
  await Promise.all([
    getTypes(),
    getBangComing(),
    getEmployees(),
    getIncomeItems(),
    getCashregisters(),
    getOrganizations(),
    getCounterparties(),
    getOrganizationBills(),
  ]);
});

function validateNumberInput(event) {
  let inputValue = event.target.value;
  inputValue = inputValue.replace(/[^0-9.]/g, "");
  form.sum = inputValue;
}
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 ms-4">
          <span>БАНК ПРИХОД (изменение)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="getAccess" name="add" />
              <Icons title="Скопировать" name="copy" />
              <Icons title="Удалить" name="delete" />
            </div>
          </div>
        </v-card>
      </div>
    </v-col>
    <v-divider />
    <v-divider />
    <div style="background: #fff">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4 mb-2">
          <custom-text-field
            readonly
            :value="form.doc_number"
            min-width="140"
            max-width="110"
          />
          <v-text-field
            type="date"
            rounded="lg"
            hide-details
            label="Дата"
            density="compact"
            v-model="form.date"
            :color="BASE_COLOR"
            clear-icon="close"
            variant="outlined"
            class="text-sm-body-1"
            style="max-width: 145px; max-height: 40px !important"
            :base-color="FIELD_COLOR"
          />
          <custom-autocomplete
            label="Организация"
            :items="organizations"
            v-model="form.organization"
          />
          <custom-autocomplete
            label="Касса"
            :items="cashRegisters"
            v-model="form.cash"
          />
          <custom-text-field
            label="Сумма"
            @input="validateNumberInput"
            v-model="form.sum"
          />
        </div>

        <div class="d-flex ga-6">
          <div
            style="
              width: 250px;
              height: 420px;
              border: 1px solid rgba(39, 77, 135, 0.45);
              border-radius: 4px;
              box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
              padding: 8px;
            "
          >
            <span>Тип операции: </span>
            <div>
              <v-radio-group v-model="form.typeOperation">
                <v-radio
                  class="text-black"
                  v-for="typeOperation in typeOperations"
                  :color="BASE_COLOR"
                  :key="typeOperation.id"
                  :label="typeOperation.title_ru"
                  :value="typeOperation.title_ru"
                ></v-radio>
              </v-radio-group>
            </div>
          </div>
          <div class="d-flex flex-column ga-4">
            <div v-if="form.typeOperation === 'Снятие с P/C'">
              <custom-autocomplete
                label="Банковский счет"
                :items="organizationBills"
                v-model="form.organization_bill"
              />
            </div>
            <div v-else-if="form.typeOperation === 'Получение с другой кассы'">
              <custom-autocomplete
                label="Касса отправителя"
                :items="cashRegisters"
                v-model="form.sender_cash"
              />
            </div>
            <div v-else-if="form.typeOperation === 'Возврат от подотчетника'">
              <custom-autocomplete
                label="Сотрудник"
                :items="employees"
                v-model="form.employee"
              />
            </div>
            <div v-else-if="form.typeOperation === 'Прочие доходы'">
              <custom-autocomplete
                label="Статья дохода"
                :items="incomeItems"
                v-model="form.incomeItem"
              />
            </div>
            <div v-else-if="form.typeOperation === 'Прочие приходы'">
              <custom-autocomplete
                label="Статья баланса"
                :items="incomeItems"
                v-model="form.balanceItem"
              />
            </div>
            <div v-else class="d-flex flex-column ga-4">
              <custom-autocomplete
                label="Контрагент"
                :items="counterparties"
                v-model="form.counterparty"
              />
              <custom-autocomplete
                :disabled="form.counterparty !== null ? false : true"
                label="Договор"
                :items="cpAgreements"
                v-model="form.cpAgreement"
              />
            </div>

            <v-container fluid>
              <v-textarea
                style="width: 450px"
                :base-color="FIELD_COLOR"
                v-model="form.base"
                :color="BASE_COLOR"
                variant="outlined"
                label="Основание"
                rounded="lg"
              ></v-textarea>
            </v-container>
          </div>
        </div>

        <div class="d-flex justify-space-between w-100 my-4">
          <div class="d-flex ga-10">
            <custom-text-field
              readonly
              :value="author"
              min-width="140"
              max-width="110"
            />
            <custom-text-field
              label="Комментарий"
              v-model="form.comment"
              min-width="310"
            />
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style></style>
