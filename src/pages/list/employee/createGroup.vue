<script setup>
import { ref, defineEmits, onMounted } from "vue";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import { addMessage, removeMessage, editMessage, restoreMessage } from "../../../composables/constant/buttons";
import userGroup from "../../../api/list/userGroup.js";
import {USER_GROUP} from "../../../composables/constant/paramsApi.js";
import {FIELD_COLOR} from "../../../composables/constant/colors.js";
import {getUser} from "../../../composables/auth/index.js";
import employeeGroup from "../../../api/list/employeeGroup.js";


const props = defineProps(['isEdit', 'item'])
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
    console.log(response)
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

onMounted(() => {
  if (props.isEdit) {
    name.value = props.item.name
    console.log(name.value)
  }
})

const update = async () => {
  try {
    isValid.value = true;
    if (name.value.length === 0) {
      showToast("Поле Наименование не может быть пустым", "warning");
      return
    }
    const response = await employeeGroup.update(props.item.id, {name: name.value});
    if (response.status === 200) {
      showToast(editMessage);
    }
    emit("toggleDialog");
  } catch (e) {
    console.log(e)
  } finally {
    isValid.value = false;
  }
};

const restore = async () => {
  const response = await employeeGroup.restore(props.item.id);
    if (response.status === 200) {
      showToast(restoreMessage);
    }
    emit("toggleDialog");
}

const destroy  = async () => {
  const response = await employeeGroup.delete(props.item.id);
    if (response.status === 200) {
      showToast(removeMessage);
    }
    emit("toggleDialog");
}

const compute = async () => {
  if(props.item.deleted_at !== null) {
      restore()
  }
  else {
    destroy()
  }
}




</script>
<template>
  <div>
    <v-col>
      <v-dialog  v-model="dialog" class="mt-2 pa-2" persistent @keyup.esc="emit('toggleDialog')">
        <v-card
          style="border: 2px solid #3ab700"
          min-width="350"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>{{ props.isEdit ? "Изменить" : "Создать" }} группу</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
              <Icons v-if="props.isEdit"  @click="compute" name="delete"/>
            </div>
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons @click="props.isEdit ? update() : createGroup()" name="save" />
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
                  autofocus
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
