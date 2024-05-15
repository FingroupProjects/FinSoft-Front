<template>
  <div class="w-100" style="position: fixed; top: 0; left: 0; right: 0; z-index: 1000;">
    <div >
      <v-toolbar color="#F2FAFF" style="padding: 0 150px 0 150px; box-shadow: #71717A 2px 2px 7px;" >
  
        <v-toolbar-title style="font-size: 15px; color: #71717A;">Связаться <span style="color: #000000; font-weight: bold">+992 92 992 92 92</span></v-toolbar-title>
  
        <v-spacer></v-spacer>
        
        <v-btn
          @click="$router.push('/login')"
          color="#5865F2"
          style="height: 32px;"
          :text="'Войти'"
          class="text-none"
          size="small"
          variant="flat"
          flat
        ></v-btn>
      </v-toolbar>
    </div>
    <div color="#fff">
      <v-card-text style="text-align: center; font-size: 18px; font-weight: bold;">SOHIBKOR</v-card-text>
    </div>
  </div>
</template>


<script>

</script>

<style scoped>
.tolbar {
  width: 800px;
}
</style>