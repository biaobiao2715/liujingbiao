<!--
标题：			addmeeting.vue
功能：			新增会议
说明:
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-31
修改人信息：张峰     2025-11-4
修改内容：新增,编辑，详情会议
 -->
<template>
  <el-dialog
    v-model="visible"
    width="50%"
    :title="modeTitleMap[mode]"
    :close-on-click-modal="false"
    show-close
    @close="handleClose"
    class="add-meeting-dialog"
  >
    <!-- 内容区 -->
    <div class="dialog-body">
      <el-form ref="formRef" :model="form" label-width="110px" label-position="left" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="12" v-if="isView">
            <el-form-item label="培训会议状态" prop="meetingStatus">
              <el-select v-model="form.meetingStatus" filterable clearable placeholder="请选择所属状态" :disabled="isView">
                <el-option v-for="dict in meeting_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="培训会议标题" prop="meetingName">
              <el-input v-model.trim="form.meetingName" placeholder="请输入培训会议标题" :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="培训会议类型" prop="meetingType">
              <el-select v-model="form.meetingType" placeholder="请选择培训会议类型" :disabled="isView">
                <el-option v-for="dict in meeting_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="培训会议地址" prop="meetingAddress">
              <el-input v-model.trim="form.meetingAddress" placeholder="请输入培训会议地址" :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议时间" prop="meetingStartTime" :required="true">
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm"
                format="YYYY-MM-DD HH:mm"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                range-separator=" - "
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="handleSelectDate"
                :disabled="isView"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="会议联系人" prop="meetingContact">
              <el-input v-model.trim="form.meetingContact" placeholder="请输入会议联系人" :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人电话" prop="meetingPhone">
              <el-input v-model.trim="form.meetingPhone" placeholder="请输入联系人电话" :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="props.data.data && props.data.data.meetingStatus == '99'">
            <el-form-item label="取消原因" prop="cancelReason">
              <el-input v-model.trim="form.cancelReason" placeholder="请输入取消原因" :disabled="isView" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邀请专家" :required="true" prop="experts">
              <span v-if="isView">专家总人数：{{ selectedCount }} 人</span>
              <el-button v-else type="primary" @click="invitation" :disabled="isView">添加</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <!-- 选中的数据 -->
      <el-table ref="tableRef" :data="paginatedSelectedExperts" border v-loading="formloading" style="width: 100%">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column label="专家类型" align="center" prop="expertType" width="180">
          <template #default="scope">
            {{ scope.row.expertType === '1' ? '技术专家' : '法务专家' }}
          </template>
        </el-table-column>
        <el-table-column label="专家姓名" align="center" prop="expertName" width="180" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.expertName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="专家性别" align="center" prop="sex" :show-overflow-tooltip="true" min-width="120">
          <template #default="scope">
            <dict-tag :options="sys_user_sex" :value="scope.row.sex || scope.row.expertSex" />
          </template>
        </el-table-column>
        <el-table-column label="专家编号" align="center" prop="expertCode" :show-overflow-tooltip="true" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.expertCode || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" align="center" width="120">
          <template #default="scope">
            <span> {{ scope.row.contactPhone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="100">
          <template #default="scope">
            <el-button @click="handleDelete(scope.row)" type="text" :disabled="isView" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 已选专家分页 -->
      <div class="flex-center justify-end pagination" v-if="form.experts && form.experts.length > 0">
        <pagination
          v-show="selectedTotal > 0"
          :page="selectedQueryParams.pageNum"
          :limit="selectedQueryParams.pageSize"
          :total="selectedTotal"
          @pagination="handleSelectedPagination"
        />
      </div>

      <!-- 报名的专家 -->
      <div v-if="isView" style="margin-top: 50px; font-size: 16px; font-weight: 700; margin-bottom: 10px">
        报名参加会议人员信息
        <span style="color: #666; font-size: 14px">(报名人数：{{ registrantsNumber }}人)</span>
      </div>
      <el-table v-if="isView" ref="tableRef" :data="registration" border v-loading="registrationloading" style="table-layout: fixed">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column label="报名人姓名" align="center" prop="expertName" :show-overflow-tooltip="true">
          <template #default="scope">
            <span>{{ scope.row.enrollUserNickName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报名人联系电话" align="center">
          <template #default="scope">
            <span> {{ scope.row.enrollUserPhone || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="isView" class="flex-center justify-end pagination">
        <pagination
          v-show="registrationTotal > 0"
          v-model:page="registrationParams.pageNum"
          v-model:limit="registrationParams.pageSize"
          v-model:total="registrationTotal"
          @pagination="() => getRegistrationInfo(props?.data?.data?.id)"
        />
      </div>
    </div>
    <template #footer>
      <!-- 底部按钮 -->
      <div style="text-align: right; margin-top: 20px">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="!isView" type="primary" :loading="saveloading" @click="handleSave"> 发布 </el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogVisible" width="70%">
    <!-- 自定义头部区域 -->
    <template #header>
      <div>
        <span style="font-weight: bold; font-size: 16px">邀请专家</span>
        <!-- 已选择人数 -->
        <span style="font-size: 14px; color: #666"> (已选择 {{ selectedCount }} 人) </span>
      </div>
    </template>
    <!-- 查询 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="70" label-position="left">
      <el-form-item label="专家姓名">
        <el-input v-model.trim="queryParams.expertName" placeholder="请输入专家姓名" clearable />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleQuery">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格内容 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="技术专家" name="technology"></el-tab-pane>
      <el-tab-pane label="法务专家" name="legalaffairs"></el-tab-pane>
    </el-tabs>
    <el-table ref="tableRef" :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="专家类型" align="center" prop="expertType" width="180">
        <span>{{ activeName === 'technology' ? '技术专家' : '法务专家' }}</span>
      </el-table-column>
      <el-table-column label="专家姓名" align="center" prop="expertName" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.expertName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="专家性别" align="center" prop="sex" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.sex" />
        </template>
      </el-table-column>
      <el-table-column label="专家编号" align="center" prop="expertCode" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.expertNumber || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" width="120">
        <template #default="scope">
          <span> {{ activeName === 'technology' ? scope.row.contactPhone || '-' : scope.row.phoneNumber || '-' }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="flex-center pagination" style="display: flex; justify-content: end; align-items: end">
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        v-model:total="total"
        @pagination="getexpert"
      />
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmExperts">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance, nextTick, onMounted } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox, ElTable } from 'element-plus';
import {
  getcultivateExpertList,
  getbaseLegalExpertInfoList,
  AddHnMeetingCultivate,
  EditHnMeetingCultivate,
  getactivityEnrollList
} from '@/api/skill/HnMeetingCultivate';
interface Props {
  modelValue: boolean;
  data?: any;
  mode?: 'add' | 'edit' | 'view';
}
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { meeting_status } = toRefs<any>((proxy as any)?.useDict('meeting_status')); //会议状态
const { meeting_type } = toRefs<any>((proxy as any)?.useDict('meeting_type')); //会议类别
const { expert_type } = toRefs<any>((proxy as any)?.useDict('expert_type')); //专家类型
const { sys_user_sex } = toRefs<any>((proxy as any)?.useDict('sys_user_sex')); //专家性别
const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'save']);
const visible = ref(props.modelValue);
const formRef = ref();
const loading = ref(false);
const formloading = ref(false);
const selectedRows = ref([]); // 选中的表格数据
const selectedIds = ref([]); //选中数据的Id
const tableData = ref(); //表格数据
const total = ref();
const saveloading = ref(false); //发布loading
const tableRef = ref<InstanceType<typeof ElTable>>();
const selectionMap = ref(new Map());
const registration = ref(); //报名的专家信息
const registrationloading = ref(false);
const registrationTotal = ref();
const registrantsNumber = ref(0); //报名人数
const form = ref({
  meetingName: '', //会议标题
  meetingType: '', //会议类型
  meetingAddress: '', //培训会议地址
  meetingEndTime: '', // 会议结束时间
  meetingStartTime: '', // 会议开始时间
  meetingContact: '', //会议联系人
  meetingPhone: '', //联系人电话
  cancelReason: '', //取消原因
  meetingStatus: '', //会议状态
  experts: [] // 邀请的专家
});
const activeName = ref('technology');
/* 专家查询条件 */
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  expertName: '', //专家姓名
  reviewStatus: '1', //审核状态
  startStopStatus: '1' //启用状态
});
/* 报名专家分页参数 */
const registrationParams = ref({
  pageNum: 1,
  pageSize: 10,
  activityType: '0',
  foreignId: ''
});
// 已选专家的分页参数
const selectedQueryParams = ref({
  pageNum: 1,
  pageSize: 10
});
const selectedTotal = computed(() => form.value.experts?.length || 0);
// 模式标题映射
const modeTitleMap: Record<string, string> = {
  add: '新增培训会议',
  edit: '编辑培训会议',
  view: '查看培训会议'
};
const dateRange = ref<string[]>([]); // 会议日期范围
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val;
    setTimeout(() => {
      formRef.value.clearValidate();
    });
  }
);

watch(
  () => props.data,
  async (val) => {
    console.log(val, 'val');

    if ((props.mode === 'edit' || props.mode === 'view') && val && val.data) {
      console.log('dadsadasdas');

      form.value = { ...val.data };

      // 回显会议时间
      if (val.data.meetingStartTime && val.data.meetingEndTime) {
        // 将时间格式转换为日期范围选择器需要的格式
        dateRange.value = [
          val.data.meetingStartTime, // "2025-11-12 00:00:00"
          val.data.meetingEndTime // "2025-12-16 00:00:00"
        ];
      } else {
        dateRange.value = [];
      }
      if (val.data.experts) {
        // 编辑回显时，确保专家数据有 id 字段
        const techExperts = val.data.experts
          .filter((e) => e.expertType === '1')
          .map((expert) => ({
            id: expert.id, // 确保有 id 字段
            expertId: expert.expertId,
            expertName: expert.expertName,
            expertType: expert.expertType,
            contactPhone: expert.contactPhone,
            sex: expert.expertSex
          }));

        const legalExperts = val.data.experts
          .filter((e) => e.expertType === '2')
          .map((expert) => ({
            id: expert.id, // 确保有 id 字段
            expertId: expert.expertId,
            expertName: expert.expertName,
            expertType: expert.expertType,
            contactPhone: expert.contactPhone,
            sex: expert.expertSex
          }));

        selectionMap.value.set('technology', techExperts);
        selectionMap.value.set('legalaffairs', legalExperts);
        console.log('selectionMap.value', selectionMap.value.get('technology'));
        console.log('legalaffairs.value', selectionMap.value.get('legalaffairs'));
        console.log('form.experts', form.value.experts);
      }
      // 在查看模式下获取报名信息
      if (props.mode === 'view' && val.data.id) {
        await getRegistrationInfo(val.data.id);
      }
    } else if (props.mode === 'add') {
      // 新增时重置表单
      resetForm();
    }
  }
);
/* 报名信息 */
const getRegistrationInfo = async (id) => {
  console.log('props.data', props.data);

  registrationloading.value = true;
  registrationParams.value.foreignId = id;
  try {
    const res = await getactivityEnrollList(registrationParams.value);
    if (res.code === 200) {
      registration.value = res.rows || [];
      registrationTotal.value = res.total || 0;
      registrantsNumber.value = res.rows.length || 0;
      console.log('报名信息获取成功:', registration.value);
    } else {
      ElMessage.error(res.msg || '获取报名信息失败');
    }
  } catch (error) {
    console.error('获取报名信息失败:', error);
    ElMessage.error('获取报名信息失败，请稍后重试');
  } finally {
    registrationloading.value = false;
  }
};
// 分页后的已选专家数据
const paginatedSelectedExperts = computed(() => {
  if (!form.value.experts || form.value.experts.length === 0) {
    return [];
  }

  const start = (selectedQueryParams.value.pageNum - 1) * selectedQueryParams.value.pageSize;
  const end = start + selectedQueryParams.value.pageSize;
  return form.value.experts.slice(start, end);
});

// 处理已选专家分页
const handleSelectedPagination = (pagination: any) => {
  selectedQueryParams.value.pageNum = pagination.page;
  selectedQueryParams.value.pageSize = pagination.limit;
};
// 重置表单函数
const resetForm = () => {
  form.value = {
    meetingName: '', //会议标题
    meetingType: '', //会议类型
    meetingAddress: '', //培训会议地址
    meetingEndTime: '', // 会议结束时间
    meetingStartTime: '', // 会议开始时间
    meetingContact: '', //会议联系人
    meetingPhone: '', //联系人电话
    cancelReason: '', //取消原因
    meetingStatus: '', //会议状态
    experts: [] // 邀请的专家
  };
  dateRange.value = [];
  selectionMap.value.clear();
};
/* 邀请专家弹窗 */
const dialogVisible = ref(false);
const isView = computed(() => props.mode === 'view');
// 校验规则
const rules = {
  meetingName: [
    { required: true, message: '请输入发布培训会议标题内容', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,30}$/, message: '最多支持30个汉字或字符', trigger: 'blur' }
  ],
  meetingType: [{ required: true, message: '请选择培训会议类型', trigger: 'change' }],
  meetingAddress: [
    { required: true, message: '请输入会议地址', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]{1,30}$/, message: '最多支持30个汉字或字符', trigger: 'blur' }
  ],
  meetingStartTime: [
    {
      validator: (rule: any, value: any, callback: any) => {
        const start = form.value.meetingStartTime;
        const end = form.value.meetingEndTime;
        if (!start || !end) {
          return callback(new Error('请选择会议时间'));
        }
        const parseTs = (s: string) => {
          // 把 "YYYY-MM-DD HH:mm[:ss]" 转为可被 Date 解析的 ISO 字符串
          try {
            return new Date(s.replace(' ', 'T')).getTime();
          } catch {
            return NaN;
          }
        };
        const now = Date.now();
        const startTs = parseTs(start);
        const endTs = parseTs(end);
        if (isNaN(startTs) || isNaN(endTs)) {
          return callback(new Error('会议时间格式错误'));
        }
        if (startTs < now) {
          return callback(new Error('会议开始时间不得小于当前时间'));
        }
        if (endTs < now) {
          return callback(new Error('会议结束时间不得小于当前时间'));
        }
        if (endTs < startTs) {
          return callback(new Error('会议结束时间不得早于开始时间'));
        }
        callback();
      },
      trigger: ['change', 'blur']
    }
  ],
  meetingContact: [
    { required: true, message: '请输入培训会议联系人', trigger: 'blur' },
    { min: 1, max: 20, message: '联系人最多支持20个字符', trigger: 'blur' }
  ],
  meetingPhone: [
    { required: true, message: '请输入联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }
  ],
  experts: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!form.value.experts || form.value.experts.length === 0) {
          callback(new Error('请至少邀请一位专家'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};
const selectedCount = computed(() => {
  const techCount = selectionMap.value.get('technology')?.length || 0;
  const legalCount = selectionMap.value.get('legalaffairs')?.length || 0;
  return techCount + legalCount;
});

const handleClose = () => {
  visible.value = false;
  emit('update:modelValue', false);
};
/* 邀请专家 */
const invitation = async () => {
  dialogVisible.value = true;
  // 如果 form.experts 有数据，回显选中状态
  console.log('form.value', form.value);

  if (form.value.experts?.length) {
    const techExperts = form.value.experts.filter((e) => e.expertType === '1');
    const legalExperts = form.value.experts.filter((e) => e.expertType === '2');
    selectionMap.value.set('technology', techExperts);
    selectionMap.value.set('legalaffairs', legalExperts);
  }
  await nextTick();
  getexpert();
};
// 处理日期选择事件
const handleSelectDate = (val: string[]) => {
  form.value.meetingStartTime = val?.[0] || '';
  form.value.meetingEndTime = val?.[1] || '';
};

/** 重置按钮操作 */
const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    expertName: '', //专家姓名
    reviewStatus: '1', //审核状态
    startStopStatus: '1' //启用状态
  };
  getexpert();
};
/* 邀请专家删除 */
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除专家 "${row.expertName}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 1. 从 form.experts 中删除
    const index = form.value.experts.findIndex((expert) => expert.expertId === row.expertId);
    if (index > -1) {
      form.value.experts.splice(index, 1);
    }

    // 2. 从 selectionMap 中删除对应的专家
    const expertType = row.expertType;
    const tabName = expertType === '1' ? 'technology' : 'legalaffairs';
    const currentSelections = selectionMap.value.get(tabName) || [];
    const updatedSelections = currentSelections.filter((item) => item.id !== row.expertId);
    selectionMap.value.set(tabName, updatedSelections);
    if (paginatedSelectedExperts.value.length === 0 && selectedQueryParams.value.pageNum > 1) {
      selectedQueryParams.value.pageNum--;
    }
    // 3. 重新验证表单
    formRef.value?.validateField('experts');

    ElMessage.success('删除成功');

    console.log('删除后 form.experts:', form.value.experts);
    console.log('删除后 selectionMap:', selectionMap.value);
  } catch (error) {
    console.log('取消删除');
  }
};

/* 查询 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getexpert();
};
/* 表格选中 */
const handleSelectionChange = (selection) => {
  selectionMap.value.set(activeName.value, selection);
};
/* 切换专家tab */
const handleClick = (tab, event) => {
  // const currentTab = activeName.value;
  activeName.value = tab.paneName;
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    expertName: '', //专家姓名
    reviewStatus: '1', //审核状态
    startStopStatus: '1' //启用状态
  };
  getexpert();
};
/* 获取专家 */
const getexpert = async () => {
  console.log('activeName', activeName.value);

  loading.value = true;
  try {
    let res: any;

    if (activeName.value == 'technology') {
      // 调用技术类专家接口
      res = await getcultivateExpertList(queryParams.value);
    } else if (activeName.value == 'legalaffairs') {
      // 调用法律类专家接口
      res = await getbaseLegalExpertInfoList(queryParams.value);
    } else {
      ElMessage.warning('未知的专家类型');
      loading.value = false;
      return;
    }
    if (res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
      const selectedList = selectionMap.value.get(activeName.value) || [];
      console.log('selectedList111111111', selectedList);

      nextTick(() => {
        tableData.value.forEach((row) => {
          tableRef.value?.toggleRowSelection(row, false);
        });
        tableData.value.forEach((row) => {
          if (selectedList.find((sel) => sel.id === row.id || sel.expertId === row.id)) {
            tableRef.value?.toggleRowSelection(row, true);
          }
        });
      });
    } else {
      ElMessage.error(res.msg || '获取专家列表数据失败');
    }
  } catch (error) {
    console.error('获取专家列表数据失败:', error);
    ElMessage.error('获取专家列表数据失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
/* 选中专家 */
const confirmExperts = () => {
  formloading.value = true;
  const techSelections = selectionMap.value.get('technology') || [];
  const legalSelections = selectionMap.value.get('legalaffairs') || [];
  console.log('techSelections', techSelections);
  console.log('legalSelections', legalSelections);

  const allSelections = [...techSelections, ...legalSelections];
  console.log('allSelections', allSelections);

  if (!allSelections.length) {
    ElMessage.warning('请至少选择一位专家');
    return;
  }
  const experts = [
    ...techSelections.map((item) => ({
      foreignType: '0',
      expertType: '1',
      expertId: item.id,
      expertName: item.expertName,
      sex: item.sex,
      expertCode: item.expertNumber,
      contactPhone: item.contactPhone
    })),
    ...legalSelections.map((item) => ({
      foreignType: '0',
      expertType: '2',
      expertId: item.id,
      expertName: item.expertName,
      sex: item.sex,
      expertCode: item.expertNumber,
      contactPhone: item.phoneNumber
    }))
  ];

  form.value.experts = experts;
  selectedQueryParams.value.pageNum = 1;
  dialogVisible.value = false;
  formRef.value?.validateField('experts');
  formloading.value = false;
  console.log('form.value123', form.value.experts, paginatedSelectedExperts.value);
};
const handleSave = async () => {
  console.log('props.mode', props.mode);
  console.log('form.value123', form.value);
  saveloading.value = true;
  try {
    let verify = await formRef.value.validate();
    if (!verify) return;
    if (props.mode == 'edit') {
      await EditHnMeetingCultivate(form.value);
    } else {
      await AddHnMeetingCultivate(form.value);
    }
    ElMessage.success('发布成功');
    emit('save', form.value);
    handleClose();
  } catch (error) {
    // ElMessage.error(error);
  } finally {
    saveloading.value = false;
  }
};
</script>

<style scoped>
.add-meeting-dialog {
  padding: 0;
}

.pagination {
  /* margin-top: 15px; */
  margin-bottom: 15px;
}

.close-btn {
  font-size: 28px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.dialog-body {
  padding: 20px;
  padding-top: 0;
  /* height: calc(100vh - 60px); */
  /* overflow-y: auto; */
}

.addmeetingtitle {
  font-size: 22px;
  font-weight: bold;
  color: #666;
  border-bottom: 2px solid #ccc;
  padding-bottom: 10px;
}
</style>
