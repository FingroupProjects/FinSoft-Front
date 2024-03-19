<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icons from "../../../composables/Icons/Icons.vue";
import barcodeApi from "../../../api/barcode";
import CustomCheckbox from "../../../components/checkbox/CustomCheckbox.vue";
import showToast from "../../../composables/toast";
import {
  ErrorSelectMessage,
  removeMessage,
  restoreMessage,
  selectOneItemMessage,
  addMessage,
  editMessage,
} from "../../../composables/constant/buttons.js";

const router = useRouter();
const route = useRoute();
const props = defineProps(["isCreated"]);

const pagination = ref([]);
const barcodes = ref([]);
const markedID = ref([]);
const markedItem = ref([]);

const isEdit = ref(false);
const addBarcode = ref(false);
const loading = ref(true);

const hoveredRowIndex = ref(null);

const id = ref(null);
const barcodeId = ref(null);

const barcode = ref("");

const rules = {
  required: (v) => !!v,
};

const editItem = (id) => {
  isEdit.value = true;
  barcodeId.value = id;
  getBarcodeById(id, { page: 1, itemsPerPage: 100 });
};

const getBarcodeById = async (id, { page, itemsPerPage, sortBy, search }) => {
  try {
    const { data } = await barcodeApi.getBarcodeById(
      id,
      { page, itemsPerPage, sortBy },
      search
    );
    barcode.value = data.result.barcode;
    isEdit.value = true;
    addBarcode.value = true;
  } catch (e) {
    console.log(e);
  }
};

const createBarcode = async () => {
  try {
    const body = {
      good_id: id.value,
      barcode: barcode.value,
    };
    loading.value = true;
    await barcodeApi.create(body);
    showToast(addMessage);
    addBarcode.value = false;
    loading.value = false;
    await getBarcodes({ page: 1, itemsPerPage: 100 });
  } catch (e) {
    console.log(e);
  }
};

const updateBarcode = async () => {
  try {
    const body = {
      good_id: id.value,
      barcode: barcode.value,
    };
    const res = await barcodeApi.update(barcodeId.value, body);
    showToast(editMessage, "green");
    addBarcode.value = false;
    await getBarcodes({ page: 1, itemsPerPage: 100 });
  } catch (e) {
    console.log(e);
  }
};
const getBarcodes = async ({ page, itemsPerPage, sortBy, search }) => {
  if (id.value == 0) {
    loading.value = false;
    return;
  }
  try {
    loading.value = true;
    const { data } = await barcodeApi.getById(
      route.params.id,
      { page, itemsPerPage, sortBy },
      search
    );
    loading.value = false;
    barcodes.value = data.result.data;
  } catch (e) {
    console.log(e);
  }
};

const headers = ref([
  { title: "№", key: "id", align: "start" },
  { title: "Наименование", key: "name" },
]);

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = barcodes.value.find(
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

const del = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value,
  };
  try {
    const { status } = await barcodeApi.massDeletion(body);
    if (status === 200) {
      showToast(removeMessage, "red");
      await getBarcodes({ page, itemsPerPage, sortBy }, search);
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const restore = async ({ page, itemsPerPage, sortBy }) => {
  try {
    const body = {
      ids: markedID.value,
    };
    const { status } = await barcodeApi.massRestore(body);
    if (status === 200) {
      showToast(restoreMessage, "green");
      await getBarcodes({ page, itemsPerPage, sortBy });
      markedID.value = [];
    }
  } catch (e) {
    console.log(e);
  }
};

const compute = ({ page, itemsPerPage, sortBy, search }) => {
  if (markedItem.value.deleted_at) {
    return restore({ page, itemsPerPage, sortBy });
  } else {
    return del({ page, itemsPerPage, sortBy, search });
  }
};

onMounted(async () => {
  id.value = route.params.id;
});
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase ga-10">
        <div class="d-flex align-center ga-2 pe-2 w-75 text-sm-body-1">
          <span>Штрих - код</span>
        </div>
        <v-card variant="text" class="d-flex align-center ga-2">
          <div class="d-flex ga-2 mt-2 me-3">
            <Icons @click="addBarcode = true" name="add" />
            <Icons
              @click="compute({ page, itemsPerPage, sortBy })"
              name="delete"
            />
          </div>
        </v-card>
      </div>

      <v-card class="table mt-2">
        <v-data-table-server
          style="height: 30vh"
          fixed-header
          :items="barcodes"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          @update:options="getBarcodes"
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
          <template v-slot:item="{ item, index }">
            <tr
              @mouseenter="hoveredRowIndex = index"
              @mouseleave="hoveredRowIndex = null"
              @click="lineMarking(item)"
              @dblclick="editItem(item.id)"
              :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
            >
              <td>
                <template
                  v-if="hoveredRowIndex === index || markedID.includes(item.id)"
                >
                  <CustomCheckbox
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
                <span>{{ item.barcode }}</span>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
    </v-col>

    <!-- Creata barcode -->
    <v-dialog v-model="addBarcode" max-width="400px">
      <v-card
        style="border: 2px solid #3ab700"
        min-width="350"
        class="d-flex pa-5 pt-2 justify-center flex-column mx-auto my-0"
        rounded="xl"
      >
        <div class="d-flex justify-space-between align-center mb-2">
          <span>{{ isEdit ? "Изменение" : "Добавление" }}</span>
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center mt-2 me-4">
              <Icons
                @click="isEdit ? updateBarcode() : createBarcode()"
                name="save"
              />
            </div>
            <v-btn
              @click="dialog = false"
              variant="text"
              :size="32"
              class="pt-2 pl-1"
            >
              <Icons @click="addBarcode = false" name="close" />
            </v-btn>
          </div>
        </div>
        <v-form class="d-flex w-100">
          <v-row class="w-100">
            <v-col class="d-flex flex-column w-100"
              ><v-text-field
                v-model="barcode"
                :rules="[rules.required]"
                color="green"
                rounded="md"
                variant="outlined"
                class="w-auto text-sm-body-1"
                density="compact"
                placeholder="Штрих-код"
                label="Наименование"
                clear-icon="close"
                clearable
                hide-details
            /></v-col> </v-row
        ></v-form>
      </v-card>
    </v-dialog>
  </div>
</template>
