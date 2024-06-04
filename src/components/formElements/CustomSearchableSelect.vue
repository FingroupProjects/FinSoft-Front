<script setup>
import {ref, onMounted, watch} from "vue";

const input = ref(null);
const list = ref(null);
const items = ref([
  { id: 1, name: "testAPI" },
  { id: 2, name: "getUser" },
  { id: 3, name: "postData" },
  { id: 4, name: "addPerson", description: "Add a new person to the system" }
]);
const filteredItems = ref(items.value);

const getGoods = async () => {
  try {

  } catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  input.value = document.querySelector(".dropdown-input");
  list.value = document.querySelector(".dropdown-list");

  input.value.addEventListener("focus", () => {
    list.value.style.display = "block";
  });

  input.value.addEventListener("input", () => {
    const searchText = input.value.value.toLowerCase();

    filteredItems.value = items.value.filter(item => {
      return Object.values(item).some(value =>
          (typeof value === "string" || typeof value === "number") &&
          value.toString().toLowerCase().includes(searchText)
      );
    });

    list.value.style.display = filteredItems.value.length > 0 ? "block" : "none";
  });

  document.addEventListener("click", (event) => {
    if (!input.value.contains(event.target) && !list.value.contains(event.target)) {
      list.value.style.display = "none";
    }
  });
});

const selectItem = (item) => {
  input.value.value = item.name;
  list.value.style.display = "none";

  console.log(item)
};


</script>

<template>
  <div class="dropdown">
    <input type="text" class="dropdown-input" placeholder="Search...">
    <div class="dropdown-list">
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
  border: 1px solid #274D87;
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
