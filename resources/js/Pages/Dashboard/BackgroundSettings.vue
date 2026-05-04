<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Landing Page Background Settings</h2>
            <p class="text-muted mb-4">Manage background images for different sections of the landing page.</p>

            <el-table :data="settings" style="width: 100%" v-loading="loading" stripe>
                <el-table-column label="Section" prop="section_name" width="200"/>
                <el-table-column label="Current Background" width="300">
                    <template #default="scope">
                        <div class="background-preview">
                            <img
                                :src="scope.row.image_path || scope.row.default_image_path"
                                :alt="scope.row.section_name"
                                class="preview-image"
                                @error="handleImageError"
                            />
                            <span v-if="!scope.row.image_path" class="badge bg-secondary ms-2">Default</span>
                            <span v-else class="badge bg-primary ms-2">Custom</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Status" width="120">
                    <template #default="scope">
                        <el-switch
                            v-model="scope.row.is_active"
                            @change="toggleActive(scope.row)"
                            active-text="Active"
                            inactive-text="Inactive"
                        />
                    </template>
                </el-table-column>
                <el-table-column label="Actions" width="300">
                    <template #default="scope">
                        <div class="d-flex gap-2">
                            <el-button type="primary" size="small" @click="openUploadDialog(scope.row)">
                                <i class="ti ti-upload me-1"></i> Change
                            </el-button>
                            <el-button
                                type="warning"
                                size="small"
                                @click="resetToDefault(scope.row)"
                                :disabled="!scope.row.image_path"
                            >
                                <i class="ti ti-refresh me-1"></i> Reset
                            </el-button>
                            <el-button type="info" size="small" @click="previewImage(scope.row)">
                                <i class="ti ti-eye me-1"></i> Preview
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- Upload Dialog -->
            <el-dialog v-model="uploadDialogVisible" title="Change Background Image" width="500px">
                <div v-if="selectedSetting">
                    <p><strong>Section:</strong> {{ selectedSetting.section_name }}</p>

                    <div class="current-image mb-3">
                        <p class="text-muted">Current Image:</p>
                        <img
                            :src="selectedSetting.image_path || selectedSetting.default_image_path"
                            :alt="selectedSetting.section_name"
                            class="img-fluid rounded"
                            style="max-height: 200px;"
                        />
                    </div>

                    <el-upload
                        ref="uploadRef"
                        class="upload-area"
                        drag
                        :auto-upload="false"
                        :limit="1"
                        accept="image/*"
                        :on-change="handleFileChange"
                        :on-exceed="handleExceed"
                    >
                        <el-icon class="el-icon--upload"><i class="ti ti-cloud-upload" style="font-size: 40px;"></i></el-icon>
                        <div class="el-upload__text">
                            Drop file here or <em>click to upload</em>
                        </div>
                        <template #tip>
                            <div class="el-upload__tip">
                                Supported formats: JPG, PNG, JPEG, WebP. Max size: 5MB
                            </div>
                        </template>
                    </el-upload>

                    <div v-if="previewUrl" class="mt-3">
                        <p class="text-muted">New Image Preview:</p>
                        <img :src="previewUrl" alt="New image preview" class="img-fluid rounded" style="max-height: 200px;"/>
                    </div>
                </div>
                <template #footer>
                    <el-button @click="closeUploadDialog">Cancel</el-button>
                    <el-button type="primary" @click="uploadImage" :loading="uploading" :disabled="!selectedFile">
                        Upload & Save
                    </el-button>
                </template>
            </el-dialog>

            <!-- Preview Dialog -->
            <el-dialog v-model="previewDialogVisible" title="Background Preview" width="80%">
                <div class="text-center">
                    <img
                        v-if="previewSetting"
                        :src="previewSetting.image_path || previewSetting.default_image_path"
                        :alt="previewSetting.section_name"
                        class="img-fluid"
                        style="max-height: 70vh;"
                    />
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

const settings = ref([])
const loading = ref(false)
const uploadDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const selectedSetting = ref(null)
const previewSetting = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(null)
const uploading = ref(false)
const uploadRef = ref(null)

const fetchSettings = async () => {
    loading.value = true
    try {
        const response = await axios.get('/api/background-settings')
        if (response.data.status) {
            settings.value = response.data.data
        }
    } catch (error) {
        ElMessage.error('Failed to load background settings')
        console.error(error)
    } finally {
        loading.value = false
    }
}

const openUploadDialog = (setting) => {
    selectedSetting.value = setting
    selectedFile.value = null
    previewUrl.value = null
    uploadDialogVisible.value = true
}

const closeUploadDialog = () => {
    uploadDialogVisible.value = false
    selectedSetting.value = null
    selectedFile.value = null
    previewUrl.value = null
    if (uploadRef.value) {
        uploadRef.value.clearFiles()
    }
}

const handleFileChange = (file) => {
    if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('File size must be less than 5MB')
        return
    }
    selectedFile.value = file.raw
    previewUrl.value = URL.createObjectURL(file.raw)
}

const handleExceed = () => {
    ElMessage.warning('Only one file can be uploaded')
}

const uploadImage = async () => {
    if (!selectedFile.value || !selectedSetting.value) return

    uploading.value = true
    const formData = new FormData()
    formData.append('image', selectedFile.value)

    try {
        const response = await axios.post(
            `/api/background-settings/${selectedSetting.value.id}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        )

        if (response.data.status) {
            ElMessage.success('Background updated successfully')
            await fetchSettings()
            closeUploadDialog()
        } else {
            ElMessage.error(response.data.message || 'Failed to update background')
        }
    } catch (error) {
        ElMessage.error('Failed to upload image')
        console.error(error)
    } finally {
        uploading.value = false
    }
}

const resetToDefault = async (setting) => {
    try {
        await ElMessageBox.confirm(
            'Are you sure you want to reset this background to the default image?',
            'Confirm Reset',
            {
                confirmButtonText: 'Reset',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }
        )

        const response = await axios.post(`/api/background-settings/${setting.id}/reset`)
        if (response.data.status) {
            ElMessage.success('Background reset to default')
            await fetchSettings()
        } else {
            ElMessage.error(response.data.message || 'Failed to reset background')
        }
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('Failed to reset background')
            console.error(error)
        }
    }
}

const toggleActive = async (setting) => {
    try {
        const formData = new FormData()
        formData.append('is_active', setting.is_active ? '1' : '0')

        const response = await axios.post(
            `/api/background-settings/${setting.id}`,
            formData
        )

        if (response.data.status) {
            ElMessage.success(`Background ${setting.is_active ? 'activated' : 'deactivated'}`)
        } else {
            ElMessage.error(response.data.message || 'Failed to update status')
            setting.is_active = !setting.is_active
        }
    } catch (error) {
        ElMessage.error('Failed to update status')
        setting.is_active = !setting.is_active
        console.error(error)
    }
}

const previewImage = (setting) => {
    previewSetting.value = setting
    previewDialogVisible.value = true
}

const handleImageError = (e) => {
    e.target.src = '/images/placeholder.png'
}

onMounted(() => {
    fetchSettings()
})
</script>

<style scoped>
.background-preview {
    display: flex;
    align-items: center;
}

.preview-image {
    width: 150px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.upload-area {
    width: 100%;
}

.gap-2 {
    gap: 0.5rem;
}
</style>

