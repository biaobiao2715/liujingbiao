<template>
  <div class="success-container">
    <p>
      <span class="username">{{ username }}</span
      >，您的登陆账号是： <span class="account">{{ account }}</span
      >，请牢记登陆账号和密码！
    </p>
    <p v-if="isBuyer">{{ countdown }}秒后自动进入登陆页</p>
    <p v-else>请您耐心等待管理员审核</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

defineProps<{
  username: string;
  account: string;
  isBuyer: boolean;
}>();

const router = useRouter();
const countdown = ref(5);

onMounted(() => {
  const interval = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(interval);
      router.push('/login'); // 跳转到登录页
    }
  }, 1000);
});
</script>

<style scoped lang="scss">
.success-container {
  text-align: center;
  font-size: 16px;
  line-height: 1.5;

  .username,
  .account {
    color: var(--color-main);
    font-weight: bold;
    font-size: 26px;
  }
}
</style>
