<script setup>
import { useRoute, useRouter } from "vue-router";
import { onMounted, ref, reactive } from "vue";
import showDate from "../../composables/date/showDate";
import currentDate from "../../composables/date/currentDate";
import procurementApi from "../../api/documents/procurement";
import CustomTextField from "../../components/formElements/CustomTextField.vue";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

const goods = ref([]);
const doc_name = ref("");

const form = reactive({
  date: null,
  storage: null,
  comment: null,
  currency: null,
  doc_number: null,
  cpAgreement: null,
  salePercent: null,
  saleInteger: null,
  counterparty: null,
  organization: null,
});

const headers = ref([
  { id: 1, title: "№", key: "doc_number" },
  { id: 2, title: "Наименование товара", key: "name" },
  { id: 4, title: "Цена", key: "price" },
  { id: 3, title: "Количество", key: "count" },
  { id: 5, title: "Сумма", key: "sum" },
]);

const getItemDetails = async () => {
  try {
    const { data } = await procurementApi.getById(route.params.id);
    form.doc_number = data.result.doc_number;
    form.date = showDate(data.result.date, "-", true);
    (form.organization = data.result.organization.name),
      (form.counterparty = data.result.counterparty.name),
      (form.storage = data.result.storage.name),
      (form.saleInteger =
        data.result.saleInteger !== 0 ? data.result.saleInteger : null);
    form.salePercent =
      data.result.salePercent !== 0 ? data.result.salePercent : null;
    form.comment = data.result.comment;
    form.currency = data.result.currency;
    goods.value = data.result.goods.map((item) => ({
      id: item.id,
      good: {
        id: item.good.id,
        name: item.good.name,
      },
      amount: item.amount,
      price: item.price,
    }));
    console.log(data);
  } catch (e) {
    console.error(e);
  }
};

const totalSum = computed(() => {
  let sum = 0;
  goods.value.forEach((item) => {
    sum += item.price * item.amount;
  });
  return sum;
});

const totalPrice = computed(() => {
  let price = 0;
  goods.value.forEach((item) => {
    price += item.price;
  });
  return price;
});

const totalCount = computed(() => {
  let count = 0;
  goods.value.forEach((item) => {
    count += item.amount;
  });
  return count;
});

const windowPrint = () => {
  window.print();
};

const handleAfterPrint = () => {
  window.removeEventListener("afterprint", handleAfterPrint);
  setTimeout(() => {
    router.go(-1);
  }, 500);
};

onMounted(async () => {
  doc_name.value = route.params.title;
  await getItemDetails();
  window.addEventListener("afterprint", handleAfterPrint);
  windowPrint();
  // window.close()
});
</script>

<template>
  <div style="overflow-y: auto;" class="w-100 d-flex justify-center align-start h-100">
    <div style="width: 80%; padding: 20px 15px">
      <div class="d-flex justify-space-between mb-4">
        <div class="d-flex ga-8">
          <CustomTextField
            v-model="form.organization"
            variant="underlined"
            label="Ораганизация"
          />
          <CustomTextField
            v-model="form.counterparty"
            variant="underlined"
            label="Поставщик"
          />
          <CustomTextField
            v-model="form.storage"
            variant="underlined"
            label="Склад"
          />
        </div>
      </div>
      <div class="d-flex flex-column justify-center ga-10">
        <div class="text-center">
          <h2>
            Накладная {{ doc_name }} № {{ form.doc_number }} от {{ form.date }}
          </h2>
        </div>
        <table class="border-none table-auto w-full">
          <thead>
            <tr>
              <th v-for="header in headers" :key="header.id">
                {{ header.title }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(good, index) in goods" :key="good.id">
              <td>{{ index + 1 }}</td>
              <td>{{ good.good.name }}</td>
              <td>{{ good.price }}</td>
              <td>{{ good.amount }}</td>
              <td>{{ good.amount * good.price }}</td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td class="text-right">Итого</td>
              <td>{{ totalCount }}</td>
              <td>{{ totalSum }}</td>
            </tr>
          </tbody>
        </table>

        <div class="d-flex justify-center ga-16">
          <div class="d-flex ga-4">
            <span>Сдал</span>
            <div style="width: 150px; border-bottom: 1px solid #d9d9d9" />
          </div>
          <div class="d-flex ga-4">
            <span>Принял</span>
            <div style="width: 150px; border-bottom: 1px solid #d9d9d9" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
td {
  padding: 10px;
}

.border-none {
  border-collapse: collapse;
}

.border-none td {
  border: 1px solid #d9d9d9;
}

.border-none tr:last-child td {
}

.border-none tr td:first-child {
}

.border-none tr td:last-child {
}

th {
  padding: 10px;
  border: 1px solid #d9d9d9;
}

.border-none th:first-child {
  border-radius: 20px;
}

.border-none th:last-child {
  border-radius: 20px;
}
</style>
