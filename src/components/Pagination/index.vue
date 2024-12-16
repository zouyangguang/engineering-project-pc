<template>
  <el-pagination
    v-model:current-page="current"
    v-model:page-size="pagesize"
    :layout="layout"
    :size="size"
    :total="total"
    :page-sizes="pageSizes"
    :background="background"
    :disabled="disabled"
    :pager-count="pagerCount"
    @change="changePagination" />
</template>

<script setup lang="ts">
  import { withDefaults } from "vue"

  // 接收父组件的数据: 分页组件配置
  withDefaults(
    defineProps<{
      layout?: string // 分页布局
      size?: string // 尺寸【small / default / large 】
      pageSizes?: number[] // 每页显示条数的选项设置
      background?: boolean // 是否为背景样式【背景true / 默认false】
      disabled?: boolean // 是否禁用【禁用true / 默认false】
      pagerCount?: number //设置最大页码按钮数。 页码按钮的数量，当总页数超过该值时会折叠
    }>(),
    {
      layout: "total, sizes, prev, pager, next, jumper",
      size: "default",
      singleHide: true,
      pageSizes: () => [10, 20, 30, 50],
      background: true,
      disabled: false
    }
  )

  // 接收父组件的响应式数据：总条数、当前页数、每页条数
  const total = defineModel<number>("total", { required: true, default: 0 })
  const current = defineModel<number>("current", { required: true, default: 1 })
  const pagesize = defineModel<number>("pagesize", { required: true, default: 10 })

  // 向父组件传递事件，定义事件
  const emit = defineEmits<{
    change: [current: number, pagesize: number]
  }>()

  // 当前页数、每页条数改变时触发
  function changePagination(current: number, pagesize: number) {
    // 触发 emits 事件
    emit("change", current, pagesize)
  }
</script>

<style lang="scss" scoped></style>
