<script setup>
import { FIELD_COLOR, BASE_COLOR,} from "../../../composables/constant/colors.js";
import { ref, defineProps, defineEmits, watch, computed } from "vue";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import Button from "../../../components/button/button.vue";
import counterparty from "../../../api/list/counterparty.js";

const props = defineProps([
  "isOpen",
  "markedID"
]);
const emits = defineEmits(["toggleIsOpen", "computeCounterparty"]);

const form = ref({
  message: "",
});

const dialog = ref(false);

watch(
  () => props.isOpen,
  (newValue, oldValue) => {
    if (newValue === true || oldValue === true) {
      dialog.value = newValue;
    }
  }
);
const sendSms = async () => {
  if(form.message.value === null) return showToast("Заполните поле сообщение", "warning")
  try {
    console.log(props)
    const body = {
      ids: props.markedID,
      message: form.value.message,
    };
    const res = await counterparty.sendMessage(body);
    console.log(res);
    showToast("Успешно отпрвлено", "green");
    agreementDialog.value = false;
    getDocuments({});

    clearInputs();
  } catch (error) {   
    console.error(error);
  }
};
</script>

<template>
  <div>
    <v-dialog
      persistent
      v-model="dialog"
      class="mt-2 pa-2"
    >
      <v-card
        :style="`border: 2px solid ${BASE_COLOR}`"
        min-width="650"
        class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
        rounded="xl"
      >
        <div class="d-flex justify-space-between align-center mb-2">
          <span>Сообщение</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center mt-2 me-4">
            </div>
            <v-btn
              @click="$emit('toggleIsOpen')"
              variant="text"
              title="Закрыть"
              :size="32"
              class="pt-1"
            >
              <Icons name="close" />
            </v-btn>
          </div>
        </div>
        <v-form
          class="d-flex w-100"
        >
          <v-row style="width: 150px;" class="w-150">
            <v-col class="d-flex flex-column w-150">
              <div class="d-flex justify-space-between ga-6">
                <v-textarea
                  v-model="form.message"  
                  max-length="35"
                  :color="BASE_COLOR"
                  :base-color="FIELD_COLOR"
                  rounded="lg"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Сообщение"
                  label="Текст сообщение"
                  clear-icon="close"
                  clearable
                  hide-details
                />
              </div>
            </v-col>
          </v-row>
        </v-form>
        <div style="display: grid; justify-content: end; margin: 10px;">
            <Button @click="sendSms()" name="send" />
        </div>
      </v-card>      
    </v-dialog>
  </div>
</template>

