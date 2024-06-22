<script setup>
import {defineEmits, defineProps, onMounted, ref, watch} from "vue";
import hexToRgba from "../../composables/format/hexToRgba.js";
import goodApi from "../../api/list/goods.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n({ useScope: "global" });
const props = defineProps({
  modelValue: [String, Number],
  items: {
    type: Array,
    required: true,
  },
  organization: {
    required: false,
  },
  storage: {
    required: false,
  },
  baseColor: {
    type: String,
    required: true,
  },
  itemTitle: {
    type: String,
    default: "name",
    required: false,
  },
  itemValue: {
    type: String,
    default: "id",
    required: false,
  },
  isAmount: {
    type: Boolean,
    default: false,
    required: false,
  },
});
const emit = defineEmits(["update:modelValue"]);
const isOpen = ref(false);
const select = ref(null);
const input = ref(null);
const list = ref(null);
const filteredItems = ref([...props.items]);
const displayValue = ref("");

watch(
    () => props.items,
    (newItems) => {
      filteredItems.value = [...newItems]
    },
    {immediate: true}
);

watch(
    () => props.modelValue,
    (newValue) => {
      setTimeout(() => {
        const selectedItem = props.items.find(
            (item) => item[props.itemValue] === newValue
        );
        if (selectedItem) {
          displayValue.value = selectedItem[props.itemTitle];
        } else {
          displayValue.value = "";
        }
      }, 1000);
    },
    {immediate: true}
);

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

const onClickOutside = event => {
  if (
      !input.value?.contains(event.target) &&
      !list.value?.contains(event.target)
  ) {
    if (list.value) { // Проверка на null перед обращением к свойству
      list.value.style.display = "none";
    }
    isOpen.value = false;
  }
};


const onFocus = () => {
  isOpen.value = true;
  list.value.style.display = "block";
};

const search = async (event) => {
  const {
    target: {value},
  } = event

  displayValue.value = event.target.value
  await getGood(value);
}

const getGood = async (good) => {
  let filterData = {}

  if (props.storage !== null && props.organization !== null) {
    filterData = {
      storage_id: typeof props.storage === "object" ? props.storage.id : props.storage,
      organization_id: typeof props.organization === "object" ? props.organization.id : props.organization,
    }
  }

  try {
    const {
      data: {
        result: {data},
      },
    } = await goodApi.getGoodBySearch(good, filterData);
    filteredItems.value = data;
    console.log(data)
  } catch (e) {
    console.error(e);
  }
}

const selectItem = (item) => {
  emit("update:modelValue", item[props.itemValue]);
  list.value.style.display = "none";
  displayValue.value = item[props.itemTitle];
  isOpen.value = false;
};
</script>

<template>
  <div style="top: -24px" class="dropdown w-100" @click.stop>
    <div class="position-relative" @click="onFocus">
      <input
        type="text"
        :style="[
          'width: 100%;',
          `outline: 1px solid ${hexToRgba(props.baseColor, 0.5)}`,
        ]"
        class="dropdown-input position-absolute"
        :placeholder="t('searchableSelect')"
        ref="input"
        @input="search($event)"
        :value="displayValue"
      />
      <span v-if="baseColor === '#274D87'" class="arrow">
        <i
            :style="['top: -5px; color: rgba(125, 148, 183)', isOpen ? 'transform: rotate(180deg)' : '']"
            class="material-icons v-icon notranslate v-icon--size-default v-icon--clickable v-autocomplete__menu-icon"
            role="button"
        >
          arrow_drop_down
        </i>
      </span>
    </div>
    <div class="dropdown-list" ref="list">
      <div v-if="filteredItems.length !== 0">
        <div
            v-for="item in filteredItems"
            :key="item[props.itemValue]"
            class="dropdown-item"
            @click="selectItem(item)"
        >
          <span>{{ item[props.itemTitle] }}</span>
          <span v-if="props.isAmount" class="amount"
          >Кол. {{ item["amount"] }} шт.</span
          >
        </div>
      </div>
      <div v-else class="dropdown-item">Нету данных</div>
    </div>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-input {
  padding: 7px 7px 7px 12px;
  border-radius: 10px;
}

.dropdown-input:focus {
  outline: 1px solid #305895;
}

.dropdown-list {
  background: white;
  position: absolute;
  top: 40px;
  z-index: 99;
  width: 100%;
  padding: 8px 0;
  max-height: 200px;
  overflow-y: auto;
  border-top: none;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  border-radius: 12px;
  display: none;
}

.dropdown-item {
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #e5e9f0;
  transition: 0.4s;
}

.amount {
  font-size: 12px;
  color: #999;
}

.arrow {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
