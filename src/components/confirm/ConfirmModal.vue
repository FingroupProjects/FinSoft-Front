<template>
  <v-dialog style="min-width: 300px"  v-model="props.showModal" >
        <v-card
          style="max-width: 400px; border-radius: 16px"
          class="mx-auto flex flex-col"
        >
          <v-card-title
            class="d-flex justify-space-between align-center text-h6"
          >
            <span>Подтверждение</span>
            <v-btn
              @click="showConfirmDialog = false"
              variant="text"
              :size="32"
              class="pt-2 pl-1"
            >
              <Icons name="close" title="Закрыть" />
            </v-btn>
          </v-card-title>
          <v-card-text class="text-subtitle-1"
            >Точно хотите закрыть? Введенные данные не будут
            сохранены.</v-card-text
          >
          <v-card-actions class="d-flex justify-end align-end">
            <v-btn
              @click="closeModal"
              class="text-none w-[200px] h-[20px]"
              color="red"
              variant="flat"
              >Нет</v-btn
            >
            <v-btn
              @click="confirmClose"
              class="text-none w-[200px] h-[20px]"
              color="green"
              variant="flat"
              >Да</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

    <!-- <v-dialog style="min-width: 300px"  v-model="props.showModal">
        <v-card style="max-width: 400px" class="mx-auto flex flex-col">
          <v-card-title class="text-h6">Подтверждение</v-card-title>
          <v-card-text class="text-subtitle-1"
            >Точно хотите закрыть? Введенные данные не будут
            сохранены.</v-card-text
          >
          <v-card-actions>
            <v-btn
              @click="closeModal"
              class="text-none mb-4 w-[200px] h-[20px]"
              color="red"
              variant="flat"
              >Нет</v-btn
            >
            <v-btn
              @click="confirmClose"
              class="text-none mb-4 w-[200px] h-[20px]"
              color="green"
              variant="flat"
              >Да</v-btn
            >
          </v-card-actions>
        </v-card>
        
      </v-dialog> -->
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  showModal: Boolean
});

const emit = defineEmits();

const closeModal = () => {
  emit('close');
  
};

const confirmClose = () => {
  emit('closeClear')
};
</script>
