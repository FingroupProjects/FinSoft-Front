<script setup>
import { onMounted, ref } from "vue";

const expand = ref(null);
const nameRef = ref(null)
const symbolRef = ref(null)
const digitalRef = ref(null)

onMounted(() => {
  
})

</script>

<template>
  <div class="d-flex flex-column">
    <div class="shrink">
      <v-icon class="ma-2" size="40" color="info" @click="expand = !expand">
        add_circle
      </v-icon>

      <v-expand-transition>
        <v-card
          v-show="expand"
          height="200"
          width="100%"
          class="mx-auto border pa-4"
        >
          <v-form class="w-100">
            <v-row class="w-100">
              <v-col class="d-flex justfiy-between w-100 ga-5">
                <v-text-field variant="outlined" label="Название" v-model="nameRef" />
                <v-text-field variant="outlined" label="Символный код" v-model="symbolRef" />
                <v-text-field variant="outlined" label="Цифровой код" v-model="digitalRef" />
                <v-btn color="green" class="mt-2">Добавить</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-expand-transition>
    </div>
  </div>
</template>

<style scoped>

</style>