<script>
export default {
  data: () => ({
    cursors: [
      'auto',
      'default',
      'grab',
      'grabbing',
      'help',
      'move',
      'none',
      'not-allowed',
      'pointer',
      'progress',
      'text',
      'wait',
    ],
  }),
}
</script>

<template>
  <v-container>
    <v-row justify="space-between">
      <v-col v-for="cursor in cursors" :key="cursor" cols="3">
        <v-btn
            :text="cursor"
            :class="`cursor-${cursor}`"
            block
        ></v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>

</style>