<template>
  <div class="app">
    <div>
      <input type="text" id="myInput1" />
      <input type="text" id="myInput2" />

      <div class="kb">
        <PinyinKeyboard
          v-model:isShow="isShowKeyboard"
          :inputId="inputId"
          :onText="onText"
          :on-hide-btn="onHide"
          :onkey-btndown="onkeyBtndown"
          :onEnter="onEnter"
          :isShowUtilsContent="false"
        >
          <template #kb-utils>
            <span></span>
          </template>

          <template #utils-content>
            <span></span>
          </template>
        </PinyinKeyboard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PinyinKeyboard from "@/components/pinyin-keyboard/pinyin-keyboard.vue";
import { onMounted, ref } from "vue";

const isShowKeyboard = ref(false);
const inputId = ref("");

onMounted(() => {
  console.log();
  document.getElementById("myInput1")?.addEventListener("focus", (e) => {
    console.log("----", e);
    inputId.value = "myInput1";
    isShowKeyboard.value = true;
    e.target?.blur();
  });

  document.getElementById("myInput2")?.addEventListener("focus", (e) => {
    console.log("----", e);
    inputId.value = "myInput2";
    isShowKeyboard.value = true;
    e.target?.blur();
  });
});

function onText(fullText: string, singleText: string): void {
  console.log("onText:", fullText, singleText);
}

function onHide() {
  console.log("隐藏键盘按钮触发");
}

function onkeyBtndown(key: string) {
  console.log("键盘按钮触发：", key);
}

function onEnter() {
  console.log("右下角开始按钮被触发");
}
</script>

<style lang="scss">
.kb {
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
