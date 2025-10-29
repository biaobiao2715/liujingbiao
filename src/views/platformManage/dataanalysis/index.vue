<!-- 
标题：			index.vue
功能：			专家培训
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-27
修改人信息：张峰     2025-10-28
修改内容：用于展示数据分析的列表和查询功能。
 -->

<template>
  <div class="p-2 legal-expert-page">
    <el-card shadow="hover">
      <!-- 顶部展示区域 -->
      <div style="margin-bottom: 2%;">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card>
              <div>
                <el-statistic group-separator=","  :value="servicecount" title="总服务次数"></el-statistic>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div>
                <el-statistic group-separator=","  :value="servicetime" title="总时长"></el-statistic>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div>
                <el-statistic group-separator=","  :value="consultingcount" title="总咨询量"></el-statistic>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div>
                <el-statistic group-separator=","  :value="replycount" title="总回复量"></el-statistic>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <!-- 查询区域 -->
      <div class="mb-[10px]">
        <el-form ref="queryFormRef" :model="queryParams" inline :label-width="80">
          <el-form-item label="专家类型" prop="expertName">
            <el-select v-model="queryParams.reviewStatus" placeholder="请选择专家类型" filterable clearable>
              <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="专家姓名" prop="expertNumber">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="专家编号" prop="reviewStatus">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <!-- <el-form-item label="入驻时间">
            <el-date-picker v-model="registrationTime" type="daterange" value-format="YYYY-MM-DD" range-separator=" - "
              start-placeholder="开始时间" end-placeholder="结束时间" @change="handleSelectDate" />
          </el-form-item> -->
          <el-form-item>
            <el-button v-throttle type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- 日期筛选区域 -->
      <div class="date-filter flex items-center mb-[10px]">
        <div class="filter-buttons flex items-center gap-2">
          <el-button v-for="btn in timeButtons" :key="btn.value"
            :class="['custom-btn', { active: activeTime === btn.value }]" @click="handleTimeSelect(btn.value)">
            {{ btn.label }}
          </el-button>
        </div>
        <div class="filter-date ml-4">
          <el-date-picker v-model="registrationTime" type="daterange" value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss" range-separator=" - " start-placeholder="开始时间" end-placeholder="结束时间"
            @change="handleSelectDate" />
        </div>
      </div>
      <!-- 列表区域 -->
      <el-table ref="tableRef" v-loading="loading" border
        :data="expertList.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)"
        style="width: 100%">
        <!-- <el-table-column type="selection" width="45" align="center" /> -->
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expertName" label="专家类型" min-width="100" align="center" />
        <el-table-column label="专家姓名" min-width="140" align="center">
          <template #default="scope">
            <el-link type="primary">{{ scope.row.expertNumber || '--' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="phoneNumber" label="专家编码" min-width="130" align="center" />
        <el-table-column prop="registrationTime" label="服务次数" min-width="160" align="center" />
        <el-table-column prop="registrationTime" label="服务时长" min-width="160" align="center" />
        <el-table-column prop="registrationTime" label="总咨询量" min-width="160" align="center" />
        <el-table-column prop="registrationTime" label="总回复量" min-width="160" align="center" />
        <!-- <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <div style="display: flex; justify-content: space-evenly; align-items: center">
              <el-link type="primary" v-if="scope.row.reviewStatus === '1'"
                @click="handleEdit(scope.row, 'view')">查看</el-link>
              <el-link type="primary" v-if="scope.row.reviewStatus === '0'"
                @click="handleEdit(scope.row, 'audit')">审核</el-link>
              <el-link type="primary" v-if="scope.row.reviewStatus === '0'"
                @click="handleEdit(scope.row, 'edit')">编辑</el-link>
            </div>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
        :total="total" @pagination="handleQuery" />
    </el-card>
  </div>
</template>

<script setup name="LegalExpert" lang="ts">
import { ref } from 'vue';
import { LegalExpertListRequest, LegalExpertList } from '@/api/platform/legalExpert/types';
import { getLegalExpertList, reviewStatusMap } from '@/api/platform/legalExpert';
import router from '@/router';
import dayjs from 'dayjs';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status } = toRefs<any>(proxy?.useDict('review_status'));
const expertList = ref<LegalExpertList[]>([]);
const loading = ref(false);
const total = ref(0);
const servicecount = ref(126560) //总服务次数
const servicetime = ref(8846) //总时长
const consultingcount = ref(6560) //总咨询量
const replycount = ref(1102) //总回复量
const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<ElTableInstance>();

const registrationTime = ref<Array<string>>([]);

const queryParams = ref<LegalExpertListRequest>({
  pageNum: 1,
  pageSize: 10,
  expertName: '',
  expertNumber: '',
  reviewStartTime: '',
  reviewEndTime: '',
  reviewStatus: ''
});
const timeButtons = [
  { label: '昨日', value: 'yesterday' },
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' }
];
const activeTime = ref('');

// 选择时间段按钮逻辑
const handleTimeSelect = (type: string) => {
  activeTime.value = type;

  let start, end;
  const now = dayjs();

  switch (type) {
    case 'yesterday':
      start = now.subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
      end = start;
      break;
    case 'today':
      start = now.format('YYYY-MM-DD HH:mm:ss');
      end = start;
      break;
    case 'week':
      start = now.startOf('week').format('YYYY-MM-DD HH:mm:ss');
      end = now.endOf('week').format('YYYY-MM-DD HH:mm:ss');
      break;
  }
  registrationTime.value = [start, end];
  handleSelectDate([start, end]);
  handleQuery(); // 自动执行查询
}
const getList = () => {
  loading.value = true;
  getLegalExpertList(queryParams.value)
    .then((res) => {
      expertList.value = res?.rows || [];
      total.value = res.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
};
// 保证手动选日期也能清除按钮激活状态
watch(registrationTime, (val) => {
  if (!val?.length) {
    activeTime.value = '';
  }
});
// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  registrationTime.value = [];
  queryParams.value.expertName = '';
  queryParams.value.expertNumber = '';
  queryParams.value.reviewStartTime = '';
  queryParams.value.reviewEndTime = '';
  queryParams.value.reviewStatus = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};

const handleSelectDate = (val: Array<string>) => {
  queryParams.value.reviewStartTime = val?.[0] || '';
  queryParams.value.reviewEndTime = val?.[1] || '';
};

// 操作
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  // TODO: 跳转编辑页面或弹出编辑弹窗携带type参数
  router.push({
    path: '/platform/legalExpert/details',
    query: {
      id: row.id,
      type
    }
  });
};
// 页面首次加载时执行
onMounted(() => {
  handleTimeSelect('today'); // 默认选中今日
});
// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});
</script>

<style scoped lang="scss">
.legal-expert-page {
  .table-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.date-filter {
  display: flex;
  align-items: center;

  .filter-buttons {
    display: flex;
    gap: 8px;
  }

  .filter-date {
    margin-left: 16px; // 按钮与时间选择器的间距
  }

  .custom-btn {
    background-color: #f2f2f2;
    border: none;
    color: #333;
    padding: 6px 16px;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background-color: #e0e0e0;
    }

    &.active {
      background-color: #409EFF;
      color: #fff;
    }
  }
}
</style>
