<script setup>
import axios from 'axios'
import {onMounted, ref} from "vue";
let currencyArray = ref([]);
onMounted(() => {


  const token = '1|yHy58wy8PaFn8V3lr21gqD7zKKsySGVOGGmH9IfDac3d012a';
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  axios.get('http://95.142.94.22:2200/api/currency', { headers })
      .then(response => {
        currencyArray.value = response.data;
        console.log(response.data);
        console.log(currencyArray.value);
      })
      .catch(error => {
        console.error('Ошибка при получении данных:', error);
      });


})




</script>

<template>
 <div class="d-flex px-10 mt-10 flex-column w-100">

   <div class="mb-2">
     <v-btn class="d-flex rounded-lg" color="info">
       Добавить
     </v-btn>
   </div>
   <div class="w-100 align-center mx-auto rounded-xl" >
     <v-table>
       <thead>
       <tr>
         <th class="text-left">
           Наименование
         </th>
         <th class="text-left">
           Цифровой код
         </th>
         <th class="text-left">
           Символьный код
         </th>
       </tr>
       </thead>
       <tbody>
       <tr
           v-for="item in currencyArray.result"
           :key="item.id"
       >
         <td>{{ item.name }}</td>
         <td>{{ item.digital_code }}</td>
         <td>{{ item.symbol_code }}</td>
       </tr>
       </tbody>
     </v-table>
   </div>
 </div>
</template>

<style scoped>

</style>