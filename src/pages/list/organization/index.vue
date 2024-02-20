<script setup>
import { ref } from "vue";

const dialog = ref(false);
</script>


<template>
  <div>
    <div>
      <v-btn icon="add_circle" variant="text" @click="dialog = true">
        <v-icon size="40" color="green"></v-icon>
      </v-btn>

      <v-dialog v-model="dialog" width="500">
        <v-card title="Добавить новую организацию">
          <v-card-text>
            <v-text-field label="Name" name="Name"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text="Close Dialog" @click="dialog = false"></v-btn>
            <v-btn>Добавить</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
    <div></div>
  </div>
</template>

<style scoped>
.table {
  background: white;
  padding: 5px;
  border-radius: 16px;
  max-height: 90vh;
  overflow: auto;
}
</style>