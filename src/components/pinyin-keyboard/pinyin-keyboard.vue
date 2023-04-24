<template>
  <div class="container" v-show="props.isShow">
    <div>
      <div class="box" v-show="kbShow">
        <!-- 顶部输入法 -->
        <div class="shurufa">
          <div
            id="simle_input_method"
            class="simple-input-method"
            style="display: block"
          >
            <div class="pinyin">{{ inputPinyin }}</div>
            <div class="result" v-if="hanziList.length != 0">
              <ul>
                <template v-for="(item, index) in hanziList" :key="index">
                  <li @click="SimpleInputMethod.selectHanzi(index + 1)">
                    {{ item }}
                  </li>
                </template>
              </ul>
            </div>
            <div v-else class="result pinyin-utils">
              <div class="hide-btn" @click="hidekB"></div>
            </div>
          </div>
        </div>
        <!-- 虚拟键盘 -->
        <div class="simple-keyboard"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "simple-keyboard/build/css/index.css";
import { onMounted, defineProps, defineEmits, watch } from "vue";
import initKeyboard from "./index";

interface Props {
  inputId: string;
  isShow: boolean;
  onText: (fullText: string, singleText: string) => void;
  onHideBtn: () => void;
  onkeyBtndown: (str: string) => void;
}

const props = defineProps<Props>();

const emit = defineEmits(["update:isShow"]);

function hidekB() {
  emit("update:isShow", false);
}

const {
  inputPinyin,
  hanziList,
  SimpleInputMethod,
  initPinYinKeyboard,
  kbShow,
  changeInputId,
} = initKeyboard(props.onText, props.onHideBtn, props.onkeyBtndown);

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
.flex {
  display: flex;
}
.input-pinyin-result {
  width: 100vw;
  overflow-x: auto;
  .result-item {
    padding: 2px 5px;
  }
  margin-bottom: 30px;
}
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
  padding-bottom: 20px;
  background-color: #ececec;
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

.pinyin-utils {
  display: flex;
  justify-content: flex-end;
  height: 40px;
  align-items: center;
  margin-right: 18px;
  .hide-btn {
    position: relative;
    width: 24px;
    height: 24px;
    background: url(./img/icon-hide.png) no-repeat center/contain;
    &::after {
      content: "";
      position: absolute;
      left: -14px;
      top: 0;
      width: 0.5px;
      height: 100%;
      background-color: #707070;
    }
  }
}
</style>
