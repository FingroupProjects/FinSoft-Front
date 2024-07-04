<script setup>
import { onMounted, ref } from "vue";
import programSettingsApi from "../../api/list/programSettingsApi.js";
import { FIELD_COLOR , BASE_COLOR } from "../../composables/constant/colors";
import debounce from 'lodash.debounce'
import showToast from "../../composables/toast";
import {
  editMessage
} from "../../composables/constant/buttons.js";

const loading = ref(false);
const mobile_access = ref('');
const name = ref('');
const installment = ref(false);
const sales_between_organizations = ref(false)
const backdating = ref(false);
const retail = ref(false);
const loyalty_cards = ref(false);
const initial_fee = ref('');
const backdating_amount = ref('');


const send = async () => {
  try {
    loading.value = true;
    const body = {
      mobile_access: mobile_access.value,
      name: name.value,
      installment: installment.value,
      sales_between_organizations: sales_between_organizations.value,
      backdating: backdating.value,
      retail: retail.value,
      loyalty_cards: loyalty_cards.value,
      initial_fee: initial_fee.value,
      backdating_amount: backdating_amount.value
    };
   showToast(editMessage, "green")
    console.log(body)
    await programSettingsApi.create(body);
    loading.value = false;
  } catch (e) {
    console.log(e);
  }
};

const getData = async () => {
  try {
    const { data } = await programSettingsApi.get();
    if (data){
        name.value = data.name,
        mobile_access.value = data.mobile_access,
        installment.value = data.installment,
        sales_between_organizations.value = data.sales_between_organizations,
        backdating.value = data.backdating,
        retail.value = data.retail,
        loyalty_cards.value = data.loyalty_cards,
        initial_fee.value = data.initial_fee,
        backdating_amount.value = data.backdating_amount
    }

  } catch (e) {
    console.log(e);
  }
};
const debouncedSend = debounce(() => {
  send();
}, 1000);
onMounted(async () => {
  await getData();

});


</script>

<template>
  <div>
    <v-card class="container">
      <h1 style="margin: 20px;">Настройки</h1>
      <form>
      <div class="card">
      <v-col>
        <div class="textbox">
          <v-text-field
            @keypress.enter="send()"
            label="Заголовок организации"
            :base-color="FIELD_COLOR"
            variant="outlined"
            v-model="name"
            :color="BASE_COLOR"
            rounded="lg"
            autofocus
            @input="debouncedSend"
          />
        </div>
      </v-col>

      <v-switch
      v-model="backdating"
      color="indigo"
      label="Возможности продаж в рассрочку"
      inset
      @change="send()"
    ></v-switch>
    
    <div v-if="backdating === true">
      <div class="textbox">
        <v-text-field
          v-model="initial_fee"
          label="Авансовый платеж"
          :base-color="FIELD_COLOR"
          variant="outlined"
          rounded="lg"
          @input="debouncedSend"
        ></v-text-field>
      </div>
      <v-switch
        v-model="loyalty_cards"
        label="Добавление карты"
        inset
        color="indigo"
        @change="send()"
      ></v-switch>

      <v-switch
        v-model="retail"
        label="Розничные продажи"
        inset
        color="indigo"
        @change="send()"
      ></v-switch>
    </div>
    
      <v-switch
      v-model="sales_between_organizations"
      label="Продажи между организациями"
      inset
      color="indigo"
      @change="send()"
    ></v-switch>

    <v-switch
      v-model="mobile_access"
      label="Мобильный доступ"
      inset
      color="indigo"
      @change="send()"
    ></v-switch>
   
    <v-switch
      v-model="installment"
      label="Возможность изменения информации"
      inset
      color="indigo"
      @change="send()"
    ></v-switch>
  
    <div v-if="installment" class="textbox">
      <v-text-field
        v-model="backdating_amount"
        label="Число"
        :base-color="FIELD_COLOR"
        variant="outlined"
        rounded="lg"
        @input="debouncedSend"
      ></v-text-field>
      </div>
    </div>
    </form>
  </v-card>
  </div>
</template>

<style scoped>
.container{
  margin-top: 20px;
  margin-left: 100px;
  margin-right: 100px;
}
.textbox{
  width: 400px;
}

.card{
  margin-left: 100px;
}
</style>