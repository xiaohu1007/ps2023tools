<template>
  <el-container>
    <el-aside width="400px">
      <PsdParser @update:psdFile="handlepsdFile" @update:selectedNodes="handleSelectedNodesUpdate" />
    </el-aside>
    
    <el-main>
      <el-row :gutter="20">
        <ExcelHeaderGenerator :psdFile="psdFile" :selectedNodes="selectedNodes" />
      </el-row>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';
import PsdParser from '@/components/PsdParser.vue';
import ExcelHeaderGenerator from '@/components/ExcelHeaderGenerator.vue';

const selectedNodes = ref([])
const psdFile = ref();

const handleSelectedNodesUpdate = (nodes) => {
  selectedNodes.value = nodes
}

const handlepsdFile = (file) => {
  psdFile.value = file
}

</script>