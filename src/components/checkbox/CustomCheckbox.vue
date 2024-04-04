<script setup>
import { defineProps } from "vue"

const props = defineProps(['checked'])

</script>

<template>
  <label class="mcui-checkbox">
    <input type="checkbox" :checked="props.checked">
    <div class="mr-2 block">
      <svg class="mcui-check check_svg" viewBox="2 2 25 35" aria-hidden="true">
        <polyline points="7.57 15.87 12.62 21.07 23.43 9.93" />
      </svg>
    </div>
    <slot></slot>
  </label>
</template>
<style scoped lang="scss">
$main: black; //#008cff;
$grey: #8d9aa9;
$bezier: cubic-bezier(0.65, 0.25, 0.56, 0.96);
.block{
  position: relative;
}
.check_svg{
  position: absolute;
  top: 1px;
  left: -0.5px
}
.mcui-checkbox,
.mcui-radio {
  display: flex;
  align-items: center;
  user-select: none;

  input[type="checkbox"],
  input[type="radio"] {
    position: absolute !important;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
  }

  input[type="checkbox"] + div,
  input[type="radio"] + div {
    border: 2px solid $grey;
    height: 1.2em;
    width: 1.2em;
    box-sizing: border-box;
    border-radius: 2px;
    position: relative;
  }

  input[type="checkbox"] ~ div:last-child,
  input[type="radio"] ~ div:last-child {
    padding-left: 0.5em;
  }

  input[type="radio"] + div {
    border-radius: 50%;

    &::after {
      content: "";
      position: absolute;
      left: 25%;
      top: 25%;
      width: 50%;
      height: 50%;
      border-radius: 50%;
      transform: scale(0.5);
      opacity: 0;
      background: $main;
      transition: all 107ms $bezier;
    }
  }

  input[type="checkbox"]:checked + div {
    border-color: $main;
    transition: border-color 107ms $bezier;

    .mcui-check {
      opacity: 1;
      transition: opacity 107ms $bezier;

      polyline {
        animation: dash-check 107ms $bezier forwards;
      }
    }
  }

  input[type="radio"]:checked + div {
    border-color: $main;

    &::after {
      opacity: 1;
      transform: scale(1);
    }
  }

  input[type="checkbox"]:indeterminate + div::after {
    content: "";
    height: 4px;
    width: 60%;
    left: 20%;
    top: calc(50% - 2px);
    position: absolute;
    background: $grey;
    border-radius: 1px;
  }

  input[type="checkbox"]:disabled ~ div,
  input[type="radio"]:disabled ~ div {
    color: $grey;
    cursor: not-allowed;
  }

  input[type="checkbox"]:enabled ~ div,
  input[type="radio"]:enabled ~ div {
    cursor: default;
  }
}

.mcui-check {
  height: 15px;
  width: 15px;
  transform: scale(1);
  color: $main;
  opacity: 0;

  polyline {
    fill: none;
    transform-origin: 50% 50%;
    stroke-width: 5px;
    stroke-dasharray: 22.771367900227325;
    stroke: currentcolor;
  }
}

@supports (display: grid) {
  .mcui-check {
    polyline {
      stroke-dashoffset: 22.771367900227325;
    }
  }
}

@keyframes dash-check {
  to {
    stroke-dashoffset: 0;
  }
}
</style>