<script setup>
import {useFilterCanvasVisible} from "../../store/canvasVisible.js";
const canvasVisible = useFilterCanvasVisible()

</script>

<template>
    <div :class="['cartOffcanvas', 'offcanvas-end', { show: canvasVisible.isFilterCanvasVisible }]" tabindex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
      <div class="offcanvas-header">
        <h3 class="offcanvas-title" id="cartOffcanvasLabel">Фильтр</h3>
        <i class="bi bi-x text-h4 cursor-pointer" @click="canvasVisible.closeFilterCanvas"></i>
      </div>
      <div class="offcanvas-body" >
        <v-form tabindex="-1" style="position: absolute" class="d-flex w-100">
          <v-row class="w-100">
            <v-col style="max-width: calc(100% - 65px)" class="d-flex flex-column w-100 ga-4">
              <slot></slot>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </div>
</template>

<style scoped>
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css");

button {
  border: none;
  cursor: pointer;
  border-radius: 30px;
  padding: 30px;
}

i {
  font-size: 60px;
}

button:hover{
  background-color: #ccc;
}

.cartOffcanvas {
  position: absolute;
  top: 0;
  right: -100%;
  width: 35%;
  border-radius: 20px 0 0 20px;
  background-color: white;
  height: 100%;
  transition: right 0.3s ease;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cartOffcanvas.show {
  right: 0;
}

.offcanvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.offcanvas-title {
  font-weight: bold;
  font-size: 20px;
  flex: 1;
}

.offcanvas-body {
  max-width: 220px !important;
  width: 105%;
  padding: 20px;
}

.cart-empty {
  color: var(--color-error);
  font-weight: 600;
  font-size: 18px;
}

#cartCloseOffcanvas {
  cursor: pointer;
  font-size: 36px;
  position: relative;
}

#cartCloseOffcanvas:hover {
  color: #0056b3;
}

@media (min-width: 576px) {
  .container {
    max-width: 540px;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
  }
}

@media (min-width: 992px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1200px) {
  .container {
    max-width: 1140px;
  }
}

@media (min-width: 1400px) {
  .container {
    max-width: 1320px;
  }
}

@media only screen and (min-width: 320px) and (max-width: 767px) {

  .cartOffcanvas {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    background-color: white;
    height: 100%;
    transition: right 0.3s ease;
    z-index: 999;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

}
</style>