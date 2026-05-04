<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Memberships</h2>
            <div class="card">
                <div class="card-body">
                    <div class=" d-flex" style="margin-top: 50px ;">
                        <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
                            <el-table-column label="Company" prop="name"/>
                            <el-table-column label="Status" prop="">
                                <template #default="scope">
                                    <div v-if="scope.row.role === 'under_review'">Under review</div>
                                    <div v-else-if="scope.row.role === 'active_supplier'">Active Supplier</div>
                                    <div v-else>Non Active Supplier</div>
                                </template>
                            </el-table-column>
                            <el-table-column align="right">

                                <template #header>
                                    <el-input v-model="search" size="small" placeholder="Type to search"/>
                                </template>

                                <template #default="scope">
                                    <el-button
                                        v-if="scope.row.role === 'under_review'" size="small"
                                        type="success"
                                        @click="handleAccept(scope.$index, scope.row)"
                                    >Accept
                                    </el-button>

                                    <el-button
                                        v-if="scope.row.role === 'under_review' || scope.row.role === 'active_supplier'"
                                        size="small"
                                        type="danger"
                                        @click="handleDelete(scope.$index, scope.row)"
                                    >{{
                                            scope.row.role === 'under_review' ? 'Reject' : (scope.row.role === 'active_supplier' ? 'Disable' : '')
                                        }}
                                    </el-button>
                                </template>

                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {useForm} from '@inertiajs/vue3';
import {onMounted, computed, ref} from 'vue'

const search = ref('')
const tableData = ref([])
const loading = ref(false)

const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('get/requests');
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const filterTableData = computed(() => {
        return tableData.value.filter((data) => !search.value || data.company.toLowerCase().includes(search.value.toLowerCase()))
    }
)

const handleAccept = async (index, row) => {
    try {
        loading.value = true;
        const response = await axios.post('accept/requests', row);
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const handleDelete = async (index, row) => {
    try {
        loading.value = true;
        const response = await axios.post('delete/requests', row);
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
        getData()
    }
)
</script>
