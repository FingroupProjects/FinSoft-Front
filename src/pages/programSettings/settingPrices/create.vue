<script setup>
import CustomFilterAutocomplete from "../../../components/formElements/CustomFilterAutocomplete.vue";
import CustomFilterTextField from "../../../components/formElements/CustomFilterTextField.vue";
import CustomAutocomplete from "../../../components/formElements/CustomAutocomplete.vue";
import currentDateWithTime from "../../../composables/date/currentDateWithTime.js";
import CustomTextField from "../../../components/formElements/CustomTextField.vue";
import {
  BASE_COLOR,
  TITLE_COLOR,
} from "../../../composables/constant/colors.js";
import { useFilterCanvasVisible } from "../../../store/canvasVisible.js";
import formatDateTime from "../../../composables/date/formatDateTime.js";
import FilterCanvas from "../../../components/canvas/filterCanvas.vue";
import settingPricesApi from "../../../api/list/settingPrices";
import organizationsApi from "../../../api/list/organizations";
import priceTypesApi from "../../../api/list/priceType";
import { onMounted, reactive, ref, watch } from "vue";
import groupApi from "../../../api/list/goodGroup.js";
import currencyApi from "../../../api/list/currency";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });

const form = reactive({
  sum: null,
  base: null,
  date: null,
  author: null,
  percent: null,
  comment: null,
  currency: null,
  price_type: [],
  good_group: [],
  doc_number: null,
  organization: null,
});

const goods = ref([]);
const currencies = ref([]);
const price_types = ref([]);
const good_groups = ref([]);
const organizations = ref([]);

const getCurrencies = async () => {
  try {
    const {
      data: {
        result: { data },
      },
    } = await currencyApi.get({});
    currencies.value = data;
  } catch (e) {
    console.error(e);
  }
};

const getPriceTypes = async (id) => {
  try {
    const {
      data: { result },
    } = await priceTypesApi.getByCurrencyId(id);
    price_types.value = result;
  } catch (e) {
    console.error(e);
  }
};

const getOrganizations = async () => {
  try {
    const {
      data: {
        result: { data },
      },
    } = await organizationsApi.get({});
    organizations.value = data;
  } catch (e) {
    console.error(e);
  }
};

const getGoods = async (id) => {
  try {
    const {
      data: {
        result: { data },
      },
    } = await groupApi.get({});
    good_groups.value = data;
  } catch (e) {
    console.error(e);
  }
};

const getGood = async () => {
  try {
    const body = {
      goodGroupIds: form.good_group,
      priceTypeIds: form.price_type,
      changeBySum: form.sum,
      organization_id: 1,
      date: formatDateTime(form.date),
    };
    console.log(body);
    const { data } = await settingPricesApi.get(body);
    goods.value = data.result;
    console.log(goods.value);
  } catch (e) {
    console.error(e);
  }
};

const create = async () => {
  try {
    const body = {
      date: form.date,
      organization_id: form.organization,
      start_date: form.date,
      comment: form.comment,
      basis: form.base,
      goods: goods.value
    };
   console.log(' body',body )
    const res = await settingPricesApi.create(body);
    console.log(res);
  } catch (e) {
    console.error(e);
  }
};

watch(
  () => form.currency,
  async (newVal) => {
    if (newVal) {
      form.price_type = null;
      const id = typeof newVal === "object" ? newVal.id : newVal;
      await getPriceTypes(id);
    }
  }
);

const closeFilterModal = () => {
  form = {
    sum: null,
    date: null,
    author: null,
    percent: null,
    comment: null,
    currency: null,
    price_type: [],
    good_group: [],
    doc_number: null,
    organization: null,
  };
  useFilterCanvasVisible.closeFilterCanvas();
};

const priceDifference = (item) => {
  const res = Number(item.prices?.old_price) - Number(item.prices?.newPrice);
  return Math.abs(res);
};

onMounted(async () => {
  await getOrganizations();
  await getCurrencies();
  await getGoods();
  form.date = currentDateWithTime();
});
</script>
<template>
  <div class="pa-4 bg-white">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">
          {{ $t("titles.settingProces") }}
        </span>
      </div>
    </div>
    <div>
      <v-col class="d-flex flex-column ga-2">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field
            disabled
            :value="t('headers.number')"
            v-model="form.doc_number"
          />
          <custom-text-field
            class="date"
            :label="t('headers.date')"
            type="datetime-local"
            v-model="form.date"
          />
          <button
            class="btn"
            @click="useFilterCanvasVisible().toggleFilterCanvas()"
          >
            {{ $t("headers.setting") }}
          </button>
          <button
            class="btn"
            @click="create()"
          >
            {{ 'Сохранить' }}
          </button>
        </div>
      </v-col>
      <div style="height: 65vh; overflow: auto">
        <div v-if="goods.length > 0">
          <div class="d-flex">
            <div
              style="
                min-width: 200px;
                display: flex;
                justify-content: center;
                align-items: center;
              "
              class="br"
            >
              Товары
            </div>
            <div
              v-for="item in goods"
              :key="item.id"
              style="min-width: 250px"
              class="d-flex flex-column"
            >
              <div class="br">{{ item.name }}</div>
              <div class="d-flex">
                <div style="min-width: 100px" class="br">Старая</div>
                <div style="min-width: 100px" class="br">Новая</div>
                <div style="min-width: 50px" class="br">+-</div>
              </div>
            </div>
          </div>
          <div v-for="(item, index) in goods" :key="index" class="d-flex">
            <div style="min-width: 200px" class="br">
              {{ item.prices?.name }}
            </div>
            <div v-for="(item, index) in goods" :key="index" class="d-flex">
              <div style="min-width: 100px" class="br">
                {{ parseFloat(item.prices?.old_price) }}
              </div>
              <div style="min-width: 100px" class="br">
                <input
                  class="input"
                  :v-model="goods[index].prices ? goods[index].prices.newPrice : ''"
                  type="text"
                />
              </div>
              <div style="min-width: 50px" class="br">
                <div
                  :class="
                    item.prices?.newPrice > item.prices?.old_price
                      ? 'green-dot'
                      : 'red-dot'
                  "
                />
              </div>
            </div>
          </div>
          <div class="d-flex">
            <div style="min-width: 200px" class="br">Итого</div>
            <div v-for="(item, index) in goods" :key="index" class="d-flex">
              <div style="min-width: 100px" class="br">{{ goods.length }}</div>
              <div style="min-width: 100px" class="br">
                {{ priceDifference(item) }}
              </div>
              <div style="min-width: 50px" class="br"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex ga-10 mt-4">
        <custom-text-field
          readonly
          v-model="form.author"
          :label="t('headers.author')"
          min-width="110"
        />
        <custom-text-field
          :label="t('headers.comment')"
          v-model="form.comment"
          min-width="310"
        />
        <custom-text-field
          :label="t('headers.base')"
          v-model="form.base"
          min-width="310"
        />
      </div>
    </div>

    <filter-canvas>
      <div class="d-flex flex-column ga-2 w-100">
        <custom-filter-autocomplete
          min-width="106"
          :label="t('headers.currency')"
          :items="currencies"
          v-model="form.currency"
        />
        <custom-filter-autocomplete
          min-width="106"
          :label="t('headers.organization')"
          :items="organizations"
          v-model="form.organization"
        />
        <custom-filter-autocomplete
          min-width="106"
          :disabled="!form.currency"
          :label="'Список видов цен'"
          :items="price_types"
          maxWidth="350px"
          v-model="form.price_type"
          multiple
        />
        <custom-filter-autocomplete
          min-width="106"
          :label="'Список групп товаров'"
          maxWidth="350px"
          :items="good_groups"
          v-model="form.good_group"
          multiple
        />
      </div>
      <div class="d-flex ga-4">
        <custom-filter-text-field
          :disabled="form.sum !== null && form.sum !== ''"
          label="Изменить на X%"
          v-model="form.percent"
          min-width="50"
        />
        <custom-filter-text-field
          :disabled="form.percent !== null && form.percent !== ''"
          label="Изменить на X сумму"
          v-model="form.sum"
          min-width="51"
        />
      </div>
      <div class="d-flex justify-end">
        <div class="d-flex ga-2" style="margin-right: -6%">
          <v-btn
            tabindex="-1"
            color="red"
            class="btn"
            @click="closeFilterModal()"
            >{{ $t("buttonGoods.reset") }}</v-btn
          >
          <v-btn
            tabindex="-1"
            :color="BASE_COLOR"
            class="btn"
            @click="
              () => {
                getGood();
                useFilterCanvasVisible().closeFilterCanvas();
              }
            "
            >{{ $t("buttonGoods.apply") }}</v-btn
          >
        </div>
      </div>
    </filter-canvas>
  </div>
</template>
<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid black;
  text-align: start;
  vertical-align: top;
  padding: 8px;
}
.br {
  border: 1px solid black;
  text-align: start;
  vertical-align: top;
  padding: 8px;
}
th {
  padding: 8px 8px 8px 20px;
}
.green-dot {
  height: 20px;
  width: 20px;
  background-color: green;
  color: green;
  text-align: center;
  border-radius: 50%;
}
.red-dot {
  height: 20px;
  width: 20px;
  background-color: red;
  color: red;
  text-align: center;
  border-radius: 50%;
}
.tall-row td {
  height: 100px;
}
.btn {
  border: 1px solid #adbbd1;
  padding: 8px 12px;
  border-radius: 8px;
  height: 42px;
}
.input {
  outline: none;
  max-width: 80px;
}
</style>
