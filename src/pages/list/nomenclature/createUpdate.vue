<script setup>
import { onMounted, ref } from "vue";
import goodsApi from "../../../api/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";

const editGoodsDialog = ref(false);
const isValid = ref(false);
const dialog = ref(true);

const name = ref("");
const articul = ref("");

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
          min-width="650"
          class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
          rounded="xl"
        >
          <div class="d-flex justify-space-between align-center mb-2">
            <span>{{ editGoodsDialog ? "Изменение" : "Добавление" }}</span>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex ga-3 align-center mt-2 me-4">
                <Icons
                  @click="
                    editAgreementDialog
                      ? updateCpAgreement()
                      : createCpAgreement()
                  "
                  name="save"
                />
              </div>
              <v-btn
                @click="agreementDialog = false"
                variant="text"
                :size="32"
                class="pt-2 pl-1"
              >
                <Icons @click="$emit('toggleDialog')" name="close" />
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
                  hide-details
                />
                <v-text-field
                  v-model="articul"
                  :rules="isValid ? [rules.required] : []"
                  color="green"
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Артикуль"
                  label="Артикуль"
                  clear-icon="close"
                  clearable
                  hide-details
                />
                <v-select
                  variant="outlined"
                  label="Организация"
                  v-model="group_id"
                  :items="groups"
                  item-title="name"
                  item-value="id"
                  :item-props="itemsProps"
                  hide-details
                />
                <v-text-field
                  v-model="location"
                  :rules="isValid ? [rules.required] : []"
                  color="green"
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Местоположение"
                  label="Местоположение"
                  clear-icon="close"
                  clearable
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
