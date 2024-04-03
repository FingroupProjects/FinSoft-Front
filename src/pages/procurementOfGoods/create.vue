<script setup>
import Icons from "../../composables/Icons/Icons.vue";
import {reactive, ref} from "vue";
import CustomTextField from "../../components/formElements/CustomTextField.vue";
import CustomAutocomplete from "../../components/formElements/CustomAutocomplete.vue";
import '../../assets/css/procurement.css'
import CustomCheckbox from "../../components/checkbox/CustomCheckbox.vue";
import procurement from "../../api/procurement.js";

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
const debounceSearch = ref('')
const paginations = ref([])
const markedID = ref([])

const headers = ref([
  {title: 'Наименование', key: 'name'},
  {title: 'Валюта', key: 'currency.name'}
])

const getProcurement = async ({page, itemsPerPage, sortBy, search}) => {
  try {
    const response = await procurement.get({page, itemsPerPage, sortBy}, search, {})
    paginations.value = response.data.pagination
    console.log(response)
  } catch (e) {
    console.log(e)
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
          <v-data-table-server
              style="height: 78vh"
              items-per-page-text="Элементов на странице:"
              loading-text="Загрузка"
              no-data-text="Нет данных"
              v-model:items-per-page="paginations.per_page"
              :loading="loading"
              :headers="headers"
              :items-length="paginations.total || 0"
              :items="['123', '123', '321']"
              :item-value="headers.title"
              :search="debounceSearch"
              show-select
              v-model="markedID"
              @update:options="getProcurement"
              page-text =  '{0}-{1} от {2}'
              :items-per-page-options="[
                {value: 25, title: '25'},
                {value: 50, title: '50'},
                {value: 100, title: '100'},
            ]"
              fixed-header
              hover
          >
            <template v-slot:item="{ item, index }">
              <tr
                  @mouseenter="hoveredRowIndex = index"
                  @mouseleave="hoveredRowIndex = null"
                  @dblclick="openDialog(item)"
                  :class="{'bg-grey-lighten-2': markedID.includes(item.id) }"
              >
                <td>
                  <template v-if="hoveredRowIndex === index || markedID.includes(item.id)">
                    <CustomCheckbox
                        v-model="markedID"
                        :checked="markedID.includes(item.id)"
                        @click="lineMarking(item)"
                        @change="handleCheckboxClick(item)"
                    >
                      <span>{{ item.id }}</span>
                    </CustomCheckbox>
                  </template>
                  <template v-else>
                    <div class="d-flex align-center">
                      <Icons
                          style="margin-right: 10px; margin-top: 4px"
                          :name="item.deleted_at === null ? 'valid' : 'inValid'"
                      />
                      <span>{{ item.id }}</span>
                    </div>
                  </template>
                </td>
                <td>{{ item.name }}</td>
                <td>{{ item.currency.name }}</td>
              </tr>
            </template>
          </v-data-table-server>
          <table class="w-100">
            <tr>
              <td>№</td>
              <td>Товары</td>
              <td>Количество</td>
              <td>Цена</td>
              <td>Сумма</td>
            </tr>
          </table>
        </div>
      </div>
    </v-col>
  </div>
</template>

<style scoped>

</style>