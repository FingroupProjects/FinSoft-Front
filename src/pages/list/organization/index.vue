<script setup>
import { ref } from "vue";
import api from "../../../api/organizations";

const dialog = ref(false);
const loading = ref(true)
const name = ref("");
const error = ref(null);
const organizations = ref([]);
const paginations = ref([])

const headers = ref([
  { title: '№', key: 'id'},
  { title: 'Наименование', key: 'name'},
  { title: '#', key: 'icons', align:'center', sortable: false},
])

const addOrganization = () => {
  api.add({ name: name.value }).then(() => {
    dialog.value = false;
    name.value = "";
    console.log("Organization added successfully!");
    fetchOrganizations();
  }).catch((err) => {
    error.value = err.response.data.message || "Произошла ошибка при добавлении организации.";
  });
};

const fetchOrganizations = async ( page, itemsPerPage, sortBy ) => {
  loading.value = true
  try {
    const { data } = await api.getAll(page, itemsPerPage, sortBy )
    paginations.value = data.result.pagination
    organizations.value = data.result.data
    console.log(data)
    loading.value = false
  } catch (e) {

  }
}
</script>

<template>
  <div>
  <div>
    <v-btn variant="text" @click="dialog = true">Добавить</v-btn>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-text>
          <v-text-field v-model="name" label="Name"></v-text-field>
        </v-card-text>
        <div v-if="error" class="error">{{ error }}</div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Закрить</v-btn>
          <v-btn @click="addOrganization">Добавить</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <v-card class="mt-4 table">
      <v-data-table-server
          :loading="loading"
          v-model:items-per-page="paginations.per_page"
          :headers="headers"
          :items-length="paginations.total || 0"
          :items="organizations"
          :item-value="headers.title"
          @update:options="fetchOrganizations"
      >
        <template v-slot:item.id="{ index }">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-slot:item.icons="{ item }">
          <v-icon @click="goToEdit(item.id)" color="orange" class="me-2">edit</v-icon>
          <v-icon @click="goToShow(item.id, item.symbol_code)" color="red" >delete</v-icon>
        </template>
      </v-data-table-server>
    </v-card>
</div>

</template>

<style scoped>
.table {
  background: white;
  padding: 5px;
  border-radius: 16px;
  max-height: 90vh;
  overflow: auto;
}
.error {
  color: red;
}
.text{
  color: red;
  margin-left: 30px;
}
</style>
