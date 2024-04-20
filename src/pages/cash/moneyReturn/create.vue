<script setup>
import {
  BASE_COLOR,
  FIELD_COLOR,
} from "../../../composables/constant/colors.js";
import validate from "./validate.js";
import { useRouter } from "vue-router";
import pkoApi from "../../../api/documents/pko.js";
import { ref, reactive, onMounted, watch } from "vue";
import employeeApi from "../../../api/list/employee.js";
import Icons from "../../../composables/Icons/Icons.vue";
import showToast from "../../../composables/toast/index.js";
import counterpartyApi from "../../../api/list/counterparty.js";
import cashRegisterApi from "../../../api/list/cashRegister.js";
import organizationApi from "../../../api/list/organizations.js";
import currentDate from "../../../composables/date/currentDate.js";
import organizationBillApi from "../../../api/list/organizationBill.js";
import cpAgreementApi from "../../../api/list/counterpartyAgreement.js";
import { add, addMessage } from "../../../composables/constant/buttons.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";

const router = useRouter();

const author = ref("");

const typeOperations = ref([
  { id: 1, title: "Оплата от клиента" },
  { id: 2, title: "Снятие с Р/С" },
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
  incomeItem: null,
  balanceItem: null,
  cpAgreement: null,
  bankAccount: null,
  sender_cash: null,
  counterparty: null,
  organization: null,
  typeOperation: typeOperations.value[0].title,
});

const employees = ref([]);
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
    form.cpAgreement = null;
    cpAgreements.value = [];
    getCpAgreements(form.counterparty);
  }
);

const resetFields = () => {
  form.base = null;
  form.employee = null;
  form.incomeItem = null;
  form.balanceItem = null;
  form.cpAgreement = null;
  form.bankAccount = null;
  form.sender_cash = null;
  form.cpAgreement = null;
  form.organization = null;
  form.counterparty = null;
};

const firstAccess = async (paymentType) => {
  // if (
  //   validate(
  //     form.sum,
  //     form.base,
  //     form.date,
  //     form.organization,
  //     form.cash,
  //     form.counterparty,
  //     form.cpAgreement
  //   ) !== true
  // )
  //   return;
  try {
    let res;
    switch (paymentType) {
      case 1:
        const paymentFromClientBody = {
          date: form.date,
          organization_id: form.organization,
          cashRegister_id: form.cash,
          sum: form.sum,
          counterparty_id: form.counterparty,
          counterparty_agreement_id: form.cpAgreement,
          basis: form.base,
          comment: form.comment,
          type_operation: form.typeOperation,
          type: "PKO",
        };
        res = await pkoApi.paymentFromClient(paymentFromClientBody);
        break;
      case 2:
        const writeOffBody = {
          date: form.date,
          organization_id: form.organization,
          cashRegister_id: form.cash,
          sum: form.sum,
          organization_bill_id: form.bankAccount,
          basis: form.base,
          comment: form.comment,
          type_operation: form.typeOperation,
          type: "PKO",
        };
        res = await pkoApi.writeOff(writeOffBody);
        break;

      default:
        throw new Error("Unsupported payment type");
    }
    showToast(addMessage, "green");
    router.push("/moneyComing");
  } catch (e) {
    console.error(e);
  }
};

const secondAccess = () => {
  console.log(2);
};
const thirdAccess = () => {
  console.log(3);
};
const fourthAccess = () => {
  console.log(4);
};

const fifthAccess = () => {
  console.log(5);
};

const sixthAccess = () => {
  console.log(6);
};

const getAccess = () => {
  switch (form.typeOperation) {
    case "Оплата от клиента":
      firstAccess(1);
      break;
    case "Снятие с Р/С":
      firstAccess(2);
      break;
    case "Получение с другой кассы":
      thirdAccess();
      break;
    case "Вложение":
      firstAccess();
      break;
    case "Получение кредита":
      firstAccess();
      break;
    case "Возврат от поставщика":
      firstAccess();
      break;
    case "Возврат от подотчетника":
      fourthAccess();
      break;
    case "Прочие доходы":
      fifthAccess();
      break;
    case "Прочие приходы":
      sixthAccess();
      break;
  }
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
  console.log(data);
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
    const { data } = await cpAgreementApi.getById(id);
    cpAgreements.value = data.result.counterparty_id.counterpartyAgreement;
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
  form.date = currentDate();
  author.value = JSON.parse(localStorage.getItem("user")).name || null;
  await Promise.all([
    getEmployees(),
    getCashregisters(),
    getOrganizations(),
    getCounterparties(),
    getOrganizationBills(),
  ]);
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 ms-4">
          <span>РКО (создание)</span>
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
            :value="'Номер'"
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
          <custom-text-field label="Сумма" v-model="form.sum" />
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
                  :label="typeOperation.title"
                  :value="typeOperation.title"
                  @change="form.typeOperation = typeOperation.title"
                ></v-radio>
              </v-radio-group>
            </div>
          </div>
          <div class="d-flex flex-column ga-4">
            <div v-if="form.typeOperation === 'Снятие с Р/С'">
              <custom-autocomplete
                label="Банковский счет"
                :items="organizationBills"
                v-model="form.bankAccount"
              />
            </div>
            <div v-else-if="form.typeOperation === 'Получение с другой кассы'">
              <custom-autocomplete
                label="Касса отправителя"
                :items="organizations"
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
                :items="organizations"
                v-model="form.incomeItem"
              />
            </div>
            <div v-else-if="form.typeOperation === 'Прочие приходы'">
              <custom-autocomplete
                label="Статья баланса"
                :items="organizations"
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
