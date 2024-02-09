<script setup lang="ts">
import { onMounted, ref } from "vue";
import currency from '../../api/currency.js'

const expand = ref(false);
const loading = ref(false);

const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)

onMounted(() => {

})

const addCurrency = async () => {
  const body = {
    name: nameRef.value,
    digital_code: digitalRef.value,
    symbol_code: symbolRef.value
  }
  console.log(body)
  const res = await currency.addCurrency(body)
  console.log(res)
}


</script>

<template>
  <v-row
    justify="center"

    style="min-height: 160px;"
  >
    <v-col class="shrink">
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
                <v-text-field variant="outlined" label="Название" v-model="nameRef" />
                <v-text-field variant="outlined" label="Символный код" v-model="symbolRef" />
                <v-text-field variant="outlined" label="Цифровой код" v-model="digitalRef" />
                <v-btn :loading="loading" color="green" class="mt-2" type="submit">Добавить</v-btn>
              </v-col>
            </v-row>
          </v-form>

      </v-card>
      </v-expand-transition>
    </v-col>
  </v-row>
</template>

<style scoped>

</style>