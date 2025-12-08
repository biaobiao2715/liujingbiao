div<!-- 
标题：		index.vue
功能：		供应商/企业信息识别
说明：		
当前版本：	1.0
开发信息：	Created by 李政达 2025-11-13
修改人信息：	李政达 2025-11-18
修改内容：	供应商/企业信息识别页面开发
 -->
<template>
  <div class="archive-management">
    <div class="center-container">
      <div class="title">作物图片</div>
      <el-upload class="upload-demo" drag action="#" multiple accept=".jpg,.jpe,.png,.pdf">
        <el-icon>
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">最大10M 支持扩展名：jpeg.jpg.png.pdf</div>
        </template>
      </el-upload>
      <div>
        <el-button type="primary">开始识别</el-button>
        <el-button type="primary" @click="historyhandle">历史记录</el-button>
      </div>
    </div>
    <!-- 历史记录 -->
    <!-- 搜索条件 -->
    <el-dialog title="历史记录" v-model="ishistory" width="70%">
      <el-form ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <!-- 所属类别搜索框 -->
        <el-form-item label="品种类型" prop="varietyType">
          <el-select v-model="queryParams.varietyType" placeholder="请选择品种类型" filterable clearable>
            <el-option v-for="item in cultivateTypeOptions" :key="item.value" :label="item.varietyType" :value="item.varietyType" />
          </el-select>
        </el-form-item>

        <!-- 发布时间选择器 -->
        <el-form-item label="识别时间">
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
          />
        </el-form-item>
         
        <!-- 查询和重置按钮 -->
        <el-form-item>
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button  type="primary" @click="handleExport">导出</el-button>

      <!-- 操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <!-- <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar> -->
      </el-row>

      <!-- 表格展示 -->
      <el-table :data="tableData" border v-loading="loading" width="100%" style="table-layout: fixed">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <!-- 识别开始时间 -->
        <el-table-column label="识别开始时间" align="center" prop="identifyBeginTime">
          <template #default="scope">
            <span>{{ scope.row.identifyBeginTime }}</span>
          </template>
        </el-table-column>
        <!-- 识别结束时间 -->
        <el-table-column label="识别结束时间" align="center" prop="identifyEndTime">
          <template #default="scope">
            <span>{{ scope.row.identifyEndTime }}</span>
          </template>
        </el-table-column>
        <!-- 图片文件名 -->
        <el-table-column label="图片文件名" align="center" prop="fileName">
          <template #default="scope">
            <span>{{ scope.row.fileName }}</span>
          </template>
        </el-table-column>

        <!-- 品种名称 -->
        <el-table-column label="品种名称" align="center" prop="varietyName">
          <template #default="scope">
            <span>{{ scope.row.varietyName }}</span>
          </template>
        </el-table-column>

        <!-- 品种类型 -->
        <el-table-column label="品种类型" align="center" prop="varietyType">
          <template #default="scope">
            <span>{{ scope.row.varietyType != null ? scope.row.varietyType : 0 }}</span>
          </template>
        </el-table-column>

        <!-- 特征描述 -->
        <el-table-column label="特征描述" align="center" prop="featureDescription">
          <template #default="scope">
            <span>{{ scope.row.featureDescription != null ? scope.row.featureDescription : 0 }}</span>
          </template>
        </el-table-column>
        <!-- 种植技术指导 -->
        <el-table-column label="种植技术指导" align="center" prop="plantingTechniquesGuidance">
          <template #default="scope">
            <span>{{ scope.row.plantingTechniquesGuidance != null ? scope.row.plantingTechniquesGuidance : 0 }}</span>
          </template>
        </el-table-column>
        <!-- 注意事项 -->
        <el-table-column label="注意事项" align="center" prop="precautions">
          <template #default="scope">
            <span>{{ scope.row.precautions != null ? scope.row.precautions : 0 }}</span>
          </template>
        </el-table-column>
        <!-- 置信度评分 -->
        <el-table-column label="置信度评分" align="center" prop="confidenceLevel">
          <template #default="scope">
            <span>{{ scope.row.confidenceLevel != null ? scope.row.confidenceLevel : 0 }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <Pagination
          v-show="total > 0"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          v-model:total="total"
          @pagination="getList"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, View, Delete, Document, UploadFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

import { getPinlist, reportExport, getreportDetail,reportAdela,magiAppeal,reportDetail,reportGroupType } from '@/api/rightsPlatform/varietyinformationrecognition';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  varietyType: '', //品种类型
  identifyBeginTime: '', // 识别开始时间
  identifyEndTime: '' // 识别结束时间
});
const tableData = ref([]);
// 日期范围
const dateRange = ref(['', '']);
// 表单引用
const queryFormRef = ref();
/* 展示历史记录列表 */
const ishistory = ref(false);
/* 表格loading */
const loading = ref(false);
/* 表格分页总数 */
const total = ref(0);
/** 查询按钮事件 */
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/* 导出事件 */
const handleExport = () => {
    proxy?.download(
    'safeguard-server/varietyRecognize/export',
    {
      ...queryParams.value
    },
    `品种信息_${new Date().getTime()}.excel`
  );
};
// 处理日期选择事件
const handleSelectDate = (val: string[]) => {
  queryParams.value.identifyBeginTime = val?.[0] || '';
  queryParams.value.identifyEndTime = val?.[1] || '';
};
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 下拉框的数据 */
const cultivateTypeOptions = ref([]);

/** 重置按钮操作 */
const handleReset = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    varietyType: '', //品种类型
    
    identifyBeginTime: '', // 识别开始时间
    identifyEndTime: '' // 识别结束时间
  };
  handleQuery();
};
/* 历史记录 */
const historyhandle = () => {
  ishistory.value = true;
   // 打开对话框时自动加载数据
  nextTick(() => {
    getList();
  });
};
onMounted(() => {
  // getListType();
});
/* 历史列表查询 */
const getList = async () => {
    try {
    loading.value = true;
    const res = await getPinlist(queryParams.value);
    console.log('历史列表数据:', res);
    
    if (res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
    } else {
      ElMessage.error(res.msg || '获取数据失败');
    }
  } catch (error) {
    console.error('获取历史记录失败:', error);
    ElMessage.error('获取数据时发生错误');
  } finally {
    loading.value = false;
  }

};
/* 获取类型 */
const getListType = async () => {
  try {
    const res = await reportGroupType(); // 修正：添加括号调用函数
    console.log('获取类型:', res);
    
    if (res.code === 200) {
      // 假设返回的数据结构中data字段包含选项数组
      cultivateTypeOptions.value = res.data || [];
    } else {
      ElMessage.error(res.msg);
    }
  } catch (error) {
    console.error('获取类型失败:', error);
    // ElMessage.error('获取类型时发生错误');
  }
};
</script>

<style scoped lang="scss">
.archive-management {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.center-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
}

.title {
  color: #333;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.upload-demo {
  width: 100%;
  margin-bottom: 30px;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

.button-group {
  display: flex;
  gap: 20px;
  justify-content: center;
  width: 100%;

  .el-button {
    min-width: 120px;
    height: 40px;
  }
}

/* 历史记录部分的样式保持不变 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .center-container {
    padding: 20px 10px;
    max-width: 100%;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .button-group {
    flex-direction: column;
    gap: 10px;

    .el-button {
      width: 100%;
      min-width: auto;
    }
  }

  .upload-demo :deep(.el-upload-dragger) {
    height: 150px;
  }
}
</style>
