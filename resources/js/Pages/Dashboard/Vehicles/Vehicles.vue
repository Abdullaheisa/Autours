<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Fleet</h2>

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

            <div class="table-container">
                <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
                    <el-table-column label="Photo" width="120">
                        <template #default="scope">
                            <img :src="'/img/vehicles/' + scope.row.photo" class="w-100" style="object-fit: contain; max-height: 80px;">
                        </template>
                    </el-table-column>
                    <el-table-column label="Name" prop="name" min-width="150"/>
                    <el-table-column label="Pickup" min-width="180">
                        <template #default="scope">
                            <span v-if="scope.row.branches && scope.row.branches.length > 0">
                                {{ Array.from(new Set(scope.row.branches.map(b => b.location))).join(', ') }}
                            </span>
                            <span v-else>{{ scope.row.branch?.location }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="Price" prop="price" width="100">
                        <template #default="scope">
                            ${{ scope.row.price }}
                        </template>
                    </el-table-column>
                    <el-table-column label="Active Rentals" prop="rentals_count" width="130" align="center"/>
                    <el-table-column v-if="role === 'admin'" label="Supplier" width="150">
                        <template #default="scope">
                            <img v-if="scope.row.supplier?.logo" :src="'/img/' + scope.row.supplier.logo" width="50" height="50" style="object-fit: contain;">
                            <span v-else>{{ scope.row.supplier?.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="Actions" align="right" width="200">
                        <template #default="scope">
                            <el-button
                                size="small"
                                type="danger"
                                @click="handleDelete(scope.$index, scope.row)"
                            >Delete
                            </el-button>
                            <el-button
                                size="small"
                                type="info"
                                @click="handleDrawer(scope.$index, scope.row);"
                            >Edit
                            </el-button>
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
            <el-drawer v-model="drawer" direction="rtl" :before-close="handleClose">
                <template #header>
                    <h4>Edit your vehicle</h4>
                </template>
                <template #default>
                    <div>
                        <form @submit.prevent>
                            <div class="formbold-mb-3">
                                <label class="formbold-form-label">
                                    Vehicle Photo
                                </label>
                                <img v-if="photo?.includes('_')" :src="'/img/vehicles/' + photo" class="w-100 mb-2"
                                     style="border-radius: 15px;">
                                <img v-else-if="data.photo" :src="'/img/vehicles/' + data.photo" class="w-100 mb-2"
                                     style="border-radius: 15px;">
                                <el-select
                                    v-model="photo"
                                    size="large"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="Photo..."
                                    remote-show-suffix
                                    :remote-method="remotePhotos"
                                    :loading="photos.loading.value"
                                >
                                    <el-option
                                        v-for="item in photos.options.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.photo"
                                    >
                                        <div class="d-flex" style="gap:10px;">
                                            <img :src="'img/vehicles/' + item.photo" style="width:50px;">
                                            {{ item.label }}
                                        </div>
                                    </el-option>
                                </el-select>
                            </div>

                            <div class="formbold-mb-3">
                                <label class="formbold-form-label"> Vehicle Name </label>
                                <input v-model="data.name" type="text" class="formbold-form-input"
                                       required/>
                            </div>

                            <div class="formbold-mb-3">
                                <label class="formbold-form-label"> Vehicle Description </label>
                                <textarea v-model="data.description" class="formbold-form-input"></textarea>
                            </div>

                            <div class="formbold-mb-3">
                                <label class="formbold-form-label">Price</label>
                                <div class="input-with-percent">
                                    <input v-model="data.price" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                           class="formbold-form-input"/>
                                    <span class="percent-symbol">$</span>
                                </div>
                            </div>

                            <div class="formbold-mb-3">
                                <label class="formbold-form-label">3 - 7 Days Price</label>
                                <div class="input-with-percent">
                                    <input v-model="data.week_price" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                           class="formbold-form-input"/>
                                    <span class="percent-symbol">$</span>
                                </div>
                            </div>

                            <div class="formbold-mb-3">
                                <label class="formbold-form-label">30 Days Price</label>
                                <div class="input-with-percent">
                                    <input v-model="data.month_price" type="text" pattern="[0-9]+([,.][0-9]+)?"
                                           class="formbold-form-input"/>
                                    <span class="percent-symbol">$</span>
                                </div>
                            </div>

                            <div class="formbold-mb-3">
                                <label class="formbold-form-label"> Vehicle Location </label>
                                <el-select
                                    v-model="pickupLoc"
                                    size="large"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="Pickup..."
                                    remote-show-suffix
                                    :remote-method="remoteBranches"
                                    :loading="locations.loading.value"
                                    @click="remoteBranches()"
                                >
                                    <el-option
                                        v-for="item in locations.options.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.id"
                                    />
                                </el-select>
                            </div>

                            <div class="formbold-mb-3">
                                <label class="formbold-form-label">Category</label>
                                <el-select
                                    v-model="category"
                                    size="large"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="Select Category..."
                                    remote-show-suffix
                                    :remote-method="remoteCategories"
                                    :loading="categories.loading.value"
                                    @click="remoteCategories()"
                                >
                                    <el-option
                                        v-for="item in categories.options.value"
                                        :key="item.id"
                                        :label="item.label"
                                        :value="item.id"
                                    />
                                </el-select>
                            </div>

                            <div v-for="(list, i) in allSpecifications" :key="i" class="formbold-mb-3">
                                <label class="formbold-form-label">{{ list.name }}</label>
                                <el-select
                                    v-model="specification[i]"
                                    size="large"
                                    filterable
                                    remote
                                    reserve-keyword
                                    placeholder="SELECT OPTION..."
                                    remote-show-suffix
                                >
                                    <el-option
                                        v-for="item in list.options"
                                        @click="getSpecificationOption(list.name, item, list)"
                                        :key="item"
                                        :label="item"
                                        :value="item"
                                    />
                                </el-select>
                            </div>

                            <!-- <div class="text-center">
                                <button type="submit" class="formbold-btn">Submit</button>
                            </div> -->
                        </form>
                    </div>
                </template>
                <template #footer>
                    <div style="flex: auto">
                        <el-button @click="cancelClick">cancel</el-button>
                        <el-button type="primary" @click="confirmClick">confirm</el-button>
                    </div>
                </template>
            </el-drawer>
        </div>
    </div>
</template>

<script setup>
import {router, useForm} from '@inertiajs/vue3';
import {onMounted, computed, ref, watch} from 'vue'

const search = ref('')
const filterCategory = ref('')
const filterBranch = ref('')
const tableData = ref([])
const loading = ref(false)
const role = ref('')
const drawer = ref(false)
const photo = ref('')
const category = ref('')

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
const photos = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const pickupLoc = ref('')
const locations = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const specification = ref([])
const allSpecifications = ref([])
const selectedSpecifications = ref([])

const data = ref({});

const fetchPhotos = async () => {
    photos.loading.value = true;
    try {
        const response = await axios.get('/get/photos')
        photos.all.value = response.data
        photos.list.value = photos.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item.name}`,
            photo: `${item.photo}`,
        }))
        photos.options.value = photos.list.value;
    } catch (error) {
        console.error(error)
    } finally {
        photos.loading.value = false;
    }
}

const remotePhotos = (query) => {
    if (query) {
        photos.loading.value = true
        setTimeout(() => {
            photos.loading.value = false
            photos.options.value = photos.list.value.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)
    } else {
        photos.options.value = photos.list.value;
    }
}

const getSpecificationOption = (name, option, list) => {
    const s = {
        'name': name,
        'icon': list.icon,
        'option': option,
    }

    const isDuplicate = selectedSpecifications.value.some(item => (
        item.name === name
    ));

    if (!isDuplicate) {
        selectedSpecifications.value.push(s);
    } else {
        const existingItem = selectedSpecifications.value.find(item => item.name === name);
        if (existingItem) {
            existingItem.option = option;
        }
    }
};

const fetchSpecifications = async () => {
    try {
        const response = await axios.get('get/specifications');
        allSpecifications.value = response.data;
    } catch (error) {
        console.error(error);
    }
}

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

const remoteCategories = (query) => {
    if (query) {
        categories.loading.value = true
        setTimeout(() => {
            categories.loading.value = false
            categories.options.value = categories.list.value.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)
    } else {
        categories.options.value = categories.list.value;
    }
}

const handleDrawer = (index, row) => {
    router.get('edit/vehicle',{id: row.id}  )
}

const handleClose = () => {
    ElMessageBox.confirm('Are you sure you want to cancel this?')
        .then(() => {
            drawer.value = false
        })
        .catch(() => {
        })
}

function cancelClick() {
    ElMessageBox.confirm('Are you sure you want to cancel this?')
        .then(() => {
            drawer.value = false
        })
        .catch(() => {
        })
}

function confirmClick() {
    ElMessageBox.confirm(`Are you sure you want to modify this?`)
        .then(() => {
            upload();
            drawer.value = false
        })
        .catch(() => {
        })
}

const upload = async () => {
    try {
        const formData = new FormData();
        if (photo.value.includes("_")) {
            formData.append('photo', photo.value);
        } else {
            formData.append('photo', data.value.photo);
        }
        formData.append('id', data.value.id);
        formData.append('name', data.value.name);
        formData.append('description', data.value.description);
        formData.append('price', data.value.price);
        formData.append('week_price', data.value.week_price);
        formData.append('month_price', data.value.month_price);
        if (!isNaN(category.value)) {
            formData.append('category', category.value);
        } else {
            formData.append('category', data.value.category.id);
        }
        if (!isNaN(pickupLoc.value)) {
            formData.append('pickupLoc', pickupLoc.value);
        } else {
            formData.append('pickupLoc', data.value.branch.id);
        }
        if (selectedSpecifications.value) {
            formData.append('specifications', JSON.stringify(selectedSpecifications.value));
        }
        formData.append('update', '1');
        await axios.post('post/vehicles', formData);
    } catch (error) {
        console.error(error);
    } finally {
        for (const key in data.value) {
            data.value[key] = null;
        }
        getData();
    }
}

const getRole = async () => {
    try {
        const response = await axios.get('get/user/role');
        role.value = response.data;
    } catch (error) {
        console.error(error);
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

const remoteBranches = (query) => {
    if (query) {
        locations.loading.value = true
        setTimeout(() => {
            locations.loading.value = false
            locations.options.value = locations.list.value.filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)
    } else {
        locations.options.value = locations.list.value;
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

const handleDelete = async (index, row) => {
    try {
       const decision =  confirm("Are you sure want to delete ?" + row.name)
        if(!decision) {
            return;
        }
        loading.value = true;
        await axios.post('delete/vehicles/' +row.id );
        getData()
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
        getRole()
        getData()
        fetchCategories()
        fetchSpecifications()
        fetchPhotos();
        fetchBranches();
    }
)
</script>

<style lang="scss">
.el-table td.el-table__cell:last-child div {
    gap: 10px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;

    button {
        margin: 0;
    }
}

.formbold-form-input.disabled {
    background: rgba(128, 128, 128, 0.1);
    color: rgba(0, 0, 0, 0.3);
}

.el-drawer .el-drawer__header {
    margin-top: 75px;
    background: white;
}

.el-drawer .el-drawer__body {
    padding-top: 150px;
}

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
