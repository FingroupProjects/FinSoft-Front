<script setup>
import Icons from "../../composables/Icons/Icons.vue";
import {reactive, ref, watch} from "vue";
import CustomTextField from "../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../components/formElements/CustomAutocomplete.vue";
import '../../assets/css/procurement.css'
import CustomCheckbox from "../../components/checkbox/CustomCheckbox.vue";

const form = reactive({
  number: null,
  date: null,
  organization: null,
  organizations: [],
  counterparty: null,
  counterparties: [],
  cpAgreement: null,
  cpAgreements: [],
  storage: null,
  storages: [],
  saleInteger: null,
  salePercent: null,
})

const loading = ref(false)
const hoveredRowIndex = ref(null)

const search = ref('')
const markedID = ref([])
const goods = ref([])

const headers = ref([
  {title: 'Товары', key: 'goods', sortable: false},
  {title: 'Количество', key: 'currency.name', sortable: false},
  {title: 'Цена', key: 'currency.name', sortable: false},
  {title: 'Сумма', key: 'currency.name', sortable: false},
])

const decreaseCountOfGoods = () => {
  if (goods.value.length > 0) {
    goods.value = goods.value.slice(0, -1);
  }
}

const increaseCountOfGoods = () => {
  goods.value.push({ good_id: null, amount: 1, price: null });
}


const addNewProcurement = () => {

  const body = {
    number: form.number,
    date: form.date,
    organization_id: form.organization,
    counterparty_id: form.counterparty,
    counterparty_agreement_id: form.cpAgreement,
    storage_id: form.storage,
    sale_integer: form.saleInteger,
    sale_percent: form.salePercent,
    goods: goods.value
 }

  console.log(body)
}

watch(markedID, (newVal) => {
  console.log(newVal)
})

</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Покупка (создание)</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-1 me-3">
              <Icons title="Добавить" @click="addNewProcurement" name="add"/>
              <Icons title="Скопировать" @click="" name="copy"/>
              <Icons title="Удалить" @click="" name="delete"/>
            </div>
          </div>
        </v-card>
      </div>
    </v-col>
    <v-divider/>
    <v-divider/>
    <div style="background: #fff;">
      <v-col class="d-flex flex-column ga-2 pb-0">
        <div class="d-flex flex-wrap ga-4">
          <custom-text-field label="Номер" v-model="form.number"/>
          <custom-text-field label="Дата" type="date" v-model="form.date"/>
          <custom-autocomplete label="Организация" :items="['123', '123', '321']" v-model="form.organization"/>
          <custom-autocomplete label="Поставщик" :items="['123', '123', '321']" v-model="form.counterparty"/>
          <custom-autocomplete label="Договор" :items="['123', '123', '321']" v-model="form.cpAgreement"/>
          <custom-autocomplete label="Склад" :items="['123', '123', '321']" v-model="form.storage"/>
          <custom-text-field label="Руч. скидка (сумма)" v-model="form.saleInteger"/>
          <custom-text-field label="Руч. скидка (процент)" v-model="form.salePercent"/>
        </div>
      </v-col>
      <v-col>
        <div style="border: 1px solid #0FC242;" class="rounded">
          <div class="d-flex pa-1 ga-1">
            <Icons name="add" title="Добавить поле" @click="increaseCountOfGoods"/>
            <Icons name="delete" @click="decreaseCountOfGoods"/>
          </div>
          <div class="d-flex w-100">
            <v-data-table
                style="height: 78vh"
                items-per-page-text="Элементов на странице:"
                loading-text="Загрузка"
                no-data-text="Нет данных"
                :headers="headers"
                :items="goods"
                item-value="amount"
                v-model="markedID"
                page-text='{0}-{1} от {2}'
                :items-per-page-options="[
                  {value: 25, title: '25'},
                  {value: 50, title: '50'},
                  {value: 100, title: '100'},
                ]"
                show-select
                fixed-footer
            >
              <template v-slot:item="{ item, index }">
                <tr  :key="index">
                  <td>
                    <CustomCheckbox
                      v-model="markedID"
                      :checked="markedID.includes(index)"
                    >
                      <span>{{ index + 1}}</span>
                    </CustomCheckbox>
                  </td>
                  <td>
                    <custom-autocomplete v-model="item.good_id" :items="['123', 1, 2, 2, 2, 2]" min-width="150" />
                  </td>
                  <td>
                    <custom-text-field v-model="item.amount" min-width="50" max-width="90" />
                  </td>
                  <td>
                    <custom-text-field v-model="item.price" min-width="80" max-width="110"/>
                  </td>
                  <td>
                    <custom-text-field v-model="form.number"  min-width="100" max-width="110"/>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
        </div>
      </v-col>
    </div>
  </div>
</template>

<style scoped>

</style>