<template>
  <div class="container" v-show="props.isShow">
    <div>
      <div class="box" v-show="kbShow">
        <div class="shurufa"></div>
        <div class="simple-keyboard"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "simple-keyboard/build/css/index.css";
import { onMounted, defineProps, watch } from "vue";
import initKeyboard from "./index";

interface Props {
  inputId: string;
  isShow: boolean;
  onText: (fullText: string, singleText: string) => void;
  onHideBtn: () => void;
  onkeyBtndown: (str: string) => void;
}

const props = defineProps<Props>();

const { initPinYinKeyboard, kbShow, changeInputId } = initKeyboard(
  props.onText,
  props.onHideBtn,
  props.onkeyBtndown
);

onMounted(() => {
  initPinYinKeyboard();

  watch(
    () => props.inputId,
    (value) => {
      console.log("value:", value);

      changeInputId(value);
    }
  );
});
</script>

<style>
@import "./simple-input-method.css";
</style>
<style scoped lang="scss">
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.key-board {
  width: 100vw;
}
.box {
  width: 100vw;
}

.simple-keyboard {
  width: 100%;
  //
}

/* 键盘样式 */
.hg-candidate-box {
  /* position: static; */
  background: #fff;
}
</style>
