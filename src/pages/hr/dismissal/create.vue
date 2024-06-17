<script setup>
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import {
  BASE_COLOR,
  FIELD_COLOR,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import { onMounted, onUnmounted, reactive, ref, watch } from "vue";
import organizationApi from "../../../api/list/organizations.js";
import employee from "../../../api/list/employee.js";
import currentDate from "../../../composables/date/currentDate.js";
import dismissal from "../../../api/hr/dismissal.js";
import changeTheDateForSending from "../../../composables/date/changeTheDateForSending.js";
import currentDateWithTime from "../../../composables/date/currentDateWithTime.js";
import showDate from "../../../composables/date/showDate.js";
import { addMessage } from "../../../composables/constant/buttons.js";
import { useRouter } from "vue-router";
import validate from "../../../composables/validate/validate.js";
import { useConfirmDocumentStore } from "../../../store/confirmDocument.js";
import Button from "../../../components/button/button.vue";

const router = useRouter();
const emits = defineEmits(["changed"]);
const confirmDocument = useConfirmDocumentStore();

const form = reactive({
  date: null,
  dateOfDismissal: null,
  organization: null,
  employee: null,
  basis: null,
  comment: null,
  author: null,
});

const organizations = ref([]);
const employees = ref([]);

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const getEmployees = async () => {
  const { data } = await employee.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  employees.value = data.result.data;
};

const addDismissal = async () => {
  const validateValue = [
    {
      Дата: form.date,
    },
    {
      "Дата увольнения": form.dateOfDismissal,
    },
    {
      Организация: form.organization,
    },
    {
      Сотрудник: form.employee,
    },
    {
      Основание: form.basis,
    },
  ];

  if (validate(validateValue) !== true) return;

  try {
    const body = {
      date: changeTheDateForSending(form.date, "-"),
      firing_date: changeTheDateForSending(form.dateOfDismissal, "-"),
      organization_id:
        typeof form.organization === "object"
          ? form.organization.id
          : form.organization,
      basis: form.basis,
      employee_id: form.employee,
      comment: form.comment,
    };
    const res = await dismissal.add(body);
    if (res.status === 201) {
      showDate(addMessage);
      router.push("/hr/dismissal");
    }
  } catch (e) {
    console.log(e);
  }
};

const isChanged = () => {
  const { employee, dateOfDismissal, date, basis, comment } = form;

  const valuesToCheck = [employee, dateOfDismissal, date, basis, comment];
  return valuesToCheck.every(
    (val) => val === null || val === "" || val === currentDate() || val === "1"
  );
};

watch(form, () => {
  if (!isChanged()) {
    emits("changed", true);
  } else {
    emits("changed", false);
  }
});

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    addDismissal();
  }
});

onUnmounted(() => {
  emits("changed", false);
});

onMounted(() => {
  form.date = form.dateOfDismissal = currentDateWithTime();
  form.organization =
    JSON.parse(localStorage.getItem("user")).organization || null;
  form.author = JSON.parse(localStorage.getItem("user")).name || null;

  getOrganizations();
  getEmployees();
});
</script>

<template>
  <div class="document">
    <div class="d-flex justify-space-between documentCalcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"
          >Увольнение кадра (создание)</span
        >
      </div>
      <v-card variant="text" class="d-flex align-center ga-2">
        <div class="d-flex w-100">
          <div class="d-flex ga-2 mt-1 me-3 py-2">
            <Button @click="addDismissal" name="save1" />
            <Button @click="router.push('/hr/dismissal')" name="close" />
          </div>
        </div>
      </v-card>
    </div>
    <v-divider />
    <div style="height: 82.4vh; background: #fff">
      <v-col style="height: 72vh" class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field disabled value="Номер" />
          <custom-text-field
            label="Дата"
            type="datetime-local"
            class="date"
            v-model="form.date"
          />
          <custom-autocomplete
            label="Организация"
            :items="organizations"
            v-model="form.organization"
          />
          <custom-autocomplete
            label="Сотрудник"
            :items="employees"
            v-model="form.employee"
          />
          <custom-text-field
            label="Дата увольнение"
            type="datetime-local"
            class="date"
            v-model="form.dateOfDismissal"
          />
        </div>
        <v-textarea
          label="Описание"
          :color="BASE_COLOR"
          :base-color="FIELD_COLOR"
          v-model="form.basis"
          hide-details
          rounded="lg"
          variant="outlined"
          class="w-auto text-sm-body-1"
          density="compact"
        />
      </v-col>
      <v-col class="d-flex ga-2">
        <custom-text-field :value="form.author" readonly />
        <custom-text-field
          label="Комментарий"
          v-model="form.comment"
          min-width="500"
          max-width="200"
        />
      </v-col>
    </div>
  </div>
</template>

<style scoped></style>
