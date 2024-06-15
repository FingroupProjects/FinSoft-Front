<script setup>
import {BASE_COLOR, FIELD_COLOR, TITLE_COLOR,} from "../../../composables/constant/colors.js";
import {useRoute, useRouter} from "vue-router";
import validate from "./validate.js";
import {onMounted, reactive, ref, watch} from "vue";
import employeeApi from "../../../api/list/employee.js";
import showToast from "../../../composables/toast/index.js";
import incomeItemApi from "../../../api/list/incomeItem.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import cashRegisterApi from "../../../api/list/cashRegister.js";
import organizationApi from "../../../api/list/organizations.js";
import clientPaymentApi from "../../../api/documents/cashRegister.js";
import organizationBillApi from "../../../api/list/organizationBill.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import {addMessage, editMessage} from "../../../composables/constant/buttons.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import Button from "../../../components/button/button.vue";
import validateNumberInput from "../../../composables/mask/validateNumberInput.js";
import formatInputPrice from "../../../composables/format/formatInputPrice.js";
import monthApi from "../../../api/list/schedule.js";

const route = useRoute();
const router = useRouter();

const author = ref("");

const id = ref(null);

const typeOperations = ref([
  { id: 1, title: "Оплата от клиента" },
  { id: 2, title: "Снятие с P/C" },
  { id: 3, title: "Получение с другой кассы" },
  { id: 4, title: "Вложение" },
  { id: 5, title: "Получение кредита" },
  { id: 6, title: "Возврат от поставщика" },
  { id: 7, title: "Возврат от подотчетника" },
  { id: 8, title: "Прочие доходы" },
  { id: 9, title: "Прочие приходы" },
]);

const form = reactive({
  sum: null,
  user: null,
  base: null,
  date: null,
  cash: null,
  comment: null,
  employee: null,
  months_id: null,
  incomeItem: null,
  doc_number: "Номер",
  balanceItem: null,
  cpAgreement: null,
  sender_cash: null,
  counterparty: null,
  organization: null,
  organization_bill: null,
  typeOperation: null,
  recipient: null,
});

const months = ref([]);
const employees = ref([]);
const incomeItems = ref([]);
const cpAgreements = ref([]);
const cashRegisters = ref([]);
const organizations = ref([]);
const counterparties = ref([]);
const organizationBills = ref([]);

watch(
  () => form.typeOperation,
  (newValue, oldValue) => {
    if (oldValue === null) return;
    resetFields();
  }
);

watch(
  () => form.counterparty,
  () => {
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
    } = await clientPaymentApi.getTypes("RKO");
    typeOperations.value = result;
  } catch (e) {
    console.error(e);
  }
};
const getSellingGoods = async () => {
  try {
    const {
      data: { result },
    } = await clientPaymentApi.getById(route.params.id);
    console.log(result)
    form.typeOperation = result.operationType.id;
    (form.sum = result.sum), (author.value = result.author.name);
    (form.base = result.basis),
      (form.doc_number = result.doc_number),
      (form.date = formatDateTime(result.created_at, "-", true)),
      (form.cash = result.cashRegister),
      (form.comment = result.comment),
      (form.employee = result.employee),
      (form.incomeItem = result.incomeItem),
      (form.balanceItem = result.balanceItem),
      (form.sender_cash = result.senderCashRegister),
      (form.organization = result.organization),
      (form.organization_bill = result.organization_bill),
      form.recipient = result.sender_text
      form.months_id = result.month
      setTimeout(() => {
        (form.counterparty = result.counterparty)
      });
      setTimeout(() => {
        form.cpAgreement = result.counterpartyAgreement;
      });
  } catch (e) {
    console.error(e);
  }
};

const firstAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updatePaymentFromClient(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const secondAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.organization_bill, "Банковский счет") !== true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateWriteOff(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};
const thirdAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.sender_cash, "Касса отправителя") !== true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateAnotherCashRegister(
      id.value,
      body
    );
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};
const fourthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateInvestment(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const fifthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateCreditReceive(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const sixthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.counterparty, "Контрагент", form.cpAgreement, "Договор") !==
      true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateProviderRefund(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const seventhAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.employee, "Сотрудник") !== true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateAccountablePersonRefund(
      id.value,
      body
    );
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const eighthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.incomeItem, "Статья дохода") !== true
  ) {
    return;
  }
  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateOtherExpenses(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const ninthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.balanceItem, "Статья баланса") !== true
  ) {
    return;
  }

  const body = {
    date: formatDateTime(form.date),
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
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    const res = await clientPaymentApi.updateOtherIncomes(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const tenthAccess = async () => {
  if (
    !validate(form.sum, form.base, form.date, form.organization, form.cash, form.recipient) ||
    isValid(form.employee, "Сотрудник", form.months_id, "Месяц") !== true
  ) {
    return;
  }

  const body = {
    date: formatDateTime(form.date),
    organization_id: form.organization,
    cash_register_id: form.cash,
    sum: form.sum,
    employee_id: form.employee,
    month_id: form.months_id,
    basis: form.base,
    comment: form.comment,
    operation_type_id: form.typeOperation,
    type: "RKO",
    recipient: form.recipient,
  };
  try {
    await clientPaymentApi.updateSalaryPayment(id.value, body);
    showToast(editMessage);
  } catch (e) {
    console.error(e);
  }
};

const getAccess = () => {
  switch (form.typeOperation) {
    case 10:
      firstAccess();
      break;
    case 11:
      secondAccess();
      break;
    case 12:
      thirdAccess();
      break;
    case 13:
      fourthAccess();
      break;
    case 14:
      fifthAccess();
      break;
    case 15:
      sixthAccess();
      break;
    case 16:
      seventhAccess();
      break;
    case 17:
      eighthAccess();
      break;
    case 18:
      ninthAccess();
      break;
    case 19:
      tenthAccess();
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
    cpAgreements.value = data.result.data;
    if (cpAgreements.value.length === 1) {
      form.cpAgreement = cpAgreements.value[0];
    }
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

const getMonths = async () => {
  try {
    const { data } = await monthApi.month();
    months.value = data.result.data;
  } catch (e) {
    console.error(e);
  }
}

const closeWindow = () => {
  window.close()
}

const selectTypeOperation = item => {
  form.typeOperation = item.id;
}

onMounted(async () => {
  id.value = route.params.id;
  
  await Promise.all([
    getTypes(),
    getEmployees(),
    getIncomeItems(),
    getMonths(),
    getCashregisters(),
    getOrganizations(),
    getCounterparties(),
    getOrganizationBills(),
    getSellingGoods(),
  ]);
});
</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between ">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          РКО (изменение)
        </span>
      </div>
      <v-card variant="text" class="d-flex align-center ga-2 py-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3">
            <Button @click="getAccess" name="save1" />
            <Button @click="closeWindow" name="close" />
          </div>
        </div>
      </v-card>
    </div>
    <v-divider />
    <div class="documentHeight documentCalcWidthPKO">
      <v-col class="d-flex flex-column ga-2 pb-0 ">
        <div class="d-flex flex-wrap ga-4 mb-2">
          <custom-text-field
              readonly
              :value="'Номер'"
              min-width="140"
              max-width="110"
          />
          <custom-text-field
              type="datetime-local"
              rounded="lg"
              hide-details
              label="Дата"
              density="compact"
              v-model="form.date"
              :color="BASE_COLOR"
              clear-icon="close"
              variant="outlined"
              class="text-sm-body-1 date"
              style="max-width: 220px; max-height: 40px !important"
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
              :value="validateNumberInput(form.sum)"
              @input="formatInputPrice(form.sum, $event)"
              v-model="form.sum"
          />
          <custom-text-field
              label="Отправитель"
              v-model="form.recipient"
          />
        </div>
        <div class="d-flex ga-6">
          <div
              style="
              width: 300px;
              height: 420px;
              border-radius: 4px;
            "
          >
            <div>
              <v-radio-group  v-model="form.typeOperation">
                <v-radio
                    style="margin: 3px 0;"
                    v-for="typeOperation in typeOperations"
                    @click="selectTypeOperation(typeOperation)"
                    :class="['title-item', {'active_type': form.typeOperation === typeOperation.id}]"
                    color="#fff"
                    :key="typeOperation.id"
                    :label="typeOperation.title_ru"
                    :value="typeOperation.id"
                ></v-radio>
              </v-radio-group>
            </div>
          </div>
          <div class="d-flex flex-column ga-4 mt-1">
            <div v-if="form.typeOperation === 11">
              <custom-autocomplete
                  label="Банковский счет"
                  :items="organizationBills"
                  v-model="form.organization_bill"
              />
            </div>
            <div v-else-if="form.typeOperation === 12">
              <custom-autocomplete
                  label="Касса отправителя"
                  :items="cashRegisters"
                  v-model="form.sender_cash"
              />
            </div>
            <div v-else-if="form.typeOperation === 16">
              <custom-autocomplete
                  label="Сотрудник"
                  :items="employees"
                  v-model="form.employee"
              />
            </div>
            <div v-else-if="form.typeOperation === 17">
              <custom-autocomplete
                  label="Статья дохода"
                  :items="incomeItems"
                  v-model="form.incomeItem"
              />
            </div>
            <div v-else-if="form.typeOperation === 18">
              <custom-autocomplete
                  label="Статья баланса"
                  :items="incomeItems"
                  v-model="form.balanceItem"
              />
            </div>
            <div
                v-else-if="form.typeOperation === 19"
                class="d-flex flex-column ga-4"
            >
              <custom-autocomplete
                  label="Сотрудник"
                  :items="employees"
                  v-model="form.employee"
              />
              <custom-autocomplete
                  label="Месяц"
                  :items="months"
                  v-model="form.months_id"
              />
            </div>
            <div v-else class="d-flex flex-column ga-4">
              <custom-autocomplete
                  label="Контрагент"
                  :items="counterparties"
                  v-model="form.counterparty"
              />
              <custom-autocomplete
                  :disabled="form.counterparty === null"
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

        <div class="d-flex justify-space-between w-100" style="margin-top: 100px">
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

<style scoped>
.title-item {
  padding: 3px 16px;
  background: rgb(82, 78, 216, 0.7);
  color: #e4e1e1;
  width: 100%;
  border-radius: 18px;
  cursor: pointer;
}

.title-item:hover {
  transition: .3s;
  background: rgb(82, 78, 216, 0.8);
}

.active_type {
  background: rgb(82, 78, 216, 1);
}
</style>

