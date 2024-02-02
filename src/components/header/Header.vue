<script setup>

import {ref} from "vue";

const dialog = ref(false)
</script>

<template>
  <v-app-bar
      :elevation="2"
      color="info"
      height="45"
  >
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="$emit('rale')"></v-app-bar-nav-icon>
      <v-icon size="18" class="text-grey-lighten-3">home</v-icon>
      <v-icon size="12" class="ms-1">chevron_right</v-icon>
    </template>

    <v-app-bar-title class="text-sm-body-1">Клиент</v-app-bar-title>

    <template v-slot:append>
      <v-btn density="comfortable" variant="tonal" color="info" class="d-flex justify-space-between ga-3  text-sm-body-2 bg-white rounded-lg py-1 cursor-pointer">
        <template v-slot:prepend>
          <v-icon>search</v-icon>
          <span class="ms-2">Поиск...</span>
        </template>

        <template v-slot:append>
          <span class="bg-blue rounded-lg px-1">Ctrl+K</span>
        </template>

        <v-dialog
            v-model="dialog"
            activator="parent"
            width="400"
            class="rounded-lg"
        >
          <v-card>
            <v-card-title>
              <div class="d-flex align-center">
                <v-icon>search</v-icon>
                <v-text-field
                    placeholder="Поиск...."
                    variant="plain"
                >
                </v-text-field>
              </div>
            </v-card-title>
            <v-divider/>
            <v-card-text>
              <v-container>

              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="dialog = false"
              >
                Close
              </v-btn>
              <v-btn
                  color="blue-darken-1"
                  variant="text"
                  @click="dialog = false"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-btn>

      <v-btn variant="text" size="55" class="ms-2" >
        <v-icon size="20">add_circle_outline</v-icon>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

      <v-btn variant="text" size="55" >
        <v-icon size="20">help_outline</v-icon>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

      <v-btn variant="text" size="55" >
        <v-icon size="20">notifications</v-icon>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

      <v-btn variant="text" class="d-flex justify-space-between">
        <v-icon size="20">language</v-icon>
        <span class="text-sm-body-2 mx-2">Русский</span>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

      <v-btn variant="text" class="d-flex justify-space-between" rounded="2">
        <v-icon size="20">account_circle</v-icon>
        <span class="text-sm-body-2 mx-2">Hello</span>
        <v-icon size="20">expand_more</v-icon>
      </v-btn>

    </template>
  </v-app-bar>
</template>

<style scoped>

</style>