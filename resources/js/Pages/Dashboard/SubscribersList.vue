<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Subscribers</h2>
            <div class="card">
                <div class=" d-flex">
                    <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
                        <el-table-column label="Name" prop="email"/>
                        <el-table-column label="Country" prop="country"/>
                        <el-table-column align="center">
                            <template #header>
                                <el-input v-model="search" size="small" placeholder="Type to search"/>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {useForm} from '@inertiajs/vue3';
import {onMounted, computed, ref, nextTick} from 'vue'

const search = ref('')
const tableData = ref([])
const loading = ref(false)


const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('get/subscribers');
        tableData.value = response.data;
        console.log(response.data)
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const filterTableData = computed(() => {
        return tableData.value.filter((data) => !search.value || data.email.toLowerCase().includes(search.value.toLowerCase()))
    }
)

onMounted(() => {
        getData()
    }
)
</script>

