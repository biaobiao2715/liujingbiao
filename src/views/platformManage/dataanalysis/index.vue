<!-- 
标题：			index.vue
功能：			专家培训
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-27
修改人信息：张峰     2025-11-6
修改内容：用于展示数据分析的列表和查询功能。
 -->

<template>
  <div class="p-2 legal-expert-page">
    <!-- 顶部展示区域 -->
    <div style="margin-bottom: 2%">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card>
            <div>
              <el-statistic group-separator="," :value="staticdata.serviceCount || 0" title="总服务次数"></el-statistic>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div>
              <el-statistic group-separator="," :value="staticdata.serviceDuration || 0" title="总时长(分钟)"></el-statistic>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div>
              <el-statistic group-separator="," :value="staticdata.totalConsultations || 0" title="总咨询量"></el-statistic>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card>
            <div>
              <el-statistic group-separator="," :value="staticdata.totalReplies || 0" title="总回复量"></el-statistic>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <!-- 查询区域 -->
    <div class="mb-[10px]">
      <el-form ref="queryFormRef" :model="queryParams" inline :label-width="80">
        <el-form-item label="专家类型" prop="expertType">
          <el-select v-model="queryParams.expertType" placeholder="请选择专家类型" filterable clearable>
            <el-option v-for="dict in static_expert_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="专家姓名" prop="expertName">
          <el-input v-model.trim="queryParams.expertName" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="专家编号" prop="expertNumber">
          <el-input v-model.trim="queryParams.expertNumber" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
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
        <el-button
          v-for="btn in timeButtons"
          :key="btn.value"
          :class="['custom-btn', { active: activeTime === btn.value }]"
          @click="handleTimeSelect(btn.value)"
        >
          {{ btn.label }}
        </el-button>
      </div>
      <div class="filter-date ml-4">
        <el-date-picker
          v-model="registrationTime"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          @change="handleSelectDate"
        />
      </div>
    </div>
    <!-- 列表区域 -->
    <el-table ref="tableRef" v-loading="loading" :data="expertList" style="width: 100%">
      <!-- <el-table-column type="selection" width="45" align="center" /> -->
      <el-table-column label="序号" width="60">
        <template #default="scope">
          <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="expertType" label="专家类型" min-width="100" align="center">
        <template #default="scope">
          <dict-tag :options="static_expert_type" :value="scope.row.expertType" />
        </template>
      </el-table-column>
      <el-table-column label="专家姓名" min-width="140" prop="expertName" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.expertName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="expertNumber" label="专家编号" min-width="130" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.expertNumber || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="serviceCount" label="服务次数" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.serviceCount || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="serviceDuration" label="服务时长" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.serviceDuration || '-' }}分钟</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalConsultations" label="总咨询量" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.totalConsultations || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="totalReplies" label="总回复量" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.totalReplies || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      v-model:total="total"
      @pagination="handleQuery"
    />
  </div>
</template>

<script setup name="LegalExpert" lang="ts">
import { ref } from 'vue';
import { getqueryExpertStaticData, getexpertTotalStaticData } from '@/api/platformManage/dataanalysis';
import router from '@/router';
import dayjs from 'dayjs';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { static_expert_type } = toRefs<any>(proxy?.useDict('static_expert_type'));
const expertList = ref([]);
const loading = ref(false);
const total = ref(0);
const staticdata = ref({
  serviceCount: 0,
  serviceDuration: 0,
  totalConsultations: 0,
  totalReplies: 0
});
const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<ElTableInstance>();

const registrationTime = ref<Array<string>>([]);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  expertName: '',
  expertNumber: '',
  expertType: '', //专家类型
  today: false, //是否只查询今天的数据
  yesterday: false, //是否只查询昨天的数据
  thisWeek: false //是否只查询本周的数据
});
const timeButtons = [
  { label: '昨日', value: 'yesterday' },
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' }
];
const activeTime = ref('');
/** 构建最终的查询参数 - 只传递为true的参数 */
const buildFinalParams = () => {
  const params = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    expertName: queryParams.value.expertName,
    expertNumber: queryParams.value.expertNumber,
    expertType: queryParams.value.expertType
  };

  // 只添加为true的时间参数
  if (queryParams.value.today) {
    params['today'] = true;
  }
  if (queryParams.value.yesterday) {
    params['yesterday'] = true;
  }
  if (queryParams.value.thisWeek) {
    params['thisWeek'] = true;
  }

  return params;
};
/** 重置所有时间参数为false */
const resetTimeParams = () => {
  queryParams.value.today = false;
  queryParams.value.yesterday = false;
  queryParams.value.thisWeek = false;
};

/** 根据日期判断对应的时间按钮 */
const getTimeButtonByDate = (startDate: string, endDate: string): string => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const now = dayjs();

  // 检查是否是今天
  if (start.format('YYYY-MM-DD') === now.format('YYYY-MM-DD') && end.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
    return 'today';
  }

  // 检查是否是昨天
  const yesterday = now.subtract(1, 'day');
  if (start.format('YYYY-MM-DD') === yesterday.format('YYYY-MM-DD') && end.format('YYYY-MM-DD') === yesterday.format('YYYY-MM-DD')) {
    return 'yesterday';
  }

  // 检查是否是本周
  const weekStart = now.startOf('week');
  const weekEnd = now.endOf('week');
  if (start.format('YYYY-MM-DD') === weekStart.format('YYYY-MM-DD') && end.format('YYYY-MM-DD') === weekEnd.format('YYYY-MM-DD')) {
    return 'week';
  }

  return ''; // 自定义日期范围
};
/** 处理时间按钮选择 */
const handleTimeSelect = (type: string) => {
  activeTime.value = type;

  // 重置所有时间参数
  resetTimeParams();

  const now = dayjs();
  let start, end;

  switch (type) {
    case 'yesterday':
      queryParams.value.yesterday = true;
      start = now.subtract(1, 'day').startOf('day').format('YYYY-MM-DD HH:mm:ss');
      end = now.subtract(1, 'day').endOf('day').format('YYYY-MM-DD HH:mm:ss');
      break;
    case 'today':
      queryParams.value.today = true;
      start = now.startOf('day').format('YYYY-MM-DD HH:mm:ss');
      end = now.endOf('day').format('YYYY-MM-DD HH:mm:ss');
      break;
    case 'week':
      queryParams.value.thisWeek = true;
      start = now.startOf('week').format('YYYY-MM-DD HH:mm:ss');
      end = now.endOf('week').format('YYYY-MM-DD HH:mm:ss');
      break;
    default:
      start = '';
      end = '';
  }

  registrationTime.value = [start, end];
  handleQuery(); // 自动执行查询
};

const handleSelectDate = (val: Array<string>) => {
  if (val && val.length === 2) {
    // 根据选择的日期判断对应的时间按钮
    const buttonType = getTimeButtonByDate(val[0], val[1]);
    activeTime.value = buttonType;

    // 重置所有时间参数
    resetTimeParams();

    // 根据按钮类型设置对应的时间参数
    if (buttonType === 'today') {
      queryParams.value.today = true;
    } else if (buttonType === 'yesterday') {
      queryParams.value.yesterday = true;
    } else if (buttonType === 'week') {
      queryParams.value.thisWeek = true;
    }
    // 如果是自定义日期范围，所有时间参数保持false
  } else {
    // 清空选择时，重置状态
    activeTime.value = '';
    resetTimeParams();
  }

  handleQuery();
};
const getList = () => {
  loading.value = true;
  const finalParams = buildFinalParams();
  console.log('最终查询参数:', finalParams);
  getqueryExpertStaticData(finalParams)
    .then((res) => {
      expertList.value = res?.data.records || [];
      total.value = res.data.total || 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

/* 查询专家知道静态数据总量 */
const getstaticData = async () => {
  try {
    let res = await getexpertTotalStaticData();
    staticdata.value = res.data || {};
  } catch (error) {
    ElMessage.error(error || '查询失败');
  }
};
/** 监听日期选择器变化，同步按钮状态 */
watch(
  registrationTime,
  (newVal) => {
    if (!newVal || newVal.length !== 2) {
      activeTime.value = '';
      resetTimeParams();
      return;
    }

    // 当日期选择器值变化时，自动判断对应的时间按钮
    const buttonType = getTimeButtonByDate(newVal[0], newVal[1]);
    activeTime.value = buttonType;

    // 重置并设置对应的时间参数
    resetTimeParams();
    if (buttonType === 'today') {
      queryParams.value.today = true;
    } else if (buttonType === 'yesterday') {
      queryParams.value.yesterday = true;
    } else if (buttonType === 'week') {
      queryParams.value.thisWeek = true;
    }
  },
  { deep: true }
);
// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  registrationTime.value = [];
  activeTime.value = '';

  // 重置查询参数
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  queryParams.value.expertName = '';
  queryParams.value.expertNumber = '';
  queryParams.value.expertType = '';

  // 重置时间参数
  resetTimeParams();

  handleQuery();
};

// 页面首次加载时执行
onMounted(() => {
  handleTimeSelect('today'); // 默认选中今日
  getstaticData();
});
// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});
</script>

<style scoped lang="scss">
.legal-expert-page {
  min-height: calc(100vh - 120px);
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
      // background-color: #409eff;
      background-color: var(--el-color-primary);
      color: #fff;
    }
  }
}
</style>
