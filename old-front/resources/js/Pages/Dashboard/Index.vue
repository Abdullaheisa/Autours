<template>

    <div class="">
        <!--  Row 1 -->
        <div class="card">
            <div class="card">
            </div>
            <div class="row">
                <div class="col-lg-8 d-flex align-items-strech">
                    <div class="card w-100">
                        <div class="card-body">
                            <div class="d-sm-flex d-block align-items-center justify-content-between mb-9">
                                <div class="mb-3 mb-sm-0">
                                    <h5 class="card-title fw-semibold">Sales Overview</h5>
                                </div>

                            </div>
                            <Chart type="bar" :data="BarChartData" :options="chartOptions"/>
                            <Chart type="line" :data="LineChartData" class="h-[30rem]"/>

                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="row">
                        <div class="col-lg-12">
                            <!-- Yearly Breakup -->
                            <div class="card overflow-hidden">
                                <div class="card-body p-4">
                                    <h5 class="card-title mb-9 fw-semibold">Current year Number of suppliers
                                        {{ currentYearNumberOfSupplier[0]?.year }}</h5>
                                    <div class="row align-items-center">
                                        <div class="col-5">
                                            <h4 class="fw-semibold mb-3">{{ currentYearNumberOfSupplier[0]?.count }}
                                                Companies</h4>
                                        </div>
                                        <div class="col-4">
                                            <div class="d-flex justify-content-center">
                                                <Chart type="doughnut" :data="DoghnutChartData" :options="chartOptions"
                                                       class="w-full md:w-[30rem]"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-12">
                            <!-- Monthly Earnings -->
                            <div class="card">
                                <div class="card-body">
                                    <div class="row align-items-start">
                                        <div class="col-8">
                                            <h5 class="card-title mb-9 fw-semibold"> Monthly Earnings </h5>
                                            <h4 class="fw-semibold mb-3">$6,820</h4>
                                            <div class="d-flex align-items-center pb-1">
                          <span
                              class="me-2 rounded-circle bg-light-danger round-20 d-flex align-items-center justify-content-center">
                            <i class="ti ti-arrow-down-right text-danger"></i>
                          </span>
                                                <p class="text-dark me-1 fs-3 mb-0">+9%</p>
                                                <p class="fs-3 mb-0">last year</p>
                                            </div>
                                        </div>
                                        <div class="col-4">
                                            <div class="d-flex justify-content-end">
                                                <div
                                                    class="text-white bg-secondary rounded-circle p-6 d-flex align-items-center justify-content-center">
                                                    <i class="ti ti-currency-dollar fs-6"></i>
                                                </div>

                                            </div>
                                        </div>
                                        <Chart type="pie" :data="PieChartData" :options="chartOptions"
                                               class="w-full md:w-[30rem]"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-4 d-flex align-items-stretch">
                    <div class="card w-100">
                        <div class="card-body p-4">
                            <div class="mb-4">
                                <h5 class="card-title fw-semibold">Recent Transactions</h5>
                            </div>
                            <ul class="timeline-widget mb-0 position-relative mb-n5">
                                <li v-for="item in latestTransaction" class="timeline-item d-flex position-relative overflow-hidden">
                                    <div class="timeline-time text-dark flex-shrink-0 text-end">{{moment(item.updated_at).format("LT")}}</div>
                                    <div class="timeline-badge-wrap d-flex flex-column align-items-center">
                                    <span
                                        class="timeline-badge border-2 border border-primary flex-shrink-0 my-8"></span>
                                        <span class="timeline-badge-border d-block flex-shrink-0"></span>
                                    </div>
                                    <div class="timeline-desc fs-3 text-dark mt-n1">New rentals {{item.order_number}} with {{item.price}}$
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-lg-8 d-flex align-items-stretch">
                    <div class="card w-100">
                        <div class="card-body p-4">
                            <h5 class="card-title fw-semibold mb-4">Recent Transactions</h5>
                            <div class="table-responsive">
                                <table class="table text-nowrap mb-0 align-middle">
                                    <thead class="text-dark fs-4">
                                    <tr>
                                        <th class="border-bottom-0">
                                            <h6 class="fw-semibold mb-0">Rental Id</h6>
                                        </th>
                                        <th class="border-bottom-0">
                                            <h6 class="fw-semibold mb-0">Customer</h6>
                                        </th>
                                        <th class="border-bottom-0">
                                            <h6 class="fw-semibold mb-0">Vehicle</h6>
                                        </th>
                                        <th class="border-bottom-0">
                                            <h6 class="fw-semibold mb-0">status</h6>
                                        </th>
                                        <th class="border-bottom-0">
                                            <h6 class="fw-semibold mb-0">Price</h6>
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="item in latestCustomerTransactions">
                                        <td class="border-bottom-0"><h6 class="fw-semibold mb-0">#{{item.order_number}}</h6></td>
                                        <td class="border-bottom-0">
                                            <h6 class="fw-semibold mb-1">{{item.customer.name}}</h6>
                                            <span class="fw-normal">{{item.customer.phone_num}}</span>
                                        </td>
                                        <td class="border-bottom-0">
                                            <p class="mb-0 fw-normal">{{item.vehicle.name}}</p>
                                        </td>
                                        <td class="border-bottom-0">
                                            <div class="d-flex align-items-center gap-2">
                                                <span :class="
                                                item.order_status == 1 ? 'badge rounded-3 fw-semibold bg-primary' :
                                                item.order_status == 2 ? 'badge rounded-3 fw-semibold bg-success' :
                                                item.order_status == 3 ? 'badge rounded-3 fw-semibold bg-danger' :
                                                item.order_status == 4 ? 'badge rounded-3 fw-semibold bg-warning' :
                                                item.order_status == 7 ? 'badge rounded-3 fw-semibold bg-dark' :
                                                 '' ">{{item.status.name_en}}</span>
                                            </div>
                                        </td>
                                        <td class="border-bottom-0">
                                            <h6 class="fw-semibold mb-0 fs-4">$3.9</h6>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div v-for="vehicle in latestVehicles" class="col-sm-6 col-xl-3">
                    <div class="card overflow-hidden rounded-2">
                        <div class="position-relative">
                            <a href="javascript:void(0)">
                                <img :src="'/img/vehicles/' + vehicle.photo" width="250" height="250" class="card-img-top rounded-0" alt="..."></a>
                          </div>
                        <div class="card-body pt-3 p-4">
                            <h6 class="fw-semibold fs-4">{{vehicle.name}}</h6>
                            <div class="d-flex align-items-center justify-content-between">
                                <h6 class="fw-semibold fs-4 mb-0">{{vehicle.price}} <span class="ms-2 fw-normal text-muted fs-3"> USD</span>
                                </h6>
                                <ul class="list-unstyled d-flex align-items-center mb-0">
                                    <li><a class="me-1" href="javascript:void(0)"><i
                                        class="ti ti-star text-warning"></i></a></li>
                                    <li><a class="me-1" href="javascript:void(0)"><i
                                        class="ti ti-star text-warning"></i></a></li>
                                    <li><a class="me-1" href="javascript:void(0)"><i
                                        class="ti ti-star text-warning"></i></a></li>
                                    <li><a class="me-1" href="javascript:void(0)"><i
                                        class="ti ti-star text-warning"></i></a></li>
                                    <li><a class="" href="javascript:void(0)"><i
                                        class="ti ti-star text-warning"></i></a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="py-6 px-6 text-center">
                <p class="mb-0 fs-4">Design and Developed by @Autours</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import Chart from 'primevue/chart';
import moment from "moment";

const BarChartData = ref();
const PieChartData = ref();
const DoghnutChartData = ref();
const LineChartData = ref();
const chartOptions = ref();
const user = ref('');
const currentYearNumberOfSupplier = ref('')
const latestTransaction = ref();
const latestVehicles = ref();
const latestCustomerTransactions = ref();
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const getUser = async () => {
    try {
        const response = await axios.get('/get/user/data');
        user.value = response.data;
        if (response.data?.role === "admin") {
            getAdminCharts()
        } else {
            getSupplierCharts()
        }
    } catch (error) {
        console.log(error);
    }
}
const getAdminCharts = async () => {
    try {
        const response = await axios.get('/dashboard');
        const SalesData = response.data.data.supplierRevenue
        BarChartData.value = {
            labels: SalesData.map(item => item.supplier_name),
            datasets: [
                {
                    label: 'Revenue',
                    data: SalesData.map(item => item.profit),
                    backgroundColor: SalesData.map(item => getRandomColor()),
                    borderColor: SalesData.map(item => getRandomColor()),
                    borderWidth: 2,
                    borderRadius: 12
                }
            ]
        };

        const SuppliersData = response.data.data.NumberOfActiveSuppliers
        currentYearNumberOfSupplier.value = SuppliersData?.currentYear
        DoghnutChartData.value = {
            supplierCount: SuppliersData.monthly.map(item => item.count),
            labels: SuppliersData.monthly.map(item => moment(item.month, 'M').format('MMMM')),
            datasets: [
                {
                    data: SuppliersData.monthly.map(item => item.count),
                    backgroundColor: SuppliersData.monthly.map(item => getRandomColor()),
                    hoverBackgroundColor: SuppliersData.monthly.map(item => getRandomColor()),

                }
            ]
        }

        const RentalsData = response.data.data.numberOfRentalsMonthly
        LineChartData.value = {
            labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "12"].map(item => moment(item, 'M').format('MMM')),
            datasets: [
                {
                    label: 'Cancelled Rentals',
                    data: RentalsData.cancelled.map(item => item.count),
                    fill: true,
                    borderColor: getRandomColor(),
                    tension: 0.4

                },
                {
                    label: 'Done Rentals',
                    data: RentalsData.done.map(item => item.count),
                    fill: true,
                    borderColor: getRandomColor(),
                    tension: 0.4

                }
            ]
        }

            PieChartData.value = {
                labels: ['A', 'B', 'C'],
                datasets: [
                    {
                        data: [540, 325, 702],
                        backgroundColor: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "12"].map(() => getRandomColor()),
                        hoverBackgroundColor: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "12"].map(() => getRandomColor()),
                    }
                ]
            };
        latestTransaction.value = response.data.data.latestRentalsTransactions
        latestVehicles.value = response.data.data.latestVehicles
        latestCustomerTransactions.value = response.data.data.customerTransactions
        } catch
        (error)
        {
            console.log(error);
        }
    }
    const getSupplierCharts = async () => {
        try {
            const response = await axios.get('/supplier-dashboard');
            const SalesData = response.data.data.supplierRevenue
            BarChartData.value = {
                labels: SalesData.map(item => item.branch_name),
                datasets: [
                    {
                        label: 'Revenue',
                        data: SalesData.map(item => item.profit),
                        backgroundColor: SalesData.map(() => getRandomColor()),
                        borderColor: SalesData.map(() => getRandomColor()),
                        borderWidth: 2,
                        borderRadius: 12
                    }
                ]
            };

            const SuppliersData = response.data.data.NumberOfActiveVehicles
            currentYearNumberOfSupplier.value = SuppliersData?.currentYear
            DoghnutChartData.value = {
                supplierCount: SuppliersData.monthly.map(item => item.count),
                labels: SuppliersData.monthly.map(item => moment(item.month, 'M').format('MMMM')),
                datasets: [
                    {
                        data: SuppliersData.monthly.map(item => item.count),
                        backgroundColor: SuppliersData.monthly.map(item => getRandomColor()),
                        hoverBackgroundColor: SuppliersData.monthly.map(item => getRandomColor()),

                    }
                ]
            }

            const RentalsData = response.data.data.numberOfRentalsMonthly
            LineChartData.value = {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "12"].map(item => moment(item, 'M').format('MMM')),
                datasets: [
                    {
                        label: 'Cancelled Rentals',
                        data: RentalsData.cancelled.map(item => item.count),
                        fill: true,
                        borderColor: getRandomColor(),
                        tension: 0.4

                    },
                    {
                        label: 'Done Rentals',
                        data: RentalsData.done.map(item => item.count),
                        fill: true,
                        borderColor: getRandomColor(),
                        tension: 0.4

                    }
                ]
            }

            PieChartData.value = {
                labels: ['A', 'B', 'C'],
                datasets: [
                    {
                        data: [540, 325, 702],
                        backgroundColor: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "12"].map(() => getRandomColor()),
                        hoverBackgroundColor: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "12"].map(() => getRandomColor()),
                    }
                ]
            };
            latestTransaction.value = response.data.data.latestRentalsTransactions
            latestVehicles.value = response.data.data.latestVehicles
            latestCustomerTransactions.value = response.data.data.customerTransactions
        } catch (error) {
            console.log(error);
        }
    }
    onMounted(() => {
        getUser()
    })

</script>
