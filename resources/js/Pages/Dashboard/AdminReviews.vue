<template>
    <div class="card">
        <div v-if="isOpen" class="modal-mask">
            <div class="modal-wrapper" @click="$emit('close')">
                <div v-if="loading"><Loader/></div>
                <div v-else class="modal-container" ref="target">
                    <div class="modal-header">
                        <slot name="header"> Rental Review</slot>
                    </div>
                    <div class="modal-body overflow-y-auto" style="max-height: calc(100vh - 210px);">
                        <h2>Customer Feedback</h2>
                        <div  v-for="(item,index) in activeRental?.rental_rates" :item-key="index">
                            <div class="row col-md-12 ">
                                <div class="col-md-6 text-nowrap">{{item.question.objective}} </div>
                                <div class="col-md-6 text-nowrap">  <CProgressBar style="border-radius: 10px;"   :value="item.rate * 10">{{item.rate}} / 10</CProgressBar> </div>
                            </div>
                        </div>
                        <div class="mt-5 ml-2" v-if="activeRental?.comment">
                            <label>Comment</label>
                            <Textarea class="col-md-12" disabled rows="5"> {{activeRental.comment}} </Textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <slot name="footer">
                            <div>
                                <button class="btn btn-primary" @click="closeModal()">Done</button>
                            </div>
                        </slot>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="row">
                <div class="formbold-mb-3 col-md-2">
                    <label class="formbold-form-label">Country</label>
                    <el-select
                        v-model="country"
                        size="large"
                        filterable
                        remote
                        reserve-keyword
                        placeholder="Countries..."
                        remote-show-suffix
                        :loading="countries.loading.value"
                        v-on:change="getSuppliers()"
                        required>
                        <el-option
                            v-for="item in countries.list.value"
                            :key="item.id"
                            :label="item.label"
                            :value="item.label"
                        />
                    </el-select>
                </div>
                <div class="formbold-mb-3 col-md-2">
                    <label class="formbold-form-label">Suppliers</label>
                    <el-select
                        v-model="supplier"
                        size="large"
                        filterable
                        remote
                        style="height: 35px;"
                        reserve-keyword
                        v-on:change="getSupplierInvoices()"
                        placeholder="Suppliers..."
                        remote-show-suffix
                        :loading="suppliers.loading.value"
                        required>
                        <el-option
                            v-for="item in suppliers.list.value"
                            :key="item.id"
                            :label="item.label"
                            :value="item.id"
                        />
                    </el-select>
                </div>
                <div class="formbold-mb-3 col-md-2">
                    <label class="formbold-form-label">Status</label>
                    <el-select
                        v-model="order_status"
                        size="large"
                        filterable
                        remote
                        reserve-keyword
                        placeholder="Rental Status..."
                        remote-show-suffix
                        style="height: 35px;"
                        :loading="countries.loading.value"
                        @change="selectStatus()"
                        required>
                        <el-option
                            v-for="item in order_statuses.all.value"
                            :key="item.id"
                            :label="item.name_en"
                            :value="item.id"
                        />
                    </el-select>
                </div>
                <div class="formbold-mb-3 col-md-2">
                    <label class="formbold-form-label">Rental Reference</label>
                    <el-input
                        placeholder="Reference..."
                        v-model="reference"
                        @change="getData()"
                        style="height: 35px;"
                    >

                    </el-input>
                </div>
                <div class=" col-md-3  date-input">
                    <div class=" ">
                        <label class="formbold-form-label">Select Date Range</label>
                        <el-date-picker
                            v-model="date_range"
                            type="daterange"
                            range-separator="TO"
                            start-placeholder="Start date"
                            end-placeholder="End date"
                            size="large"
                            required="true"
                            format="YYYY/MM/DD"
                            value-format="YYYY-MM-DD"
                            style="height: 35px;"
                            @change="getData"

                        />

                    </div>
                </div>
            </div>
            <h2 class="mb-4">Rentals</h2>
            <div class=" d-flex">
                <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>

                    <el-table-column align="left" label="Booking #" prop="order_number"/>
                    <el-table-column align="left" label="Vehicle" prop="vehicle.name"/>
                    <el-table-column align="left" label="Country" prop="customer.country"/>
                    <el-table-column align="left" label="Supplier name" prop="vehicle.supplier.name"/>
                    <el-table-column align="left" label="Started At" prop="start_date"/>
                    <el-table-column align="left" label="Ended At" prop="end_date"/>

                    <el-table-column align="left" label="Duration" prop="start_date">
                        <template #default="scope">
                            {{moment(scope.row.end_date).diff(moment(scope.row.start_date), 'days')}}
                        </template>
                    </el-table-column>

                    <el-table-column label="Review" align="center" prop="rate">
                        <template #default="scope">
                            <a class="btn btn-primary col-md-6" @click="openReviewDetails(scope.row.id)" href="#">{{scope.row.rate}} <i class="fa fa-star"/></a>
                        </template>
                    </el-table-column>

                    <el-table-column align="right">
                        <template #header>
                            <el-input v-model="search" size="small" placeholder="Type to search"/>
                        </template>


                    </el-table-column>
                </el-table>
            </div>
        </div>

    </div>

</template>

<script setup>
import {onMounted, computed, ref} from 'vue'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import moment from "moment";
import Loader from "../../components/Loader.vue";
import {CProgressBar} from "@coreui/vue";

const country = ref('')
const supplier = ref('')
const branch = ref('')
const reference = ref('')
const date_range = ref('')
const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const suppliers = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};
const branches = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const order_statuses = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
}
const order_status = ref('')
const search = ref('')
const tableData = ref([])
const loading = ref(false)
const role = ref('')
const invoices = ref({})
const $toast = useToast();
const isOpen = ref(false)
const activeRental = ref({})

const closeModal = () => {
    isOpen.value = false;
}
const openReviewDetails = async (rental_id) =>  {
    try {

        loading.value = true

        const response = await axios.get('/rental/rate/' + rental_id, {})
        console.log(response)
        if (response.data.status) {
            isOpen.value = true
            activeRental.value = response.data.data
        }
        loading.value = false
    } catch (e) {
        loading.value = false
    }

}
const fetchCountries = async () => {
    countries.loading.value = true;
    try {
        //
        const response = await axios.get('/get/countries', {})
        countries.all.value = response.data
        console.log(response);
        countries.list.value = countries.all.value.map((item) => ({
            id: `${item}`,
            label: `${item}`,
            iso: `${item}`
        }))
    } catch (error) {
        console.error(error)
    } finally {
        countries.loading.value = false;
    }
}

const cancel = () => {
    supplier.value = '';
    country.value = ''
    getData()
}

const getSuppliers = async () => {
    try {
        suppliers.loading.value = true
        if (country.value) {
            const response = await axios.get(`/get/suppliers`, {
                params: {
                    'country': country.value
                }
            })
            suppliers.all.value = response.data
            suppliers.list.value = suppliers.all.value.map((item) => ({
                value: `${item.name}`,
                label: `${item.name}`,
                id: `${item.id}`,
            }))

        }
    } catch (error) {
        console.error(error)
    } finally {
        suppliers.loading.value = false
    }
}

const selectStatus = () => {
    getData()
}

const getSupplierInvoices = async () => {
    try {
        const response = await axios.get('/get/supplier/invoice', {
            params: {
                'company_id': supplier.value
            }
        });
        invoices.value = response.data.data
        getData()
    } catch (error) {
        console.error(error);
    }
};

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
        const params = {
            country: "",
            supplier_id: "",
            order_status: "",
            order_number: "",
            date_range: "",
            has_review: 1
        };
        if (country.value !== [] || country.value != null || country.value !== undefined || country.value !== "") {
            params.country = country.value
        }

        if (supplier.value !== [] || supplier.value != null || supplier.value !== undefined || supplier.value !== "") {
            params.supplier_id = supplier.value
        }
        if (order_status.value !== [] || order_status.value != null || order_status.value !== undefined || order_status.value !== "") {
            params.order_status = order_status.value
        }
        if (reference.value !== [] || reference.value != null || reference.value !== undefined || reference.value !== "") {

            params.order_number =  reference.value
        }
        if (date_range.value !== [] || date_range.value != null || date_range.value !== undefined || date_range.value !== "") {
            params.date_range =  date_range.value
        }
        const response = await axios.get('/get/rentals/admin', {params: params});
        tableData.value = response.data.rentals;
        order_statuses.all.value = response.data.rental_statuses;
        order_statuses.list.value = order_statuses.all.value.map((item) => ({
            value: `${item.name_en}`,
            label: `${item.name_en}`,
            id: `${item.id}`,
        }))
        order_statuses.loading.value = false
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const filterTableData = computed(() => {
        return tableData.value.filter((data) =>
            !search.value
            || data.vehicle.name.toLowerCase().includes(search.value.toLowerCase())
            || data.order_number.toLowerCase().includes(search.value.toLowerCase())
        )})

const handleAccept = async (index, row) => {
    try {
        loading.value = true;
        const response = await axios.post('accept/rentals', row);
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
        const response = await axios.post('delete/rentals', row);
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}
const setParams = async () => {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('status')) {
        order_status.value = urlParams.get('status')
    }
}
onMounted(() => {
        setParams();
        getRole()
        getData()
        fetchCountries()
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
