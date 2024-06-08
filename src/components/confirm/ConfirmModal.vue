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
            <Icons @click="closeModal" name="close" title="Закрыть" />
          </v-card-title>
          <v-card-text class="text-subtitle-1"
            >Сохранить текущие изменения?</v-card-text
          >
          <v-card-actions class="d-flex justify-end align-end">
            <v-btn
              @click="confirmClose"
              class="text-none w-[200px] h-[20px]"
              color="red"
              variant="flat"
              >Нет</v-btn
            >
            <v-btn
              @click="closingWithSaving"
              class="text-none w-[200px] h-[20px]"
              color="green"
              variant="flat"
              >Да</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import Icons from '../../composables/Icons/Icons.vue';

const props = defineProps({
  showModal: Boolean
});

const emit = defineEmits();

const closeModal = () => {
  emit('close');

};

const confirmClose = () => {
  emit('closeClear')
}

const closingWithSaving = () => {
  emit('closeWithSaving')
}

</script>
