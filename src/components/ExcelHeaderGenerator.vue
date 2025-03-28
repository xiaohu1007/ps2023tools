<template>
  <!-- <el-input 
    style="width: 200px; margin-bottom: 20px; margin-right: 10px;" 
    placeholder="文件所在目录路径" 
    v-model="baseFilePath"
  /> -->
  <!-- 开启文件夹上传，multiple 表示可以多选 -->
  <el-upload
    :before-upload="handleBeforeUpload"
    :http-request="handleUpload"
    :show-file-list="false"
    accept="*"
    multiple
    ref="uploadRef"
  >
    <el-button type="primary">点击上传图片</el-button>
  </el-upload>

  <!-- <el-button type="success" @click="exportToCsv" style="margin-bottom: 20px; margin-left: 10px;">导出数据</el-button> -->
  <!-- <el-button type="warning" @click="clearTable" style="margin-bottom: 20px; margin-left: 10px;">生成脚本</el-button> -->
  <el-button type="success" @click="exportZip" style="margin-bottom: 20px; margin-left: 10px;">生成脚本压缩包</el-button>
  <el-button @click="clearTable" style="margin-bottom: 20px; margin-left: 10px;">清空列表</el-button>
  <!-- 触发播放的按钮 -->
  <el-button type="warning" @click="showVideo = true" style="margin-bottom: 20px; margin-left: 10px;">
    播放视频教程
  </el-button>

  <el-table
    :data="tableData"
    style="width: 100%"
    border
    ref="tableRef"
  >
    <!-- 动态生成表头，支持拖拽排序 -->
    <el-table-column
      v-for="(header, index) in selectedNodes"
      :key="index"
      :label="header"
      :prop="header"
    >
      <template #header>
        <div class="drag-handle">
          {{ header }}
          <el-icon><Rank /></el-icon>
        </div>
      </template>
      <template #default="scope">
        <!-- 如果当前单元格正在编辑，则显示输入框 -->
          <div style="height: 40px; display: flex; align-items: center;" v-if="isEditing(scope.$index, index)">
            <el-input
              v-model="editedValue"
              @blur="saveEdit(scope.$index, index)"
              @keyup.enter="saveEdit(scope.$index, index)"
              autofocus
            />
          </div>
          <!-- 否则显示文本，并绑定双击事件进入编辑模式 -->
          <div style="height: 40px; display: flex; align-items: center;" v-else @dblclick="editCell(scope.$index, index, scope.row[index])">
            <span>{{ scope.row[index] }}</span>
          </div>
      </template>
    </el-table-column>
  </el-table>

    <!-- 视频播放弹窗 -->
    <el-dialog v-model="showVideo" title="视频教程" width="60%" :before-close="handleClose">
    <video ref="videoPlayer" width="100%" controls>
      <source src="/视频教程.mp4" type="video/mp4" />
      您的浏览器不支持 HTML5 视频标签，请尝试使用现代浏览器。
    </video>
  </el-dialog>
</template>

<script setup>
import { Rank } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';
import JSZip from 'jszip';

// 定义响应式变量
const uploadRef = ref(null);
const tableData = ref([]);       // 存储表格数据

const showVideo = ref(false); // 控制弹窗显示
const videoPlayer = ref(null);

// 新增变量：保存上传的图片文件
const uploadedImages = ref([]);

// 通过 props 获取外部传入的初始表头
const props = defineProps({
  selectedNodes: {
    type: Array,
    default: () => [],
  },
  psdFile: {
    type: Object,
    default: () => {},
  }
});
// ref 获取 Element Plus 表格组件，后续通过 $el 获取 DOM 节点
const tableRef = ref(null)
// 保存当前表头顺序
const headersOrder = ref([])

// Sortable 实例引用
let sortableInstance = null

/**
 * 初始化拖拽
 */
const initSortable = () => {
  // 获取表格根 DOM（Element Plus 的表格组件需通过 $el 获取真实 DOM）
  const tableEl = tableRef.value?.$el
  if (!tableEl) return
  
  // 定位到表头行（根据 Element Plus 内部结构）
  const tableHeader = tableEl.querySelector('.el-table__header-wrapper thead tr')
  if (!tableHeader) return
  
  // 如果 headersOrder 未初始化，则从 DOM 中获取初始表头顺序
  headersOrder.value = Array.from(tableHeader.querySelectorAll('th'))
    .map(th => th.innerText.trim())
  
  // 初始化 Sortable 实例，使用 onUpdate 事件确保顺序变化后获取更新的顺序
  sortableInstance = new Sortable(tableHeader, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    handle: '.drag-handle', // 仅允许拖拽句柄触发
    onEnd: () => {
      // 等待 DOM 更新完成后重新获取表头顺序
      nextTick(() => {
        const updatedHeaders = Array.from(tableHeader.querySelectorAll('th'))
          .map(th => th.innerText.trim())
        headersOrder.value = updatedHeaders
      })
    },
  })
}

// 监听外部传入的表头变化，更新 headersOrder 并重新初始化拖拽
watch(
  () => props.selectedNodes,
  async () => {
    // 销毁已有的 Sortable 实例，防止重复初始化
    if (sortableInstance) {
      sortableInstance.destroy()
      sortableInstance = null
    }
    await nextTick()
    initSortable()
  },
  { deep: true, immediate: true }
)

// 在组件卸载时销毁 Sortable 实例，避免内存泄漏
onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
})

/* ===== 单元格编辑相关 ===== */
// 当前正在编辑的单元格，包含行索引和表头字段
const editingCell = ref({ rowIndex: null, header: null })
// 当前编辑的值
const editedValue = ref('')

// 判断是否正在编辑当前单元格
const isEditing = (rowIndex, index) => {
  return editingCell.value.rowIndex === rowIndex && editingCell.value.index === index
}

// 双击进入编辑模式，传入行索引、表头和当前值
const editCell = (rowIndex, index, currentValue) => {
  editingCell.value = { rowIndex, index }
  editedValue.value = currentValue
}

// 编辑完成，保存修改并退出编辑状态
const saveEdit = (rowIndex, index) => {
  // 更新 tableData 中对应单元格的值
  console.log(tableData.value, rowIndex, index, editedValue.value)
  tableData.value[rowIndex][index] = editedValue.value
  // 清空编辑状态
  editingCell.value = { rowIndex: null, header: null }
}

// 清空表格数据
const clearTable = () => {
  tableData.value = [];
};

// 导出 CSV 文件（增加简单转义处理）
const exportToCsv = () => {
  // 拼接 CSV 头部
  const headerLine = headersOrder.value.map(field => `${field}`).join(',');
  let csvContent = headerLine + '\n';
  
  // 拼接每一行数据
  tableData.value.forEach(row => {
    const rowLine = row.map(cell => `${cell}`).join(',');
    csvContent += rowLine + '\n';
  });
  
  // 创建 Blob 对象并下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'tableData.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 文件上传前校验（可根据需求扩展）
const handleBeforeUpload = (file) => {
  // 这里可以添加文件格式或大小的校验逻辑
  return true;
};

// 自定义文件上传逻辑：处理文件名，解析数据后存入 tableData
const handleUpload = ({ file }) => {
  const fileName = file.name; // 例如："test+ces2+333.img"
  // 去除扩展名
  const lastDot = fileName.lastIndexOf('.');
  const baseName = lastDot !== -1 ? fileName.substring(0, lastDot) : fileName;
  
  // 按 "+" 分隔文件名（可以增加容错处理）
  const parts = baseName.split('+');
  
  // 拼接相对文件路径（如果 file.webkitRelativePath 可用，优先使用）
  const filePath = file.name;
  
  // 将处理后的数据存入 tableData，格式为：[文件路径, ...文件名拆分部分]
  tableData.value.push([filePath, ...parts]);

   // 如果文件是图片类型，则存入 uploadedImages 数组（根据 MIME 类型判断）
  if (file.type && file.type.startsWith("image/")) {
    uploadedImages.value.push(file);
  }
};

// 生成压缩包：包含表格数据 CSV 和本地 assets 下的批量脚本.jsx
const exportZip = async () => {
  // 生成 CSV 内容（可替换为 Excel 格式的生成逻辑）
  const headerLine = headersOrder.value.map(field => `${field}`).join(',');
  let csvContent = headerLine + '\n';
  
  tableData.value.forEach(row => {
    const rowLine = row.map(cell => `${cell}`).join(',');
    csvContent += rowLine + '\n';
  });
  
  // 新建 JSZip 实例
  const zip = new JSZip();
  // 添加 CSV 文件到压缩包
  zip.file("tableData.csv", csvContent);
  
  // 获取本地 assets 文件夹下的批量脚本.jsx 文件
  try {
    // 注意：路径根据项目配置可能需要调整（例如 '/assets/批量脚本.jsx'）
    const response = await fetch('/public/批量脚本.jsx');
    if (!response.ok) {
      throw new Error("Failed to fetch 批量脚本.jsx");
    }
    const scriptContent = await response.text();
    zip.file("批量脚本.jsx", scriptContent);
  } catch (error) {
    console.error("Error fetching 批量脚本.jsx:", error);
    // 如果获取失败，可放入一份提示内容
    zip.file("批量脚本.jsx", "// 无法加载批量脚本.jsx文件");
  }

  // 将上传的图片添加到 zip 包内的 img 文件夹
  uploadedImages.value.forEach(file => {
    zip.file("img/" + file.name, file);
  });

  // 将上传的图片添加到 zip 包内的 img 文件夹
  zip.file(props.psdFile.name, props.psdFile);
  
  // 生成压缩包 Blob 并触发下载
  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = "模板批量替换.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 关闭弹窗时，暂停视频播放
 */
const handleClose = () => {
  if (videoPlayer.value) {
    videoPlayer.value.pause();
  }
  showVideo.value = false;
};

</script>

<style scoped>
.drag-handle {
  display: flex;
  align-items: center;
  cursor: move;
}

.drag-handle .el-icon {
  margin-left: 5px;
}

.sortable-ghost {
  opacity: 0.5;
  background: #f8f8f8;
}
</style>
