<script setup lang="ts">
import { onMounted, ref } from "vue";
import currency from '../../api/currency.js'

const expand = ref(false);
const loading = ref(false);
const isCurrentRate = ref(false)

const idCurrency = ref(null)
const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)
const dateRef = ref(null)
const valueRef = ref(null)


onMounted(() => {

})

const addCurrency = async () => {
  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }

  const res = await currency.addCurrency(body)
  if (res.status === 201) {
    isCurrentRate.value = true
    idCurrency.value = res.data.result.id
  }
  
}

const addCurrentRate = async () => {
  const body = {
    date: dateRef.value,
    value: valueRef.value
  }
  const res = await currency.addCurrencyRate(body, String(idCurrency.value))
  console.log(res)
}


</script>

<template>
  <v-row
    justify="center"
    class="d-flex flex-column"
    style="min-height: 160px;"
  >
    <v-col class="">
      <v-icon size="40" color="info" class="ma-2" @click="expand = !expand">add_circle</v-icon>

      <v-expand-transition>
        <v-card
          v-show="expand"
          height="200"
          width="100%"
          class="mx-auto"
        >

          <v-form class="w-100 pa-4" @submit.prevent="addCurrency">
            <v-row class="w-100">
              <v-col class="d-flex justfiy-between w-100 ga-5">
                <v-text-field variant="outlined" :disabled="isCurrentRate"  label="Название" v-model="nameRef" />
                <v-text-field variant="outlined" :disabled="isCurrentRate" v-mask="'SSS'" label="Символный код" v-model="symbolRef" />
                <v-text-field variant="outlined" :disabled="isCurrentRate" v-mask="'###'" label="Цифровой код" v-model="digitalRef" />
                <v-btn :loading="loading" color="green" class="mt-2" type="submit" :hidden="isCurrentRate">Добавить</v-btn>
              </v-col>
            </v-row>
          </v-form>

          <v-form class="w-100 pa-4" v-show="isCurrentRate" @submit.prevent="addCurrentRate">
            <v-row class="w-100">
              <v-col class="d-flex justfiy-between w-100 ga-5">
                <v-text-field variant="outlined"  label="Дата" v-model="dateRef" />
                <v-text-field variant="outlined" :disabled="isCurrentRate" label="Символный код" v-model="symbolRef" />
                <v-text-field variant="outlined" type="number" label="Значение" v-model="valueRef" />
                <v-btn :loading="loading" color="green" class="mt-2" type="submit">Добавить</v-btn>
              </v-col>
            </v-row>
          </v-form>

      </v-card>
      </v-expand-transition>
      <v-card class="mt-4">
        daopsd
      </v-card>
    </v-col>
   
  </v-row>
</template>

<style scoped>

</style>