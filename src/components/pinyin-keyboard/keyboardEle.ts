/**中文切换按钮 */
export const zhSpan =
  "<span style='font-size: 14px'>中</span>/<span style='font-size: 12px; color: #999'>英</span>";
/**英文切换按钮 */
export const enSpan =
  "<span style='font-size: 14px'>英</span>/<span style='font-size: 12px; color: #999'>中</span>";

/**new Keyboard() 时需要的信息 */
export const keyboardEle = {
  buttonTheme: [
    {
      class: "myCustomClass",
      buttons:
        "{symbol} {participle} {switchLower} {numbers} {backspace} {shift} {ent} {abc}",
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
      "{symbol} {numbers} ， {space} 。 {shift} {ent}",
    ],
    lower: [
      "Q W E R T Y U I O P",
      "A S D F G H J K L",
      "{switchLower} Z X C V B N M {backspace}",
      "{symbol} {numbers} , {space} . {shift} {ent}",
    ],
    shift: [
      "q w e r t y u i o p",
      "a s d f g h j k l",
      "{switchLower} z x c v b n m {backspace}",
      "{symbol} {numbers} , {space} . {shift} {ent}",
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
    "{symbol}": "符",
  },
};
