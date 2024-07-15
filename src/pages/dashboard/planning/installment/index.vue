<script setup>
import {copyMessage, ErrorSelectMessage, restoreMessage, selectOneItemMessage, warningMessage, } from "../../../../composables/constant/buttons.js";
import CustomFilterAutocomplete from "../../../../components/formElements/CustomFilterAutocomplete.vue";
import { BASE_COLOR, FIELD_OF_SEARCH, TITLE_COLOR } from "../../../../composables/constant/colors.js";
import CustomFilterTextField from "../../../../components/formElements/CustomFilterTextField.vue";
import getDateTimeInShow from "../../../../composables/date/getDateTimeInShow.js";
import CustomCheckbox from "../../../../components/checkbox/CustomCheckbox.vue";
import { useModalCreateBased } from "../../../../store/modalCreateBased.js";
import { useFilterCanvasVisible } from "../../../../store/canvasVisible.js";
import FilterCanvas from "../../../../components/canvas/filterCanvas.vue";
import plan from "../../../../api/plans/installment.js"
import organizationApi from "../../../../api/list/organizations";
import showToast from "../../../../composables/toast/index.js";
import Button from "../../../../components/button/button.vue";
import Icons from "../../../../composables/Icons/Icons.vue";
import user from "../../../../api/list/user.js";
import { onMounted, ref, watch } from "vue";
import debounce from "lodash.debounce";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import getListColor from "../../../../composables/displayed/getListColor.js";
import getListStatus from "../../../../composables/displayed/getListStatus.js";

const { t } = useI18n({ useScope: "global" });

const router = useRouter();

const loading = ref(true);
const filterModal = ref(false);
const hoveredRowIndex = ref(null);

const plans = ref([])
const markedID = ref([]);
const markedItem = ref([]);
const search = ref("");
const debounceSearch = ref("");
const paginations = ref([]);
const counterFilter = ref(0);

const organizations = ref([]);
const authors = ref([]);
const modalCreateBased = useModalCreateBased();

const filterForm = ref({
  author_id: null,
  organization_id: null,
  year: null
})

const headers = ref([
  { title: "Дата", key: "date" },
  { title: "Организация", key: "organization" },
  { title: "Год", key: "year" },
  {title: "Статус", key: "deleted_at"}
]);


const getPlan = async({
  page,
  itemsPerPage,
  sortBy,
  search
}= {}) => {
  counterFilter.value = 0;
  countFilter();
  filterModal.value = false;
  loading.value = false;
  try {
    const { data } = await plan.get(
        {page, itemsPerPage, sortBy},
        search,
        filterForm.value
    );
    paginations.value = data.result.pagination;
    plans.value = data.result.data
    loading.value = false;
    console.log()
  } catch (error) {
    console.log(error)
  }
}

const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "planningInstallmentCreate" }),
  },
  {
    name: "createBasedOn",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }
      if (markedItem.value.active === false) {
        return showToast(documentAprove, "warning");
      }

      modalCreateBased.isModal();
    },
  },
  {
    name: "copy",
    function: async () => {
      if (markedID.value.length !== 1) {
        return showToast(selectOneItemMessage, "warning");
      }

      try {
        const res = await copyDocument.copy(markedID.value[0]);
        if (res.status === 200) {
          showToast(copyMessage);
          window.open(`/procurementOfGoods/${res.data.result.id}`, "_blank");
        }
      } catch (e) {
        console.error(e);
      }
    },
  },
  {
    name: "delete",
    function: () => {
      compute({ page: 1, itemsPerPage: 25 });
    },
  },
]);
const massDel = async ({ page, itemsPerPage, sortBy, search }) => {
  const body = {
    ids: markedID.value,
  };
  try {
    const {status} = await plan.remove(body);
    if(status === 200) {
      showToast("Успешно удалено!", "red");
      await getPlan({page, itemsPerPage, sortBy, search})
      markedID.value = [];
    }
  }catch (e) {
    console.log(e)
  }
}

const massRestore = async ({page, itemsPerPage, sortBy}) => {
  try {
    const body = {
      ids: markedID.value,
    };
    const {status} = await plan.restore(body)
    if(status === 200) {
      showToast(restoreMessage);
      await getPlan({page, itemsPerPage, sortBy})
      markedID.value = [];
    }
  }catch (e) {
    console.log(e)
  }
}

const compute = () => {
  if (markedID.value.length === 0) return showToast(warningMessage, "warning");

  if (markedItem.value?.deleted_at) {
    return massRestore({});
  } else {
    return massDel({});
  }
};

const lineMarking = (item) => {
  if (markedID.value.length > 0) {
    const firstMarkedItem = plans.value.find(
        (el) => el.id === markedID.value[0]
    );
    if (firstMarkedItem &&
        firstMarkedItem.deleted_at &&
        item.deleted_at === null
    ) {
      showToast(ErrorSelectMessage, "warning");
      return;
    }
    if (firstMarkedItem &&
        firstMarkedItem.deleted_at === null &&
        item.deleted_at !== null
    ) {
      showToast(ErrorSelectMessage, "warning");
      return;
    }
  }

  const index = markedID.value.indexOf(item.id);
  if (index !== -1) {
    markedID.value.splice(index, 1);
  } else {
    if (item.id !== null) {
      markedID.value.push(item.id);
    }
  }
  markedItem.value = item;
};

const getOrganizations = async () => {
  const { data } = await organizationApi.get({
    page: 1,
    itemsPerPage: 10000,
    sortBy: "name"
  });
  organizations.value = data.result.data
};

const getAuthors = async () => {
  const { data } = await user.getAuthors()
  authors.value = data.result.data
};

const countFilter = () =>{
  for (const key in filterForm.value) {
    if (filterForm.value[key] !== null) {
      counterFilter.value++;
    }
  }
}
const cleanFilterForm = () => {
  filterForm.value = {}
}
const closeFilterModal = async () => {
  filterModal.value = false;
  cleanFilterForm();
  await getPlan();
  useFilterCanvasVisible().closeFilterCanvas();
};

onMounted(()=>{
  getOrganizations()
  getAuthors()
})

</script>

<template>
  <div class="pa-4">
    <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж в рассрочку (товар)</span>
      </div>
      <div class="d-flex justify-end ga-2">
        <div class="d-flex w-100 justify-end mb-3">
          <div class="d-flex ga-2 position-relative">
            <Button
                v-for="(button, idx) in headerButtons"
                :name="button.name"
                :key="idx"
                @click="button.function"
            />
          </div>
        </div>
        <div class="custom_search">
          <v-text-field
              style="width: 190px"
              v-model="search"
              prepend-inner-icon="search"
              density="compact"
              label="Поиск..."
              variant="outlined"
              :color="BASE_COLOR"
              rounded="lg"
              :base-color="FIELD_OF_SEARCH"
              clear-icon="close"
              hide-details
              single-line
              :append-inner-icon="search ? 'close' : ''"
              @click:append-inner="search = ''"
              flat
          />
        </div>
        <div class="mt-2 filterElement">
          <Icons
              name="filter"
              title="Фильтр"
              @click="useFilterCanvasVisible().toggleFilterCanvas()"
          />
          <span v-if="counterFilter !== 0" class="countFilter">5</span>
        </div>
      </div>
    </div>
    <v-card class="table calcWidth">
      <v-data-table-server
          style="height: calc(100vh - 150px)"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          v-model:items-per-page="paginations.per_page"
          :loading="loading"
          :headers="headers"
          :items-length="paginations.total || 0"
          :items="plans"
          :item-value="headers.title"
          :search="debounceSearch"
          v-model="markedID"
          @update:options="getPlan"
          page-text="{0}-{1} от {2}"
          :items-per-page-options="[
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
          show-select
          fixed-header
          hover
      >
        <template v-slot:item="{ item, index }">
          <tr
              @mouseenter="hoveredRowIndex = index"
              @mouseleave="hoveredRowIndex = null"
              @dblclick="show(router.push({name:'planningInstallmentShow', params:{id:item.id}}))"
              :class="{ 'bg-grey-lighten-2': markedID.includes(item.id) }"
              style="font-size: 12px"
          >
            <td>
              <CustomCheckbox
                  v-model="markedID"
                  :checked="markedID.includes(item.id)"
                  @change="lineMarking(item)"
              >
              </CustomCheckbox>
            </td>
            <td>{{ getDateTimeInShow(item.created_at) }}</td>

            <td>{{ item.organization_id.name }}</td>
            <td>{{ item.year}}</td>
            <td>
              <v-chip
                  style="height: 50px !important; max-width: 200px"
                  class="d-flex justify-center"
                  :color="getListColor(item.deleted_at)"
              >
                <span class="padding: 5px;">{{
                    getListStatus(item.deleted_at)
                  }}</span>
              </v-chip>
            </td>
          </tr>
        </template>
      </v-data-table-server>
    </v-card>
    <filter-canvas>
      <div class="d-flex flex-column ga-2 w-100">
        <custom-filter-autocomplete
            label="Автор"
            type="text"
            class="date"
            min-width="106"
            clearable
            :items="authors"
            v-model="filterForm.author_id"
        />
        <custom-filter-autocomplete
            min-width="106"
            clearable
            :label="t('headers.organization')"
            :items="organizations"
            v-model="filterForm.organization_id"
        />
        <custom-filter-text-field
            min-width="106"
            clearable
            type="number"
            :label="t('headers.year')"
            v-model="filterForm.year"
        />

      </div>
      <div class="d-flex justify-end">
        <div class="d-flex ga-2" style="margin-right: -6%">
          <v-btn tabindex="-1" color="red" class="btn" @click="closeFilterModal"
          >{{ $t('buttonGoods.reset') }}</v-btn
          >
          <v-btn
              tabindex="-1"
              :color="BASE_COLOR"
              class="btn"
              @click="
              () => {
                getPlan();
                useFilterCanvasVisible().closeFilterCanvas();
              }
            "
          >{{ $t('buttonGoods.apply') }}</v-btn
          >
        </div>
      </div>
    </filter-canvas>
  </div>
</template>

<style scoped>

</style>