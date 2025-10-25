<script setup lang="ts">
import type { ProductCreation } from '@/api/shop/handleProduct'
import { ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { uploadPhoto } from '@/api/editPostAndComment/utils'
import { handleProduct } from '@/api/shop/handleProduct'
import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'

const { userInfo } = useUserStore()

const router = useRouter()

// 商品数据
const product = ref<ProductCreation & { tempFiles: File[] }>({
  name: '',
  price: 0,
  description: '',
  images: [], // 存储图片URL
  tempFiles: [], // 临时存储选择的文件，用于预览
})

// 错误信息
const errors = ref<{
  name: string
  price: string
  description: string
  images: string
}>({
  name: '',
  price: '',
  description: '',
  images: '',
})

// 提交状态
const isSubmitting = ref<boolean>(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

// 触发文件选择
function triggerFileInput(): void {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理文件选择
function handleFiles(event: Event): void {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files)
    return

  for (const file of Array.from(files)) {
    if (!isImage(file))
      continue // 检查是否是图片

    if (product.value.tempFiles.length >= 5) {
      showMsg('最多只能上传5张图片')
      break
    }

    // 添加到临时文件列表
    product.value.tempFiles.push(file)

    // 预览图片
    const reader = new FileReader()
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      if (e.target && e.target.result) {
        // 在 images 数组中添加临时预览URL（非服务器URL）
        product.value.images.push(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  // 清空文件输入，以便可以重新选择相同的文件
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 检查是否是图片
function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

// 删除图片
function deleteImage(index: number): void {
  product.value.tempFiles.splice(index, 1) // 从临时文件中删除
  product.value.images.splice(index, 1) // 从预览列表中删除
}

// 表单验证
function validateForm(): boolean {
  let isValid = true
  errors.value = {
    name: '',
    price: '',
    description: '',
    images: '',
  }

  if (!product.value.name) {
    errors.value.name = '商品名称不能为空'
    isValid = false
  }

  if (product.value.price === null || product.value.price <= 0) {
    errors.value.price = '请输入有效的商品价格'
    isValid = false
  }

  if (!product.value.description) {
    errors.value.description = '商品描述不能为空'
    isValid = false
  }

  // if (product.value.tempFiles.length === 0) {
  //   errors.value.images = '至少需要上传一张商品图片'
  //   isValid = false
  // }

  return isValid
}

// 提交商品
async function submitProduct(): Promise<void> {
  if (isSubmitting.value)
    return

  if (!validateForm()) {
    showMsg('请修正表单中的错误')
    return
  }
  isSubmitting.value = true

  try {
    // 收集所有图片的URL
    const imageUrls: string[] = []

    // 上传所有图片到服务器
    for (const file of product.value.tempFiles) {
      try {
        const data = await uploadPhoto(file)
        imageUrls.push(data.fileURL)
      }
      catch (error) {
        console.error('Error uploading file:', error)
        showMsg('部分图片上传失败，请重试')
        isSubmitting.value = false
        return
      }
    }

    // 将图片URL添加到商品对象
    product.value.images = imageUrls

    // 这里添加提交逻辑，可以调用API提交整个商品对象
    // console.log('商品发布成功，图片URL:', imageUrls)
    await handleProduct(product.value, userInfo.userID)
    await router.push('/shop')
    showMsg('商品发布成功')
  }
  catch (error) {
    console.error('Error submitting product:', error)
    showMsg('商品发布失败，请重试')
  }
  finally {
    isSubmitting.value = false
  }
}

// 取消发布
function cancelPublish(): void {
  if (confirm('确定要取消发布吗？已填写的信息将不会保存')) {
    router.push('/shop')
  }
}
</script>

<template>
  <div class="product-publish-container">
    <div class="publish-header">
      <h1>发布新商品</h1>
    </div>

    <form class="product-form" @submit.prevent="submitProduct">
      <div class="form-row">
        <!-- 商品名称 -->
        <div class="form-group flex-1">
          <label for="productName">商品名称</label>
          <input
            id="productName"
            v-model.trim="product.name"
            type="text"
            placeholder="请输入商品名称"
            :class="{ error: errors.name }"
          >
          <div v-if="errors.name" class="error-message">
            {{ errors.name }}
          </div>
        </div>

        <!-- 商品价格 -->
        <div class="form-group flex-1">
          <label for="productPrice">商品价格 (¥)</label>
          <input
            id="productPrice"
            v-model.number="product.price"
            type="number"
            placeholder="请输入商品价格"
            :class="{ error: errors.price }"
          >
          <div v-if="errors.price" class="error-message">
            {{ errors.price }}
          </div>
        </div>
      </div>

      <!-- 商品图片上传 -->
      <div class="form-group">
        <label>商品图片 (最多上传5张)</label>
        <div class="images-upload-container">
          <div
            v-for="(image, index) in product.images"
            :key="index"
            class="image-upload-wrapper"
          >
            <img :src="image" alt="预览图" class="preview-image">
            <div class="image-actions">
              <button type="button" class="delete-image" @click.stop="deleteImage(index)">
                删除
              </button>
            </div>
          </div>

          <div
            v-if="product.images.length < 5"
            class="upload-button-wrapper"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              style="display: none"
              @change="handleFiles"
            >
            <div class="upload-button">
              <i class="upload-icon">+</i>
              <span>添加图片</span>
            </div>
          </div>
        </div>
        <div v-if="errors.images" class="error-message">
          {{ errors.images }}
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="form-group">
        <label for="productDescription">商品描述</label>
        <textarea
          id="productDescription"
          v-model="product.description"
          placeholder="请输入商品详细描述"
          rows="6"
          :class="{ error: errors.description }"
        />
        <div v-if="errors.description" class="error-message">
          {{ errors.description }}
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="cancelPublish">
          取消
        </button>
        <button type="submit" class="publish-btn" :disabled="isSubmitting">
          发布商品
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.product-publish-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.publish-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.publish-header h1 {
  font-size: 32px;
  color: #2c3e50;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #4c8baf, #81b3e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.product-form {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.product-form::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4c8baf, #81b3e9, #4c8baf);
  border-radius: 16px 16px 0 0;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 25px;
}

.flex-1 {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4c8baf;
  background: white;
  box-shadow: 0 0 0 3px rgba(76, 139, 175, 0.1);
  transform: translateY(-1px);
}

.form-group input.error,
.form-group textarea.error {
  border-color: #e53935;
}

.error-message {
  color: #e53935;
  font-size: 14px;
  margin-top: 5px;
}

.images-upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  border: 2px dashed #4c8baf;
  border-radius: 12px;
  padding: 20px;
  min-height: 180px;
  background: rgba(76, 139, 175, 0.05);
  transition: all 0.3s ease;
}

.images-upload-container:hover {
  border-color: #81b3e9;
  background: rgba(76, 139, 175, 0.1);
}

.image-upload-wrapper {
  position: relative;
  width: 150px;
}

.preview-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.image-actions {
  position: absolute;
  top: 5px;
  right: 5px;
}

.delete-image {
  background-color: rgba(229, 57, 53, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.upload-button-wrapper {
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.3s ease;
  border: 2px dashed #4c8baf;
}

.upload-button-wrapper:hover {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-color: #81b3e9;
  transform: scale(1.05);
}

.upload-button {
  text-align: center;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 8px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: center; /* 居中对齐按钮 */
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #dee2e6;
  border-radius: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.publish-btn {
  padding: 16px 32px;
  background: linear-gradient(135deg, #4c8baf 0%, #81b3e9 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 139, 175, 0.3);
}

.publish-btn:hover {
  background: linear-gradient(135deg, #3a6b8a 0%, #6a9bc7 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 139, 175, 0.4);
}

.publish-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  -webkit-tap-highlight-color: transparent;
}
</style>
