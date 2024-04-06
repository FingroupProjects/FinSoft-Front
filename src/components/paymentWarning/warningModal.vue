<script setup>
import { onMounted, ref, watch } from "vue";

const dialog = ref(false);

const paymentNotification = ref("Срок действия оплаты программы");

const reboot = () => {
  window.location.reload();
  localStorage.removeItem("isPayment");
};

onMounted(() => {
  dialog.value = localStorage.getItem("isPayment") === "true";
});
</script>

<template>
  <v-dialog persistent v-model="dialog" width="500">
    <v-card style="border-radius: 12px;" class="pa-2">
      <v-card-title>Внимание!</v-card-title>
      <v-card-text>
        {{ paymentNotification }}
      </v-card-text>
      <div class="d-flex justify-end ga-4 ma-1 mt-6">
        <a href="https://t.me/RMFIS"><v-btn color="red">Связаться</v-btn></a>
        <v-btn @click="reboot()" color="green">Оплачено</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>
