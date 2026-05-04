<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">What is Included ?</h2>
            <div class="card">
                <div class="card-body">
                    <form @submit.prevent="postData">
                            <div >
                                <label class="formbold-form-label"> What is included? </label>
                                <el-input  :class="'col-md-4 '" v-model="form.included" required/>
                            </div>
                        <div class="text-center mt-5">
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </div>
                <div>
                    <el-table :data="filterTableData" :loading="loading" stripe>
                        <el-table-column label="What is included?" prop="what_is_included"/>
                        <el-table-column align="center">
                            <template #header>
                                <el-input v-model="search" size="small" placeholder="Type to search"/>
                            </template>

                            <template #default="scope">
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
import {onMounted, computed, ref, nextTick} from 'vue'
import Editor from 'primevue/editor';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const search = ref('')
const tableData = ref([])
const loading = ref(false)

const inputValue = ref('')
const dynamicTags = ref([])
const inputVisible = ref(false)
const InputRef = ref(false)

const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('get/included');
        tableData.value = response.data;
        console.log(response.data)
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const filterTableData = computed(() => {
        return tableData.value.filter((data) => !search.value || data.what_is_included.toLowerCase().includes(search.value.toLowerCase()))
    }
)


const handleDelete = async (index, row) => {
    try {
        const d = confirm('are you sure you want to delete this item ?')
        if(!d) return
        loading.value = true;
        const response = await axios.post('delete/included', row);
        if(response.data) {
            $toast.success('Item deleted', {position: 'top'});
        }
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
        getData()
    }
}

const form = useForm({
    included: '',
});
const $toast = useToast();
const postData = async () => {
    try {
        const formData = new FormData();
        const options = dynamicTags.value;
        formData.append('included', form.included);
        const response = await axios.post('post/included', formData);
        console.log(response.data.status)
        if(response.data.status) {
            $toast.success('Successfully Added', {position: 'top'})
        }
    } catch (error) {
        console.error(error);
    } finally {
        getData();
    }
};

onMounted(() => {
        getData()
    }
)
</script>

<style>

.el-tag {
    .el-icon,
    .el-tag__content {
        color: #111111;
    }
}

</style>
