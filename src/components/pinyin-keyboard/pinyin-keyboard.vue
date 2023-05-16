<template>
  <div class="container" v-show="props.isShow">
    <div>
      <div class="box">
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
              <div class="kb-utils">
                <slot name="kb-utils"></slot>
              </div>
              <div class="hide-btn" @click="hidekB"></div>
            </div>
          </div>
        </div>
        <!-- 虚拟键盘 -->
        <div class="simple-keyboard"></div>
      </div>
    </div>
    <!-- 工具内容 -->
    <div class="utils-content" v-if="props.isShowUtilsContent">
      <slot name="utils-content"></slot>
    </div>

    <div class="pinyin-symbol" v-show="isShowSymbol">
      <div class="symbol">
        <template v-for="(zhs, zh_i) in publishZHSymbol" :key="zh_i">
          <span>{{ zhs }}</span>
        </template>
      </div>
      <div class="symbol-utils">
        <span @click="symbolBack">返回</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "simple-keyboard/build/css/index.css";
import { onMounted, defineProps, defineEmits, watch } from "vue";
import initKeyboard from "./pinyin-keyboard";
import { publishENSymbol, publishZHSymbol } from "./pinyin-symbol";

interface Props {
  /**
   * 是否显示键盘
   */
  isShow: boolean;
  /**
   * 需要弹出键盘的输入框的id
   * @param inputId: string
   */
  inputId: string;
  /**
   * 是否显示键盘工具栏内容
   */
  isShowUtilsContent?: boolean;
  /**
   * 监听文字输出
   * @param fullText 文本框中的所有字符
   * @param singleText 此次得到的字符
   */
  onText?: (fullText: string, singleText: string) => void;
  /**
   * 监听键盘隐藏
   */
  onHideBtn?: () => void;
  /**
   * 监听键盘按钮按下
   * @param str 按下那个按钮
   */
  onkeyBtndown?: (str: string) => void;
  /**
   * 监听右下角开始按钮点击
   */
  onEnter?: () => void;
}

const props = defineProps<Props>();

const emit = defineEmits(["update:isShow"]);

function hidekB() {
  props.onHideBtn && props.onHideBtn();
  emit("update:isShow", false);
}

const {
  inputPinyin,
  hanziList,
  SimpleInputMethod,
  initPinYinKeyboard,
  changeInputId,
  isShowSymbol,
  symbolBack,
} = initKeyboard(
  props.onText,
  props.onHideBtn,
  props.onkeyBtndown,
  props.onEnter
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
  position: relative;
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
  width: 100%;
  height: 40px;
  align-items: center;
  .kb-utils {
    box-sizing: border-box;
    width: calc(100% - 66px);
    height: 100%;
  }

  .hide-btn {
    position: relative;
    width: 24px;
    height: 24px;
    margin-right: 14px;
    margin-left: auto;
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
.utils-content {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #fff;
}

.pinyin-symbol {
  display: flex;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  border-top: 1px solid #eee;
  background: #fff;
  .symbol {
    display: flex;
    flex-wrap: wrap;
    width: 80%;
    height: 100%;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    span {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 25%;
      aspect-ratio: 1/1;
      text-align: center;
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }
    /* 隐藏滚动条 */
    &::-webkit-scrollbar {
      display: none; /* 隐藏滚动条，仅适用于WebKit内核的浏览器 */
    }
  }
  .symbol-utils {
    flex: 1;
    display: flex;
    flex-direction: column;
    span {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      border-bottom: 1px solid #eee;
      border-right: 1px solid #eee;
      aspect-ratio: 1/1;
      background-color: #d3d3d3;
    }
  }
}
</style>
