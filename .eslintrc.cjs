// @see: http://eslint.cn

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  // 指定如何解析语法
  parser: "vue-eslint-parser",
  // 优先级低于 parser 的语法解析配置
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
    jsxPragma: "React",
    ecmaFeatures: { jsx: true }
  },
  plugins: ["@typescript-eslint"],
  // 继承某些已有的规则
  extends: ["plugin:vue/vue3-recommended", "plugin:prettier/recommended", "plugin:@typescript-eslint/recommended"],
  /**
   * "off" 或 0    ==>  关闭规则
   * "warn" 或 1   ==>  打开的规则作为警告（不影响代码执行）
   * "error" 或 2  ==>  规则作为一个错误（代码不能执行，界面报错）
   */
  rules: {
    // eslint (http://eslint.cn/docs/rules)
    "switch-colon-spacing": ["error"], // switch 冒号前禁止空格，冒号后空一格；
    "quotes": "error", // 引号：尽可能使用双引号；
    "comma-style": "error", // 逗号：默认放在当前行末尾；
    "comma-spacing": "error", // 逗号：后面默认需要空格；
    "comma-dangle": "error", // 逗号：在对象和数组默认禁止使用拖尾逗号；
    "dot-location": ["error", "property"], // 在点之前和之后强制执行一致的换行符；
    "no-trailing-spaces": "error", // 禁止在每行末尾使用多余的空格；
    "no-multiple-empty-lines": ["error"], // 禁止多个空行（默认最大空 2 行）；
    "no-var": "error", // 禁止使用 var 定义变量；
    "object-curly-spacing": ["error", "always"], // 对象和数组的大括号内保持一致的间距；
    "object-curly-newline": ["error", { multiline: true }], // 对象的大括号内拥有多行数据时强制换行；
    "array-bracket-newline": "error", // 数组的大括号内拥有多行数据时强制换行；
    "arrow-spacing": "error", // 箭头函数的箭头前后保持一致的间距；
    "prefer-const": "off", // 使用 let 关键字声明但在初始分配后从未重新分配的变量，要求使用 const
    "no-use-before-define": "off", // 禁止在 函数/类/变量 定义之前使用它们

    // typeScript (https://typescript-eslint.io/rules)
    "@typescript-eslint/no-unused-vars": "error", // 禁止定义未使用的变量
    "@typescript-eslint/no-empty-function": "error", // 禁止空函数
    "@typescript-eslint/prefer-ts-expect-error": "error", // 禁止使用 @ts-ignore
    "@typescript-eslint/ban-ts-comment": "error", // 禁止 @ts-<directive> 使用注释或要求在指令后进行描述
    "@typescript-eslint/no-inferrable-types": "off", // 可以轻松推断的显式类型可能会增加不必要的冗长
    "@typescript-eslint/no-namespace": "off", // 禁止使用自定义 TypeScript 模块和命名空间
    "@typescript-eslint/no-explicit-any": "off", // 禁止使用 any 类型
    "@typescript-eslint/ban-types": "off", // 禁止使用特定类型
    "@typescript-eslint/no-var-requires": "off", // 允许使用 require() 函数导入模块
    "@typescript-eslint/no-non-null-assertion": "off", // 不允许使用后缀运算符的非空断言(!)

    // vue (https://eslint.vuejs.org/rules)
    "vue/script-setup-uses-vars": "error", // 防止<script setup>使用的变量<template>被标记为未使用，此规则仅在启用该 no-unused-vars 规则时有效
    "vue/v-slot-style": "error", // 强制执行 v-slot 指令样式
    "vue/no-mutating-props": "error", // 不允许改变组件 prop
    "vue/custom-event-name-casing": "error", // 为自定义事件名称强制使用特定大小写
    "vue/attribute-hyphenation": "error", // 对模板中的自定义组件强制执行属性命名样式：my-prop="prop"
    "vue/attributes-order": "error", // vue api使用顺序，强制执行属性顺序
    "vue/no-v-html": "off", // 禁止使用 v-html
    "vue/require-default-prop": "off", // 此规则要求为每个 prop 为必填时，必须提供默认值
    "vue/multi-word-component-names": "off", // 要求组件名称始终为 “-” 链接的单词
    "vue/no-setup-props-destructure": "off", // 禁止解构 props 传递给 setup
    "vue/html-closing-bracket-newline": ["error", { singleline: "never", multiline: "never" }] // 在标签的右括号之前要求或禁止换行
  }
}
