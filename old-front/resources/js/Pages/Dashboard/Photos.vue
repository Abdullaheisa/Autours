<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Vehicles Photos</h2>
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <form class="row" @submit.prevent="upload" enctype="multipart/form-data">
                            <div class="formbold-mb-3 col-md-3">
                                <label class="formbold-form-label">
                                    Vehicle Photo
                                </label>
                                <input @change="handle" type="file" class="formbold-form-input formbold-form-file" required/>

                                <img v-if="image" :src="'img/vehicles' + photo" style="width:300px;">

                            </div>

                            <div class="formbold-mb-3 col-md-3">
                                <label class="formbold-form-label"> Vehicle Name </label>
                                <input v-model="name" type="text" class="formbold-form-input"
                                       required/>
                            </div>

                            <div class="text-left ">
                                <button type="submit" class="btn btn-primary p-3" style="color: #0a3622;">Submit</button>
                            </div>
                        </form>
                    </div>
                    <div class=" d-flex">
                        <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
                            <el-table-column label="Photo" prop="">
                                <template #default="scope">
                                    <img :src="'img/vehicles/' + scope.row.photo" class="w-50">
                                </template>
                            </el-table-column>
                            <el-table-column label="Vehicle" prop="name"/>

                            <el-table-column align="right">

                                <template #header>
                                    <el-input v-model="search" size="small" placeholder="Type to search"/>
                                </template>

                                <template #default="scope">
                                    <!-- <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
                                    >Edit</el-button> -->

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
    </div>
</template>

<script setup>
import {onMounted, ref, computed} from 'vue'

const photo = ref('')
const image = ref('')
const name = ref('')

const search = ref('')
const tableData = ref([])
const loading = ref(false)

const handle = (event) => {
    image.value = event.target.files[0]
}

const upload = async () => {
    try {
        const formData = new FormData();
        formData.append('photo', image.value);
        formData.append('name', name.value);
        const response = await axios.post('post/photos', formData);
        open(response.data);
        if (response.data === 1) {
            photo.value = null;
            image.value = null;
            name.value = null;
        }
    } catch (error) {
        console.error(error);
    } finally {
        fetchPhotos();
    }
}

const handleDelete = async (index, row) => {
    try {
        loading.value = true;
        const response = await axios.post('delete/photos', row);
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const fetchPhotos = async () => {
    try {
        loading.value = true;
        const response = await axios.get('get/photos');
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

const open = (response) => {
    if (response === 1) {
        ElMessage({
            showClose: true,
            message: 'Created successfully.',
            type: 'success',
        })
    } else {
        ElMessage.error('Oops, something went wrong.')
    }
}


onMounted(() => {
    fetchPhotos();
});
</script>
