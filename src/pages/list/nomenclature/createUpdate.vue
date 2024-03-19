<script setup>
import { onMounted, ref, watch } from "vue";
import groupApi from "../../../api/goodGroup";
import goodsApi from "../../../api/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import unitsApi from "../../../api/units";
import barcode from "./barcode.vue";
import storageApi from "../../../api/storage";
import { useRoute, useRouter } from "vue-router";
import { add, addMessage } from "../../../composables/constant/buttons";

const route = useRoute();
const router = useRouter();

const isValid = ref(false);
const isEdit = ref(false);
const isCreated = ref(false);

const name = ref("");
const vendor_code = ref("");
const description = ref("");

const id = ref(0);
const storage_id = ref(null);
const unit_id = ref(null);
const good_group_id = ref(null);
const firstImage = ref(null);
const fileInput = ref(null);

const imageRef = ref([]);
const add_images = ref([]);
const url = ref([]);
const storages = ref([]);
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

const setImageByIndex = (index) => {
  if (add_images.value.length > 1 && add_images.value[index]) {
    const fileReader = new FileReader();
    fileReader.addEventListener("load", () => {
      firstImage.value = fileReader.result;
    });
    fileReader.readAsDataURL(add_images.value[index]);
  }
};

const selectAvatar = async (event) => {
  await Promise.all(
    (imageRef.value = []),
    (add_images.value = []),
    (firstImage.value = null)
  );
  const files = event.target.files;
  imageRef.value = files[0];
  for (let i = 0; i < files.length; i++) {
    add_images.value.push(files[i]);
    if (i > 3) {
      showToast("Максимум 4 изображений", "warning");
      return;
    }
  }
  let filename = files[0].name;
  if (filename.lastIndexOf(".") <= 0) {
    return showToast("Пожалуйста, добавьте заново!");
  }
  const fileReader = new FileReader();
  fileReader.addEventListener("load", () => {
    firstImage.value = fileReader.result;
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

const getGoodByid = async () => {
  if (id.value == 0) {
    return;
  }
  try {
    const { data } = await goodsApi.getById(id.value);
    const good = data.result;
    name.value = good.name;
    (vendor_code.value = good.vendor_code),
      (description.value = good.description),
      (unit_id.value = good.unit_id),
      (storage_id.value = good.storage_id),
      (firstImage.value = good.images[0]
        ? import.meta.env.VITE_IMG_URL + good.images[0].image
        : "data:image/png;base64,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BQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAJoNBOOglEwwAAggEYz4SgYBQMMAAIMAOrdVOIxsnZhAAAAAElFTkSuQmCC"),
      (add_images.value = good.images),
      (good_group_id.value = good.good_group_id);
  } catch (e) {
    console.log(e);
  }
};

const getStorage = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await storageApi.get(
      { page, itemsPerPage, sortBy },
      search
    );
    storages.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const getGroups = async ({ page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await groupApi.get({ page, itemsPerPage, sortBy }, search);
    groups.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const updateGood = async () => {
  if (id.value == 0) {
    return;
  }
  try {
    isValid.value = true;
    const formData = new FormData();

    function appendIfNotNull(key, value) {
      if (value !== null) {
        formData.append(key, value);
      }
    }

    appendIfNotNull("name", name.value);
    appendIfNotNull("vendor_code", vendor_code.value);
    appendIfNotNull("description", description.value);
    appendIfNotNull("unit_id", unit_id.value);
    appendIfNotNull("storage_id", storage_id.value);
    appendIfNotNull("main_image", imageRef.value);
    appendIfNotNull("add_images", add_images.value);
    appendIfNotNull("good_group_id", good_group_id.value);

    console.log(...formData.entries());

    const res = await goodsApi.update(id.value, formData);
    console.log(res);
  } catch (e) {
    console.log(e);
  } finally {
    isValid.value = false;
  }
};

const createGood = async () => {
  try {
    isValid.value = true;

    const formData = new FormData();

    function appendIfNotNull(key, value) {
      if (value !== null) {
        formData.append(key, value);
      }
    }
    const add_images_array = [...add_images.value];

    console.log(add_images_array);
    appendIfNotNull("name", name.value);
    appendIfNotNull("vendor_code", vendor_code.value);
    appendIfNotNull("description", description.value);
    appendIfNotNull("unit_id", unit_id.value);
    appendIfNotNull("storage_id", storage_id.value);
    appendIfNotNull("main_image", imageRef.value);
    appendIfNotNull("add_images[]", add_images_array);
    appendIfNotNull("good_group_id", good_group_id.value);
    console.log(typeof add_images.value);

    console.log(...formData.entries());
    const res = await goodsApi.create(formData);
    router.push("/list/nomenclatureGroup");
    showToast(addMessage);
    console.log(res, "res");
    isCreated.value = true;
  } catch (e) {
    console.log(e);
  } finally {
    isValid.value = false;
  }
};

const onPickFile = () => {
  fileInput.value.click();
};

const setImage = (item) => {
  console.log(item);
  firstImage.value = item.name;
};

const isEditGood = async () => {
  id.value = route.params.id;
  isEdit.value = id.value != 0;
};

onMounted(async () => {
  await isEditGood();
  await Promise.all([
    getGoodByid(),
    getUnits(),
    getStorage({ page: 1, itemsPerPage: 1000 }),
    getGroups({ page: 1, itemsPerPage: 1000 }),
  ]);
});
</script>

<template>
  <div class="modal">
    <v-col>
      <div
        class="d-flex justify-space-between align-center mb-2 text-uppercase ms-4"
      >
        <div>
          <div
            style="cursor: pointer"
            @click="$router.go(-1)"
            class="pa-1 bg-green rounded-circle d-inline-block mr-4"
          >
            <v-icon icon="keyboard_backspace" size="x-small" />
          </div>
          <span>{{ isEdit ? "Изменение" : "Добавление" }}</span>
        </div>
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex ga-3 align-center mt-2 me-4">
            <Icons @click="isEdit ? updateGood() : createGood()" name="save" />
          </div>
        </div>
      </div>
      <v-card
        min-width="650"
        class="d-flex pa-5 justify-center flex-column mx-auto my-0"
        rounded="xl"
      >
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
                clearablehide-details
                hide-details=""
              />
              <v-text-field
                v-model="vendor_code"
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
              <div
                :class="add_images.length > 0 ? 'mb-10' : ''"
                class="d-flex justify-space-between ga-3"
              >
                <div style="width: 40%; height: 180px">
                  <div
                    class="d-flex justify-center align-center py-2 w-100"
                    style="
                      height: 160px;
                      border-radius: 4px;
                      border: 1px solid #3ab700;
                    "
                  >
                    <div v-if="firstImage === null">
                      <v-btn @click="onPickFile">Загрузить фото</v-btn>
                      <input
                        accept="image/*"
                        type="file"
                        @change="selectAvatar"
                        style="display: none"
                        ref="fileInput"
                        multiple
                      />
                    </div>
                    <img
                      v-else
                      class="image"
                      :src="firstImage"
                      width="200"
                      height="150"
                      alt=""
                    />
                  </div>
                  <div class="d-flex justify-center ga-4">
                    <span
                      class="photo_el"
                      v-for="(img, index) in add_images"
                      :key="index"
                      @click="setImageByIndex(index)"
                    >
                      Фото {{ index + 1 }}
                    </span>
                  </div>
                  <div
                    v-if="add_images.length > 0 && isEdit"
                    class="d-flex justify-center my-1"
                  >
                    <v-btn @click="onPickFile">{{
                      isEdit && firstImage ? "Изменить фото" : "Загрузить фото"
                    }}</v-btn>
                    <input
                      accept="image/*"
                      type="file"
                      @change="selectAvatar"
                      style="display: none"
                      ref="fileInput"
                      multiple
                    />
                  </div>
                </div>
                <div class="d-flex flex-column w-75 ga-3">
                  <v-select
                    :rules="isValid ? [rules.required] : []"
                    placeholder="Местоположения"
                    label="Местоположения"
                    :item-props="itemsProps"
                    v-model="storage_id"
                    variant="outlined"
                    item-title="name"
                    item-value="id"
                    :items="storages"
                    color="green"
                    hide-details
                  />
                  <v-select
                    :rules="isValid ? [rules.required] : []"
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
                  <v-select
                    :rules="isValid ? [rules.required] : []"
                    placeholder="Группа номенклатуры"
                    label="Группа номенклатуры"
                    :item-props="itemsProps"
                    v-model="good_group_id"
                    variant="outlined"
                    item-title="name"
                    item-value="id"
                    :items="groups"
                    color="green"
                    hide-details
                  />
                </div>
              </div>
              <v-textarea
                v-model="description"
                variant="outlined"
                label="Описание"
                color="green"
              />
              <div
                v-if="isEdit"
                style="border: 1px solid #3ab700; border-radius: 8px"
              >
                <barcode :isCreated="isCreated" />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-col>
  </div>
</template>
<style>
.modal {
  padding: 20px 0px;
}
.photo_el:hover {
  color: green;
  cursor: pointer;
}
.image {
  object-fit: contain;
}
</style>
