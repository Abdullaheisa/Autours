<template>
    <div class="card">
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">What is Included ?</h2>
                <el-button type="primary" @click="openAddDialog">
                    <i class="ti ti-plus me-1"></i> Add Included
                </el-button>
            </div>

            <!-- Dialog for Adding a new inclusion -->
            <el-dialog v-model="showAddDialog" title="Add New Included Feature" width="35%">
                <div class="formbold-mb-3">
                    <label class="formbold-form-label">What is included? (Feature Title)</label>
                    <el-input v-model="newInclusionForm.included" placeholder="e.g. Free Cancellation" required></el-input>
                </div>
                <div class="formbold-mb-3 mt-3">
                    <label class="formbold-form-label">Description (Optional)</label>
                    <el-input type="textarea" v-model="newInclusionForm.description" placeholder="Provide a brief description of this feature..." rows="3"></el-input>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="showAddDialog = false">Cancel</el-button>
                        <el-button type="primary" :loading="submitLoading" @click="submitAddInclusion">
                            Save Feature
                        </el-button>
                    </span>
                </template>
            </el-dialog>

            <!-- Dialog for Editing an inclusion -->
            <el-dialog v-model="showEditDialog" title="Edit Included Feature" width="35%">
                <div class="formbold-mb-3">
                    <label class="formbold-form-label">What is included? (Feature Title)</label>
                    <el-input v-model="editInclusionForm.included" placeholder="e.g. Free Cancellation" required></el-input>
                </div>
                <div class="formbold-mb-3 mt-3">
                    <label class="formbold-form-label">Description (Optional)</label>
                    <el-input type="textarea" v-model="editInclusionForm.description" placeholder="Provide a brief description..." rows="3"></el-input>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="showEditDialog = false">Cancel</el-button>
                        <el-button type="primary" :loading="submitLoading" @click="submitEditInclusion">
                            Update Feature
                        </el-button>
                    </span>
                </template>
            </el-dialog>

            <div class="card">
                <div>
                    <el-table :data="filterTableData" :loading="loading" stripe>
                        <el-table-column label="What is included?" prop="what_is_included"/>
                        
                        <el-table-column label="Description" prop="description" min-width="150">
                            <template #default="scope">
                                <span class="text-muted">{{ scope.row.description || 'No description provided' }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="Supplier" prop="supplier.company" width="150">
                            <template #default="scope">
                                {{ scope.row.supplier ? scope.row.supplier.company : 'Global' }}
                            </template>
                        </el-table-column>

                        <el-table-column label="Status" prop="status" width="120">
                            <template #default="scope">
                                <el-tag :type="scope.row.status === 'approved' ? 'success' : (scope.row.status === 'rejected' ? 'danger' : 'warning')">
                                    {{ scope.row.status }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column align="center" width="280">
                            <template #header>
                                <el-input v-model="search" size="small" placeholder="Type to search"/>
                            </template>

                            <template #default="scope">
                                <span v-if="$page.props.auth.user.role === 'admin' && scope.row.status === 'pending'" class="me-2">
                                    <el-button size="small" type="success" @click="handleStatus(scope.row, 'approved')">Approve</el-button>
                                    <el-button size="small" type="danger" @click="handleStatus(scope.row, 'rejected')">Reject</el-button>
                                </span>
                                <el-button
                                    size="small"
                                    type="primary"
                                    @click="openEditDialog(scope.row)"
                                >Edit
                                </el-button>
                                <el-button
                                    size="small"
                                    type="danger"
                                    @click="handleDelete(scope.$index, scope.row)"
                                >Delete
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, computed, ref} from 'vue'
import {useToast} from 'vue-toast-notification';
import {ElMessageBox} from 'element-plus';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast();
const search = ref('')
const tableData = ref([])
const loading = ref(false)

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const submitLoading = ref(false)

const newInclusionForm = ref({
    included: '',
    description: ''
})

const editInclusionForm = ref({
    id: null,
    included: '',
    description: ''
})

const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('get/included');
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const filterTableData = computed(() => {
    return tableData.value.filter((data) => !search.value || data.what_is_included.toLowerCase().includes(search.value.toLowerCase()))
})

const openAddDialog = () => {
    newInclusionForm.value = {
        included: '',
        description: ''
    }
    showAddDialog.value = true
}

const submitAddInclusion = async () => {
    if (!newInclusionForm.value.included.trim()) {
        $toast.error('Please enter a feature title', {position: 'top'});
        return;
    }

    try {
        submitLoading.value = true;
        const formData = new FormData();
        formData.append('included', newInclusionForm.value.included.trim());
        if (newInclusionForm.value.description) {
            formData.append('description', newInclusionForm.value.description.trim());
        }

        const response = await axios.post('post/included', formData);
        if (response.data.status) {
            $toast.success('Feature added successfully', {position: 'top'});
            showAddDialog.value = false;
            getData();
        } else {
            $toast.error('Failed to add feature', {position: 'top'});
        }
    } catch (error) {
        console.error(error);
        $toast.error('An error occurred', {position: 'top'});
    } finally {
        submitLoading.value = false;
    }
}

const openEditDialog = (row) => {
    editInclusionForm.value = {
        id: row.id,
        included: row.what_is_included,
        description: row.description || ''
    }
    showEditDialog.value = true
}

const submitEditInclusion = async () => {
    if (!editInclusionForm.value.included.trim()) {
        $toast.error('Please enter a feature title', {position: 'top'});
        return;
    }

    try {
        submitLoading.value = true;
        const response = await axios.post('post/included/update', {
            id: editInclusionForm.value.id,
            included: editInclusionForm.value.included.trim(),
            description: editInclusionForm.value.description.trim()
        });
        if (response.data.status) {
            $toast.success('Feature updated successfully', {position: 'top'});
            showEditDialog.value = false;
            getData();
        } else {
            $toast.error('Failed to update feature', {position: 'top'});
        }
    } catch (error) {
        console.error(error);
        $toast.error('An error occurred', {position: 'top'});
    } finally {
        submitLoading.value = false;
    }
}

const handleDelete = async (index, row) => {
    ElMessageBox.confirm(
        'Are you sure you want to delete this feature?',
        'Confirm Delete',
        {
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            type: 'warning',
        }
    ).then(async () => {
        try {
            loading.value = true;
            const response = await axios.post('delete/included', row);
            if(response.data.status) {
                $toast.success('Item deleted successfully', {position: 'top'});
            }
        } catch (error) {
            console.error(error);
            $toast.error('Error deleting item', {position: 'top'});
        } finally {
            loading.value = false;
            getData()
        }
    }).catch(() => {
        // Cancelled
    });
}

const handleStatus = async (row, status) => {
    try {
        loading.value = true;
        const response = await axios.post('post/included/status', { id: row.id, status: status });
        if(response.data.status) {
            $toast.success(`Feature ${status} successfully`, {position: 'top'});
        }
    } catch (error) {
        console.error(error);
        $toast.error('Error updating status', {position: 'top'});
    } finally {
        loading.value = false;
        getData()
    }
}

onMounted(() => {
    getData()
})
</script>

<style>
.el-tag {
    .el-icon,
    .el-tag__content {
        color: #111111;
    }
}
.formbold-mb-3 {
    margin-bottom: 1rem;
}
.formbold-form-label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}
</style>
