<script setup>
import { onMounted, ref } from "vue";
import goodsApi from "../../../api/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import unitsApi from "../../../api/units";
import barcode from "./barcode.vue";

const editGoodsDialog = ref(false);
const isValid = ref(false);
const dialog = ref(true);

const name = ref("");
const articul = ref("");
const location = ref("");
const description = ref("");

const unit_id = ref(null);
const group_id = ref(null);
const imageRef = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);

const url = ref([]);
const units = ref([]);
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
  const files = event.target.files;
  imageRef.value = files[0];
  let filename = files[0].name;
  if (filename.lastIndexOf(".") <= 0) {
    return showToast("Пожалуйста, добавьте заново!");
  }
  const fileReader = new FileReader();
  fileReader.addEventListener("load", () => {
    imagePreview.value = fileReader.result;
  });
  fileReader.readAsDataURL(files[0]);
};

const getUnits = async () => {
  try {
    const { data } = await unitsApi.get();
    units.value = data.result;
  } catch (e) {
    console.log(e);
  }
};

const getGroups = async () => {
  try {
    const { data } = await goodsApi.getGroup();
    groups.value = data.result;
    console.log(data);
  } catch (e) {
    console.log(e);
  }
};

const onPickFile = () => {
  fileInput.value.click();
};

onMounted(() => {
  getUnits();
  getGroups();
});
</script>

<template>
  <div class="modal">
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
                  placeholder="Группа номенклатуры"
                  label="Группа номенклатуры"
                  :item-props="itemsProps"
                  v-model="group_id"
                  variant="outlined"
                  item-title="name"
                  item-value="id"
                  :items="groups"
                  color="green"
                  hide-details
                />
                <v-select
                  placeholder="Ед измерения"
                  :item-props="itemsProps"
                  label="Ед измерения"
                  v-model="unit_id"
                  variant="outlined"
                  item-title="name"
                  item-value="id"
                  :items="units"
                  color="green"
                  hide-details
                />
                <div class="d-flex justify-space-between">
                  <div
                    class="d-flex justify-center align-center py-2"
                    style="
                      width: 40%;
                      height: 160px;
                      border-radius: 12px;
                      border: 1px solid #3ab700;
                    "
                  >
                    <div v-if="imagePreview === null">
                      <v-btn @click="onPickFile">Загрузить фото</v-btn>
                      <input
                        accept="image/*"
                        type="file"
                        @change="selectAvatar"
                        style="display: none"
                        ref="fileInput"
                      />
                    </div>
                    <img
                      v-else
                      :src="imagePreview"
                      width="150"
                      height="150"
                      alt=""
                    />
                  </div>
                </div>
                <v-container class="pa-0 mt-3">
                  <v-textarea
                    v-model="description"
                    variant="outlined"
                    label="Описание"
                  />
                </v-container>
                <!-- <div style="border: 1px solid #3ab700; border-radius: 8px">
                  <barcode />
                </div> -->
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </div>
</template>
<style>
.modal {
  /* overflow: scroll; */
  padding: 20px 0px;
}
</style>
