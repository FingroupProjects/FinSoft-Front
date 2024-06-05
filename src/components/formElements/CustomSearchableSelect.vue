<script setup>
import { ref, onMounted, watch } from "vue";
import { defineProps, defineEmits } from "vue";
import hexToRgba from "../../composables/format/hexToRgba.js";

const props = defineProps({
  modelValue: [String, Number],
  items: {
    type: Array,
    required: true
  },
  baseColor: {
    type: String,
    required: true
  },
  itemTitle: {
    type: String,
    default: 'name',
    required: false
  },
  itemValue: {
    type: String,
    default: 'id',
    required: false
  },
  isAmount: {
    type: Boolean,
    default: false,
    required: false,
  }
});
const emit = defineEmits(['update:modelValue']);

const input = ref(null);
const list = ref(null);
const filteredItems = ref([...props.items]);
const displayValue = ref('');

watch(
    () => props.items,
    (newItems) => {
      filteredItems.value = [...newItems];
    },
    { immediate: true }
);

watch(
    () => props.modelValue,
    (newValue) => {
      setTimeout(() => {
        const selectedItem = props.items.find(item => item[props.itemValue] === newValue);
        if (selectedItem) {
          displayValue.value = selectedItem[props.itemTitle];
        } else {
          displayValue.value = '';
        }
      }, 1000)

    },
    { immediate: true }
);

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});

const onClickOutside = (event) => {
  if (!input.value.contains(event.target) && !list.value.contains(event.target)) {
    list.value.style.display = "none";
  }
};

const onFocus = () => {
  list.value.style.display = "block";
};

const onInput = () => {
  const searchText = input.value.value.toLowerCase();
  displayValue.value = input.value.value;

  filteredItems.value = props.items.filter(item => {
    return Object.values(item).some(value =>
        (typeof value === "string" || typeof value === "number") &&
        value.toString().toLowerCase().includes(searchText)
    );
  });

  list.value.style.display = filteredItems.value.length > 0 ? "block" : "none";
};

const selectItem = (item) => {
  emit('update:modelValue', item[props.itemValue]);
  list.value.style.display = "none";
  displayValue.value = item[props.itemTitle];
};
</script>

<template>
  <div class="dropdown w-100" @click.stop>
    <input
        type="text"
        :style="['width: 100%;', `outline: 1px solid ${hexToRgba(props.baseColor, 0.5)}`]"
        class="dropdown-input"
        placeholder="Поиск..."
        ref="input"
        @input="onInput"
        @focus="onFocus"
        :value="displayValue"
    />
    <div class="dropdown-list" ref="list">
      <div
          v-if="filteredItems.length !== 0"
          v-for="item in filteredItems"
          :key="item[props.itemValue]"
          class="dropdown-item"
          @click="selectItem(item)"
      >
        <span>{{ item[props.itemTitle] }}</span>
        <span v-if="props.isAmount" class="amount">Кол. {{ item['amount'] }} шт.</span>
      </div>
      <div v-else class="dropdown-item">
        Нету данных
      </div>
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
  top: 42px;
  z-index: 99;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border-top: none;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  border-radius: 4px 4px 4px 4px;
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
  transition: .4s;
}

.amount {
  font-size: 12px;
  color: #999;
}
</style>
