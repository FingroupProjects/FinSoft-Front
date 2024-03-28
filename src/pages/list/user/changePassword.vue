<script setup>
import {ref, defineEmits} from "vue";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import user from "../../../api/user.js";
import {FIELD_COLOR} from "../../../composables/constant/colors.js";

const emit = defineEmits();

const dialog = ref(true);
const isValid = ref(false);

const password = ref(null)
const confirmPassword = ref(null)

const props = defineProps({
  "id": Number,
});

const change = async () => {
  try {
    isValid.value = true;

    if (password.value === null) {
      showToast("Поле Новый пароль не может быть пустым", "warning");
      return
    }
    if (confirmPassword.value === null) {
      showToast("Поле Подтверждение пароя не может быть пустым", "warning");
      return
    }
    if (password.value !== confirmPassword.value) {
      showToast("Пароли не совпадают", "warning");
      return
    }


    const body = {
      password: password.value,
      password_confirmation: confirmPassword.value
    }

    await user.password(props.id, body)
    showToast("Пароль успешно изменён!")
    emit("toggleDialogPassword")

  } catch (e) {
    console.log(e)
  } finally {
    isValid.value = false;
  }
};

const rules = {
  required: (v) => !!v,
};
</script>
<template>
  <div>
    <v-dialog  v-model="dialog" class="mt-2 pa-2" persistent>
      <v-card
          style="border: 2px solid #3ab700"
          min-width="350"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
      >
        <div class="d-flex justify-space-between align-center mb-2">
          <span>Изменить пароль</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex ga-3 align-center mt-2 me-4">
              <Icons @click="change()" name="save"/>
            </div>
            <v-btn @click="$emit('toggleDialogPassword')" variant="text" :size="32" class="pt-2 pl-1">
              <Icons name="close"/>
            </v-btn>
          </div>
        </div>
        <v-form class="d-flex w-100">
          <v-row class="w-100">
            <v-col class="d-flex flex-column w-100 ga-3">
              <v-text-field
                  v-model="password"
                  :rules="isValid ? [rules.required] : []"
                  color="green"
                  :base-color="FIELD_COLOR"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Новый пароль"
                  label="Новый пароль"
                  clear-icon="close"
                  type="password"
                  :append-inner-icon="password ? 'close' : ''"
                  @click:append-inner="password = null"
                  hide-details
              />
              <v-text-field
                  v-model="confirmPassword"
                  :rules="isValid ? [rules.required] : []"
                  color="green"
                  :base-color="FIELD_COLOR"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Подтвердите пароль"
                  label="Подтвердите пароль"
                  clear-icon="close"
                  type="password"
                  :append-inner-icon="confirmPassword ? 'close' : ''"
                  @click:append-inner="confirmPassword = null"
                  hide-details
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
