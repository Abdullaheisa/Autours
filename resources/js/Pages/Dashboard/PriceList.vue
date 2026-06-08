<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Price List</h2>

            <div class="filters-bar mb-4 d-flex align-items-end" style="gap: 15px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <label class="form-label d-block">Search Name</label>
                    <el-input v-model="search" placeholder="Search by name" clearable @change="handleFilterChange"/>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <label class="form-label d-block">Category</label>
                    <el-select v-model="filterCategory" placeholder="All Categories" clearable @change="handleFilterChange" style="width: 100%">
                        <el-option
                            v-for="item in categories.options.value"
                            :key="item.id"
                            :label="item.label"
                            :value="item.id"
                        />
                    </el-select>
                </div>
                <div style="flex: 1; min-width: 200px;">
                    <label class="form-label d-block">Branch</label>
                    <el-select v-model="filterBranch" placeholder="All Branches" clearable @change="handleFilterChange" style="width: 100%">
                        <el-option
                            v-for="item in locations.options.value"
                            :key="item.id"
                            :label="item.label"
                            :value="item.id"
                        />
                    </el-select>
                </div>
                <div>
                    <el-button type="primary" @click="handleFilterChange">Filter</el-button>
                    <el-button @click="resetFilters">Reset</el-button>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="table-container">
                        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>

                            <el-table-column label="Photo" width="120">
                                <template #default="scope">
                                    <img :src="'/img/vehicles/' + scope.row.photo" width="100" style="object-fit: contain; max-height: 80px;">
                                </template>
                            </el-table-column>
                            <el-table-column label="Name" prop="name" min-width="150"/>
                            <el-table-column label="1-2 days Price" min-width="140">
                                <template #default="scope">
                                    <div class="d-flex align-items-center" style="gap: 5px;">
                                        <el-input size="small" v-model="scope.row.price" placeholder="1-2 price"/>
                                        <small>{{scope.row.branch?.currency}}</small>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="3-7 days Price" min-width="140">
                                <template #default="scope">
                                    <div class="d-flex align-items-center" style="gap: 5px;">
                                        <el-input size="small" v-model="scope.row.week_price" placeholder="3-7 price"/>
                                        <small>{{scope.row.branch?.currency}}</small>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="8-30 days Price" min-width="140">
                                <template #default="scope">
                                    <div class="d-flex align-items-center" style="gap: 5px;">
                                        <el-input size="small" v-model="scope.row.month_price" placeholder="4-30 price"/>
                                        <small>{{scope.row.branch?.currency}}</small>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="Branch Name - Location" min-width="200">
                                <template #default="scope">
                                        {{scope.row.branch?.name}} - {{scope.row.branch?.location}}
                                </template>
                            </el-table-column>

                            <el-table-column label="Actions" align="right" width="180">
                                <template #default="scope">
                                    <div class="d-flex align-items-center justify-content-end" style="gap: 10px;">
                                        <button class="btn btn-link p-0" @click="update(scope.row, scope.$index)">
                                            <i style="color:green;" class="fa fa-check fa-2x"/>
                                        </button>
                                        <el-switch size="large" v-model="scope.row.activation" @change="changeVehicleStatus(scope.row)"></el-switch>
                                    </div>
                                </template>
                            </el-table-column>

                        </el-table>

                        <div class="d-flex justify-content-end mt-4">
                            <el-pagination
                                v-model:current-page="currentPage"
                                v-model:page-size="pageSize"
                                :page-sizes="[10, 20, 50, 100]"
                                layout="total, sizes, prev, pager, next, jumper"
                                :total="total"
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const loading = ref(false)
const search = ref('')
const filterCategory = ref('')
const filterBranch = ref('')
const tableData = ref([])

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const categories = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const locations = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const fetchCategories = async () => {
    categories.loading.value = true;
    try {
        const response = await axios.get('get/categories')
        categories.all.value = response.data
        categories.list.value = categories.all.value.map((item) => ({
            id: item.id,
            label: item.name,
        }))
        categories.options.value = categories.list.value;
    } catch (error) {
        console.error(error)
    } finally {
        categories.loading.value = false;
    }
}

const fetchBranches = async () => {
    locations.loading.value = true;
    try {
        const response = await axios.get('get/branches')
        locations.all.value = response.data
        locations.list.value = locations.all.value.map((item) => ({
            id: item.id,
            label: item.name,
        }))
        locations.options.value = locations.list.value;
    } catch (error) {
        console.error(error)
    } finally {
        locations.loading.value = false;
    }
}

const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/get/vehicles', {
            params: {
                paginate: true,
                page: currentPage.value,
                per_page: pageSize.value,
                search: search.value,
                category_id: filterCategory.value,
                branch_id: filterBranch.value
            }
        });
        tableData.value = response.data.data;
        total.value = response.data.total;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const handleFilterChange = () => {
    currentPage.value = 1;
    getData();
}

const resetFilters = () => {
    search.value = '';
    filterCategory.value = '';
    filterBranch.value = '';
    currentPage.value = 1;
    getData();
}

const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
    getData();
}

const handleCurrentChange = (val) => {
    currentPage.value = val;
    getData();
}

const update = async ($item, $index) => {
    const $toast = useToast();

    try {
        loading.value = true;
        const formData = new FormData();

        if($item.price == null || $item.price <= 0 || isNaN($item.price)) {
            $toast.error('price should be numeric and more than 0', {position: 'top'})
            return
        }
        if($item.week_price == null || $item.week_price <= 0 || isNaN($item.week_price)) {
            $toast.error('price should be numeric and more than 0', {position: 'top'})
            return
        }
        if($item.month_price == null || $item.month_price <= 0 || isNaN($item.month_price)) {
            $toast.error('price should be numeric and more than 0', {position: 'top'})
            return
        }
        formData.append('id', $item.id);
        formData.append('price', $item.price);
        formData.append('week_price', $item.week_price);
        formData.append('month_price', $item.month_price);
        formData.append('update', '1');

        await axios.post('/edit-vehicle-price', formData);
        $toast.success('Price List updated successfully to ' + $item.name, {position: 'top'});

    } catch (error) {
        $toast.error(error.message, {position: 'top'});

    } finally {
        loading.value = false;
    }
}

const changeVehicleStatus = async ($item) => {
    const $toast = useToast();
    try {
        loading.value = true;
        const formData = new FormData();
        const activation = $item.activation ? 1 : 0;
        formData.append('activation', activation);
        formData.append('vehicle_id', $item.id);

        await axios.post('update/vehicles/activation', formData);
        $toast.success('Activation Status updated successfully to ' + $item.name, {position: 'top'});
    } catch (error) {
        $toast.error(error.message, {position: 'top'});
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    getData()
    fetchCategories()
    fetchBranches()
})
</script>

<style lang="scss">
.filters-bar {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #dee2e6;

    .form-label {
        font-weight: 600;
        font-size: 0.9rem;
        margin-bottom: 5px;
        color: #495057;
    }
}
</style>
