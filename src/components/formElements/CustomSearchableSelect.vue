<script setup>
import { ref, onMounted, watch } from "vue";
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  items: {
    type: Array,
    required: true
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
      const selectedItem = props.items.find(item => item.id === newValue);
      if (selectedItem) {
        displayValue.value = selectedItem.name;
      } else {
        displayValue.value = '';
      }
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
  emit('update:modelValue', item.id);
  list.value.style.display = "none";
  displayValue.value = item.name;
};
</script>

<template>
  <div class="dropdown w-100" @click.stop>
    <input type="text" style="width: 100%;" class="dropdown-input" :value="displayValue"
           @input="onInput" placeholder="Поиск..." @focus="onFocus" ref="input"/>
    <div class="dropdown-list" ref="list">
      <div
          v-for="item in filteredItems"
          :key="item.id"
          class="dropdown-item"
          @click="selectItem(item)"
      >
        {{ item.name }}
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
  width: 300px;
  border: 1px solid rgba(39, 77, 135, 0.5);
  border-radius: 10px;
}

.dropdown-input:focus {
  outline: none;
}

.dropdown-list {
  background: white;
  position: absolute;
  z-index: 99;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  display: none;
}

.dropdown-item {
  padding: 8px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f0f0f0;
}
</style>
