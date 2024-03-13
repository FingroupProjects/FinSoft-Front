<script setup>
import { ref, defineEmits, onMounted } from "vue";
import goodsApi from "../../../api/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { addMessage } from "../../../composables/constant/buttons";
import unitsApi from "../../../api/units";

const emit = defineEmits();

const dialog = ref(true);
const isValid = ref(false);
const is_good = ref(false);
const is_service = ref(false);

const name = ref("");

const createGroup = async () => {
  try {
    isValid.value = true;
    const body = {
      name: name.value,
      is_good: is_good.value,
      is_service: is_service.value,
    };
    if (name.value.length === 0) {
      showToast("Поле Наименование не может быть пустым", "warning");
      return;
    }
    await goodsApi.group(body);
    showToast(addMessage, "green");
    emit("toggleDialog");
  } catch (e) {
    console.log(e);
  } finally {
    isValid.value = false;
  }
};

const getUnits = async () => {
  try {
    const res = await unitsApi.get();
    console.log(res);
  } catch (e) {
    console.log(e);
  }
};

const rules = {
  required: (v) => !!v,
};

onMounted(async () => {
  await getUnits();
});
</script>
<template>
  <div>
    <v-col>
      <v-dialog v-model="dialog" class="mt-2 pa-2">
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
                <!-- <Icons name="delete" /> -->
                <Icons @click="createGroup()" name="save" />
              </div>
              <v-btn
                @click="$emit('toggleDialog')"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
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
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Наименование"
                  label="Наименование"
                  clear-icon="close"
                  :append-inner-icon="name.length > 1 ? 'close' : ''"
                  @click:append-inner="name = ''"
                  hide-details
                />
                <div class="d-flex justify-space-around">
                  <CustomCheckbox
                    @change="is_good = !is_good"
                    :checked="is_good"
                  >
                    Товар
                  </CustomCheckbox>
                  <CustomCheckbox
                    @change="is_service = !is_service"
                    :checked="is_service"
                  >
                    Услуги
                  </CustomCheckbox>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </div>
</template>
