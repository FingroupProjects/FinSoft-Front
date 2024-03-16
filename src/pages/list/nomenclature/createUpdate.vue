<script setup>
import { onMounted, ref } from "vue";
import groupApi from "../../../api/goodGroup";
import goodsApi from "../../../api/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import unitsApi from "../../../api/units";
import barcode from "./barcode.vue";
import storageApi from "../../../api/storage";
import { useRoute, useRouter } from "vue-router";
import { addMessage } from "../../../composables/constant/buttons";

const route = useRoute();
const router = useRouter();

const editGoodsDialog = ref(false);
const isValid = ref(false);
const dialog = ref(true);

const name = ref("");
const vendor_code = ref("");
const description = ref("");
const main_image = ref("");

const id = ref(null);
const storage_id = ref(null);
const category_id = ref(null);
const unit_id = ref(null);
const good_group_id = ref(null);
const imageRef = ref(null);
const imagePreview = ref(null);
const fileInput = ref(null);

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

const getGoodByid = async () => {
  if (id.value !== 0) {
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
      (main_image.value = good.main_image);
    (add_images.value = good.add_images),
      (good_group_id.value = good.good_group_id),
      console.log(data);
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
  try {
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
    appendIfNotNull("main_image", main_image.value);
    appendIfNotNull("add_images", add_images.value);
    appendIfNotNull("good_group_id", good_group_id.value);

    console.log(...formData.entries());

    const res = await goodsApi.update(id.value, formData);
    console.log(res);
  } catch (e) {
    console.log(e);
  }
};

const createGood = async () => {
  try {
    const body = {
      name: name.value,
      vendor_code: vendor_code.value,
      description: description.value,
      category_id: 1,
      unit_id: unit_id.value,
      storage_id: storage_id.value,
      main_image: (main_image.value = imagePreview.value), // main_image.value,
      add_images: add_images.value,
      good_group_id: good_group_id.value,
    };
    const res = await goodsApi.create(body);
    router.push("/list/nomenclatureGroup");
    showToast(addMessage);
  } catch (e) {
    console.log(e);
  }
};
const onPickFile = () => {
  fileInput.value.click();
};

onMounted(async () => {
  id.value = route.params.id;
  getGoodByid();
  getUnits();
  getStorage({ page: 1, itemsPerPage: 1000 });
  getGroups({ page: 1, itemsPerPage: 1000 });
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
            @click="$router.push('/list/nomenclatureGroup')"
            class="pa-1 bg-green rounded-circle d-inline-block mr-4"
          >
            <v-icon icon="keyboard_backspace" size="x-small" />
          </div>
          <span>{{ id === 0 ? "Изменение" : "Добавление" }}</span>
        </div>
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex ga-3 align-center mt-2 me-4">
            <Icons
              @click="id !== 0 ? updateGood() : createGood()"
              name="save"
            />
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
              <div class="d-flex justify-space-between ga-3">
                <div style="width: 40%; height: 180px">
                  <div
                    class="d-flex justify-center align-center py-2 w-100"
                    style="
                      height: 160px;
                      border-radius: 4px;
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
                  <div class="d-flex justify-center ga-4">
                    <span>Фото 1</span>
                    <span>Фото 2</span>
                    <span>Фото 3</span>
                  </div>
                </div>
                <div class="d-flex flex-column w-75 ga-3">
                  <v-select
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
              <div style="border: 1px solid #3ab700; border-radius: 8px">
                <barcode />
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
</style>
