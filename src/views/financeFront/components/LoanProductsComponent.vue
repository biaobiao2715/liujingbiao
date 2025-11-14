<template>
  <div class="loan-products">
    <h2>信贷产品</h2>
    <el-row :gutter="20">
      <el-col :span="8" v-for="product in products" :key="product.id">
        <div class="item">
          <span class="tag">热门</span>

          <div class="header">
            <div class="flex-center gap-8">
              <span class="name">{{ product.name }}</span>
              <el-icon size="20" color="#ccc" v-if="!product.isCollected"><StarFilled /></el-icon>
              <el-icon size="20" color="#108c58" v-else> <StarFilled /></el-icon>
            </div>
          </div>
          <div class="content">
            <div class="limit">
              <div>
                {{ product.limit }}
              </div>
              <div>最高额度</div>
            </div>
            <p class="rate">{{ product.rate }}</p>
            <p class="term">最高36期</p>
          </div>
          <div class="footer">
            <el-button type="primary" size="small">查看详情 →</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const products = ref([
  { id: 1, name: '惠农贷', limit: '100万元', rate: '1.2% - 2.6%', isCollected: false },
  { id: 2, name: '惠农贷2', limit: '100万元', rate: '1.2% - 2.6%', isCollected: true },
  { id: 3, name: '惠农贷3', limit: '100万元', rate: '1.2% - 2.6%', isCollected: false },
  { id: 4, name: '惠农贷4', limit: '100万元', rate: '1.2% - 2.6%', isCollected: false },
  { id: 5, name: '惠农贷5', limit: '100万元', rate: '1.2% - 2.6%', isCollected: false },
  { id: 6, name: '惠农贷6', limit: '100万元', rate: '1.2% - 2.6%', isCollected: false },
  { id: 7, name: '惠农贷7', limit: '100万元', rate: '1.2% - 2.6%', isCollected: false },
  { id: 8, name: '惠农贷8', limit: '100万元', rate: '1.2% - 2.6%', isCollected: false }
]);
</script>

<style scoped lang="scss">
.loan-products {
  padding: 20px;

  .item {
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    padding: 16px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    position: relative;

    // &:hover {
    //   transform: translateY(-4px);
    //   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    // }

    .tag {
      position: absolute;
      top: 12px;
      right: -25px; /* 控制横向位置，按需微调 */
      width: 110px; /* 控制梯形的“上底”长度 */
      height: 30px; /* 控制梯形的高度（厚度）*/
      transform: rotate(43deg);
      transform-origin: center;
      background: #e65c33;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      /* 关键：用 clip-path 画一个上下底不等且居中的梯形（对称） */
      clip-path: polygon(25% 0, 75% 0, 100% 100%, 0 100%);
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08) inset;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
      }
    }

    .content {
      margin-bottom: 12px;

      .limit {
        font-size: 20px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
        
      }

      .rate {
        font-size: 14px;
        color: #666;
        margin-bottom: 4px;
      }

      .term {
        font-size: 14px;
        color: #999;
      }
    }

    .footer {
      text-align: right;

      .el-button {
        font-size: 12px;
        padding: 4px 12px;
        background-color: #409eff;
        border-color: #409eff;

        &:hover {
          background-color: #66b1ff;
          border-color: #66b1ff;
        }
      }
    }
  }
}
</style>
