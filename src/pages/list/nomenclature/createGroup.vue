<script setup>
import { ref, defineEmits, onMounted, watch } from "vue";
import groupApi from "../../../api/goodGroup";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { addMessage } from "../../../composables/constant/buttons";

const emit = defineEmits();
const props = defineProps([
  "createGroupOnBase",
  "groupData",
  "isFilter",
  "filterForm",
]);

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
    if (is_good.value === false && is_service.value === false) {
      showToast("Выберите тип группы", "warning");
      return;
    }
    await groupApi.create(body);
    showToast(addMessage, "green");
    emit("toggleDialog");
  } catch (e) {
    console.log(e);
  } finally {
    isValid.value = false;
  }
};

const filter = async () => {
  try {
    const filterData = {
      name: name.value,
      is_good: is_good.value,
      is_service: is_service.value,
    };
    emit("toggleDialog");
    emit("filter", filterData);
  } catch (e) {
    console.log(e);
  }
};

watch(
  () => dialog.value,
  (newValue) => {
    if (newValue === false) {
      emit("toggleDialog");
      name.value = "";
      is_good.value = false;
      is_service.value = false;
    }
  }
);

onMounted(() => {
  if (props.createGroupOnBase) {
    name.value = props.groupData.name;
    is_good.value = props.groupData.is_good;
    is_service.value = props.groupData.is_service;
  }
  if (
    props.filterForm &&
    props.filterForm.name !== null &&
    props.filterForm.is_good !== null &&
    props.filterForm.is_service !== null
  ) {
    name.value = props.filterForm.name;
    is_good.value = props.filterForm.is_good;
    is_service.value = props.filterForm.is_service;
  }
});

const rules = {
  required: (v) => !!v,
};
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
            <span>{{ isFilter ? "Фильтр" : "Создать группу" }}</span>
            <div
              v-if="!isFilter"
              class="d-flex align-center justify-space-between"
            >
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <!-- <Icons name="delete" /> -->
                <Icons
                  @click="isFilter ? filter() : createGroup()"
                  name="save"
                  title="Сохранить"
                />
              </div>
              <v-btn
                @click="$emit('toggleDialog')"
                variant="text"
                title="Закрыть"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons name="close" title="Закрыть" />
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
                  clearable
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
                <div class="d-flex justify-end ga-2 mt-2">
                  <v-btn color="red" class="btn">сбросить</v-btn>
                  <v-btn color="green" class="btn">применить</v-btn>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </div>
</template>
<style>
.btn {
  font-size: 10px;
}
</style>
