<script setup>
import { ref, onMounted } from "vue";
import counterpartyApi from "../../../api/counterparty";
import { useRoute, useRouter } from "vue-router";
import counterpartyAgreement from "../../../api/counterpartyAgreement";
import showDate from "../../../composables/date/showDate"
import { prevIcon } from "../../../composables/constant/buttons.js";

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

const search = ref('')

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

const getDocumentsById = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await counterpartyAgreement.getCounterpartyById(route.params.id, {page, itemsPerPage, sortBy}, search);
    dataCounterpartyAgreement.value = data.result.data.map(item => ({
      ...item,
      date: showDate(item.date)
    }));
    paginations.value = data.result.pagination;
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
    <v-col>

      <div class="d-flex justify-start mb-4">
        <v-btn color="info" class="rounded-circle mb-1" size="40" @click="$router.push({name: 'counterparty'})">
          <v-icon color="white" size="25" >{{ prevIcon }}</v-icon>
        </v-btn>
      </div>

      <v-card class="block">

        <div class="d-flex ga-5">
          <v-text-field
              density="compact"
              rounded="lg"
              v-model="form.name"
              disabled
              variant="outlined"
              label="Наименование контрагента"
          />
          <v-text-field
              density="compact"
              rounded="lg"

              v-model="form.phone"
              disabled
              variant="outlined"
              label="Тел номер"
              v-mask="'+992#########'"
          />
          <v-text-field
              density="compact"
              rounded="lg"
              v-model="form.address"
              disabled
              variant="outlined"
              label="Адрес"
          />
          <v-text-field
              density="compact"
              rounded="lg"
              v-model="form.email"
              disabled
              variant="outlined"
              type="email"
              label="Почта"
          />
        </div>
        <div class="d-flex ga-16 flex-wrap">
          <v-switch
              disabled
              v-model="a"
              label="Клиент"
              base-color="info"
              color="info"
          />
          <v-switch
              disabled
              v-model="b"
              label="Поставщик"
              base-color="info"
              color="info"
          />
          <v-switch
              disabled
              v-model="c"
              label="Прочие отношения"
              base-color="info"
              color="info"
          />
        </div>
      </v-card>

      <div class="mt-4">
        <v-card class="table">

          <v-card-title class="d-flex align-center pe-2">
            Список договоров контрагента
            <v-spacer />
            <v-spacer />
            <v-spacer />
            <v-text-field
                v-model="search"
                prepend-inner-icon="search"
                clearable
                density="compact"
                label="Поиск..."
                color="info"
                rounded="lg"
                single-line
                flat
                hide-details
                variant="outlined"
            />
          </v-card-title>

          <v-data-table-server
            :items="dataCounterpartyAgreement"
            items-per-page-text="Элементов на странице:"
            loading-text="Загрузка"
            no-data-text="Нет данных"
            @update:options="getDocumentsById"
            :headers="headers"
            :search="search"
            v-model:items-per-page="paginations.per_page"
            :items-length="paginations.total || 0"
            :item-value="headers.title"
          >
            <template v-slot:item.id="{ item, index }">
              <span>{{ index + 1 }}</span>
            </template>
          </v-data-table-server>

        </v-card>
      </div>

    </v-col>
  </div>
</template>

<style scoped>
.block {
  border-radius: 16px;
  padding: 20px;
}
</style>
