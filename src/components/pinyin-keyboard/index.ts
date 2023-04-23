import Keyboard from "simple-keyboard";
import "simple-keyboard/build/css/index.css";
import { ref } from "vue";
import pinyinUtil from "./shurufa/pinyinUtil";

export default (
  onText: (fullText: string, singleText: string) => void,
  onHideBtn: () => void,
  onkeyBtndown: (input: string) => void
) => {
  const username = ref("");
  const phone = ref("");
  const message = ref("");
  const keyboard = ref<Keyboard>();
  const inputName = ref("");
  const kbShow = ref(true);
  const moveY = ref(0);
  const currentKbShift = ref("zh");
  const isLandscape = ref(false);
  const landscapeInput = ref("");
  let inputDom: HTMLInputElement;

  if (window.innerWidth > window.innerHeight) {
    isLandscape.value = true;
  } else isLandscape.value = false;

  const SimpleInputMethod = {
    hanzi: "", // 候选汉字
    pinyin: "", // 候选拼音
    result: [], // 当前匹配到的汉字集合
    pageCurrent: 1, // 当前页
    pageSize: 8, // 每页大小
    pageCount: 0, // 总页数
    _target: "" as any,
    _pinyinTarget: "" as any,
    _resultTarget: "" as any,
    _input: "" as any,
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
     * 初始化DOM结构
     */
    initDom: function () {
      const temp = '<div class="pinyin"></div><div class="result"><ul></ul>';
      const dom = document.createElement("div");
      dom.id = "simle_input_method";
      dom.className = "simple-input-method";
      dom.innerHTML = temp;
      const that = this as any;
      // 初始化汉字选择和翻页键的点击事件
      dom.addEventListener("click", function (e) {
        const target = e.target as any;
        if (target?.nodeName == "LI")
          that.selectHanzi(parseInt(target.dataset.idx));
        else if (target.nodeName == "SPAN") {
          if (target.className == "page-up" && that.pageCurrent > 1) {
            that.pageCurrent--;
            that.refreshPage();
          } else if (
            target.className == "page-down" &&
            that.pageCurrent < that.pageCount
          ) {
            that.pageCurrent++;
            that.refreshPage();
          }
        }
      });
      document.querySelector(".shurufa")?.appendChild(dom);
    },
    /**
     * 初始化
     */
    init: function (selector: string) {
      this.initDict();
      this.initDom();

      const obj = document.querySelectorAll(selector);
      this._target = document.querySelector("#simle_input_method") as any;
      this._pinyinTarget = document.querySelector(
        "#simle_input_method .pinyin"
      ) as any;

      this._resultTarget = document.querySelector(
        "#simle_input_method .result ul"
      ) as any;
      const that = this as any;
      for (let i = 0; i < obj.length; i++) {
        console.log("1");
        obj[i].addEventListener("keydown", function (e: any) {
          console.log("---");
          const keyCode = e.keyCode;
          let preventDefault = false;
          if (keyCode >= 65 && keyCode <= 90) {
            // A-Z
            that.addChar(String.fromCharCode(keyCode + 32), that);
            preventDefault = true;
          } else if (keyCode == 8 && that.pinyin) {
            // 删除键
            that.delChar();
            preventDefault = true;
          } else if (
            keyCode >= 48 &&
            keyCode <= 57 &&
            !e.shiftKey &&
            that.pinyin
          ) {
            // 1-9
            that.selectHanzi(keyCode - 48);
            preventDefault = true;
          } else if (keyCode == 32 && that.pinyin) {
            // 空格
            that.selectHanzi(1);
            preventDefault = true;
          } else if (
            keyCode == 33 &&
            that.pageCount > 0 &&
            that.pageCurrent > 1
          ) {
            // 上翻页
            that.pageCurrent--;
            that.refreshPage();
            preventDefault = true;
          } else if (
            keyCode == 34 &&
            that.pageCount > 0 &&
            that.pageCurrent < that.pageCount
          ) {
            // 下翻页
            that.pageCurrent++;
            that.refreshPage();
            preventDefault = true;
          }
          if (preventDefault) e.preventDefault();
        });
        obj[i].addEventListener("focus", function () {
          // 如果选中的不是当前文本框，隐藏输入法
          if (that._input !== that) that.hide();
        });
      }
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
      console.log("选择文字 selectHanzi:", i, hz);
      if (!hz) return;
      this.hanzi += hz;
      const idx = this.pinyin.indexOf("'");
      if (idx > 0) {
        this.pinyin = this.pinyin.substr(idx + 1);
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
      this._pinyinTarget.innerHTML = this.hanzi + this.pinyin;
      this.refreshPage();
    },
    refreshPage: function () {
      // const temp = this.result.slice(
      //   (this.pageCurrent - 1) * this.pageSize,
      //   this.pageCurrent * this.pageSize
      // );
      const temp = this.result;
      let html = "";
      let i = 0;
      temp.forEach(function (val) {
        html += '<li data-idx="' + ++i + '">' + val + "</li>";
      });
      // this._target.querySelector(".page-up").style.opacity =
      //   this.pageCurrent > 1 ? "1" : ".3";
      // this._target.querySelector(".page-down").style.opacity =
      //   this.pageCurrent < this.pageCount ? "1" : ".3";
      this._resultTarget.innerHTML = html;
    },
    addChar: function (ch: string, obj: any) {
      console.log("addChar:", ch, obj);
      onkeyBtndown(ch);
      if (this.pinyin.length == 0) {
        // 长度为1，显示输入法
        // this.show(obj) // 在那个元素上面显示
        document.getElementById("simle_input_method")!.style.display = "block";
      }
      this.pinyin += ch;
      this.refresh();
    },
    delChar: function () {
      console.log("删除");

      if (inputDom.selectionStart !== inputDom.selectionEnd) {
        console.log(inputDom.selectionStart, inputDom.selectionEnd);

        // inputDom.setSelectionRange(
        //   inputDom.selectionStart,
        //   inputDom.selectionStart
        // );
        const str = inputDom.value;

        const start = str.substring(0, inputDom.selectionStart as number);
        console.log("start:", start);

        const end = str.substring(inputDom.selectionEnd as number);
        console.log("end:", end);

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
    show: function (obj: any) {
      // var pos = obj.getBoundingClientRect()
      // this._target.style.left = pos.left + 'px'
      // this._target.style.top = pos.top + pos.height + document.body.scrollTop + 'px'
      // this._input = obj
      // this._target.style.display = 'block'
    },
    hide: function () {
      this.reset();
      this.pinyin = "";
      this._target.style.display = "none";
    },
    reset: function () {
      this.hanzi = "";
      this.pinyin = "";
      this.result = [];
      this.pageCurrent = 1;
      this.pageCount = 0;
      this._pinyinTarget.innerHTML = "";
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
        shift: [
          "Q W E R T Y U I O P",
          "A S D F G H J K L",
          "{switchLower} Z X C V B N M {backspace}",
          "{numbers} , {space} . {shift} {ent}",
        ],
        lower: [
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
  function onChange(input: string) {
    console.log("--onChange", input);

    if (
      isNumbers.value ||
      currentKbShift.value == "en" ||
      "，,。.?".indexOf(input) != -1
    ) {
      onkeyBtndown(input);
      SimpleInputMethod.hide();
      // 这里是键盘的
      inputDom.focus();
      document.activeElement?.blur();
      const start = inputDom.selectionStart as number;
      const end = inputDom.selectionEnd as number;
      console.log(start, end);

      // 获取文本框中已有的文字
      const value = inputDom.value;

      // 将输入的文字插入到文本框中
      inputDom.value = value.slice(0, start) + input + value.slice(end);

      const newStart = start + input.length;
      inputDom.setSelectionRange(newStart, newStart);

      console.log("Input changed", input, newStart);
      keyboard.value?.setInput("");
    }
  }

  function onKeyPress(button: string) {
    console.log("---onKeyPress", button);

    if (currentKbShift.value == "en") {
      keyboard.value?.setInput("");
    }

    if (button === "{numbers}" || "1234567890".indexOf(button) != -1) {
      isNumbers.value = true;
      keyboard.value?.setInput("");
      SimpleInputMethod.hide();
      console.log("切换到数字");
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
      SimpleInputMethod.addChar(button.toLowerCase(), "");
    }

    if (button === "{shift}" || button === "{lock}") handleShift();
    if (button === "{numbers}" || button === "{abc}") handleNumbers();

    // 隐藏按钮
    if (button === "{ent}") {
      onHideBtn();
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
        "{ent}": "隐藏",
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

  function handleTouch(type: string) {
    if (isLandscape.value) return;
    inputName.value = type;
    if (type == "username") landscapeInput.value = username.value;
    if (type == "phone") landscapeInput.value = phone.value;
    if (type == "message") landscapeInput.value = message.value;
    kbShow.value = true;
    moveY.value = 19;
  }

  function closeKB() {
    // inputName.value = ''
    moveY.value = 0;
    kbShow.value = false;
  }

  let prevSelectionStart = 0;
  let prevSelectionEnd = 0;

  function changeInputValue(str: string) {
    inputDom.focus();
    document.activeElement?.blur();
    // 获取文本框中已有的文字
    const value = inputDom.value;

    // 将输入的文字插入到文本框中
    inputDom.value =
      value.slice(0, prevSelectionStart) + str + value.slice(prevSelectionEnd);
    prevSelectionStart++;
    prevSelectionEnd++;
    inputDom.setSelectionRange(prevSelectionStart, prevSelectionEnd);

    onText(inputDom.value, str);
  }

  // 初始化键盘
  function initPinYinKeyboard() {
    SimpleInputMethod.init(".shurufa");
    initKeyboardEle();

    const pinyin = document.querySelector(
      "#simle_input_method .pinyin"
    ) as HTMLDivElement;

    pinyin.onclick = function () {
      console.log("最终得到得文字:", (window as any).myText);
    };
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
    initPinYinKeyboard,
    changeInputId,
    SimpleInputMethod,
    initKeyboardEle,
    username,
    phone,
    message,
    handleTouch,
    closeKB,
    inputName,
    kbShow,
    moveY,
    isLandscape,
    landscapeInput,
  };
};
