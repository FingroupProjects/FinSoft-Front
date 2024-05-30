<script setup>
import Button from "../../../components/button/button.vue";
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import goodsApi from "../../../api/list/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { FIELD_COLOR, BASE_COLOR, TITLE_COLOR } from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  addMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";

const route = useRoute();
const router = useRouter();

const a = ref(false);
const loading = ref(false);
const preview = ref(false);
const isCreate = ref(false);

const id = ref(null);
const image = ref(null);
const imageId = ref(null);
const imagePreview = ref(null);
const imageRef = ref(null);
const fileInput = ref(null);
const hoveredRowIndex = ref(null);

const search = ref("");

const markedID = ref([]);
const markedItem = ref([]);
const images = ref([]);
const pagination = ref([]);

const headers = ref([
  { title: "№", key: "id" },
  { title: "Наименование", key: "name" },
]);

watch(markedID, (newVal) => {
  markedItem.value = images.value.find((el) => el.id === newVal[0]);
});

watch(isCreate, (newVal) => {
  if (newVal == false) {
    setTimeout(() => {
      imagePreview.value = null;
      image.value = null;
      imageRef.value = null;
      preview.value = false;
    }, 200);
  }
});

const goToBack = () => {
  router.push({
    name: "createUpdateGood",
    params: {
      id: route.params.id,
    },
  });
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = images.value.find(
      (el) => el.id === markedID.value[0]
    );
    if (firstMarkedItem && firstMarkedItem.deleted_at) {
      if (item.deleted_at === null) {
        showToast(ErrorSelectMessage, "warning");
        return;
      }
    }
    if (firstMarkedItem && firstMarkedItem.deleted_at === null) {
      if (item.deleted_at !== null) {
        showToast(ErrorSelectMessage, "warning");
        return;
      }
    }
  }
  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    markedID.value.push(item.id);
  }
  markedItem.value = item;
};

const openInModal = (item) => {
  image.value = import.meta.env.VITE_IMG_URL + item.image;
  preview.value = true;
  isCreate.value = true;
  imageId.value = item.id;
};

const openModal = () => {
  if (images.value.length == 0) {
    a.value = true;
  }
  isCreate.value = true;
};
const onPickFile = () => {
  fileInput.value.click();
};

const selectAvatar = (event) => {
  const files = event.target.files;
  imageRef.value = files[0];
  let filename = files[0].name;
  if (filename.lastIndexOf(".") <= 0) {
    return showToast("Пожалуйста, добавьте заново!");
  }
  const fileReader = new FileReader();
  fileReader.readAsDataURL(files[0]);
  fileReader.addEventListener("load", () => {
    imagePreview.value = fileReader.result;
  });
};

const createImage = async () => {
  try {
    const formData = new FormData();
    formData.append("image", imageRef.value);
    formData.append("good_id", route.params.id);
    formData.append("is_main", a.value === true ? 1 : 0);
    console.log(a.value,'000');
    const { data } = await goodsApi.createImage(formData);
    isCreate.value = false;
    a.value = false;
    showToast(addMessage, "green");
    await getImages({});
  } catch (e) {
    console.error(e);
  }
};

const getImages = async ({ page, itemsPerPage }) => {
  try {
    loading.value = true;
    const { data } = await goodsApi.getImages(route.params.id, {
      page,
      itemsPerPage,
    });
    images.value = data.result.data;
    pagination.value = data.result.pagination;
    loading.value = false;
  } catch (e) {
    console.error(e);
  }
};

const delImg = async () => {
  try {
    if (markedItem.value) {
      imageId.value = markedItem.value.id;
    }
    const { data } = await goodsApi.deleteImage(imageId.value);
    showToast(removeMessage, "red");
    markedID.value = [];
    isCreate.value = false;
    preview.value = false;
    await getImages({ page: 1, itemsPerPage: 25 });
  } catch (e) {
    console.error(e);
  }
};

onMounted(async () => {
  markedID.value = [];
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span :style="{ color: TITLE_COLOR, fontSize: '22px' }"> Добавление фото </span>
        </div>
        <v-card variant="text" min-width="300" class="d-flex align-center ga-2">
          <div class="d-flex w-100 justify-end mb-2">
            <div class="d-flex align-end ga-2 me-3">
              <Button @click="openModal()" name="create"/>
              <Button @click="delImg()" name="delete"/>
              <Button @click="goToBack()" name="close"/>
              <!-- <Icons @click="openModal()" name="add" title="Создать" />
              <Icons @click="delImg()" name="delete" title="Удалить" /> -->
            </div>
          </div>
        </v-card>
      </div>

      <v-card class="table">
        <v-data-table-server
          style="height: calc(100vh - 140px)"
          fixed-header
          :items="images"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :search="search"
          @update:options="getImages"
          v-model:items-per-page="pagination.per_page"
          :items-length="pagination.total || 0"
          :item-value="headers.title"
          hover
          fixed-footer
          page-text="{0}-{1} от {2}"
          :items-per-page-options="[
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
          ]"
        >
          <template v-slot:loading>
            <v-skeleton-loader type="table-row@9"></v-skeleton-loader>
          </template>
          <template v-slot:item="{ item, index }">
            <tr
              @mouseenter="hoveredRowIndex = index"
              @mouseleave="hoveredRowIndex = null"
              @dblclick="openInModal(item)"
              :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
            >
              <td>
                <template
                  v-if="hoveredRowIndex === index || markedID.includes(item.id)"
                >
                  <CustomCheckbox
                    @click="lineMarking(item)"
                    :checked="markedID.includes(item.id)"
                    @change="lineMarking(item)"
                  >
                    <span>{{ item.id }}</span>
                  </CustomCheckbox>
                </template>
                <template v-else>
                  <CustomCheckbox
                    @click="lineMarking(item)"
                    :checked="markedID.includes(item.id)"
                    @change="lineMarking(item)"
                  >
                    <span>{{ item.id }}</span>
                  </CustomCheckbox>
                </template>
              </td>
              <td>
                <span>{{ item.name }}</span>
              </td>
            </tr>
          </template>
        </v-data-table-server>

        <v-dialog persistent v-model="isCreate" class="mt-2 pa-2">
          <v-card
            :style="`border: 2px solid ${BASE_COLOR}`"
            min-width="350"
            class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
            rounded="xl"
          >
            <div class="d-flex justify-space-between align-center mb-2">
              {{ preview ? "Просмотр" : "Добавление" }}
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex ga-3 align-center mt-2 me-4">
                  <Icons
                    v-if="!preview"
                    @click="createImage()"
                    name="save"
                    title="Сохранить"
                  />
                  <Icons
                    v-if="preview"
                    @click="delImg()"
                    name="delete"
                    title="Удалить"
                  />
                </div>
                <v-btn
                  @click="isCreate = false"
                  variant="text"
                  title="Закрыть"
                  :size="32"
                  class="pt-2 pl-1"
                >
                  <Icons name="close" title="Закрыть" />
                </v-btn>
              </div>
            </div>
            <form>
              <div style="width: 100%; height: 180px">
                <div
                  class="d-flex justify-center align-center py-2 w-100"
                  style="height: 180px; border-radius: 4px; border: 1px solid #3ab700;"
                  >
                  <div v-if="!preview">
                    <div v-if="imagePreview === null">
                      <v-btn style="font-size: 10px" @click="onPickFile()"
                        >Загрузить фото</v-btn
                      >
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
                      class="image"
                      :src="imagePreview"
                      width="300"
                      alt=""
                    />
                  </div>
                  <div v-else>
                    <img class="image" :src="image" alt="" width="300" />
                  </div>
                </div>
              </div>
              <div v-if="!preview" class="mt-2">
                <CustomCheckbox :checked="a" @change="a = !a"
                  >Главная
                </CustomCheckbox>
              </div>
            </form>
          </v-card>
        </v-dialog>
      </v-card>
    </v-col>
  </div>
</template>
<style scoped>
.image {
  object-fit: contain;
  max-height: 160px;
  max-width: 280px;
}
</style>
