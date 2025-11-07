<!-- 
标题：			trainingcourseEdit.vue
功能：			新增编辑直播信息
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-11-7
修改人信息：张峰     2025-11-7
修改内容：新增编辑直播信息
 -->
<template>
    <div class="content-edit-dialog" v-loading="loading">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px"
            :disabled="props.type === 'view'">
            <!-- 直播标题 -->
            <el-form-item label="直播标题" prop="title">
                <el-input v-model="formData.title" placeholder="请输入直播标题" maxlength="30" show-word-limit clearable />
            </el-form-item>

            <!-- 内容简介 -->
            <el-form-item label="内容简介" prop="description">
                <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入内容简介" maxlength="60"
                    show-word-limit resize="none" />
            </el-form-item>

            <!-- 链接地址 -->
            <el-form-item label="链接地址" prop="videoUrl">
                <el-input v-model="formData.videoUrl" placeholder="请输入视频链接地址" clearable>
                </el-input>
            </el-form-item>
            <el-form-item label="主图" prop="coverImageId" :required="true">
                <el-upload action="#" :auto-upload="false" list-type="picture-card"
                    :on-preview="handlePictureCardPreview" accept=".jpg,.gif,.png" :limit="1" :file-list="fileList"
                    :on-change="handleImgFileChange" :on-exceed="handleExceed" :on-remove="handleRemove">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    <template #tip>
                        <div class="upload-tip">支持格式：支持jpg、gif、png三种格式，大小不超过10MB</div>
                    </template>
                </el-upload>
                <el-dialog v-model="dialogVisible">
                    <img width="100%" :src="dialogImageUrl" alt="" />
                </el-dialog>
            </el-form-item>
            <div class="form-actions">
                <el-button type="primary" @click="handleSubmit" :loading="saving">
                    {{ props.type === 'add' ? '发布' : '保存' }}
                </el-button>
                <el-button @click="emitCancel">取消</el-button>
            </div>
        </el-form>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, watch, ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, View, Delete, Document, Plus } from '@element-plus/icons-vue';
import { gethnOnlineVideoDetail, hnOnlineVideoadd, hnOnlineVideoupdate } from '@/api/system/onlineVideo';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
const props = defineProps<{
    id?: string | number | null;
    type: 'add' | 'edit' | 'view';
}>();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits<{
    (e: 'success'): void;
    (e: 'cancel'): void;
}>();
const loading = ref(false)
/* 保存loading */
const saving = ref(false)
// 表单引用
const formRef = ref();

/* 缩略图弹窗 */
const dialogVisible = ref(false)
/* 查看上传图片的url */
const dialogImageUrl = ref('')
/* 主图图片 */
const fileList = ref([])
// 表单数据
const formData = ref({
    title: '',
    description: '',
    videoUrl: '',
    coverImageId: '', //主图id
});

// 表单验证规则
const formRules = {
    title: [
        { required: true, message: '请输入直播标题', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: any) => {
                if (value && getChineseCharCount(value) > 30) {
                    callback(new Error('直播标题最多支持30个汉字'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ],
    description: [
        { required: true, message: '请输入内容简介', trigger: 'blur' },
        { max: 60, message: '内容简介最多支持60个字', trigger: 'blur' }
    ],
    coverImageId: [
        { required: true, message: '请上传主图', trigger: 'blur' },
    ],
    videoUrl: [
        { required: true, message: '请输入链接地址', trigger: 'blur' },
        {
            validator: (rule: any, value: string, callback: any) => {
                if (value && !isValidUrl(value)) {
                    callback(new Error('请输入有效的链接地址'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
};

// 计算中文字符数量
const getChineseCharCount = (str: string): number => {
    if (!str) return 0;
    // 匹配中文字符
    const chineseChars = str.match(/[\u4e00-\u9fa5]/g);
    return chineseChars ? chineseChars.length : 0;
};

// 验证URL格式
const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/* 主图验证 */
const valiImgFile = (file: File): boolean => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const imageExt = ['jpg', 'gif', 'png'];
    const allExt = [...imageExt];

    if (!allExt.includes(ext)) {
        ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
        return false;
    }

    const MB = 1024 * 1024;
    const limit = imageExt.includes(ext) ? 10 * MB : 100 * MB;
    if (file.size > limit) {
        ElMessage.error(imageExt.includes(ext) ? '图片文件最大10MB' : '文档文件最大100MB');
        return false;
    }

    return true;
};
/* 处理超出限制 */
const handleExceed = (files: any, fileList: any) => {
    // 先清空现有文件
    console.log('替换files', files);

    const wrappedFile = {
        name: files[0].name,
        raw: files[0],
    };
    fileList.value = [];
    // 手动触发新文件的上传
    handleImgFileChange(wrappedFile);
};
/* 主图上传 */
const handleImgFileChange = async (file: any) => {
    console.log('file', file);

    if (!valiImgFile(file.raw)) return;

    (proxy as any)?.$modal?.loading('正在上传附件，请稍候...');
    /* 先重置表单主图id */
    formData.value.coverImageId = ''
    try {
        const response = await ossUploadImage({ file: file.raw });
        console.log('response', response);

        // 直接替换而不是追加
        fileList.value = [{
            name: response.data.fileName,
            url: response.data.url,
            ossId: response.data.ossId,
            uid: file.uid
        }];
        formData.value.coverImageId = response.data.ossId
    } catch (error) {
        console.error('附件上传失败:', error);
        ElMessage.error('上传失败，请重试');
    } finally {
        (proxy as any)?.$modal?.closeLoading();
    }
};

/* 查看图片 */
const handlePictureCardPreview = (file) => {
    console.log('file', file);

    dialogImageUrl.value = file.url;
    dialogVisible.value = true
}
/* 删除主图的回调 */
const handleRemove = () => {
    formData.value.coverImageId = ''
}
// 处理提交
const handleSubmit = async () => {
    if (!formRef.value) return;

    try {
        const valid = await formRef.value.validate();
        if (!valid) return;

        saving.value = true;
        const apiMethod = props.type === 'add' ? hnOnlineVideoadd : hnOnlineVideoupdate;
        await apiMethod(formData.value);

        ElMessage.success(props.type === 'add' ? '新增成功' : '编辑成功');
        emit('success');

    } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error('操作失败，请重试');
    } finally {
        saving.value = false;
        (proxy as any)?.$modal?.closeLoading();
    }
};
// 加载详情数据（编辑/查看时）
const loadDetail = async () => {
    if (!props.id || props.type === 'add') return;
    loading.value = true;
    try {
        const res = await gethnOnlineVideoDetail(props.id);
        console.log('详情数据', res);

        formData.value = { ...res.data };

        fileList.value = [{
            // name: data.imageFile.originalName,
            url: res.data.coverImageUrl,
            ossId: res.data.coverImageId,
            uid: Date.now().toString() // 生成一个临时 uid
        }];

    } catch (error) {
        console.error('加载详情失败:', error);
        ElMessage.error('加载详情失败');
    } finally {
        loading.value = false;
    }
};
watch(
    () => props.id,
    () => {
        loadDetail();
    },
    { immediate: true }
);
/** 取消 */
const emitCancel = () => {
    emit('cancel');
};
</script>
<style scoped lang="scss">
.content-edit-dialog {
    padding: 20px 0;
}

// 编辑器容器 - 左右布局
.editor-container {
    display: flex;
    gap: 0;
    width: 100%;
    min-height: 500px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    overflow: hidden;
}

// 编辑器包装器 - 左侧主编辑区
.editor-wrapper {
    flex: 1;
    min-width: 0;
    background: #ffffff;
    border-right: 1px solid #dcdfe6;

    :deep(.w-e-text-container) {
        border: none !important;
        border-radius: 0;
    }

    :deep(.w-e-toolbar) {
        border: none !important;
        border-bottom: 1px solid #dcdfe6 !important;
        border-radius: 0;
        background-color: #fafafa;
    }

    :deep(.w-e-text-placeholder) {
        color: #c0c4cc;
        font-style: normal;
    }
}

// 文章目录侧边栏 - 右侧
.toc-sidebar {
    width: 260px;
    min-width: 260px;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;

    .toc-header {
        padding: 16px 20px;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        background: #ebebeb;
        border-bottom: 1px solid #dcdfe6;
        text-align: center;
    }

    .toc-content {
        flex: 1;
        overflow-y: auto;
        padding: 16px;

        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-thumb {
            background-color: #c0c4cc;
            border-radius: 3px;

            &:hover {
                background-color: #909399;
            }
        }

        &::-webkit-scrollbar-track {
            background-color: #e4e7ed;
        }
    }

    .toc-list {
        max-height: none;
    }

    .toc-item {
        padding: 8px 10px;
        margin-bottom: 4px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #606266;
        font-size: 13px;
        line-height: 1.5;
        position: relative;

        &:hover {
            background-color: #e4e7ed;
            color: #409eff;
        }

        &:active {
            background-color: #d9dcdf;
        }

        .toc-text {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        // 不同层级的缩进
        &.toc-level-1 {
            font-weight: 600;
            font-size: 13px;
            color: #303133;
            padding-left: 10px;
        }

        &.toc-level-2 {
            padding-left: 20px;
            font-size: 12px;
        }

        &.toc-level-3 {
            padding-left: 30px;
            font-size: 12px;
            color: #909399;
        }

        &.toc-level-4,
        &.toc-level-5,
        &.toc-level-6 {
            padding-left: 40px;
            font-size: 12px;
            color: #a8abb2;
        }
    }

    .toc-empty {
        text-align: center;
        padding: 60px 20px;
        color: #909399;

        .empty-icon {
            font-size: 36px;
            color: #c0c4cc;
            margin-bottom: 12px;
        }

        .empty-text {
            font-size: 13px;
            color: #909399;
            margin: 8px 0 4px;
        }

        .empty-tip {
            font-size: 11px;
            color: #c0c4cc;
            line-height: 1.6;
            margin: 0;
            padding: 0 10px;
        }
    }
}

// 表单操作按钮
.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid #e4e7ed;
    gap: 12px;

    .el-button {
        min-width: 100px;
    }
}

// 附件上传区域
.attachment-section {
    margin: 32px 0;
    padding: 20px;
    background-color: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e4e7ed;

    .attachment-title {
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        margin-bottom: 16px;
        position: relative;
        padding-left: 12px;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background-color: #409eff;
            border-radius: 2px;
        }
    }

    .upload-tip {
        font-size: 12px;
        color: #909399;
        margin-top: 8px;
        line-height: 1.6;
    }

    .attachment-table {
        margin-top: 20px;

        :deep(.el-button) {
            padding: 4px 8px;

            .el-icon {
                margin-right: 4px;
            }
        }
    }
}

// 响应式设计
@media (max-width: 768px) {
    .editor-container {
        flex-direction: column;
    }

    .toc-sidebar {
        width: 100%;
        min-width: 100%;
        max-height: 300px;

        .toc-list {
            max-height: 200px;
        }
    }

    .form-actions {
        .el-button {
            width: 100%;
        }
    }

    .attachment-section {
        .attachment-table {
            :deep(.el-table__body-wrapper) {
                overflow-x: auto;
            }
        }
    }
}

// 中等屏幕优化
@media (min-width: 769px) and (max-width: 1024px) {
    .toc-sidebar {
        width: 200px;
        min-width: 200px;
        padding: 16px;
    }

    .editor-container {
        gap: 16px;
    }
}
</style>