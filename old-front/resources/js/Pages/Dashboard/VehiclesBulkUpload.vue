<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Bulk Vehicle Upload (Excel)</h2>

            <div class="card">
                <div class="card-body">
                    <!-- Download Template Section -->
                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="alert alert-info d-flex align-items-center justify-content-between">
                                <div>
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Need a template?</strong> Download our Excel template with all required columns and sample data.
                                </div>
                                <button
                                    type="button"
                                    class="btn btn-success"
                                    @click="downloadTemplate"
                                    :disabled="downloadingTemplate"
                                >
                                    <i class="fas fa-download me-2" v-if="!downloadingTemplate"></i>
                                    <span v-if="downloadingTemplate" class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    {{ downloadingTemplate ? 'Downloading...' : 'Download Template' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <form @submit.prevent="upload">
                        <div class="row">
                            <!-- Supplier -->
                            <div class="formbold-mb-3 col-md-2">
                                <label class="formbold-form-label">Suppliers</label>
                                <el-select
                                    v-model="supplier"
                                    size="large"
                                    filterable
                                    remote
                                    reserve-keyword
                                    v-on:change="getBranches()"
                                    placeholder="Suppliers..."
                                    remote-show-suffix
                                    :loading="suppliers.loading.value"
                                    required>
                                    <el-option
                                        v-for="item in suppliers.list.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.id"
                                    />
                                </el-select>
                            </div>

                            <!-- Branch -->
                            <div class="formbold-mb-3 col-md-2">
                                <label class="formbold-form-label">Branches</label>
                                <el-select
                                    v-model="branch"
                                    size="large"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="Branches..."
                                    remote-show-suffix
                                    :loading="branches.loading.value"
                                    required>
                                    <el-option
                                        v-for="item in branches.list.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.id"
                                    />
                                </el-select>
                            </div>

                            <!-- Excel Upload -->
                            <div class="formbold-mb-3 col-md-2">
                                <label class="formbold-form-label">Upload Excel File</label>
                                <input
                                    type="file"
                                    class="formbold-form-input formbold-form-file"
                                    accept=".xls,.xlsx"
                                    @change="handleFile"
                                    :disabled="!branch"
                                    required
                                />
                            </div>

                            <div class="text-center mt-4">
                                <button
                                    type="submit"
                                    class="btn btn-primary p-3"
                                    :disabled="!file"
                                >
                                    Upload Excel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Preview Table -->
            <div class="card mt-4">
                <div class="card-body">
                    <h5 class="mb-3">Excel Preview (Mock)</h5>

                    <el-table stripe style="width: 100%">
                        <el-table-column prop="vehicle" label="Vehicle Name"/>
                        <el-table-column prop="category" label="Category"/>
                        <el-table-column prop="price" label="Daily Price"/>
                    </el-table>
                </div>
            </div>

        </div>
    </div>
</template>
<script setup>

import {onMounted, ref} from "vue";

const supplier = ref('')
const loading = ref(false)
const branch = ref('')
const file = ref('')
const downloadingTemplate = ref(false)
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const downloadTemplate = async () => {
    const $toast = useToast();
    downloadingTemplate.value = true;

    try {
        const response = await axios.get('vehicles/bulk-upload/template', {
            responseType: 'blob'
        });

        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'vehicles_bulk_upload_template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        $toast.success('Template downloaded successfully');
    } catch (error) {
        console.error('Download error:', error);
        $toast.error('Failed to download template');
    } finally {
        downloadingTemplate.value = false;
    }
};


const suppliers = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const branches = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const handleFile = (event) => {
    file.value = event.target.files[0]
}

const upload = async () => {
    const $toast = useToast();

    try {
        const formData = new FormData();
        formData.append('file', file.value);
        formData.append('supplier', supplier.value);
        formData.append('branch', branch.value);
        const response = await axios.post('vehicles/bulk-upload', formData);

        if (response.data.status === true) {
            const message = response.data.message || 'Uploaded successfully';
            const vehicleCount = response.data.data?.vehicles_imported || 0;

            $toast.success(`${message} (${vehicleCount} vehicles)`, { duration: 5000 });

            // Show warnings if any
            if (response.data.warnings && response.data.warnings.length > 0) {
                response.data.warnings.forEach(warning => {
                    $toast.warning(warning.error, { duration: 8000 });
                });
            }

            // Reset form
            file.value = '';
        }
    } catch (error) {
        console.log(error.response);

        if (error.response?.data?.status === false) {
            const message = error.response.data.message || 'Upload failed';
            $toast.error(message, { duration: 5000 });

            // Show individual errors if available
            if (error.response.data.errors && error.response.data.errors.length > 0) {
                error.response.data.errors.forEach(err => {
                    $toast.error(err.error, { duration: 8000 });
                });
            }
        } else {
            $toast.error('An unexpected error occurred');
        }
    }
}
const getSuppliers = async () => {
    try {
        suppliers.loading.value = true
        const response = await axios.get(`get/suppliers`, {})
        suppliers.all.value = response.data
        suppliers.list.value = suppliers.all.value.map((item) => ({
            value: `${item.name}`,
            label: `${item.name}`,
            id: `${item.id}`,
        }))

    } catch (error) {
        console.error(error)
    } finally {
        suppliers.loading.value = false
    }
}

const getBranches = async () => {
    try {
        const response = await axios.get('get/branches', {
            params: {
                'company_id': supplier.value
            }
        });
        branches.all.value = response.data
        branches.list.value = branches.all.value.map((item) => ({
            value: `${item.name}`,
            label: `${item.name}`,
            id: `${item.id}`,
        }))
    } catch (error) {
        console.error(error);
    }
};
onMounted(() => {
    getSuppliers();
});
</script>
