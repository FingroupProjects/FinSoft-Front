<script setup>
import axios from 'axios'
import {onMounted, ref} from "vue";
let currencyArray = ref([]);

</script>

<template>
 <div class="d-flex px-10 mt-10 flex-column w-100">


   <div class="w-100 align-center mx-auto rounded-xl" >
     <v-form v-model="valid">
       <v-container>
         <v-row>
           <v-col
               cols="12"
               md="4"
           >
             <v-text-field
                 v-model="firstname"
                 :rules="nameRules"
                 :counter="10"
                 label="First name"
                 required
                 hide-details
             ></v-text-field>
           </v-col>

           <v-col
               cols="12"
               md="4"
           >
             <v-text-field
                 v-model="lastname"
                 :rules="nameRules"
                 :counter="10"
                 label="Last name"
                 hide-details
                 required
             ></v-text-field>
           </v-col>

           <v-col
               cols="12"
               md="4"
           >
             <v-text-field
                 v-model="email"
                 :rules="emailRules"
                 label="E-mail"
                 hide-details
                 required
             ></v-text-field>
           </v-col>
         </v-row>
       </v-container>
     </v-form>
   </div>
 </div>
</template>

<style scoped>

</style>