<template>

    <body>
    <header-one/>


    <div id="wrapper">
        <!-- header begin -->
        <!-- header close -->
        <!-- content begin -->
        <div class="" style="background: #f7f7f7" id="content">
            <div id="top"></div>
            <!--            <ProgressBar class="col-12" mode="indeterminate" style="height: 6px"></ProgressBar>-->

            <div v-if="isOpen" class="modal-mask">
                <div class="modal-wrapper" @click="$emit('close')">
                    <div class="modal-container" ref="target">
                        <div class="modal-header">
                            <slot name="header"> Rental Terms</slot>
                        </div>
                        <div class="modal-body overflow-y-auto" style="height: 450px;">
                            <h2>Terms and Conditions</h2>
                            <div v-for="(item,index) in activeRentalTerms" :item-key="index">
                                <h3 v-html="item.title"></h3>
                                <ul>
                                    <div v-html="item.description"></div>
                                </ul>
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

            <div id="section-cars">



                <div class="w-100 mt-2  ps-md-5 ps-lg-5 " >
                    <div class=" col-md-11 mb-1 top-buttons d-flex flex-column flex-md-row gap-2 gap-md-3">
                        <button class="btn steps-button w-100 text-start px-3 py-2 d-flex align-items-center justify-content-center"
                                style="background: #f9d602; color: #000;">
                            <span class="ti ti-circle-number-1 me-2"></span> Choose Your Location
                        </button>
                        <button class="btn steps-button active w-100 text-start px-3 py-2 d-flex align-items-center justify-content-center "
                                style="background: rgb(155,147,84); color: #000;">
                            <span class="ti ti-circle-number-2 me-2"></span> Choose Your Car
                        </button>
                        <button class="btn steps-button w-100 text-start px-3 py-2 d-flex align-items-center justify-content-center "
                                style="background: #f9d602; color: #000;">
                            <span class="ti ti-circle-number-3 me-2"></span> Reserve Your Car
                        </button>
                    </div>


                    <div class="row">

                        <div class="hidden filter-by">
                            <div class="d-flex align-items-center justify-content-center  align-content-center">
                                <button id="filter-btn" @click="filters()" class="col-md-11 col-11  bg-white btn btn-main  mt-2"><i class="fa fa-filter"/> Filter by</button>
                            </div>
                        </div>
                        <div class="col-12 col-md-8 col-lg-3 mobile-filters">
                            <div class=" pb-4 bg-white">
                                <div class="p-1"
                                     style="background: #e1e1e1; width: 100%;  margin-top: 10px;">
                                    <h5 class="p-2">YOUR SEARCH DETAILS</h5>
                                </div>
                                <div class=" mt-3 p-3" style="background: #fff;">
                                    <h5>PICK-UP - LOCATION </h5>
                                    <p class="col-11"><span class="  ti ti-gps"></span>&nbsp;{{ locationName }}</p>

                                    <span class="col-md-6 ti ti-calendar">&nbsp;{{ form.date_from }}</span>
                                    <span class="col-md-3 ti ti-clock">&nbsp;{{ form.time_from }}</span>
                                </div>
                                <hr/>
                                <div class=" mt-3 p-3" style="background: #fff;">
                                    <h5>DROP-OFF - LOCATION </h5>

                                    <p class="col-11"><span class="  ti ti-gps"></span>&nbsp;{{ locationName }}</p>

                                    <span class="col-md-6 ti ti-calendar">&nbsp;{{ form.date_to }}</span>
                                    <span class="col-md-3 ti ti-clock">&nbsp;{{ form.time_to }}</span>
                                </div>
                            </div>
                            <div class="col-md-12 pb-4"></div>

                            <div class=" pb-4" style="background: #fff;">
                                <div class="p-2 pt-3"
                                     style="overflow: hidden; background: #e1e1e1; ">
                                    <h5>FILTER BY</h5>
                                </div>
                                <div class="mt-3">
                                    <form class="trip-form mt-4 px-2" @submit.prevent="search">
                                        <div class="row align-items-center flex-column">
                                            <div class="mb-3 col-md-11">
                                                <el-select style="width:100%" v-model="form.pickupLoc" size="large"
                                                           filterable
                                                           remote
                                                           reserve-keyword placeholder="PICKUP..."
                                                           remote-show-suffix
                                                           :remote-method="remoteLocations"
                                                           :loading="locations.loading.value">
                                                    <el-option v-for="item in locations.all.value"
                                                               :label="item.name"
                                                               :value="item.id"/>
                                                </el-select>
                                            </div>
                                            <div class="mb-3 row">
                                                <div class="form-control-wrap col-md-7">
                                                    <el-date-picker v-model="form.date_from"
                                                                    start-placeholder="Start date"
                                                                    end-placeholder="End date"
                                                                    size="large" format="YYYY/MM/DD"
                                                                    value-format="YYYY-MM-DD"/>
                                                </div>
                                                <div class="col-md-5">
                                                    <select class="form-control rounded-1"
                                                            v-model="form.time_from">
                                                        <option value="00:00" selected>00:00</option>
                                                        <option value="00:30">00:30</option>
                                                        <option value="01:00">01:00</option>
                                                        <option value="01:30">01:30</option>
                                                        <option value="02:00">02:00</option>
                                                        <option value="02:30">02:30</option>
                                                        <option value="03:00">03:00</option>
                                                        <option value="03:30">03:30</option>
                                                        <option value="04:00">04:00</option>
                                                        <option value="04:30">04:30</option>
                                                        <option value="05:00">05:00</option>
                                                        <option value="05:30">05:30</option>
                                                        <option value="06:00">06:00</option>
                                                        <option value="06:30">06:30</option>
                                                        <option value="07:00">07:00</option>
                                                        <option value="07:30">07:30</option>
                                                        <option value="08:00">08:00</option>
                                                        <option value="08:30">08:30</option>
                                                        <option value="09:00">09:00</option>
                                                        <option value="09:30">09:30</option>
                                                        <option value="10:00" selected>10:00</option>
                                                        <option value="10:30">10:30</option>
                                                        <option value="11:00">11:00</option>
                                                        <option value="11:30">11:30</option>
                                                        <option value="12:00">12:00</option>
                                                        <option value="12:30">12:30</option>
                                                        <option value="13:00">13:00</option>
                                                        <option value="13:30">13:30</option>
                                                        <option value="14:00">14:00</option>
                                                        <option value="14:30">14:30</option>
                                                        <option value="15:00">15:00</option>
                                                        <option value="15:30">15:30</option>
                                                        <option value="16:00">16:00</option>
                                                        <option value="16:30">16:30</option>
                                                        <option value="17:00">17:00</option>
                                                        <option value="17:30">17:30</option>
                                                        <option value="18:00">18:00</option>
                                                        <option value="18:30">18:30</option>
                                                        <option value="19:00">19:00</option>
                                                        <option value="19:30">19:30</option>
                                                        <option value="20:00">20:00</option>
                                                        <option value="20:30">20:30</option>
                                                        <option value="21:00">21:00</option>
                                                        <option value="21:30">21:30</option>
                                                        <option value="22:00">22:00</option>
                                                        <option value="22:30">22:30</option>
                                                        <option value="23:00">23:00</option>
                                                        <option value="23:30">23:30</option>
                                                    </select>


                                                </div>
                                            </div>
                                            <div class="mb-3 row">
                                                <div class="form-control-wrap col-md-7">
                                                    <el-date-picker v-model="form.date_to" range-separator="To"
                                                                    start-placeholder="Start date"
                                                                    end-placeholder="End date"
                                                                    size="large" format="YYYY/MM/DD"
                                                                    value-format="YYYY-MM-DD"/>
                                                </div>
                                                <div class="col-md-5">
                                                    <select class="form-control rounded-1"
                                                            v-model="form.time_to">
                                                        <option value="00:00" selected>00:00</option>
                                                        <option value="00:30">00:30</option>
                                                        <option value="01:00">01:00</option>
                                                        <option value="01:30">01:30</option>
                                                        <option value="02:00">02:00</option>
                                                        <option value="02:30">02:30</option>
                                                        <option value="03:00">03:00</option>
                                                        <option value="03:30">03:30</option>
                                                        <option value="04:00">04:00</option>
                                                        <option value="04:30">04:30</option>
                                                        <option value="05:00">05:00</option>
                                                        <option value="05:30">05:30</option>
                                                        <option value="06:00">06:00</option>
                                                        <option value="06:30">06:30</option>
                                                        <option value="07:00">07:00</option>
                                                        <option value="07:30">07:30</option>
                                                        <option value="08:00">08:00</option>
                                                        <option value="08:30">08:30</option>
                                                        <option value="09:00">09:00</option>
                                                        <option value="09:30">09:30</option>
                                                        <option value="10:00" selected>10:00</option>
                                                        <option value="10:30">10:30</option>
                                                        <option value="11:00">11:00</option>
                                                        <option value="11:30">11:30</option>
                                                        <option value="12:00">12:00</option>
                                                        <option value="12:30">12:30</option>
                                                        <option value="13:00">13:00</option>
                                                        <option value="13:30">13:30</option>
                                                        <option value="14:00">14:00</option>
                                                        <option value="14:30">14:30</option>
                                                        <option value="15:00">15:00</option>
                                                        <option value="15:30">15:30</option>
                                                        <option value="16:00">16:00</option>
                                                        <option value="16:30">16:30</option>
                                                        <option value="17:00">17:00</option>
                                                        <option value="17:30">17:30</option>
                                                        <option value="18:00">18:00</option>
                                                        <option value="18:30">18:30</option>
                                                        <option value="19:00">19:00</option>
                                                        <option value="19:30">19:30</option>
                                                        <option value="20:00">20:00</option>
                                                        <option value="20:30">20:30</option>
                                                        <option value="21:00">21:00</option>
                                                        <option value="21:30">21:30</option>
                                                        <option value="22:00">22:00</option>
                                                        <option value="22:30">22:30</option>
                                                        <option value="23:00">23:00</option>
                                                        <option value="23:30">23:30</option>
                                                    </select>

                                                </div>
                                            </div>
                                            <div class="mb-3 col-md-11">
                                                <input type="submit" value="Search"
                                                       class="btn-main btn-fullwidth "
                                                       style="padding: 7px 25px"/>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="col-md-12 mt-2" style="background: #fff;">
                                    <h5 style="margin-bottom: -30px">PRICE RANGE <span class="col-md-1"
                                                                                       style="font-size: small;">&nbsp;{{
                                            priceRange
                                        }}&nbsp;-&nbsp;{{ max }}</span></h5>
                                    <hr/>
                                    <div class="row" style="margin-top: -20px">
                                        <el-slider class="col-md-12" v-model="priceRange" :min="min" :max="max"/>
                                    </div>
                                </div>
                                <div class="col-md-12 my-4" style="background: #fff;">
                                    <div class="row" @click="collapse('ms')">
                                        <h4 class="col-md-9 col-10 mr-3" style="color: #000; margin-bottom: -30px">
                                            Location Types</h4> <i :class="'col-md-2 col-1  fa fa-arrow-down cursor-pointer  pointer-arrow-ms' "/></div>
                                    <hr style="margin-top: 20px;"/>
                                    <div style="margin-top: -45px;" id="ms">
                                        <div class="row" v-for="locationType in filteredLocationTypes">
                                            <div class="row" v-if="locationType?.vehicle_count">
                                                <div class="col-md-10 col-10  mt-3">{{
                                                        locationType.name
                                                    }} <small style="font-size: 14px;">
                                                        ({{ locationType?.vehicle_count }})</small></div>

                                                <Checkbox
                                                    binary
                                                    :model-value="checkIfLocationTypeSelected(locationType.id)"
                                                    class="col-md-2 col-2 mt-3"
                                                    @click="selectLocationType(locationType.id)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-12 my-4" style="background: #fff;">
                                    <div class="row" @click="collapse('cat')">
                                        <h4 class="col-md-9 col-10 mr-3" style="color: #000; margin-bottom: -30px">
                                            Categories</h4> <i :class="'col-md-2 col-1  fa fa-arrow-down cursor-pointer  pointer-arrow-cat' "/></div>
                                    <hr style="margin-top: 20px;"/>
                                    <div style="margin-top: -45px;" id="cat">
                                        <div class="row" v-for="item in filteredCategories">
                                            <div class="row">
                                                <div class="col-md-10 col-10 mt-3">{{
                                                        item.name
                                                    }} <small style="font-size: 14px;">
                                                        ({{ item?.vehicle_count }})</small></div>

                                                <Checkbox
                                                    binary
                                                    :model-value="checkIfCategorySelected(item.id)"
                                                    class="col-md-2 col-2 mt-3"
                                                    @click="SelectCategory(item.id)"
                                                />

                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-12 my-4" style="background: #fff;">
                                    <div class="row" @click="collapse('lt')">
                                        <h4 class="col-md-9 col-10 mr-3" style="color: #000; margin-bottom: -30px">
                                            Suppliers</h4> <i
                                        :class="'col-md-2 col-1 fa fa-arrow-down cursor-pointer  pointer-arrow-lt' "/></div>
                                    <hr style="margin-top: 20px;"/>
                                    <div style="margin-top: -45px;" id="lt">
                                        <div class="row" v-for="supplier in filteredSuppliers">
                                            <div class="row" v-if="supplier?.vehicle_count">
                                                <div class="col-md-10 col-10 mt-3">{{
                                                        supplier.company
                                                    }} <small style="font-size: 14px;">
                                                        ({{ supplier?.vehicle_count }})</small></div>


                                                <Checkbox
                                                    binary
                                                    :model-value="checkIfSupplierSelected(supplier.id)"
                                                    class="col-md-2  col-2 mt-3"
                                                    @click="selectSupplier(supplier.id)"
                                                />


                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-12 my-4" style="background: #fff;">
                                    <div class="row" @click="collapse('payment')">
                                        <h4 class="col-md-9 col-10 mr-3" style="color: #000; margin-top: -10px">
                                            Payment Types</h4> <i
                                        :class="'col-md-2 col-1 fa fa-arrow-down cursor-pointer  pointer-arrow-payment' "/>
                                    </div>
                                    <hr class="my-2"/>
                                    <div style="margin-top: -10px;" id="payment">
                                        <div class="row" v-for="paymentMethod in paymentMethods">
                                            <div class="row">
                                                <div class="col-md-10 col-10 mt-3">{{
                                                        paymentMethod.name
                                                    }}
                                                    <!--                                                    <small style="font-size: 14px;">({{ paymentMethod?.vehicle_count }})</small>-->
                                                </div>

                                                <Checkbox
                                                    binary
                                                    :model-value="checkIfPaymentMethodSelected(paymentMethod.id)"
                                                    class="col-md-2 col-2  mt-3"
                                                    @click="selectPaymentMethod(paymentMethod.id)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class=" my-4" v-for="(item, i) in filteredSpecifications" :key="i" style="background: #fff;">
                                    <div class="col-md-12 my-4  ">
                                        <div @click="collapse(item.id)" class="row"><h4 class="col-md-9 col-10 mr-3"
                                                                                        style="color: #000; margin-bottom: -30px">
                                            {{ item.name }}</h4>
                                            <i :class="'col-md-2 col-1 fa fa-arrow-down cursor-pointer ' +  'pointer-arrow-' + item.id"/>
                                        </div>
                                        <hr style="margin-top: 20px"/>
                                        <div style="margin-top: -35px" :id="item.id">
                                            <div class="row" v-for="option in item.options">
                                                <div class="row " v-if="option.vehicle_count">
                                                    <div class="col-md-10 col-10 my-2 text-nowrap ">
                                                        <div class="col-md-9 col-9 ">{{ option.value }}
                                                        {{
                                                            item.name == 'Number of seats' ||
                                                            item.name == 'Number of Seats' ? 'Seats' : item.name == 'Doors' ? 'Doors' : ''
                                                        }}
                                                        <small
                                                            style="font-size: 14px;">({{
                                                                option.vehicle_count
                                                            }})</small>
                                                    </div>
                                                    </div>
                                                    <Checkbox
                                                        binary
                                                        :model-value="checkIfSpecificationSelected(item, option)"
                                                        class="col-md-2 col-2  mt-3"
                                                        @click="selectSpecification(item, option)"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div class="col-lg-9">
                            <div class="col-12 col-md-11">
                                <swiper
                                    :modules="[Navigation, Pagination, Scrollbar, A11y]"
                                    :space-between="5"
                                    navigation
                                    style="width: 90%;"
                                    :class="'slide-container mt-2'"
                                    :breakpoints="{
                                              0: { slidesPerView: 1.2 },
                                              576: { slidesPerView: 2 },
                                              768: { slidesPerView: 3 },
                                              992: { slidesPerView: 4 }
                                              }"
                                >
                                    <swiper-slide v-for="item in filteredCategories" :key="item.id">
                                        <div :class="category.indexOf(item.id) >= 0 ? 'card select' : 'card'" :id="'category-' + item.id">
                                            <el-radio
                                                :label="item.id"
                                                size="large"
                                                border
                                                @click="SelectCategory(item.id)"
                                                class="image-content"
                                            >
                                                <div class="card-item">
                                                    <img
                                                        class="position-relative"
                                                        :src="'img/categories/' + item.photo"
                                                        alt=""
                                                        width="180"
                                                        height="190"
                                                    />
                                                </div>
                                            </el-radio>
                                        </div>
                                    </swiper-slide>
                                </swiper>
                            </div>


                            <h3 style="color: #000; margin-left: 1.2%;">SEARCH RESULT <strong
                                style="color: #bdaa2f;">{{ count }} CARS FOUND</strong></h3>

                            <div v-if="loading" class="col-lg-5 ">
                                <Loader/>
                            </div>

                            <div v-if="!loading" v-for="(vehicle, mobileIndex) in priceFiltered" :key="mobileIndex" class="mb-4 mobile-card px-2" :style="getDisplayStyle(vehicle)">
                                <div class="  p-3 position-relative" style="background: #fff; border-radius: 1%;">
                                    <!-- Close Button -->
                                    <div class="position-absolute top-0 end-0 m-2 cursor-pointer" @click="hideItem(vehicle)">
                                      <i class="fa fa-close"/>
                                    </div>

                                    <!-- Vehicle Info -->
                                    <div class="row g-3 align-items-center">
                                        <div class="col-10 col-md-3 text-center">
                                            <img :src="'img/vehicles/' + vehicle.photo" class="img-fluid rounded" :alt="vehicle.name" />
                                        </div>

                                        <div class="col-12 col-md-9">
                                            <h5 class="text-dark">{{ vehicle.name }} Or Similar
                                                <el-tooltip placement="right-start">
                                                    <template #content>
                                                        The supplier will provide a car in the same class.
                                                    </template>
                                                    <i class="fas fa-info-circle text-primary ms-2"></i>
                                                </el-tooltip>
                                            </h5>
                                            <p class="mb-1">{{ vehicle?.category?.name }}</p>

                                            <!-- Specs -->
                                            <div class="d-flex flex-wrap gap-2 mb-2">
                                                <div v-for="specification in vehicle.specifications" class="d-flex align-items-center">
                                                    <img v-if="specification.icon" :src="'assets/images/icons/' + specification.icon + '.svg'" class="me-2" style="width:20px" />
                                                    <small>{{ specification.value }} {{ (specification.name) }}</small>
                                                </div>
                                            </div>

                                            <!-- Supplier & Review -->
                                            <div class="row bg-light  rounded   flex-md-nowrap align-items-center">
                                                <div class="col-2 col-md-3 text-center">
                                                    <img :src="'img/' + vehicle.supplier.logo" alt="" class="img-fluid"   />
                                                </div>

                                                <div class="col-3 col-md-3">
                                                    <div style="margin-bottom: -10px;" class="ml-2">{{ vehicle.supplier.company }}</div>
                                                    <a href="javascript:void(0);" @click="openRentalTerms(vehicle)" style="font-size: 13px; color: blue" class="text-decoration-underline  text-nowrap">
                                                        Rental Terms
                                                    </a>
                                                </div>

                                                <div class="col-3 col-md-3 ml-1 ">
                                                    <span class="badge bg-warning text-dark ml-3">{{ vehicle.supplier_rate }}/10</span>
                                                    <div>
                                                        <small class="text-nowrap"> ({{ vehicle.supplier_number_of_reviews }}+ reviews)</small>
                                                    </div>
                                                </div>

                                                <div class="col-2 col-md-3 mt-3 d-flex">
                                                    <img
                                                        v-if="vehicle.instant_confirmation"
                                                        src="/images/icons/instant_confirmation.png"
                                                        width="20"
                                                        height="20"
                                                        class="mt-3 mr-2"
                                                    />

                                                    <div v-if="vehicle.instant_confirmation">
                                                        <p style="font-size: 13px; margin-bottom: -10px;" class="bold">Instant </p>
                                                        <p style="font-size: 13px;" class="bold">Confirmation</p></div>
                                                    <div v-else class="bold"> <p style="font-size: 13px;"> On Request</p></div>
                                                </div>
                                            </div>

                                            <!-- What's Included -->
                                            <div class="mt-2">
                                                <p class="bold " style="color: #5e9007; margin-bottom: 5px !important;">What is Included!</p>
                                                <ul class="list-unstyled row">
                                                    <li v-for="(item, index) in vehicle.included" :key="index" class="col-6">
                                                        <el-tooltip v-if="item.description" placement="top">
                                                            <template #content>
                                                                {{ item.description }}
                                                            </template>
                                                            <span class="small text-nowrap"><i class="fa fa-check  me-2" style="color: #5e9007;"/> {{ item.what_is_included }}</span>
                                                        </el-tooltip>
                                                        <span v-else class="small text-nowrap"><i class="fa fa-check  me-2" style="color: #5e9007;"/> {{ item.what_is_included }}</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <!-- Fuel Policy and Location -->
                                            <div class="row mt-3 g-2">
                                                <div class="col-12 col-md-6">
                                                    <el-tooltip placement="top">
                                                        <template #content>
                                                            {{ vehicle?.fuel_policy?.description }}
                                                        </template>
                                                        <span><i class="fa fa-gas-pump me-1"></i>Fuel Policy: <strong>{{ vehicle?.fuel_policy?.name }}</strong></span>
                                                    </el-tooltip>
                                                </div>
                                                <div class="col-12 col-md-6">
                                                    <i :class="'fa fa-' + vehicle.location_type[0]?.icon + ' me-1'"></i>Location Type:
                                                    <strong>{{ vehicle.location_type[0]?.name }}</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Pricing and Booking -->
                                    <div class="d-flex justify-content-between align-items-center mt-4 flex-wrap">
                                        <div style="top: 100px;">
                                            <p class="mb-0 text-success" v-if="vehicle.promo.length"><i class="fa fa-check me-1"></i>{{ vehicle.promo }}</p>
                                            <span class="text-muted">For {{ daysNumber }} day{{ daysNumber > 1 ? 's' : '' }}</span>
                                            <h4 class="mb-0">{{ vehicle.final_price }} <small>{{ selectedCurrency }}</small></h4>
                                        </div>
                                        <button class="btn btn-primary mt-2 col-12" style="color: #000;" @click="goToBookingPage(vehicle.id)">
                                            Booking <i class="fa fa-arrow-right ms-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="!loading" v-for="(vehicle, index) in priceFiltered" :key="index" class="row web-card col-md-11">
                                <div :style="getDisplayStyle(vehicle)">
                                    <div class="de-item-list mb-3 p-4 ">
                                        <div class="close"
                                             style="position: absolute; top: 10px;right: 35px; cursor: pointer;"
                                             @click="hideItem(vehicle)">
                                            <svg width="25" height="25" fill="currentColor" viewBox="0 0 24 24"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd"
                                                      d="M19.505 4.975a.6.6 0 0 1 0 .85l-13.2 13.2a.6.6 0 0 1-.85-.85l13.2-13.2a.598.598 0 0 1 .85 0Z"
                                                      clip-rule="evenodd"></path>
                                                <path fill-rule="evenodd"
                                                      d="M5.456 4.975a.6.6 0 0 0 0 .85l13.2 13.2a.6.6 0 1 0 .85-.85l-13.2-13.2a.6.6 0 0 0-.85 0Z"
                                                      clip-rule="evenodd"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="col-md-12">

                                                <div class="col-md-2 d-img">
                                                    <img :src="'img/vehicles/' + vehicle.photo" class="img-fluid"
                                                         width="300" height="100"
                                                         alt=""/>
                                                </div>
                                                <div class="d-info">
                                                    <div class="d-text">
                                                        <h4 style="color: #000;" class="text-nowrap">

                                                            {{ vehicle.name }} Or&nbsp;Similar

                                                            <el-tooltip placement="right-start">
                                                                <template #content>
                                                                    <div style="font-size: 1vw;">
                                                                        The supplier will provide a car with same class
                                                                        and specifications,<br> though the make may
                                                                        vary.
                                                                    </div>
                                                                </template>
                                                                <i class="fas fa-info-circle"
                                                                   style="color: #6969d8;"></i>
                                                            </el-tooltip>
                                                        </h4>
                                                        <span>{{ vehicle?.category?.name }}</span>
                                                        <div class="d-atr-group row">
                                                            <ul class="d-atr col-md-8 text-nowrap">
                                                                <li v-for="specification in vehicle.specifications">
                                                                    <img style="width:15%; margin-right: -3px;"
                                                                         v-if="specification.icon"
                                                                         :src="'assets/images/icons/' + specification.icon + '.svg'"/>
                                                                    <span> {{
                                                                            specification.value
                                                                        }} {{
                                                                            specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Conditioning' ||
                                                                            specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Conditioner' ||
                                                                            specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Transmission' ||
                                                                            specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Transmission' ||
                                                                            specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Fuel'
                                                                                ? '' : specification.name?.split(' ')[specification.name?.split(' ')?.length - 1]
                                                                        }}</span>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="clearfix"></div>
                                            </div>
                                            <div class="row rounded-2 mb-3 py-1" style="background: #edecec; width: 76.5%;">
                                                <div class="d-supplier d-flex align-items-center gap-4 w-100 px-3">
                                                    <div class="mt-2 d-img">
                                                        <img :src="'img/' + vehicle.supplier.logo" style="height: 55px; width: 140px; object-fit: contain;" alt=""/>
                                                    </div>
                                                    <div class="d-flex flex-column align-items-start">
                                                        <span style="font-size: 110%; color: #000;" class="text-nowrap fw-bold">{{ vehicle.supplier.company }}</span>
                                                        <a class="cursor-pointer text-primary text-decoration-underline mt-1" href="javascript:void(0);" @click="openRentalTerms(vehicle)">Rental&nbsp;Terms</a>
                                                    </div>
                                                    <div class="d-flex align-items-center gap-2">
                                                        <el-tooltip v-if="vehicle.instant_confirmation" placement="right-start">
                                                            <template #content>
                                                                <h5>Customers Feedback!</h5>
                                                                <div class="row col-md-12 text-nowrap" style="width: 500px" v-for="rentalReview in vehicle?.questions_rate">
                                                                    <div class="col-md-6 text-nowrap">
                                                                        {{ rentalReview.objective }}
                                                                    </div>
                                                                    <div class="col-md-6 text-nowrap">
                                                                        <CProgressBar style="border-radius: 10px;" :value="rentalReview.total_rate * 10">
                                                                            {{ rentalReview.total_rate }} / 10
                                                                        </CProgressBar>
                                                                    </div>
                                                                </div>
                                                            </template>
                                                            <span class="py-2 px-1 rounded-1" style="background-color: #f9d602; font-size: 1.0em; font-weight: 600;">
                                                                {{ vehicle?.supplier_rate }}/10
                                                            </span>
                                                        </el-tooltip>
                                                        <div class="d-flex flex-column align-items-start">
                                                            <h5 style="margin-bottom: -5px; font-size: 0.9em;">
                                                                {{
                                                                    vehicle?.supplier_rate >= 1 && vehicle?.supplier_rate <= 2 ? 'Terrible' :
                                                                    vehicle?.supplier_rate > 2 && vehicle?.supplier_rate <= 4 ? 'Ok' :
                                                                    vehicle?.supplier_rate > 4 && vehicle?.supplier_rate <= 6 ? 'Good' :
                                                                    vehicle?.supplier_rate > 6 && vehicle?.supplier_rate <= 8 ? 'Very Good' :
                                                                    vehicle?.supplier_rate > 8 && vehicle?.supplier_rate <= 10 ? 'Excellent' : ''
                                                                }}
                                                            </h5>
                                                            <span style="font-size: small;">(&nbsp;<strong style="color: #f9d602">{{ vehicle.supplier_number_of_reviews }}&nbsp;</strong>+&nbsp;reviews)</span>
                                                        </div>
                                                    </div>

                                                    <div class="ms-auto">
                                                        <el-tooltip v-if="vehicle.instant_confirmation" placement="right-start">
                                                            <template #content>
                                                                <div style="font-size: 1vw;">
                                                                    Receive instant booking confirmation!
                                                                </div>
                                                            </template>
                                                            <div class="text-nowrap fw-bold d-flex align-items-center gap-2">
                                                                <img width="30" src="/images/icons/instant_confirmation.png"/>
                                                                <span style="font-size: 1vw;">Instant Confirmation</span>
                                                                <i class="fas fa-info-circle" style="color: #6969d8;"></i>
                                                            </div>
                                                        </el-tooltip>

                                                        <el-tooltip v-if="!vehicle.instant_confirmation" placement="right-start">
                                                            <template #content>
                                                                <div style="font-size: 1vw;">
                                                                    You will receive booking confirmation after the requested service availability is verified!
                                                                </div>
                                                            </template>
                                                            <div class="text-nowrap fw-bold d-flex align-items-center gap-2">
                                                                <i style="font-size: 1.5vw; color: gold;" class="fa fa-ban"/>
                                                                <span style="font-size: 1vw;">On request</span>
                                                                <i class="fas fa-info-circle" style="color: #6969d8;"></i>
                                                            </div>
                                                        </el-tooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row" style="display: flex; align-items: stretch;">
                                                <div class=" rounded-2 bg-light-gray row ml-1"
                                                     style="width: 75%; min-height: 100%;">
                                                    <div class="row col-md-6 pe-3">
                                                        <p class="primary bold pt-2" style="color: #5e9007;">What is Included!</p>
                                                        <ul class="row list-unstyled">
                                                            <li class="col-md-6" style="margin-top: -5%"
                                                                v-for="(item, index) in vehicle.included ">
                                                                <div class="d-flex align-items-start gap-2" v-if="index < 6">
                                                                    <i class="fa fa-check text-success mt-1"/>
                                                                    <el-tooltip v-if="item?.description?.length"
                                                                                placement="right-start" trigger="hover">
                                                                        <template #content>
                                                                            <div class="" style="font-size: 1vw;">
                                                                                {{ item.description }}
                                                                            </div>
                                                                        </template>
                                                                        <p style="font-size: 14px; margin-bottom: 5px;"
                                                                           class="included-font text-nowrap text-truncate">
                                                                            {{ item.what_is_included }}</p>
                                                                    </el-tooltip>
                                                                    <p v-else style="font-size: 14px; margin-bottom: 5px;"
                                                                       class="included-font text-nowrap text-truncate">
                                                                        {{ item.what_is_included }}</p>
                                                                </div>
                                                                <div :class="'d-flex align-items-start gap-2 vehicle-'+vehicle.id"
                                                                     style="display: none;" v-else>
                                                                    <i class="fa fa-check text-success mt-1"/>
                                                                    <el-tooltip v-if="item?.description?.length"
                                                                                placement="right-start" trigger="hover">
                                                                        <template #content>
                                                                            <div class="" style="font-size: 1vw;">
                                                                                {{ item.description }}
                                                                            </div>
                                                                        </template>
                                                                        <p style="font-size: 14px; margin-bottom: 5px;"
                                                                           class="text-nowrap text-truncate included-font">
                                                                            {{ item.what_is_included }}</p>
                                                                    </el-tooltip>
                                                                    <p style="font-size: 14px; margin-bottom: 5px;" v-else
                                                                       class="included-font text-nowrap text-truncate">
                                                                        {{ item.what_is_included }}</p>
                                                                </div>
                                                            </li>
                                                            <div class="col-12 mt-2">
                                                                <span @click="showMoreIncluded(vehicle.id)"
                                                                      class="cursor-pointer text-primary"
                                                                      :id="'show-more'+ vehicle.id"
                                                                      v-if="vehicle.included.length > 6 ">Show more ...</span>
                                                            </div>
                                                        </ul>
                                                    </div>
                                                    <div class="col-md-6 mt-3 ps-4 border-start d-flex flex-column justify-content-center">
                                                        <div class="mb-2">
                                                            <p class="mb-1 text-nowrap">
                                                                <a target="_blank" :href="'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(vehicle.supplier.address)">
                                                                    <i class="fa fa-earth text-primary me-2"/>
                                                                </a>
                                                                <span class="text-secondary">Address:</span>
                                                                <span class="ms-1 fw-medium text-truncate" style="max-width: 200px; display: inline-block; vertical-align: bottom;" :title="vehicle.supplier.address">
                                                                    {{ vehicle.supplier.address }}
                                                                </span>
                                                            </p>
                                                        </div>
                                                        <div class="mb-2">
                                                            <el-tooltip placement="right-start" trigger="hover">
                                                                <template #content>
                                                                    <div class="" style="font-size: 14px;">
                                                                        {{ vehicle?.fuel_policy?.description }}
                                                                    </div>
                                                                </template>
                                                                <p class="mb-1 text-nowrap">
                                                                    <i class="fa fa-gas-pump text-primary me-2"/>
                                                                    <span class="text-secondary">Fuel Policy:</span>
                                                                    <strong class="ms-1">{{ vehicle?.fuel_policy?.name }}</strong>
                                                                </p>
                                                            </el-tooltip>
                                                        </div>
                                                        <div>
                                                            <p class="mb-1 text-nowrap">
                                                                <i :class="'fa fa-' + vehicle.location_type[0]?.icon + ' text-primary me-2'"/>
                                                                <span class="text-secondary">Location Type:</span>
                                                                <strong class="ms-1">{{ vehicle?.location_type?.length ? vehicle.location_type[0]?.name : '' }}</strong>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="price-booking-section" style="width: 20%; margin-left: 4%; display: flex; flex-direction: column; justify-content: flex-end;">
                                                    <p style="color: green; text-wrap: nowrap; font-weight: 600" v-if="vehicle.promo.length"><i style="font-size: 18px" class="fa fa-check fa-xl"/>{{ vehicle.promo }}</p>
                                                    <span class="d-days" >For {{
                                                            daysNumber
                                                        }} day{{ daysNumber < 2 ? '' : 's' }}</span>
                                                    <div class=" text-nowrap"><h2>{{
                                                            vehicle.final_price
                                                        }} <small style="font-size: 20px;">{{
                                                                selectedCurrency
                                                            }}</small></h2></div>
                                                    <a class="btn-main select-btn cursor-pointer  "
                                                       style="width: 110%; border-radius: 15px;"
                                                       @click="goToBookingPage(vehicle.id)">Booking
                                                        <svg width="25" height="25" fill="currentColor"
                                                             viewBox="0 2 20 20"
                                                             xmlns="http://www.w3.org/2000/svg">
                                                            <path
                                                                d="m8.295 16.59 4.58-4.59-4.58-4.59L9.705 6l6 6-6 6-1.41-1.41Z"></path>
                                                        </svg>
                                                        <svg width="25" height="25" fill="currentColor"
                                                             viewBox="0 2 20 20"
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             style="margin-left: -12%;">
                                                            <path
                                                                d="m8.295 16.59 4.58-4.59-4.58-4.59L9.705 6l6 6-6 6-1.41-1.41Z"></path>
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <Footer/>

    </body>

</template>

<script setup>
import {onMounted, onBeforeMount, ref, watchEffect, computed} from "vue";
import {useForm, Link, router} from "@inertiajs/vue3";
import HeaderOne from "../components/HeaderOne.vue";
import {CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody, CProgressBar} from '@coreui/vue';
import Footer from "../components/Footer.vue";
import Loader from "../components/Loader.vue";
import {Swiper, SwiperSlide} from 'swiper/vue';
import {Navigation, Pagination, Scrollbar, A11y} from 'swiper/modules';
import Checkbox from 'primevue/checkbox';
import 'primevue/resources/themes/fluent-light/theme.css'

const isOpen = ref(false)

const closeModal = () => {
    isOpen.value = false;
}
const form = {
    pickupLoc: '',
    id: '',
    currency: '',
    date_from: '',
    date_to: '',
    time_from: '',
    time_to: '',
    category: '',
    supplier: '',
    booking_id: '',
    location_type_id: '',
    specifications: [],
    payment_methods: []
}

const locations = {
    all: ref([]),
    options: ref([]),
    loading: ref(false),
};
let vehicleIds = [];

const loading = ref(false);
const locationName = ref("");
const category = ref([]);
const supplier = ref([]);
const locationType = ref([]);
const filteredVehicles = ref("");
const filteredCategories = ref("");
const filteredSuppliers = ref("");
const filteredLocationTypes = ref("");
const filteredSpecifications = ref([]);
const count = ref("");
const price = ref(0);
const max = ref(0)
const min = ref(0)
const priceTax = ref("");
const priceRange = ref(10000);
const daysNumber = ref("");
const specification = ref([]);
const paymentMethods = ref([]);
const selectedPaymentMethod = ref([]);
const getLocations = async () => {
    locations.loading.value = true;
    try {
        const response = await axios.get("/get/locations");
        locations.all.value = Object.values(response.data);

    } catch (error) {
        console.error(error);
    } finally {
        locations.loading.value = false;
    }
};

const showMoreIncluded = (vehicle_id) => {
    var elements = document.querySelectorAll('.vehicle-' + vehicle_id);
    const showMoreElement = document.getElementById('show-more' + vehicle_id);
// Loop through each element to apply the display toggle logic
    elements.forEach(function (element) {
        const display = element.style.display;

        if (display === 'none') {
            element.style.display = '';
            showMoreElement.textContent = 'Show less ...';
        } else {
            element.style.display = 'none';
            showMoreElement.textContent = 'Show more ...';
        }
    });
}
const remoteLocations = (query) => {
    if (query) {
        locations.loading.value = true;
        setTimeout(() => {
            locations.loading.value = false;
            locations.options.value = locations.all.value.filter((item) =>
                item.toLowerCase().includes(query.toLowerCase())
            );
        }, 200);
    } else {
        locations.options.value = [];
    }
};
const collapse = (menu) => {
    if ($("#" + menu).css('display') === 'block') {
        $('.pointer-arrow-' + menu).removeClass('fa-arrow-down')
        $('.pointer-arrow-' + menu).addClass('fa-arrow-right')
    } else if ($("#" + menu).css('display') === 'none') {
        $('.pointer-arrow-' + menu).removeClass('fa-arrow-right')
        $('.pointer-arrow-' + menu).addClass('fa-arrow-down')
    }

    $("#" + menu).toggle('slide')

}
const getSpecifications = async () => {

    if (vehicleIds.length <= 0) {
        vehicleIds = filteredVehicles.value.map(a => a.id)
    }
    if (filteredSpecifications.value.length <= 0) {
        const response = await axios.post('get/filtered/specifications', {vehicle_ids: vehicleIds})
        filteredSpecifications.value = response.data
    }
}
const search = () => {
    form.category = category.value
    form.currency = localStorage.getItem('currency') ?? 'USD';
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('booking_id') && urlParams.get('booking_id') != null) {
        form.booking_id = urlParams.get('booking_id')
    }
    router.get('/results', form)
};

const checkIfCategorySelected = (category_id) => {
    return (category.value?.indexOf(category_id) >= 0)
}
const SelectCategory = (category_id) => {

    if (category.value?.indexOf(category_id) >= 0) {
        category.value.splice(category.value.indexOf(category_id), 1);
    } else {
        category.value.push(category_id);
    }
    form.category = category.value
    getVehicles()
}

const checkIfSupplierSelected = (supplier_id) => {
    return supplier.value.indexOf(supplier_id) >= 0
}
const selectSupplier = (supplier_id) => {
    if (supplier.value.indexOf(supplier_id) >= 0) {
        supplier.value.splice(supplier.value.indexOf(supplier_id), 1);
    } else {
        supplier.value.push(supplier_id);
    }
    form.supplier = supplier.value
    getVehicles()
}
const checkIfPaymentMethodSelected = (payment_method_id) => {
    return (selectedPaymentMethod.value.indexOf(payment_method_id) >= 0);
}
const selectPaymentMethod = (payment_method_id) => {
    if (selectedPaymentMethod.value.indexOf(payment_method_id) >= 0) {
        selectedPaymentMethod.value.splice(selectedPaymentMethod.value.indexOf(payment_method_id), 1);
    } else {
        selectedPaymentMethod.value.push(payment_method_id);
    }
    form.payment_methods = selectedPaymentMethod.value
    getVehicles()
}

const checkIfLocationTypeSelected = (locationTypeId) =>
{
    return locationType.value.indexOf(locationTypeId) >= 0;
}
const selectLocationType = (locationTypeId) => {
    if (locationType.value.indexOf(locationTypeId) >= 0) {
        locationType.value.splice(locationType.value.indexOf(locationTypeId), 1);
    } else {
        locationType.value.push(locationTypeId);
    }
    form.location_type_id = locationType.value
    getVehicles()

}

const checkIfSpecificationSelected = (item, option) => {
    let found = 0;

    for (let i = 0; i < form.specifications.length; i++) {
        if (form.specifications[i].name === item.name && form.specifications[i].option === option) {
            found = 1
        }
    }

    return found === 1

}
const selectSpecification = (item, option) => {
    console.log("here")
    let found = 0;
    for (let i = 0; i < form.specifications.length; i++) {
        if (form.specifications[i].name === item.name) {
            found = 1
            form.specifications[i].option = option
        }
    }
    if (found === 0) {
        form.specifications.push({name: item.name, option: option})
    } else  {
        form.specifications.splice(form.specifications.indexOf({name: item.name, option: option}))
    }
    getVehicles()
}
const getVehicles = async () => {
    try {
        form.currency = localStorage.getItem('currency') ?? 'USD';
        loading.value = true;
        const response = await axios.post("/filter/vehicles", form);
        filteredVehicles.value = response.data.filteredVehicles;
        locationName.value = response.data.location;
        if (response.data.location_id) {
            form.pickupLoc = response.data.location_id;
        }
        form.date_from = response.data.date_from
        form.date_to = response.data.date_to
        filteredCategories.value = response.data.filteredCategories;
        filteredSuppliers.value = response.data.filteredSuppliers;
        filteredLocationTypes.value = response.data.filteredLocationTypes;
        if (response.data.paymentMethods) {
            paymentMethods.value = response.data.paymentMethods
        }
        count.value = response.data.count;

        max.value = response.data.max;
        priceRange.value = response.data.max;
        min.value = response.data.min;
        priceTax.value = response.data.priceTax;
        daysNumber.value = '';
        daysNumber.value = response.data.daysNumber;
        const specificationMap = new Map();
        filteredVehicles.value.forEach(vehicle => {
            const specifications = vehicle.specifications;
            for (const key in specifications) {
                if (specifications.hasOwnProperty(key)) {
                    const {name, option} = specifications[key];
                    if (specificationMap.has(name)) {
                        const specItem = specificationMap.get(name);
                        if (!specItem.options.includes(option)) {
                            specItem.options.push(option);
                        }
                    } else {
                        specificationMap.set(name, {name, options: [option]});
                    }
                }
            }
        });

        await getSpecifications()
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const getFilters = async () => {
    try {
        loading.value = true;
        const formData = new FormData();
        formData.append("category", category.value);
        formData.append("date", date.value);
        formData.append("priceRange", price.value);
        formData.append("supplier", supplier.value);
        formData.append("specification", specification.value);
        formData.append("currency", localStorage.getItem('currency') ?? 'EGP');
        const response = await axios.post("/filter/vehicles", formData);
        filteredVehicles.value = response.data.filteredVehicles;
        count.value = response.data.count;
        // max.value = 0;
        // min.value = 0;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const filters = () => {
    $('.mobile-filters').slideToggle()
}
const hideItem = (vehicle) => {
    vehicle.isHidden = true;
};

const getDisplayStyle = (item) => {
    return item.isHidden ? "display: none;" : "";
};
const activeRentalTerms = ref('');
const openRentalTerms = (vehicle) => {
    isOpen.value = true
    activeRentalTerms.value = vehicle.rental_terms
}

const priceFiltered = computed(() => {
    if (filteredVehicles.value && filteredVehicles.value.length > 0) {
        if (priceRange.value !== undefined && priceRange.value !== null) {
            return filteredVehicles.value.filter((vehicle) => {
                return vehicle.final_price <= priceRange.value;
            });
        }
        return filteredVehicles.value;
    }
    return [];
});
const selectedCurrency = computed(() => {
    return localStorage.getItem('currency') ?? 'USD'
})
watchEffect(() => {
    // getFilters();
    getLocations();
});

const goToBookingPage = async (vehicle_id) => {
    form.id = vehicle_id;
    let uri = '/vehicles/book'
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('booking_id') && urlParams.get("booking_id") != null && urlParams.get("booking_id") != "") {
        console.log("=======>")
        console.log(urlParams.get("booking_id"))
        form.booking_id = urlParams.get('booking_id')
        uri = '/update-booking'
    }
    console.log(uri)
    router.get(uri, form)
}
const setParams = async () => {
    let urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('pickupLoc')) {
        form.pickupLoc = urlParams.get('pickupLoc')
    }
    if (urlParams.has('date_from')) {
        form.date_from = urlParams.get('date_from')
    }
    if (urlParams.has('date_to')) {
        form.date_to = urlParams.get('date_to')
    }
    if (urlParams.has('time_from')) {
        form.time_from = urlParams.get('time_from')
    }
    if (urlParams.has('time_to')) {
        form.time_to = urlParams.get('time_to')
    }

    const cat = urlParams.getAll('category[]');
    if (cat.length > 0) {
        category.value = cat.map(Number);
    } else if (urlParams.has('category')) {
        category.value = [Number(urlParams.get('category'))];
    }
    form.category = category.value;

    const sup = urlParams.getAll('supplier[]');
    if (sup.length > 0) {
        supplier.value = sup.map(Number);
    } else if (urlParams.has('supplier')) {
        supplier.value = [Number(urlParams.get('supplier'))];
    }
    form.supplier = supplier.value;

    const lt = urlParams.getAll('location_type_id[]');
    if (lt.length > 0) {
        locationType.value = lt.map(Number);
    } else if (urlParams.has('location_type_id')) {
        locationType.value = [Number(urlParams.get('location_type_id'))];
    }
    form.location_type_id = locationType.value;

    const pm = urlParams.getAll('payment_methods[]');
    if (pm.length > 0) {
        selectedPaymentMethod.value = pm.map(Number);
    } else if (urlParams.has('payment_methods')) {
        selectedPaymentMethod.value = [Number(urlParams.get('payment_methods'))];
    }
    form.payment_methods = selectedPaymentMethod.value;

    await getVehicles();
}

onMounted(() => {
    setParams();
})
</script>

<style lang="scss">
.show-more-whats-included {
    display: none;
}

@media screen and (max-width: 1328px) {
    .steps-buttons {
        left: 0 !important;
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

.el-slider {
    --el-slider-main-bg-color: #f4d849;
}

.el-radio.is-bordered {
    border: none;
}

// Hide el-radio input circle/dot completely
.el-radio {
    .el-radio__input {
        display: none !important;
    }

    .el-radio__inner {
        display: none !important;
    }
}

.el-radio.is-bordered.el-radio--large {
    padding: 0;
    border: none !important;
    height: auto;
}

.filter_top {
    position: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 165px;

    img {
        width: 100px;
    }
}

.filter_top_group {
    .el-radio.is-bordered .el-radio__input {
        display: none !important;
    }

    .is-checked {
        .item_filter_group {
            border-color: #f4d849;

            h4 {
                color: #f4d849;
            }
        }
    }
}

.price-range {
    font-size: 14px;
    color: gray;
    font-weight: 500;
}

.is-checked {
    color: #f4d849 !important;
}

.scv-badge.badge-white {
    display: flex;
    min-width: 10px;
    padding: 12px 11px 11px 4px;
    color: #605c5c;
    background-color: #fff;
    border-radius: 2em;
    line-height: 14px;
    vertical-align: middle;
    white-space: normal;
    border: 1px solid #ddd;
}

[id|=sc-be] .be_media {
    overflow: hidden;
    transform: scale(1);
    transform-origin: 0 0;
}

.scv-icon.scv-instant {
    height: 29px;
    min-width: 32px;
    width: 32px;
    display: inline-block;
}

[id|=sc-be] .be_media-middle {
    vertical-align: middle;
}

.scv-inst-text {
    display: inline-block;
    font-size: 11px;
    text-align: left;
    vertical-align: middle;
    -webkit-align-self: center;
    align-self: center;
    margin-left: 2px;
}

@media (min-width: 1700px) {
    .included-font {
        font-size: 12px;
    }

}

@media (max-width: 1699px) {
    .included-font {
        font-size: 11px;
    }

}

@media (max-width: 1500px) {
    .included-font {
        font-size: 9.5px;
    }

}


.horizonal-slider {
    display: flex;
    grid-template-columns: repeat(6, calc(15% - var(--gutter) * 2));
    grid-template-rows: minmax(150px, 1fr);
    overflow-x: scroll;
    overflow-y: hidden;
    scrollbar-width: thin;
    scroll-snap-type: x proximity;
    padding-bottom: calc(.75 * var(--gutter));
    margin-bottom: calc(-.25 * var(--gutter));
    list-style: none;
}

.horizontal-slider-container {
    width: 80%;
    height: 220px;
}

.item {
    width: 12%;
    scroll-snap-align: center;
    padding: calc(var(--gutter) / 2 * 1.5);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
}


/* End  */

:root {
    --gutter: 20px;
}


.card-item {
    width: 15%;

}

.slide-container {
    width: 90%;
    height: 200px;

    .el-radio.is-bordered .el-radio__input {
        display: none !important;
    }

    .is-checked {
        .card-item {
            border-color: #f4d849;

            h4 {
                color: #f4d849;
            }
        }
    }
}

.slide-content {
    overflow: hidden;
    border-radius: 10px;

}

.card {
    border-radius: 10px;
    background-color: #FFF;
    height: 90%;
    margin-right: .5%;

}

.card:hover {
    background-color: #f8da47;
}

.image-content,
.card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.image-content {
    position: relative;
    padding: 25px 0;
}

.card-image {
    position: relative;
    height: 120px;
    width: 120px;
}

.card-image .card-img {
    height: 80%;
    width: 100%;
}


.button:hover {
    background: #f4d640;
}

.swiper-navBtn {
    color: #f4d640 !important;
    transition: color 0.3s ease;
}

.swiper-navBtn:hover {
    color: #ae9519 !important;
}

.swiper {
    margin-left: 4%;
    position: initial;
    align-items: center;
}

.swiper-navBtn::before,
.swiper-navBtn::after {
    font-size: 35px;
}

.swiper-button-next {
    color: rgb(0, 0, 0);
    width: 48px;
    height: 80px;
    background-repeat: no-repeat;
    margin-top: -40px;
    margin-right: 2%;
    font-weight: bold;
    background-color: #fff;
    border-radius: 10px;
}

.swiper-button-next:hover {
    background-color: rgb(243, 220, 83);
}

.swiper-button-prev:hover {
    background-color: rgb(243, 220, 83);
}

.swiper-button-prev {
    color: rgb(0, 0, 0);
    height: 80px;
    background-repeat: no-repeat;
    margin-top: -40px;
    width: 48px;
    font-weight: bold;
    background-color: #fff;
    border-radius: 10px;

}

.swiper-pagination-bullet {
    background-color: #f4d640;
    opacity: 1;
}

.swiper-pagination-bullet-active {
    background-color: #f4d640;
}

@media screen and (max-width: 768px) {
    .slide-content {
        margin: 0 10px;
    }

    .swiper-navBtn {
        display: none;
    }
}

.select {
    border-color: rgba(244, 214, 64, 0.49);
    border-width: thick;
}

.el-popper.is-dark {
    box-shadow: 5px 5px rgba(189, 189, 189, 0.49);
    background: #ffffff !important;
    color: black;
    border-color: rgba(0, 0, 0, 0.72);
    border-width: 2px;
    border-radius: 12px;
    font-weight: 500;
    text-wrap: balance;
    font-size: .8vw !important;
    inset: -40px auto auto -150px !important;
    height: auto;
}

.el-popper[data-popper-placement^=right] > .el-popper__arrow {
    top: 90% !important;
    left: 130px !important;
    transform: translate(0px, 0px) !important;
    display: none;
}

@media (max-width: 768px) {
    .sidebar-filter {
        padding: 1rem;
    }

    .sidebar-filter h5,
    .sidebar-filter h4 {
        font-size: 16px;
    }

    .sidebar-filter .row {
        flex-direction: column;
    }

    .sidebar-filter .col-md-10,
    .sidebar-filter .col-md-9,
    .sidebar-filter .col-md-6,
    .sidebar-filter .col-md-5,
    .sidebar-filter .col-md-2 {
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 10px;
    }

    .sidebar-filter .form-control,
    .sidebar-filter .el-select,
    .sidebar-filter .el-date-picker,
    .sidebar-filter select {
        width: 100% !important;
    }

    .sidebar-filter .btn-main {
        width: 100%;
    }

    .sidebar-filter .fa {
        float: right;
        margin-top: -25px;
    }
}

    .web-card {
        display: none;
    }
    .mobile-card {
        display: block;
    }

@media screen and (min-width: 1000px) {
    .filter-by {
        display: none;
    }
    .mobile-filters {
        display: block;
    }
    .web-card {
        display: block;
    }
    .mobile-card {
        display: none;
    }
}

@media screen and (max-width: 999px) {
    .mobile-filters {
        display: none;
    }
    .filter-by {
        display: block;
    }
}

// ========================================
// ENHANCED STYLING IMPROVEMENTS
// ========================================

// Better step buttons
.steps-button {
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    &.active {
        position: relative;
        &::after {
            content: '✓';
            position: absolute;
            right: 15px;
            font-weight: bold;
        }
    }
}

// Enhanced vehicle cards
.de-item-list {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        transform: translateY(-3px);
    }
}

// Better filter sections
.pb-4.bg-white,
.pb-4[style*="background: #fff"] {
    border-radius: 12px;
    box-shadow: 0 2px 15px rgba(0,0,0,0.06);
}

// Enhanced modal
.modal-container {
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
    background: linear-gradient(135deg, #f9d602 0%, #e5c302 100%);
    border-radius: 16px 16px 0 0;
    padding: 20px;
    font-weight: 600;
}

.modal-footer {
    border-radius: 0 0 16px 16px;
    padding: 15px 20px;
}

// Enhanced search result count
h3 strong[style*="color: #bdaa2f"] {
    background: linear-gradient(135deg, #f9d602 0%, #e5c302 100%);
    padding: 5px 15px;
    border-radius: 20px;
    color: #000 !important;
}

// Better price display
.d-days {
    font-size: 0.9rem;
    color: #666;
}

// Enhanced booking button
.btn-main.select-btn {
    background: linear-gradient(135deg, #f9d602 0%, #e5c302 100%);
    transition: all 0.3s ease;
    font-weight: 600;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(249, 214, 2, 0.4);
    }
}

// Price and booking section alignment
.price-booking-section {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 10px;

    .d-days {
        margin-top: auto;
    }

    h2 {
        margin-bottom: 10px;
    }

    .btn-main.select-btn {
        margin-top: auto;
    }
}

// Better supplier info section
.d-supplier {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 10px 15px;
}

// Enhanced "What is Included" section
.bg-light-gray {
    border-radius: 10px;
}

// Better category cards in slider
.slide-container .card {
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
        border-color: #f9d602;
        transform: translateY(-5px);
    }

    &.select {
        border-color: #f9d602;
        background: linear-gradient(135deg, #fffef5 0%, #fff9db 100%);
    }
}

// Instant confirmation badge - no background overlay
#instant_btn {
    padding: 8px 12px;
    border-radius: 8px;

    p {
        margin: 0;
    }
}

// Price range slider enhancement
.el-slider__bar {
    background: linear-gradient(90deg, #f9d602, #e5c302);
}

.el-slider__button {
    border-color: #f9d602;
}

// Loading animation
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.loading-text {
    animation: pulse 1.5s ease-in-out infinite;
}

</style>
