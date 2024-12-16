// @see: https://www.prettier.cn

module.exports = {
  // 指定prettier将换行的行长，默认80
  printWidth: 130,

  // 指定每个缩进级别的空格数，默认2
  tabWidth: 2,

  //  用制表符而不是空格缩进行<true制表符 | false空格>，默认false
  useTabs: false,

  // 语句末尾添加分号<true添加 | false不添加>，默认true
  semi: false,

  // 使用单引号而不是双引号<true单引号 | false双引号>，默认false
  singleQuote: false,

  // object对象中key值是否加引号<as-needed|consistent|preserve>，默认as-needed
  // as-needed-仅在需要时在对象属性周围添加引号
  // consistent-如果一个对象中至少有一个属性需要引号，所有属性添加引号
  // preserve-保留对象属性中用户输入使用的引号
  quoteProps: "preserve",

  // 在JSX中使用单引号而不是双引号<true单引号 | false双引号>，默认false
  jsxSingleQuote: false,

  // 在多行逗号分隔的句法结构中尽可能打印尾随逗号<es5|none|all>，默认es5
  // es5-在 ES5 中有效的尾随逗号（对象、数组等），TypeScript 的类型参数中没有尾随逗号
  // none-没有尾随逗号
  // all-尽可能以逗号结尾（包括函数参数和调用）。要运行以这种方式格式化的 JavaScript 代码需要一个支持 ES2017（Node.js 8+ 或现代浏览器）或下层编译的引擎。这还会在 TypeScript 的类型参数中启用尾随逗号（自 2018 年 1 月发布的 TypeScript 2.7 起支持）
  trailingComma: "none",

  // 在对象，数组括号与文字之间加空格<true空格 | false补空格>，默认false
  // true-始终包括父级。示例：{ foo: bar }
  // false-尽可能省略括号。示例：{foo: bar}
  bracketSpacing: true,

  // 将多行元素的 > 放在最后一行的末尾，而不是单独放在下一行<true|false>,默认false放在下一行
  bracketSameLine: true,

  // (x) => {} 箭头函数参数只有一个时是否要有小括号<always|avoid>，默认always
  // always-始终包括父级。示例：(x) => x
  // avoid-尽可能省略括号。示例：x => x
  arrowParens: "avoid",

  // 超过最大宽度是否换行<always|never|preserve>，默认preserve
  // always-如果超过最大宽度换行
  // never-不要换行
  // preserve-按原样显示
  proseWrap: "preserve",

  // 指定 HTML、Vue、Angular 和 Handlebars 的全局空格敏感度<css|strict|ignore>，默认css
  // css-遵循CSS属性的默认值
  // strict-所有标签周围的空格（或缺少空格）被认为是重要的
  // ignore-所有标签周围的空格（或缺少空格）被认为是无关紧要的
  htmlWhitespaceSensitivity: "css",

  // 在 HTML、Vue 和 JSX 中强制执行每行单个属性<true|false>，默认false
  singleAttributePerLine: false,

  // vue文件script和style标签中是否缩进<true|false>，默认false
  vueIndentScriptAndStyle: true,

  // 行尾换行符<lf|crlf|cr|auto>，默认lf
  endOfLine: "auto"
}
