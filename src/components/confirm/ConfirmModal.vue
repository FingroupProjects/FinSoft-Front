<template>
  <v-dialog style="min-width: 300px" v-if="showConfirmDialog" persistent>
        <v-card style="max-width: 400px" class="mx-auto flex flex-col">
          <v-card-title class="text-h6">Подтверждение</v-card-title>
          <v-card-text class="text-subtitle-1"
            >Точно хотите закрыть? Введенные данные не будут
            сохранены.</v-card-text
          >
          <v-card-actions>
            <v-btn
              class="text-none mb-4 w-[200px] h-[20px]"
              color="red"
              variant="flat"
              >Нет</v-btn
            >
            <v-btn
              class="text-none mb-4 w-[200px] h-[20px]"
              color="green"
              variant="flat"
              >Да</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script setup>
import { ref } from 'vue';

const showConfirmDialog = ref(false);

const openSecondModal = () => {
  showConfirmDialog.value = true;
}
</script>
