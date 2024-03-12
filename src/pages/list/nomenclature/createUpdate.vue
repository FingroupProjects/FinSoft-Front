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
const location = ref("");
const group_id = ref(null);
const url = ref([]);

const groups = ref([]);

const rules = {
  required: (v) => !!v,
};

const itemsProps = (item) => {
  return {
    title: item.name,
  };
};

const selectAvatar = (event) => {
  url.value = event.target.files[0];
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
                <v-text-field
                  v-model="location"
                  :rules="isValid ? [rules.required] : []"
                  color="green"
                  rounded="md"
                  variant="outlined"
                  class="w-auto text-sm-body-1"
                  density="compact"
                  placeholder="Место расположение"
                  label="Место расположение"
                  clear-icon="close"
                  clearable
                  hide-details
                />
                <v-select
                  :item-props="itemsProps"
                  placeholder="Группа номенклатуры"
                  label="Группа номенклатуры"
                  v-model="group_id"
                  variant="outlined"
                  item-title="name"
                  item-value="id"
                  :items="groups"
                  color="green"
                  hide-details
                />
                <v-select
                  :item-props="itemsProps"
                  placeholder="Ед измерения"
                  label="Ед измерения"
                  v-model="group_id"
                  variant="outlined"
                  item-title="name"
                  item-value="id"
                  :items="groups"
                  color="green"
                  hide-details
                />
                <div>
                  <v-text-field
                    @change="selectAvatar"
                    variant="outlined"
                    color="green"
                    type="file"
                    rounded="md"
                    class="w-auto text-sm-body-1 mt-10"
                    density="compact"
                  />
                  <img :src="url.name" />
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </div>
</template>
