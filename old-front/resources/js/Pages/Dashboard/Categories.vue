<template>

    <div v-if="isOpen" class="modal-mask">
        <div class="modal-wrapper" @click="$emit('close')">
            <div class="modal-container" ref="target">
                <div class="modal-header">
                    <slot name="header"> Update {{ editCategory?.name }} Category</slot>
                </div>
                <div class="modal-body overflow-y-auto" style="max-height: calc(100vh - 210px);">
                    <form @submit.prevent="updateData">
                        <div class="formbold-mb-3">
                            <label class="formbold-form-label">
                                Category Photo
                            </label>
                            <img :src="'img/categories/' + editCategory.photo"  width="250" height="250">

                            <input @change="handle" type="file" class="formbold-form-input formbold-form-file"/>
                        </div>
                        <div class="formbold-mb-3">
                            <label class="formbold-form-label"> Category Name </label>
                            <input v-model="editCategory.name" :placeholder="editCategory.name" type="text"
                                   class="formbold-form-input"
                                   required/>
                        </div>

                        <div class=" text-center row">
                            <div class="col-md-4 offset-2">

                                <button type="submit" class="btn btn-primary">Submit</button>
                            </div>
                            <div class="col-md-2">
                                <button class="btn btn-danger" @click="closeModal()">Cancel</button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Categories</h2>
            <div class="card">
                <div class="card-body">
                    <form @submit.prevent="postData">
                        <div class="formbold-mb-3">
                            <label class="formbold-form-label">
                                Category Photo
                            </label>
                            <input @change="handle" type="file" class="formbold-form-input formbold-form-file"/>
                        </div>
                        <div class="formbold-mb-3">
                            <label class="formbold-form-label"> Category Name </label>
                            <input v-model="form.name" type="text" class="formbold-form-input"
                                   required/>
                        </div>

                        <div class="text-center">
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </div>
                <div class=" d-flex justify-content-center col-md-12">
                    <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
                        <el-table-column label="Photo" prop="">
                            <template #default="scope">
                                <img :src="'img/categories/' + scope.row.photo" class="w-50">
                            </template>
                        </el-table-column>
                        <el-table-column label="Category" prop="name"/>

                        <el-table-column align="right">

                            <template #header>
                                <el-input v-model="search" size="small" placeholder="Type to search"/>
                            </template>

                            <template #default="scope">
                                <!-- <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
                                >Edit</el-button> -->

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
import {useForm} from '@inertiajs/vue3';
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
        const response = await axios.get('get/categories');
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
    isOpen.value = true
    editCategory.value = row;
}

const handleDelete = async (index, row) => {
    try {
        loading.value = true;
        const response = await axios.post('delete/categories', row);
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

const postData = async () => {
    try {
        const formData = new FormData();
        formData.append('photo', image.value);
        formData.append('name', form.name);
        const response = await axios.post('post/categories', formData);
    } catch (error) {
        console.error(error);
    } finally {
        getData();
        form.reset();
    }
};

const updateData = async () => {
    try {
        const formData = new FormData();
        formData.append('photo', image.value);
        formData.append('name', editCategory.value.name);
        formData.append('id', editCategory.value.id);
        console.log(formData)
        const response = await axios.post('update/categories', formData);
        if (response.status) {
            $toast.success("Category updated Successfully", {position: "top"})
        }
        isOpen.value = false
    } catch (error) {
        console.error(error);
    } finally {
        getData();
        form.reset();
    }
};
const closeModal = () => {
    isOpen.value = false;
    editCategory.value = {}
}

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
