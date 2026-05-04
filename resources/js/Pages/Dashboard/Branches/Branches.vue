<template>


    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Branches</h2>
            <div class="col-md-3 my-3">
                <button class="btn btn-primary" @click="() => router.get('/branches/add')"> Add New Branch <i class="fa fa-plus"/> </button>
            </div>
            <div class="card">
                <div class=" d-flex justify-content-center col-md-12">
                    <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
                        <el-table-column label="Branch Name" prop="name"/>
                        <el-table-column label="Country" prop="country"/>
                        <el-table-column label="Address" prop="adresse"/>
                        <el-table-column label="Location" prop="location"/>

                        <el-table-column align="right">

                            <template #header>
                                <el-input v-model="search" size="small" placeholder="Type to search"/>
                            </template>

                            <template #default="scope">
                                <el-button
                                    size="small"
                                    type="warning"
                                    @click="handleEdit(scope.$index, scope.row)"
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
import {router, useForm} from '@inertiajs/vue3';
import {onMounted, computed, ref} from 'vue'
import {CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem} from "@coreui/vue";

import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const search = ref('')
const tableData = ref([])
const loading = ref(false)
const isOpen = ref(false)
const editCategory = ref({})
const $toast = useToast()
const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/get/branches');
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const filterTableData = computed(() => {
        return tableData.value.filter((data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase()))
    }
)

const handle = (event) => {
    image.value = event.target.files[0]
}

const handleEdit = (index, row) => {
    router.get('/branches/show', {id: row.id})
}
const assignCarToBranch = (row) => {
    router.get('/branches/cars', {id: row.id})
}
const handleDelete = async (index, row) => {
    try {
        loading.value = true;
        const confirmation = confirm("Are you sure you want to delete " + row.name + " branch")

        if (confirmation !== true) {
            return
        }
        const response = await axios.post('/delete/branches', row);
        await getData()
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const form = useForm({
    name: '',
});

const image = ref('')


onMounted(() => {
        getData()
    }
)
</script>
<style>

.modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {
    width: 900px;
    margin: 5% 25%;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>
