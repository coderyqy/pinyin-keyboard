import PinyinKeyboard from "@/components/pinyin-keyboard/pinyin-keyboard.vue";

const install = function (Vue: any) {
  Vue.component("PinyinKeyboard", PinyinKeyboard);
};

export default install;
