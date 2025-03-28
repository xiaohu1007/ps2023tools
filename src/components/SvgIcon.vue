
<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  iconClass: string
  fillColor?: string
  size?: number
  className?: string
}>(), {
  iconClass: '', // icon名称
  fillColor: '#fff', // 填充颜色
  size: 14, // 大小
  className: '', // 自定义类名
})


const iconName = computed(() => {
  return `#icon-${props.iconClass}`
})

const svgClass = computed(() => {
  if (props.className) {
    return 'svg-icon ' + props.className;
  } else {
    return 'svg-icon'
  }
})

</script>

<template>
  <svg :class="svgClass" :style="{width: `${props.size}vw`, height: `${props.size}vw`}" aria-hidden="true">
    <use :xlink:href="iconName" :color="props.fillColor" />
  </svg>
</template>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover !important;
  display: inline-block;
}
</style>
