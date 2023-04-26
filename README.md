# 一个 Web 端拼音输入法键盘

🚀 在你不方便使用系统自带的输入法键盘的时候，你可以试试这个拼音输入法键盘，工具如其名，只提供简单的拼音打字，英文（大小写）、数字。键盘还提供两个插槽供你自定义功能，分别是工具栏和工具栏内容，详细可以看下面的介绍。

<video width="250" src="./docs/preview.mp4"></video>

## 安装

```js
npm install pinyin-keyboard
```

## 使用

```html
<template>
  <div>
    <input type="text" id="myInput1" />
    <input type="text" id="myInput2" />
    <PinyinKeyboard
      v-model:isShow="isShow"
      :inputId="inputId"
      :onHideBtn="onHide"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { PinyinKeyboard } from "pinyin-keyboard";
  import "pinyin-keyboard/dist/style.css";

  const isShowKeyboard = ref(true);
  const inputId = ref("");

  onMounted(() => {
    document.getElementById("myInput1")?.addEventListener("focus", (e) => {
      inputId.value = "myInput1";
      isShowKeyboard.value = true;
      e.target?.blur();
    });

    document.getElementById("myInput2")?.addEventListener("focus", (e) => {
      inputId.value = "myInput2";
      isShowKeyboard.value = true;
      e.target?.blur();
    });
  });

  function onHide() {
    console.log("隐藏键盘按钮触发");
  }
</script>
```

## Props

| 参数               | 说明                      | 类型    |
| ------------------ | ------------------------- | ------- |
| isShow             | 是否显示键盘              | boolean |
| inputId            | 需要弹出键盘的输入框的 id | string  |
| isShowUtilsContent | 是否显示键盘工具栏内容    | boolean |

## Event

| 事件名称     | 说明                   | 回调参数                             |
| ------------ | ---------------------- | ------------------------------------ |
| onText       | 监听文字输出           | fullText: string, singleText: string |
| onHideBtn    | 监听键盘隐藏           | 无                                   |
| onkeyBtndown | 监听键盘按钮按下       | str: string (当前按下的按钮名称)     |
| onEnter      | 监听右下角开始按钮点击 | 无                                   |

## 插槽

通过插槽，你可以在键盘上自定义一些功能

1.工具栏

```html
<PinyinKeyboard
  v-model:isShow="isShowKeyboard"
  :inputId="inputId"
  :onText="onText"
  :on-hide-btn="onHide"
  :onkey-btndown="onkeyBtndown"
  :onEnter="onEnter"
>
  <template #kb-utils>
    <span>这里是工具栏</span>
  </template>
</PinyinKeyboard>
```

2.工具栏内容

```html
<PinyinKeyboard
  v-model:isShow="isShowKeyboard"
  :inputId="inputId"
  :onText="onText"
  :on-hide-btn="onHide"
  :onkey-btndown="onkeyBtndown"
  :onEnter="onEnter"
  :isShowUtilsContent="true"
>
  <template #kb-utils>
    <span>这里是工具栏</span>
  </template>

  <template #utils-content>
    <span>这里是工具栏内容</span>
  </template>
</PinyinKeyboard>
```

> 注意：工具栏内容区域，覆盖在键盘上方，宽高占满整个键盘，显示与隐藏请自定义操作 isShowUtilsContent 属性

## LICENSE

Vant is [MIT](https://github.com/youzan/vant/blob/main/LICENSE) licensed.
