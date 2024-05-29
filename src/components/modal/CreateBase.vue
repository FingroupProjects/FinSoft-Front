<script setup>

import {DOCUMENT_ITEMS} from "../../composables/constant/items.js";
import createBased from "../../composables/modal/createBased.js";
import {useModalCreateBased} from "../../store/modalCreateBased.js";
import {useRouter} from "vue-router";

const props = defineProps({
  markedID: {
    type: String,
    required: true,
    default: ''
  }
})

const modalCreateBased = useModalCreateBased()
const router = useRouter()


</script>

<template>
  <div v-if="modalCreateBased.isModalCreateBased" @click.self="modalCreateBased.isModal()" class="modal_create_based">
    <v-card
        style="margin-top: 15%; left: -10%"
        max-width="300"
    >
      <v-list
          :items="DOCUMENT_ITEMS"
          item-title="name"
          item-value="id"
          @click.item="createBased($event, router, props.markedID)"
      ></v-list>
    </v-card>
  </div>
</template>

<style scoped>

</style>