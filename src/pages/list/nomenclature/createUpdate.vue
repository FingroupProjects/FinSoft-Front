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
const description = ref("");

const group_id = ref(null);
const imageRef = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);

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

const getGroups = async () => {
  try {
    const { data } = await goodsApi.getGroup();
    console.log(data);
  } catch (e) {
    console.log(e);
  }
};

const onPickFile = () => {
  fileInput.value.click();
};

// onMounted(() => {
//   getGroups();
// });
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
                <div
                  class="border d-flex justify-center align-center py-2"
                  style="width: 35%; height: 160px"
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
                <v-container class="pa-0 mt-3">
                  <v-textarea
                    v-model="description"
                    variant="outlined"
                    label="Описание"
                  />
                </v-container>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-dialog>
    </v-col>
  </div>
</template>
