<script setup>
import { ref, reactive, onMounted } from "vue";
import usersApi from "../../../api/list/user.js";
import organizationApi from "../../../api/list/organizations.js";
import {
  BASE_COLOR,
  FIELD_COLOR,
} from "../../../composables/constant/colors.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";

const author = ref("");

const typeOperations = ref([
  "Оплата от клиента",
  "Списание",
  "Получение с другой кассы",
  "Вложение",
  "Получение кредита",
  "Возврат от подотчетника",
  "Возврат от поставщика",
  "Прочие доходы",
  "Прочие приходы",
]);

const form = reactive({
  sum: null,
  user: null,
  date: null,
  number: null,
  comment: null,
  storage: null,
  organization: null,
  typeOperation: typeOperations.value[0],
});

const organizations = ref([]);
const users = ref([]);

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  organizations.value = data.result.data;
};

const getUsers = async () => {
  const { data } = await usersApi.get({
    page: 1,
    itemsPerPage: 100000,
    sortBy: "name",
  });
  users.value = data.result.data;
};

onMounted(async () => {
  author.value = JSON.parse(localStorage.getItem("user")).name || null;
  await getOrganizations();
  await getUsers();
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex flex-column justify-space-between text-uppercase mb-3">
        <div class="d-flex align-center ga-2 ms-4">
          <span>ПКО (создание)</span>
        </div>
      </div>
    </v-col>
    <v-divider />
    <v-divider />
    <div style="background: #fff">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4 mb-2">
          <v-text-field
            rounded="lg"
            hide-details
            label="Номер"
            density="compact"
            clear-icon="close"
            variant="outlined"
            :color="BASE_COLOR"
            v-model="form.number"
            style="max-width: 170px; max-height: 40px !important"
            :base-color="FIELD_COLOR"
            class="w-auto text-sm-body-1"
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
            style="max-width: 170px; max-height: 40px !important"
            :base-color="FIELD_COLOR"
          />
          <custom-autocomplete
            label="Организация"
            :items="organizations"
            v-model="form.organization"
          />
          <custom-autocomplete
            label="Касса"
            :items="users"
            v-model="form.user"
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
                  :key="typeOperation"
                  :label="typeOperation"
                  :value="typeOperation"
                  @change="form.typeOperation = typeOperation"
                ></v-radio>
              </v-radio-group>
            </div>
          </div>
          <div
            v-if="form.typeOperation === 'Оплата от клиента'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Контрагент"
              :items="organizations"
              v-model="form.organization"
            />
            <custom-autocomplete
              label="Договор"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Списание'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Банковский счет"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Получение с другой кассы'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Касса отправителя"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Вложение'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Контрагент"
              :items="organizations"
              v-model="form.organization"
            />
            <custom-autocomplete
              label="Договор"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Получение кредита'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Контрагент"
              :items="organizations"
              v-model="form.organization"
            />
            <custom-autocomplete
              label="Договор"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Возврат от подотчетника'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Контрагент"
              :items="organizations"
              v-model="form.organization"
            />
            <custom-autocomplete
              label="Договор"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Возврат от поставщика'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Контрагент"
              :items="organizations"
              v-model="form.organization"
            />
            <custom-autocomplete
              label="Договор"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Прочие доходы'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Контрагент"
              :items="organizations"
              v-model="form.organization"
            />
            <custom-autocomplete
              label="Договор"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
          </div>
          <div
            v-if="form.typeOperation === 'Прочие приходы'"
            class="d-flex flex-column ga-4"
          >
            <custom-autocomplete
              label="Контрагент"
              :items="organizations"
              v-model="form.organization"
            />
            <custom-autocomplete
              label="Договор"
              :items="organizations"
              v-model="form.organization"
            />
            <v-textarea
              variant="outlined"
              :base-color="FIELD_COLOR"
              label="Комментарий"
              v-model="form.comment"
              density="compact"
              rounded="md"
              :color="BASE_COLOR"
              hide-details
              :append-inner-icon="form.comment ? 'close' : ''"
              @click:append-inner="form.comment = null"
            />
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
