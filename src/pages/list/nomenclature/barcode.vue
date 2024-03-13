<script setup>
import { ref } from "vue";

const barcodes = ref([]);

const getBarcodes = async () => {
  // try{
  //   const { data } = await
  // }
};
</script>

<template>
  <div>
    <v-col>
      <div class="d-flex justify-space-between text-uppercase">
        <div class="d-flex align-center ga-2 pe-2 ms-4">
          <span>Номенклатура</span>
        </div>
        <v-card variant="text" min-width="500" class="d-flex align-center ga-2">
          <div class="d-flex w-100">
            <div class="d-flex ga-2 mt-2 me-3">
              <button
                style="
                  background-color: #4ecb71;
                  border-radius: 12px;
                  white-space: nowrap;
                  height: 25px;
                  font-size: 12px;
                  border: 1px solid red;
                "
              >
                <span class="px-2 py-0">создать группу</span>
              </button>
              <Icons @click="isCreate = true" name="add" />
              <Icons name="copy" />
              <Icons
                @click="compute({ page, itemsPerPage, sortBy, search })"
                name="delete"
              />
            </div>
            <div class="w-100">
              <v-text-field
                v-model="search"
                prepend-inner-icon="search"
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
          <Icons name="filter" class="mt-1" />
        </v-card>
      </div>

      <v-card class="table mt-2">
        <v-data-table-server
          style="height: 78vh"
          fixed-header
          :items="goods"
          :headers="headers"
          :loading="loading"
          items-per-page-text="Элементов на странице:"
          loading-text="Загрузка"
          no-data-text="Нет данных"
          :search="search"
          @update:options="getGoods"
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
                <span>{{ item.name }}</span>
              </td>
            </tr>
          </template>
        </v-data-table-server>
      </v-card>
      <div v-if="isCreate">
        <createUpdate @toggleDialog="isCreate = false" />
      </div>
    </v-col>
  </div>
</template>
