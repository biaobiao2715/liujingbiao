<template>
  <div class="populariz-law">
    <el-card>
      <template #header>
        <div class="card-header">普法宣传</div>
      </template>
      <!-- <el-tabs v-model="activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab" :name="index.toString()"> </el-tab-pane>
      </el-tabs> -->

      <el-segmented v-model="activeTab" :options="tabsList" />

      <div class="data-list">
        <div v-for="item in dataList" :key="item.type">
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 改成lable value形式
const tabsList = [
  { label: '国家政策法规', value: 'policy' },
  { label: '普法活动', value: 'activity' },
  { label: '普法白皮书', value: 'whitepaper' }
];
const activeTab = ref('policy');

const dataList = ref([
  {
    type: '0',
    title: '国家政策法规',
    content: '国家政策法规是指国家按照法律、法规、规章等规定，对社会、经济、文化等方面进行管理和规范的法律文件。'
  },
  {
    type: '1',
    title: '普法活动',
    content: '普法活动是指通过各种形式和渠道，向广大群众宣传法律知识，提高法律意识和法律素养的活动。'
  },
  {
    type: '2',
    title: '普法白皮书',
    content: '普法白皮书是指由政府或相关机构编写的，系统介绍法律法规、法律制度和法律实践情况的权威性文件。'
  }
]);

onMounted(() => {
  getDataList();
});

const handleTabChange = (tab: any) => {
  console.log('当前选中的标签:', tab);
  getDataList();
};

const getDataList = async () => {
  console.log(activeTab.value);
};
</script>

<style scoped lang="scss">
.populariz-law {
  flex: 1.5;
  .card-header {
    font-size: 20px;
    font-weight: bold;
  }
  .data-list {
    height: 544px;
    overflow: auto;
    margin-top: 12px;
  }
  .content {
    font-size: 16px;
    line-height: 1.5;
  }
}
</style>
