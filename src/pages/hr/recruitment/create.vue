<script setup>
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import Icons from "../../../composables/Icons/Icons.vue";
import {
  BASE_COLOR,
  FIELD_COLOR,
  TITLE_COLOR
} from "../../../composables/constant/colors.js";
import { defineEmits, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import organizationApi from "../../../api/list/organizations.js";
import employee from "../../../api/list/employee.js";
import currentDate from "../../../composables/date/currentDate.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import recruitment from "../../../api/hr/recruitment.js";
import changeTheDateForSending from "../../../composables/date/changeTheDateForSending.js";
import { useRouter } from "vue-router";
import { addMessage } from "../../../composables/constant/buttons.js";
import validate from "../../../composables/validate/validate.js";
import currentDateWithTime from "../../../composables/date/currentDateWithTime.js";
import showToast from "../../../composables/toast/index.js";
import schedule from "../../../api/list/schedule.js";
import department from "../../../api/list/department.js";
import position from "../../../api/list/position.js";
import { useConfirmDocumentStore } from "../../../store/confirmDocument.js";
import Button from "../../../components/button/button.vue";

const router = useRouter();
const emits = defineEmits(["changed"]);
const confirmDocument = useConfirmDocumentStore();

const form = reactive({
  date: null,
  dateOfReceipt: null,
  organization: null,
  position: null,
  department: null,
  employee: null,
  salary: null,
  schedule: null,
  basis: null,
  comment: null,
  author: null,
});

const organizations = ref([]);
const employees = ref([]);
const positions = ref([]);
const departments = ref([]);
const schedules = ref([]);

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

const getPositions = async () => {
  const { data } = await position.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  positions.value = data.result.data;
};

const getDepartments = async () => {
  const { data } = await department.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  departments.value = data.result.data;
};

const getSchedules = async () => {
  const { data } = await schedule.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  schedules.value = data.result.data;
};

const addRecruitment = async () => {
  const validateValue = [
    {
      Дата: form.date,
    },
    {
      Организация: form.organization,
    },
    {
      Сотрудник: form.employee,
    },
    {
      Оклад: form.salary,
    },
    {
      "Дата приёма": form.dateOfReceipt,
    },
    {
      Должность: form.position,
    },
    {
      Отдел: form.department,
    },
    {
      Основание: form.basis,
    },
  ];

  if (validate(validateValue) !== true) return;

  const body = {
    date: formatDateTime(form.date),
    organization_id:
      typeof form.organization === "object"
        ? form.organization.id
        : form.organization,
    basis: form.basis,
    department_id: form.department,
    position_id: form.position,
    employee_id: form.employee,
    salary: Number(form.salary),
    schedule_id: form.schedule,
    hiring_date: formatDateTime(form.date),
    comment: form.comment,
  };

  try {
    const res = await recruitment.add(body);
    if (res.status === 201) {
      showToast(addMessage);
      window.open(`/hr/recruitment/${res.data.result.id}`, "_blank");
    }
  } catch (e) {
    console.log(e);
  }

  console.log(body);
};

const isChanged = () => {
  const {
    employee,
    salary,
    dateOfReceipt,
    date,
    position,
    department,
    schedule,
    basis,
    comment,
  } = form;

  const valuesToCheck = [
    employee,
    salary,
    dateOfReceipt,
    date,
    position,
    department,
    schedule,
    basis,
    comment,
  ];
  return valuesToCheck.every(
    (val) => val === null || val === "" || val === currentDate() || val === "1"
  );
};

watch(form, () => {
  console.log(!isChanged());
  if (!isChanged()) {
    emits("changed", true);
  } else {
    emits("changed", false);
  }
});

watch(confirmDocument, () => {
  if (confirmDocument.isUpdateOrCreateDocument) {
    addRecruitment();
  }
});

onUnmounted(() => {
  emits("changed", false);
});

onMounted(() => {
  form.date = form.dateOfReceipt = currentDateWithTime();
  form.organization =
    JSON.parse(localStorage.getItem("user")).organization || null;
  form.author = JSON.parse(localStorage.getItem("user")).name || null;

  getOrganizations();
  getEmployees();
  getPositions();
  getDepartments();
  getSchedules();
});
</script>

<template>
  <div class="document">
      <div class="d-flex justify-space-between documentCalcWidth">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">Приём на работу (создание)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3 py-2">
              <Button @click="addRecruitment" name="save1" />
              <Button
                @click="router.push('/hr/recruitment')"
                name="close"
              />
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
          <custom-text-field label="Оклад" v-model="form.salary" />
          <custom-text-field
            label="Дата приёма"
            type="datetime-local"
            class="date"
            v-model="form.dateOfReceipt"
          />
          <custom-autocomplete
            label="Должность"
            :items="positions"
            v-model="form.position"
          />
          <custom-autocomplete
            label="Отдел"
            :items="departments"
            v-model="form.department"
          />
          <custom-autocomplete
            label="График работы"
            :items="schedules"
            v-model="form.schedule"
          />
        </div>
        <v-textarea
          label="Основание"
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
