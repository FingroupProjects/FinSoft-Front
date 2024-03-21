<script setup>
import { ref, defineEmits } from "vue";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import { addMessage } from "../../../composables/constant/buttons";
import userGroup from "../../../api/userGroup.js";
import {USER_GROUP} from "../../../composables/constant/paramsApi.js";
import {FIELD_COLOR} from "../../../composables/constant/colors.js";
import {getUser} from "../../../composables/auth/index.js";
import employeeGroup from "../../../api/employeeGroup.js";

const emit = defineEmits();

const dialog = ref(true);
const isValid = ref(false);

const name = ref(null);

const createGroup = async () => {
  try {
    isValid.value = true;

    if (!name.value) {
      showToast("Поле Наименование не может быть пустым", "warning");
      return
    }
    const response = await employeeGroup.add({name: name.value, type: 2});
    if (response.status === 201) {
      showToast(addMessage);
    }
    emit("toggleDialog");
  } catch (e) {
    console.log(e)
  } finally {
    isValid.value = false;
  }
};

const rules = {
  required: (v) => !!v,
}

</script>
<template>
  <div>
    <v-col>
      <v-dialog v-model="dialog" class="mt-2 pa-2" persistent>
        <v-card
          style="border: 2px solid #3ab700"
          min-width="350"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>Создать группу</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="createGroup()" name="save" />
              </div>
              <v-btn @click="$emit('toggleDialog')" variant="text" :size="32" class="pt-2 pl-1">
                <Icons name="close" />
              </v-btn>
            </div>
          </div>
          <v-form class="d-flex w-100">
            <v-row class="w-100">
              <v-col class="d-flex flex-column w-100 ga-3">
                <v-text-field
                  v-model="name"
                  :rules="isValid ? [rules.required] : []"
                  color="green"
                  :base-color="FIELD_COLOR"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Наименование"
                  label="Наименование"
                  clear-icon="close"
                  :append-inner-icon="name ? 'close' : ''"
                  @click:append-inner="name = null"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </div>
</template>
