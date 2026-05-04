<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Fleet</h2>

            <div class=" d-flex">
                <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
                    <el-table-column label="Photo" prop="">
                        <template #default="scope">
                            <img :src="'/img/vehicles/' + scope.row.photo" class="w-100">
                        </template>
                    </el-table-column>
                    <el-table-column label="Name" prop="name"/>
                    <el-table-column label="Pickup" prop="branch.location" width="200"/>
                    <el-table-column label="Price" prop="price"/>
                    <el-table-column label="Active Rentals" prop="rentals_count"/>
                    <el-table-column v-if="role === 'admin'" label="Supplier">
                        <template #default="scope">
                            <img :src="'/img/' + scope.row.supplier.logo" class="w-100" width="50" height="120">
                        </template>
                    </el-table-column>
                    <el-table-column align="right">

                        <template #header>
                            <el-input v-model="search" size="small" placeholder="Type to search"/>
                        </template>

                        <template #default="scope">
                            <el-button
                                class="col-6"
                                size="large"
                                type="danger"
                                @click="handleDelete(scope.$index, scope.row)"
                            >Delete
                            </el-button>
                            <el-button
                                class="col-6"
                                size="large"
                                type="info"
                                @click="handleDrawer(scope.$index, scope.row);"
                            >Edit
                            </el-button>
                        </template>

                    </el-table-column>
                </el-table>
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
import {onMounted, computed, ref} from 'vue'

const search = ref('')
const tableData = ref([])
const loading = ref(false)
const role = ref('')
const drawer = ref(false)
const photo = ref('')
const category = ref('')
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
    console.log(list)
    const s = {
        'name': name,
        'icon': list.icon,
        'option': option,
    }

    console.log(s);
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
        console.log(response.data)
        allSpecifications.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {

    }
}

const fetchCategories = async () => {
    categories.loading.value = true;
    try {
        const response = await axios.get('get/categories')
        categories.all.value = response.data
        categories.list.value = categories.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item.name}`,
        }))
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
            // catch error
        })
}

function cancelClick() {
    ElMessageBox.confirm('Are you sure you want to cancel this?')
        .then(() => {
            drawer.value = false
        })
        .catch(() => {
            // catch error
        })
}

function confirmClick() {
    ElMessageBox.confirm(`Are you sure you want to modify this?`)
        .then(() => {
            upload();
            drawer.value = false
        })
        .catch(() => {
            // catch error
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
        const response = await axios.post('post/vehicles', formData);
        tableData.value = response.data;
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

const getData = async (index, row) => {
    try {
        loading.value = true;
        const response = await axios.get('/get/vehicles');
        tableData.value = response.data;
        for (const key in tableData.value[index]) {
            data.value[key] = tableData.value[index][key] || '';
        }
        photo.value = photos.all.value.find(p => {
            return p.photo === data.value.photo;
        })?.name
        category.value = data.value.category?.name;
        pickupLoc.value = data.value.branch?.name;
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
            id: `${item.id}`,
            label: `${item.name}`,
        }))
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

const filterTableData = computed(() => {
    const dataArray = Array.isArray(tableData.value) ? tableData.value : [];
    return dataArray.filter((data) =>
        !search.value || data.name.toLowerCase().includes(search.value.toLowerCase())
    );
})

const handleDelete = async (index, row) => {
    try {
       const decision =  confirm("Are you sure want to delete ?" + row.name)
        if(!decision) {
            return;
        }
        loading.value = true;
        const response = await axios.post('delete/vehicles/' +row.id );
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
        getData()
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
    gap: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;

    button {
        width: 100%;
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
</style>
