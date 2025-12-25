<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <p>&copy; 学生作业：图书商城. 余佳明版权所有.</p>
        <p>联系电话：15777926306 | 邮箱：1919286811@qq.com</p>
        <p>禁止任何形式的转载，请尊重版权</p>
        <p>禁止用作任何形式的非法用途，我会盯着你们的！！！！！！</p>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 30px 0;
  margin-top: 50px;
}

.footer-content {
  text-align: center;
  color: #6c757d;
}

.footer-content p {
  margin: 5px 0;
  font-size: 14px;
}

.footer-content p:first-child {
  font-weight: 500;
  color: #495057;
}
</style>