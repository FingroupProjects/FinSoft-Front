<script setup>
import { ref } from 'vue';
import {useFilterCanvasVisible} from "../../store/canvasVisible.js";
const canvasVisible = useFilterCanvasVisible()

</script>

<template>
    <div :class="['cartOffcanvas', 'offcanvas-end', { show: canvasVisible.isFilterCanvasVisible }]" tabindex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
      <div class="offcanvas-header">
        <h3 class="offcanvas-title" id="cartOffcanvasLabel">Cart <span id="item-count">(0)</span></h3>
        <i class="bi bi-x" @click="canvasVisible.closeFilterCanvas"></i>
      </div>
      <div class="offcanvas-body">
        <p class="cart-empty">Your cart is currently empty.</p>
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
  position: fixed;
  top: 0;
  right: -100%;
  width: 35%;
  background-color: white;
  height: 100%;
  transition: right 0.3s ease;
  z-index: 1050;
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
  flex: 1;
}

.offcanvas-body {
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
    z-index: 1050;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

}
</style>