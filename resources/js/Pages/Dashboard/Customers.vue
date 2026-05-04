<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Customers</h2>
            <div class=" d-flex">
                <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
                    <el-table-column label="Name" prop="name"/>
                    <el-table-column label="E-mail" prop="email"/>
                    <el-table-column label="Mobile" prop="phone_num"/>
                    <el-table-column label="Country" prop="country"/>
                    <el-table-column align="right">
                        <template #header>
                            <el-input v-model="search" size="default" placeholder="Type to search"/>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, computed, ref} from 'vue'

const search = ref('')
const tableData = ref([])
const loading = ref(false)
const role = ref('')

const getRole = async () => {
    try {
        const response = await axios.get('/get/user/role');
        role.value = response.data;
    } catch (error) {
        console.error(error);
    }
}

const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/get/customers');
        tableData.value = response.data.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const filterTableData = computed(() => {
        return tableData?.value?.filter((data) =>{
           return  !search.value
               || data.name.toLowerCase().includes(search.value.toLowerCase())
               ||  data.country?.toLowerCase().includes(search.value.toLowerCase())
               ||  data.phone_num?.includes(search.value.toLowerCase())
        })
    }
)




onMounted(() => {
        getRole()
        getData()
    }
)
</script>

<style lang="scss">
.el-table td.el-table__cell:last-child div {
    gap: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;

    button {
        width: 100%;
        margin: 0;
    }
}
</style>
