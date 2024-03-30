<script setup>
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import goodsApi from "../../../api/goods";
import showToast from "../../../composables/toast";
import Icons from "../../../composables/Icons/Icons.vue";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import { FIELD_COLOR } from "../../../composables/constant/colors.js";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  warningMessage,
} from "../../../composables/constant/buttons.js";

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const isCreate = ref(false);

const hoveredRowIndex = ref(null);

const search = ref("");

const markedID = ref([]);
const markedItem = ref([]);
const images = ref([]);
const pagination = ref([]);

const count = ref(0);

const filterForm = ref({
  name: null,
  vendor_code: null,
  storage_id: null,
  unit_id: null,
  good_group_id: null,
  description: null,
});

const headers = ref([{ title: "Наименование", key: "name" }]);

watch(markedID, (newVal) => {
  markedItem.value = images.value.find((el) => el.id === newVal[0]);
});

const goToCreate = () => {
  router.push({
    name: "createUpdateGood",
    params: {
      id: 0,
    },
  });
};

const goToBack = () => {
  router.go(-1);
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = goods.value.find(
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

const getImages = async ({ page, itemsPerPage, sortBy, search }) => {
  return;
  try {
    loading.value = true;
    const { data } = await goodsApi.getImages(
      route.params.id,
      { page, itemsPerPage, sortBy },
      search
    );
    images.value = data.result.data;
    pagination.value = data.result.pagination;
    loading.value = false;
  } catch (e) {
    console.log(e);
  }
};

const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value,
  };
  try {
    const { status } = await goodsApi.deleteImage(body);
    if (status === 200) {
      showToast(removeMessage, "red");
      markedID.value = [];
      await getImages({ page, itemsPerPage, sortBy }, search);
    }
  } catch (e) {
    console.log(e);
  }
};

const massRestore = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const body = {
      ids: markedID.value,
    };
    const { status } = await goodsApi.restoreImage(body);
    if (status === 200) {
      showToast(restoreMessage, "green");
      markedID.value = [];
      await getImages({ page, itemsPerPage, sortBy });
    }
  } catch (e) {
    console.log(e);
  }
};

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return massRestore({ page, itemsPerPage, sortBy });
  } else {
    return massDel({ page, itemsPerPage, sortBy, search });
  }
};

onMounted(() => {
  markedID.value = [];
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <div
            style="cursor: pointer"
            @click="goToBack()"
            class="pa-1 bg-green rounded-circle d-inline-block"
          >
            <v-icon icon="keyboard_backspace" size="x-small" />
          </div>
          <span>Фото</span>
        </div>
        <v-card variant="text" min-width="300" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex align-center ga-2 me-3">
              <Icons @click="goToCreate()" name="add" title="Создать" />
              <Icons
                @click="compute({ page, itemsPerPage, sortBy, search })"
                name="delete"
                title="Удалить"
              />
            </div>
            <div class="w-100">
              <v-text-field
                v-model="search"
                prepend-inner-icon="search"
                base-color="info"
                density="compact"
                label="Поиск..."
                variant="outlined"
                color="info"
                rounded="lg"
                clear-icon="close"
                hide-details
                single-line
                clearable
                flat
              ></v-text-field>
            </div>
          </div>
        </v-card>
      </div>

      <v-card class="table mt-2">
        <v-data-table-server
          style="height: 78vh"
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
          show-select
          v-model="markedID"
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
              @dblclick="editItem(item.id)"
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
                  <span class="d-flex align-center">
                    <Icons
                      style="margin-right: 10px; margin-top: 4px"
                      :name="item.deleted_at === null ? 'valid' : 'inValid'"
                    />
                    <span>{{ item.id }}</span>
                  </span>
                </template>
              </td>
              <td>
                <span>{{ item.name }}</span>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </v-col>
  </div>
</template>
