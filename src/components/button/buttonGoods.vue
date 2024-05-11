<script setup>

</script>

<template>
  <v-btn rounded @click="$emit('click')" class="d-flex w-25 text-none" style="letter-spacing: 0" :color="'#524ED8'">
    <svg class="me-1" width="13" height="13" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 4.61538V5.38462H5.38462V10H4.61538V5.38462H0V4.61538H4.61538V0H5.38462V4.61538H10Z" fill="white"/>
    </svg>
    <span>Добавить товар</span>
  </v-btn>
</template>

