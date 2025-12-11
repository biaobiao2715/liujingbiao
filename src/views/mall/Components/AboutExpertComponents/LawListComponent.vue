<!--
  标题: LawListComponent.vue
  功能: 普法专栏列表静态页
  说明: 按截图布局，暂无接口先用假数据
  当前版本: 1.0
-->
<template>
  <div class="law-page">
    <section class="panel policies">
      <div class="panel-header">
        <div class="title">国家政策法规</div>
      </div>
      <div class="policy-grid">
        <ul class="policy-list">
          <li v-for="(item, idx) in policiesLeft" :key="`pl-${idx}`">
            <span class="dot" />
            <span class="text">{{ item }}</span>
          </li>
        </ul>
        <ul class="policy-list">
          <li v-for="(item, idx) in policiesRight" :key="`pr-${idx}`">
            <span class="dot" />
            <span class="text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>
      <div class="bottom-grid">
        <div class="block">
          <div class="block-title">
            <span class="line" />
            <span>普法活动</span>
          </div>
          <ul class="simple-list">
            <li v-for="(item, idx) in activities" :key="`ac-${idx}`">
              <span class="dot" />
              <span class="text">{{ item }}</span>
            </li>
          </ul>
        </div>
        <div class="block">
          <div class="block-title">
            <span class="line" />
            <span>普法白皮书</span>
          </div>
          <ul class="simple-list">
            <li v-for="(item, idx) in whitepapers" :key="`wp-${idx}`">
              <span class="dot" />
              <span class="text">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
const policiesLeft = [
  '关于农业政策的2025年公告',
  '关于农业政策发布的2025年公告普法与产业政策发布的改革的2025年公告普法与产业',
  '关于农业政策的2025年公告关于农业',
  '关于农业政策的2025年公告',
  '关于农业政策的2025年公告农业',
  '关于农业政策的2025年公告',
  '关于农业政策发布的2025年公告关于农业政策的改革的2025年公告'
];

const policiesRight = [
  '关于农业政策发布的2025年公告',
  '关于农业政策发布的2025年公告普法与产业政策发布的2025年公告普法与产业政策发布的2025年公告',
  '关于农业政策的2025年公告关于农业',
  '关于农业政策发布的2025年公告普法与产业政策的发布的2025年公告',
  '关于农业政策发布的2025年公告',
  '关于农业政策发布的2025年公告关于农业政策的改革的2025年公告'
];

const activities = [
  '2025年第一季度普法宣传活动方案审核中',
  '2025年第二季度普法宣传活动方案审核中',
  '2025年第一季度普法宣传活动方案审核中',
  '2025年第一季度普法宣传活动方案审核中',
  '2025年第二季度普法宣传活动方案审核中',
  '2025年第二季度普法宣传活动方案审核中',
  '2025年第三季度普法宣传活动方案审核中',
  '2025年第四季度普法宣传活动方案审核中',
  '2025年第一季度普法宣传活动方案审核中',
  '2025年第一季度普法宣传活动方案审核中'
];

const whitepapers = [
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本',
  'XXX普法白皮书模板 1.0版本'
];
</script>

<style scoped lang="scss">
.law-page {
  background: #f6f7fb;
  padding: 16px;
  min-height: 100%;
  color: #1f2937;
  font-size: 14px;
}

.panel {
  background: #fff;
  border: 1px solid #e6e9f0;
  box-shadow: 0 4px 12px rgba(31, 41, 55, 0.05);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    position: relative;
    padding-left: 10px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 16px;
      border-radius: 2px;
    background: #108c58;
    }
  }

  .badges {
    display: flex;
    gap: 8px;

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      border-radius: 14px;
      font-size: 12px;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      &.badge-red {
        background: linear-gradient(90deg, #ff6b6b, #ff8f6b);
      }
      &.badge-blue {
        background: linear-gradient(90deg, #5c7cfa, #63a9ff);
      }
    }
  }
}

.policy-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
  padding: 8px 4px;
}

.policy-list,
.simple-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.policy-list li,
.simple-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed #e5e7eb;

  &:last-child {
    border-bottom: none;
  }

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #108c58;
    flex-shrink: 0;
  }

  .text {
    color: #374151;
    line-height: 1.5;
  }
}

.bottom {
  padding-top: 12px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.block {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
}

.block-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 10px;
  position: relative;
  padding-left: 10px;

  .line {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: #108c58;
    flex-shrink: 0;
  }
}

@media (max-width: 960px) {
  .policy-grid {
    grid-template-columns: 1fr;
  }
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}
</style>
