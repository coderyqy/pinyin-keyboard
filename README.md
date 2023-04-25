# 一个 Web 端拼音输入法键盘

🔥 <a href="https://vant-contrib.gitee.io/vant">文档</a>

---

##

- 🚀

## 安装

```js
npm install pinyin-keyboard
```

## 使用

```js
<template>
  <PinyinKeyboard v-model:isShow="isShow" :inputId="inputId" :onHideBtn="onHide" />
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { PinyinKeyboard } from "pinyin-keyboard";
  import "pinyin-keyboard/dist/style.css";

  const isShowKeyboard = ref(true);
  const inputId = ref("");

  function onHide() {
    console.log("隐藏键盘按钮触发");
  }
</script>
```

## Props

| 参数    | 说明                      | 类型    |
| ------- | ------------------------- | ------- |
| isShow  | 是否显示键盘              | boolean |
| inputId | 需要弹出键盘的输入框的 id | string  |

## Event

| 事件名称     | 说明                   | 回调参数                             |
| ------------ | ---------------------- | ------------------------------------ |
| onText       | 监听文字输出           | fullText: string, singleText: string |
| onHideBtn    | 监听键盘隐藏           | 无                                   |
| onkeyBtndown | 监听键盘按钮按下       | str: string (当前按下的按钮名称)     |
| onEnter      | 监听右下角开始按钮点击 | 无                                   |

## LICENSE

Vant is [MIT](https://github.com/youzan/vant/blob/main/LICENSE) licensed.
