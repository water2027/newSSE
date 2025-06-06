<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import { uploadPhoto } from '@/api/editPostAndComment/utils'
import { handleProduct } from '@/api/shop/handleProduct'
import { showMsg } from '@/components/MessageBox'
import { useUserStore } from '@/store/userStore'

const { userInfo } = useUserStore()

const router = useRouter()

// 商品数据接口
interface ProductData {
  name: string
  price: number | null
  description: string
  images: string[]
  tempFiles: File[]
}

// 商品数据
const product = ref<ProductData>({
  name: '',
  price: null,
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
  max-width: 1000px; /* 增加了最大宽度 */
  margin: 0 auto;
  padding: 20px;
}

.publish-header {
  text-align: center;
  margin-bottom: 30px;
}

.publish-header h1 {
  font-size: 24px;
  color: #333;
}

.product-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
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
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4c8baf;
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
  gap: 15px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 15px;
  min-height: 150px;
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
}

.upload-button-wrapper {
  width: 150px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.upload-button-wrapper:hover {
  background-color: #e0e0e0;
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
  padding: 12px 24px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.publish-btn {
  padding: 12px 24px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.publish-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
