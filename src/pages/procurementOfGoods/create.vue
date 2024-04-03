<script setup>
import Icons from "../../composables/Icons/Icons.vue";
import {reactive, ref} from "vue";
import CustomTextField from "../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../components/formElements/CustomAutocomplete.vue";
import '../../assets/css/procurement.css'
import position from "../../api/position.js";

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
const positions = ref([])

const headers = ref([
  {title: '№', key: 'name'},
  {title: 'Товары', key: 'currency.name'},
  {title: 'Количество', key: 'currency.name'},
  {title: 'Цена', key: 'currency.name'},
  {title: 'Сумма', key: 'currency.name'},
])


const getPositionData = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await position.get({page, itemsPerPage, sortBy}, search, {})
    positions.value = data.result.data
    loading.value = false
  } catch (e) {
  }
}

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
              <Icons title="Добавить" @click="" name="add"/>
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
        <div class="d-flex ga-4">

        </div>
      </v-col>
      <v-col>
        <div style="border: 1px solid #0FC242; min-height: 500px" class="rounded">
          <div class="d-flex pa-1 ga-1">
            <Icons name="add" title="Добавить поле"/>
            <Icons name="delete"/>
          </div>
          <div class="d-flex w-100">
            <v-data-table
                style="height: 78vh"
                items-per-page-text="Элементов на странице:"
                loading-text="Загрузка"
                no-data-text="Нет данных"
                :headers="headers"
                :items="['1']"
                :item-value="headers.title"
                v-model="markedID"
                @update:options="getPositionData"
                page-text =  '{0}-{1} от {2}'
                :items-per-page-options="[
                  {value: 25, title: '25'},
                  {value: 50, title: '50'},
                  {value: 100, title: '100'},
                ]"
                show-select
                fixed-header
            >
              <template v-slot:item="{ item, index }">
                <tr>
                  <td></td>
                  <td>
                    <custom-autocomplete :items="[1, 1,2, 2, 2, 2]" />
                  </td>
                  <td>
                    <custom-text-field v-model="form.number" />
                  </td>
                  <td>
                    <custom-text-field v-model="form.number" />
                  </td>
                  <td>
                    <custom-text-field v-model="form.number" />
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