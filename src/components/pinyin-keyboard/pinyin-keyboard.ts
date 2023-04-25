import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { ref } from "vue";
import pinyinUtil from "./shurufa/pinyinUtil";

export default (
  onText?: (fullText: string, singleText: string) => void,
  onHideBtn?: () => void,
  onkeyBtndown?: (input: string) => void,
  onEnter?: () => void
) => {
  // 顶部输入法显示
  const inputPinyin = ref(""); // 输入的拼音
  const hanziList = ref<string[]>([]); // 获取到的汉字

  const keyboard = ref<Keyboard>();
  const currentKbShift = ref("zh");
  let inputDom: HTMLInputElement;

  const SimpleInputMethod = {
    hanzi: "", // 候选汉字
    pinyin: "", // 候选拼音
    result: [], // 当前匹配到的汉字集合
    pageCurrent: 1, // 当前页
    pageSize: 8, // 每页大小
    pageCount: 0, // 总页数
    /**
     * 初始化字典配置
     */
    initDict: function () {
      const dict = pinyinUtil.dict;
      if (!dict.py2hz) throw "未找到合适的字典文件！";
      // 这一步仅仅是给字母a-z扩充，例如根据b找不到相关汉字，就把bi的结果赋值给b
      // 当然这种方式只是很简单的实现，真正的拼音输入法肯定不能这么简单处理
      dict.py2hz2 = {};
      dict.py2hz2["i"] = "i"; // i比较特殊，没有符合的汉字，所以特殊处理
      for (let i = 97; i <= 123; i++) {
        const ch = String.fromCharCode(i);
        if (!dict.py2hz[ch]) {
          for (const j in dict.py2hz) {
            if (j.indexOf(ch) == 0) {
              dict.py2hz2[ch] = dict.py2hz[j];
              break;
            }
          }
        }
      }
    },
    /**
     * 初始化
     */
    init: function () {
      this.initDict();
    },
    /**
     * 单个拼音转单个汉字，例如输入 "a" 返回 "阿啊呵腌嗄吖锕"
     */
    getSingleHanzi: function (pinyin: any) {
      return (
        pinyinUtil.dict.py2hz2[pinyin] || pinyinUtil.dict.py2hz[pinyin] || ""
      );
    },
    /**
     * 拼音转汉字
     * @param pinyin 需要转换的拼音，如 zhongguo
     * @return 返回一个数组，格式类似：[["中","重","种","众","终","钟","忠"], "zhong'guo"]
     */
    getHanzi: function (pinyin: string) {
      let result = this.getSingleHanzi(pinyin);
      if (result) return [result.split(""), pinyin];
      let temp = "";
      for (let i = 0, len = pinyin.length; i < len; i++) {
        temp += pinyin[i];
        result = this.getSingleHanzi(temp);
        if (!result) continue;
        // flag表示如果当前能匹配到结果、并且往后5个字母不能匹配结果，因为最长可能是5个字母，如 zhuang
        let flag = false;
        if (i + 1 < pinyin.length) {
          for (let j = 1, len = pinyin.length; j <= 5 && i + j < len; j++) {
            if (this.getSingleHanzi(pinyin.substr(0, i + j + 1))) {
              flag = true;
              break;
            }
          }
        }
        if (!flag)
          return [
            result.split(""),
            pinyin.substr(0, i + 1) + "'" + pinyin.substr(i + 1),
          ];
      }
      return [[], ""]; // 理论上一般不会出现这种情况
    },
    /**
     * 选择某个汉字，i有效值为1-5
     */
    selectHanzi: function (i: any) {
      const hz = this.result[(this.pageCurrent - 1) * this.pageSize + i - 1];
      if (!hz) return;
      this.hanzi += hz;
      const idx = this.pinyin.indexOf("'");
      if (idx > 0) {
        this.pinyin = this.pinyin.substring(idx + 1);
        this.refresh();
      } // 如果没有单引号，表示已经没有候选词了
      else {
        changeInputValue(this.hanzi);

        this.hide(); // 隐藏输入法
      }
    },
    /**
     * 将拼音转换成汉字候选词，并显示在界面上
     */
    refresh: function () {
      const that = this as any;
      console.log("refresh:", this.pinyin);
      const temp = this.getHanzi(this.pinyin.replace(/'/g, ""));
      that.result = temp[0];
      console.log(temp);

      that.pinyin = temp[1];
      const count = this.result.length;
      this.pageCurrent = 1;
      this.pageCount = Math.ceil(count / this.pageSize);

      inputPinyin.value = this.hanzi + this.pinyin;

      this.refreshPage();
    },
    refreshPage: function () {
      const temp = this.result;
      hanziList.value = temp;
    },
    // 点击键盘按钮，第一时间会调用此方法
    addChar: function (ch: string, obj: any) {
      onkeyBtndown && onkeyBtndown(ch);

      this.pinyin += ch;

      inputPinyin.value += ch;

      this.refresh();
    },
    delChar: function () {
      if (!checkInputDom()) return;
      if (inputDom.selectionStart !== inputDom.selectionEnd) {
        const str = inputDom.value;
        const start = str.substring(0, inputDom.selectionStart as number);
        const end = str.substring(inputDom.selectionEnd as number);
        inputDom.value = start + end;
        return;
      }

      if (this.pinyin.length <= 1) {
        this.hide();
        inputDom.value = inputDom.value.substring(0, inputDom.value.length - 1);
        return;
      }
      this.pinyin = this.pinyin.substr(0, this.pinyin.length - 1);
      this.refresh();
    },
    hide: function () {
      this.reset();
      this.pinyin = "";
    },
    reset: function () {
      this.hanzi = "";
      this.pinyin = "";
      this.result = [];
      this.pageCurrent = 1;
      this.pageCount = 0;
      inputPinyin.value = "";
      hanziList.value = [];
    },
  };
  const zhSpan =
    "<span style='font-size: 14px'>中</span>/<span style='font-size: 12px; color: #999'>英</span>";
  const enSpan =
    "<span style='font-size: 14px'>英</span>/<span style='font-size: 12px; color: #999'>中</span>";

  function initKeyboardEle() {
    keyboard.value = new Keyboard({
      onChange: (input) => onChange(input),
      onKeyPress: (button) => onKeyPress(button),
      buttonTheme: [
        {
          class: "myCustomClass",
          buttons:
            "{participle} {switchLower} {numbers} {backspace} {shift} {ent} {abc}",
        },
        {
          class: "myCustomPlaceholder",
          buttons: "{ph}",
        },
        {
          class: "myCustomEnter",
          buttons: "{ent}",
        },
        {
          class: "myCustomSpace",
          buttons: "{space}",
        },
        {
          class: "myCustomNumber",
          buttons: "1 2 3 4 5 6 7 8 9 0",
        },
      ],
      mergeDisplay: true,
      layoutName: "default",
      layout: {
        default: [
          "Q W E R T Y U I O P",
          "A S D F G H J K L",
          "{participle} Z X C V B N M {backspace}",
          "{numbers} ， {space} 。 {shift} {ent}",
        ],
        lower: [
          "Q W E R T Y U I O P",
          "A S D F G H J K L",
          "{switchLower} Z X C V B N M {backspace}",
          "{numbers} , {space} . {shift} {ent}",
        ],
        shift: [
          "q w e r t y u i o p",
          "a s d f g h j k l",
          "{switchLower} z x c v b n m {backspace}",
          "{numbers} , {space} . {shift} {ent}",
        ],
        numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"],
      },
      display: {
        "{participle}": "分词",
        "{ph}": " ",
        "{space}": " ",
        "{numbers}": "123",
        "{ent}": "开始",
        "{escape}": "esc ⎋",
        "{tab}": "tab ⇥",
        "{backspace}": "⌫",
        "{capslock}": "caps lock ⇪",
        "{shift}": zhSpan,
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
        "{abc}": "ABC",
        "{switchLower}": "大写",
      },
    });
  }
  const isNumbers = ref(false);
  // 监听键盘改变
  function onChange(input: string) {
    if (
      isNumbers.value ||
      currentKbShift.value == "en" ||
      "，,。.?".indexOf(input) != -1
    ) {
      // 这里是键盘的
      SimpleInputMethod.hide();
      onkeyBtndown && onkeyBtndown(input);
      changeInputValue(input);

      keyboard.value?.setInput("");
    }
  }

  // 点击键盘按钮
  function onKeyPress(button: string) {
    if (currentKbShift.value == "en") {
      keyboard.value?.setInput("");
    }

    // 切换到数字
    if (button === "{numbers}" || "1234567890".indexOf(button) != -1) {
      isNumbers.value = true;
      keyboard.value?.setInput("");
      SimpleInputMethod.hide();
    } else {
      isNumbers.value = false;
    }

    if (
      button !== "{backspace}" &&
      button !== "{shift}" &&
      button !== "{lock}" &&
      button !== "{numbers}" &&
      button !== "{abc}" &&
      button !== "{ent}" &&
      button !== "{switchLower}"
    ) {
      // 变为小写才传参数
      SimpleInputMethod.addChar(button.toLowerCase(), "");
    }

    if (button === "{shift}" || button === "{lock}") handleShift();
    if (button === "{numbers}" || button === "{abc}") handleNumbers();

    // 右下角按钮按钮
    if (button === "{ent}") {
      onEnter && onEnter();
    }

    if (button === "{backspace}") {
      SimpleInputMethod.delChar();
    }

    if (button === "{switchLower}") {
      switchLower();
    }
  }

  let islower = 0;
  function switchLower() {
    keyboard.value?.setOptions({
      layoutName: islower == 0 ? "lower" : "shift",
      display: {
        "{participle}": "分词",
        "{numbers}": "123",
        "{ent}": "开始",
        "{escape}": "esc ⎋",
        "{tab}": "tab ⇥",
        "{backspace}": "⌫",
        "{capslock}": "caps lock ⇪",
        "{shift}": enSpan,
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
        "{abc}": "ABC",
        "{switchLower}": islower == 0 ? "小写" : "大写",
      },
    });
    islower = islower == 0 ? 1 : 0;
  }

  function handleShift() {
    const currentLayout = keyboard.value?.options.layoutName;
    const shiftToggle = currentLayout === "default" ? "shift" : "default";

    console.log("当前布局:", shiftToggle);

    if (currentKbShift.value == "zh") {
      currentKbShift.value = "en";
    } else {
      currentKbShift.value = "zh";
    }

    keyboard.value?.setOptions({
      layoutName: shiftToggle,
      display: {
        "{participle}": "分词",
        "{numbers}": "123",
        "{ent}": "开始",
        "{escape}": "esc ⎋",
        "{tab}": "tab ⇥",
        "{backspace}": "⌫",
        "{capslock}": "caps lock ⇪",
        "{shift}": shiftToggle === "default" ? zhSpan : enSpan,
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
        "{abc}": "ABC",
        "{switchLower}": "大写",
      },
    });
  }

  function handleNumbers() {
    const currentLayout = keyboard.value?.options.layoutName;

    const numbersToggle = currentLayout !== "numbers" ? "numbers" : "default";
    console.log("currentLayout:", currentLayout);

    console.log("currentKbShift.value:", currentKbShift.value);

    let layoutName = "numbers";

    if (numbersToggle == "default") {
      if (currentKbShift.value == "en") {
        // 英文
        layoutName = "shift";
        if (islower == 0) {
          // 小写
          layoutName = "lower";
        }
      } else {
        // 中文
        layoutName = "default";
      }
    }

    keyboard.value?.setOptions({
      layoutName,
      display: {
        "{participle}": "分词",
        "{numbers}": "123",
        "{ent}": "开始",
        "{escape}": "esc ⎋",
        "{tab}": "tab ⇥",
        "{backspace}": "⌫",
        "{capslock}": "caps lock ⇪",
        "{shift}": layoutName == "shift" ? enSpan : zhSpan,
        "{controlleft}": "ctrl ⌃",
        "{controlright}": "ctrl ⌃",
        "{altleft}": "alt ⌥",
        "{altright}": "alt ⌥",
        "{metaleft}": "cmd ⌘",
        "{metaright}": "cmd ⌘",
        "{abc}": "ABC",
        "{switchLower}": islower == 0 ? "大写" : "小写",
      },
    });
  }

  function changeInputValue(str: string) {
    if (!checkInputDom()) return;
    // 将输入的文字插入到文本框中
    inputDom.value += str;
    onText && onText(inputDom.value, str);
  }

  function checkInputDom() {
    if (!inputDom) {
      console.error("inputId不存在或者错误，请检查");
      console.log("获取inputDom失败:", inputDom);
      return false;
    } else return true;
  }

  // 初始化键盘
  function initPinYinKeyboard() {
    SimpleInputMethod.init();
    initKeyboardEle();
  }

  function changeInputId(inputId: string) {
    if (!inputId) {
      console.error("inputId 不能为空");
    }
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (!input) {
      console.error(
        "使用此inputId获取不到元素, 请检查inputId是否错误 or 在onMounted之后再改变inputId"
      );
    }
    inputDom = input;
  }

  return {
    inputPinyin,
    hanziList,
    initPinYinKeyboard,
    changeInputId,
    SimpleInputMethod,
    initKeyboardEle,
  };
};
