<template>
  <div class="psd-parser">
    <!-- Element Plus 上传组件 -->
    <el-upload :action="''" :before-upload="handleBeforeUpload" :show-file-list="false" accept=".psd">
      <el-button type="primary">点击上传 PSD 文件</el-button>
    </el-upload>

    <!-- 模板树展示 -->
    <el-tree v-if="templateTreeData.length" ref="templateTree" :data="templateTreeData" :props="defaultProps"
      node-key="id" default-expand-all show-checkbox class="psd-tree" @check="handleNodeCheck">
      <template #default="{ node, data }">
        <span>{{ data.name }}</span>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import PSD from 'psd.js'

const templateTreeData = ref([])
const defaultProps = {
  children: 'children',
  label: 'name'
}
const templateTree = ref(null)
const emit = defineEmits(['update:selectedNodes', 'update:psdFile'])

// 处理上传前的文件：利用 URL.createObjectURL 生成临时 URL
const handleBeforeUpload = (file) => {
  const blobUrl = URL.createObjectURL(file)
  PSD.fromURL(blobUrl)
    .then(psd => {
      psd.parse()
      const treeData = psd.tree().export()
      processTreeData(treeData)
      emit('update:psdFile', file);
    })
    .catch(error => {
      console.error('解析 PSD 文件失败:', error)
    })
  return false  // 阻止自动上传
}

// 递归处理树形数据，添加 id 与模板标记
const processTreeData = (treeData) => {
  const traverse = (node) => {
    if (!node.id) {
      node.id = Math.random().toString(36).substr(2, 9)
    }
    if (node.name && node.name.startsWith('tpl-')) {
      node.isTemplate = true
    }
    if (!node.excelOrder) {
      node.excelOrder = -1
    }
    if (node.children && node.children.length) {
      node.children.forEach(child => traverse(child))
    }
  }
  traverse(treeData)
  templateTreeData.value = treeData.children || []
}

const handleNodeCheck = () => {
  // 获取所有选中的节点
  const checkedNodes = templateTree.value.getCheckedNodes(true);

  // 用于存储所有选中节点及其子节点的名称
  const selectedNodeNames = [];

  // 递归获取节点及其所有子节点的名称
  const collectNodeNames = (node) => {
    selectedNodeNames.push(node.name);
    if (node.children && node.children.length) {
      node.children.forEach(child => collectNodeNames(child));
    }
  };

  // 遍历所有选中的节点，收集名称
  checkedNodes.forEach(node => {
    collectNodeNames(node);
  });

  // 通过 emit 事件将选中的节点名称数组传递给父组件
  emit('update:selectedNodes', selectedNodeNames);
};
</script>

<style scoped>
.psd-parser {
  padding: 20px;
}

.psd-tree {
  margin-top: 20px;
  border: 1px solid #ebeef5;
  padding: 10px;
}
</style>