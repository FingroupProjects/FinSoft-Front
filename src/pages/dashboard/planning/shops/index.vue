<script setup>
import { approveDocument, copyMessage, ErrorSelectMessage, removeMessage, restoreMessage, selectOneItemMessage, warningMessage, documentAprove} from "../../../../composables/constant/buttons.js";
import CustomFilterAutocomplete from "../../../../components/formElements/CustomFilterAutocomplete.vue";
import { BASE_COLOR, FIELD_OF_SEARCH, TITLE_COLOR } from "../../../../composables/constant/colors.js";
import CustomFilterTextField from "../../../../components/formElements/CustomFilterTextField.vue";
import { markedForDeletion, statusOptions } from "../../../../composables/constant/items.js"
import getDateTimeInShow from "../../../../composables/date/getDateTimeInShow.js";
import CustomCheckbox from "../../../../components/checkbox/CustomCheckbox.vue";
import { useModalCreateBased } from "../../../../store/modalCreateBased.js";
import { useFilterCanvasVisible } from "../../../../store/canvasVisible.js";
import FilterCanvas from "../../../../components/canvas/filterCanvas.vue";
import getStatus from "../../../../composables/displayed/getStatus.js";
import getColor from "../../../../composables/displayed/getColor.js";
import showToast from "../../../../composables/toast/index.js";
import Button from "../../../../components/button/button.vue";
import Icons from "../../../../composables/Icons/Icons.vue";
import { onMounted, ref, watch } from "vue";
import debounce from "lodash.debounce";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
const router = useRouter();

const headerButtons = ref([
  {
    name: "create",
    function: () => router.push({ name: "planningShopsCreate" }),
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
      compute();
    },
  },
]); 



</script>

<template>
    <div class="pa-4">
        <div class="d-flex justify-space-between calcWidth">
      <div class="d-flex align-center ga-2 pe-2 ms-4">
        <span :style="{ color: TITLE_COLOR, fontSize: '22px' }">План продаж (магазин)</span>
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
    

</div>
</template>