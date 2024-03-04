<template>
  <div class="app">
    <div>
      <input
        type="text"
        id="myInput1"
        :class="{ inputActive: inputId === 'myInput1' }"
      />
      <input
        type="text"
        id="myInput2"
        :class="{ inputActive: inputId === 'myInput2' }"
      />

      <div id="customInput" class="custom-input" @click="moveCursor">
        <span ref="cursorRef" id="cursor" class="cursor"></span>
        <div
          ref="contentRef"
          id="content"
          aria-multiline="true"
          tabindex="0"
        ></div>
      </div>

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
const cursorRef = ref<HTMLDivElement>();
const contentRef = ref<HTMLDivElement>();

onMounted(() => {
  console.log();
  document.getElementById("myInput1")?.addEventListener("focus", (e: Event) => {
    console.log("----", e);
    inputId.value = "myInput1";
    isShowKeyboard.value = true;
    e.target && (e.target as any).blur();
  });

  document.getElementById("myInput2")?.addEventListener("focus", (e: Event) => {
    console.log("----", e);
    inputId.value = "myInput2";
    isShowKeyboard.value = true;
    e.target && (e.target as any).blur();
  });
});

function onText(fullText: string, singleText: string): void {
  console.log("onText:", fullText, singleText);
  addText(singleText);
}

function onHide() {
  console.log("隐藏键盘按钮触发");
  inputId.value = "-";
}

function onkeyBtndown(key: string) {
  console.log("键盘按钮触发：", key);
}

function onEnter() {
  console.log("右下角开始按钮被触发");
}

let isActive = 0;
let cursorPos = 0;
const fontSize = 24;

function moveCursor() {
  // 点击输入框时，设置光标位置
  contentRef.value?.focus();
  if (isActive == 1) {
    updateCursorPos(-1);
  } else {
    isActive = 1;
  }
}

function updateCursorPos(i = 0) {
  // 更新光标位置
  var range = document.getSelection()!.getRangeAt(0);
  var rect = range.getBoundingClientRect();

  if (cursorPos === 0) {
    cursorPos = fontSize + rect.width / 2;
  } else {
    if (i == -1) {
      cursorPos = rect.left - 9 + rect.width / 2;
    } else {
      cursorPos += i;
    }
  }
  console.log("cursorPos2:", cursorPos);
  cursorRef.value!.style.left = cursorPos + "px";
}

contentRef.value?.addEventListener("input", function () {
  // 监听输入事件，更新光标位置
  updateCursorPos();
});

function addText(text: string) {
  // 获取当前光标位置
  var selection = window.getSelection();
  var range = selection?.getRangeAt(0);
  var startOffset = range?.startOffset;

  // 添加文字到内容区域
  // const text = "字";
  contentRef.value!.innerText =
    contentRef.value!.innerText.slice(0, startOffset) +
    text +
    contentRef.value!.innerText.slice(startOffset);
  contentRef.value!.focus();
  updateCursorPos(text.length * fontSize);
}
</script>

<style lang="scss">
.kb {
  position: absolute;
  left: 0;
  bottom: 0;
}

.inputActive {
  border: 1px solid rgb(7, 181, 250);
}
</style>

<style>
/* 模拟输入框的样式 */
.custom-input {
  border: 1px solid #ccc;
  width: 300px;
  height: 40px;
  font-size: 24px;
  cursor: text;
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.cursor {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 100%;
  background-color: black;
  animation: blink-caret 1s infinite;
}

@keyframes blink-caret {
  50% {
    background-color: transparent;
  }
}
</style>
