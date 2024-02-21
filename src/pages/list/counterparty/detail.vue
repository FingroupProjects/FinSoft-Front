<script setup>
import { ref, onMounted } from "vue";
import counterpartyApi from "../../../api/counterparty";
import { useRoute, useRouter } from "vue-router";
import showToast from "../../../composables/toast";
import counterpartyAgreement from "../../../api/counterpartyAgreement";

const router = useRouter();
const route = useRoute();

const dataCounterpartyAgreement = ref([]);
const paginations = ref([]);
const headers = ref([
  { title: "№", key: "id", align: "start" },
  { title: "Наименование", key: "name" },
  { title: "Контактное лицо", key: "contact_person" },
  { title: "Номер контракта", key: "contract_number" },
  { title: "Дата", key: "date" },
  { title: "Комментарий", key: "comment" },
  { title: "Контрагент", key: "counterparty_id.name" },
  { title: "Валюта договора", key: "currency_id.symbol_code" },
  { title: "Организация", key: "organization_id.name" },
  { title: "Валюта оплаты", key: "payment_id.symbol_code" },
  { title: "Тип валюты", key: "price_type_id.name" },
]);

const form = ref({
  address: "",
  created_at: "",
  email: "",
  id: null,
  name: "",
  phone: "",
  roles: [],
});

const a = ref(false);
const b = ref(false);
const c = ref(false);

const getId = async () => {
  try {
    const { data } = await counterpartyApi.getById(route.params.id);
    form.value = data.result;
    form.value.roles.forEach((roleIndex) => {
      if (roleIndex === 1) a.value = true;
      else if (roleIndex === 2) b.value = true;
      else if (roleIndex === 3) c.value = true;
    });
  } catch (e) {
    console.error(e);
  }
};

const getDocumentsById = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const { data } = await counterpartyAgreement.getById(
      route.params.id,
      page,
      itemsPerPage,
      sortBy
    );
    dataCounterpartyAgreement.value = data.result.data;
    paginations.value = data.result.pagination;
    console.log(data);
  } catch (e) {
    console.log(e);
  }
};

onMounted(async () => {
  await getId();
});
</script>

<template>
  <div>
    <div class="d-flex justify-start mb-4">
      <v-btn variant="outlined" color="info" @click="$router.push({ name: 'counterparty' })">Назад</v-btn>
    </div>
    <v-card class="px-4 py-6">
      <div class="d-flex ga-5">
        <v-text-field v-model="form.name" disabled variant="outlined" label="Наименование контрагента" />
        <v-text-field v-model="form.phone" disabled variant="outlined" label="Тел номер" v-mask="'+992#########'" />
        <v-text-field v-model="form.address" disabled variant="outlined" label="Адрес" />
        <v-text-field v-model="form.email" disabled variant="outlined" type="email" label="Почта" />
      </div>
      <div class="d-flex w-75">
        <v-checkbox-btn v-model="a" disabled label="Клиент" @change="handleCheckboxChange(1)"></v-checkbox-btn>
        <v-checkbox-btn v-model="b" disabled label="Поставщик" @change="handleCheckboxChange(2)"></v-checkbox-btn>
        <v-checkbox-btn v-model="c" disabled label="Прочие отношения" @change="handleCheckboxChange(3)"></v-checkbox-btn>
      </div>
    </v-card>
    <div class="mt-4">
      <v-card class="table">
        <v-data-table-server :items="dataCounterpartyAgreement" items-per-page-text="Элементов на странице:"
          loading-text="Загрузка" no-data-text="Нет данных" @update:options="getDocumentsById" :headers="headers"
          v-model:items-per-page="paginations.per_page" :items-length="paginations.total || 0"
          :item-value="headers.title">
          <template v-slot:item.id="{ item, index }">
            <span>{{ index + 1 }}</span>
          </template>
        </v-data-table-server>
      </v-card>
    </div>
  </div>
</template>

<style scoped></style>
