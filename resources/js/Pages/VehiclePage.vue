<template>
    <body>
    <div id="wrapper">

        <!-- header begin -->
        <header-one/>
        <!-- header close -->
        <!-- content begin -->
        <div class="no-bottom no-top zebra" id="content">
            <div id="top"></div>

            <!-- section begin -->


            <!-- section close -->
            <div v-if="isOpen" class="modal-mask">
                <div class="modal-wrapper" @click="$emit('close')">
                    <div class="modal-container" style="margin: 15px 15px 150px 20% !important;" ref="target">
                        <div class="modal-header">
                            <slot name="header"> Rental Terms</slot>
                        </div>
                        <div class="modal-body overflow-y-auto" style="max-height: 50%">
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
            <div v-if="autoursRentalTerms" class="modal-mask">
                <div class="modal-wrapper" @click="$emit('close')">
                    <div class="modal-container" style="margin: 15px 15px 150px 20% !important;" ref="target">
                        <div class="modal-header">
                            <slot name="header">Autours Rental Terms</slot>
                        </div>
                        <div class="modal-body overflow-y-auto" style="max-height: 50%;">
                            <h2>Terms and Conditions</h2>

                            <h3>Contract Agreement</h3>
                            <ul>
                                <li>Terms and Conditions, along with the website's Terms of Use and privacy policy,
                                    constitute the contract between the renter and AUTOURS Cars.
                                </li>
                                <li>These Terms apply to all deals for our services, superseding any other Terms.</li>
                                <li>Acceptance of services includes acceptance of these Terms.</li>
                            </ul>

                            <h3>Modification of Terms</h3>
                            <ul>
                                <li>Terms may change periodically; renters should check the website for updates.</li>
                                <li>Car hire services are subject to both supplier terms and local laws.</li>
                            </ul>

                            <h3>Booking Responsibilities</h3>
                            <ul>
                                <li>Bookings made through the website are governed by these Terms and the supplier's
                                    terms.
                                </li>
                                <li>Confirmation of acceptance is required for any booking.</li>
                                <li>Contact for inquiries: +1-914-368-0091 or +44-208-196-9510.</li>
                            </ul>

                            <h3>Booking Confirmation</h3>
                            <ul>
                                <li>Renters will receive a booking confirmation voucher via email if the vehicle is
                                    available.
                                </li>
                                <li>Alternatives will be suggested if the requested vehicle is unavailable; acceptance
                                    is mandatory for modifications.
                                </li>
                                <li>Failure to accept alternatives may result in booking cancellation and potential
                                    refund.
                                </li>
                            </ul>

                            <h3>Payment and Contract Confirmation</h3>
                            <ul>
                                <li>No contract for car rental exists until booking confirmation and payment are
                                    completed.
                                </li>
                                <li>All correspondence will be directed to the individual making the booking, even if a
                                    third party pays.
                                </li>
                            </ul>

                            <h3>Voucher Presentation</h3>
                            <ul>
                                <li>Renters must present a confirmation voucher at the time of vehicle pickup.</li>
                                <li>AUTOURS is not liable for rejected service due to failure to provide the voucher.
                                </li>
                            </ul>

                            <h3>Liability Provisions</h3>
                            <ul>
                                <li>AUTOURS is not liable for charges incurred at the local level.</li>
                                <li>Renters bear full responsibility for any damages caused due to negligence, including
                                    DUI incidents.
                                </li>
                            </ul>

                            <h3>Limited Liability Clause</h3>
                            <ul>
                                <li>AUTOURS is not liable for supplier issues regarding car availability; resolution
                                    must be between the renter and the supplier.
                                </li>
                            </ul>

                            <h3>Role of AUTOURS</h3>
                            <ul>
                                <li>AUTOURS acts solely as a broker and is not responsible for damages or extra charges
                                    beyond rental costs.
                                </li>
                                <li>Refund liability, if applicable, is limited to the deposit made at booking.</li>
                            </ul>

                            <h3>Insurance Provisions</h3>
                            <ul>
                                <li><strong>Collision Damage Waiver (CDW)</strong> - Reduces liability for damages,
                                    excluding intentional damages or negligent use.
                                </li>
                                <li><strong>Theft Waiver (TW)</strong> - Reduces liability for theft or damage due to
                                    theft. Negligence may lead to full liability for the vehicle's value.
                                </li>
                            </ul>

                            <h3>Delivery & Collection Charges</h3>
                            <ul>
                                <li>Additional charges apply for out-of-hours service or delivery/collection from
                                    accommodations.
                                </li>
                                <li>Specific information must be provided for vehicle delivery.</li>
                            </ul>

                            <h3>Important Insurance Notes</h3>
                            <ul>
                                <li>Check insurance covers, especially regarding third-party exclusions for family
                                    members.
                                </li>
                                <li>Personal Accident Insurance (PAI) options should be reviewed before booking.</li>
                            </ul>

                            <h3>Local Deposits & Fuel Policies</h3>
                            <ul>
                                <li>Suppliers typically require a deposit to cover potential liabilities.</li>
                                <li>Fuel policies may include non-refundable charges or specific return conditions.</li>
                            </ul>

                            <h3>Age Limitations</h3>
                            <ul>
                                <li>Minimum rental age is usually 21 years, with potential extra charges for drivers
                                    under 25 or over 65.
                                </li>
                                <li>Verify age policies with the car rental supplier.</li>
                            </ul>

                            <h3>Additional Drivers</h3>
                            <ul>
                                <li>Additional driver charges must be checked in the terms of the respective supplier.
                                </li>
                            </ul>

                            <h3>Rental Period & Charges</h3>
                            <ul>
                                <li>Rental calculated on a 24-hour basis; late returns may incur additional charges.
                                </li>
                            </ul>

                            <h3>Rental Extensions</h3>
                            <ul>
                                <li>Extensions should be arranged directly with the supplier and may incur higher local
                                    charges.
                                </li>
                            </ul>

                            <h3>One-Way Rentals</h3>
                            <ul>
                                <li>Subject to drop-off charges; details will be provided upon booking confirmation.
                                </li>
                            </ul>
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

            <section id="section-car-details">

                <div class="row d-flex justify-content-center steps">
                    <div class="col-md-10  col-11 stepper gap-3 mt-5">
                        <div class="step">
                            <span class="ti ti-circle-number-1 me-2"></span>
                            Choose Your Location
                        </div>
                        <div class="step active-step">
                            <span class="ti ti-circle-number-2 me-2"></span>
                            Choose Your Car
                        </div>
                        <div class="step">
                            <span class="ti ti-circle-number-3 me-2"></span>
                            Reserve Your Car
                        </div>
                    </div>


                    <div class="col-12 col-md-3 offset-md-1 mt-4">

                        <div class="col-12 col-md-12 p-1 rounded"  style="background-color: #e1e1e1; ">
                            <h5 class="p-2 mb-0">YOUR SEARCH DETAILS</h5>
                        </div>
                        <div class="col-12 col-md-12 pb-4 bg-white">
                            <div class="row">
                                <div class="col-12 mt-4">
                                    <h5>PICK-UP - LOCATION</h5>
                                </div>
                                <div class="col-12 d-flex align-items-start mb-2">
                                    <i class="ti ti-gps me-2"></i>
                                    <p class="mb-0">{{ form.pickupLoc }}</p>
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="ti ti-calendar me-1"></i> {{ form.date_from }}
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="ti ti-clock me-1"></i> {{ form.time_from }}
                                </div>
                            </div>

                            <hr class="my-3"/>

                            <div class="row">
                                <div class="col-12">
                                    <h5>DROP-OFF - LOCATION</h5>
                                </div>
                                <div class="col-12 d-flex align-items-start mb-2">
                                    <i class="ti ti-gps me-2"></i>
                                    <p class="mb-0">{{ form.pickupLoc }}</p>
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="ti ti-calendar me-1"></i> {{ form.date_to }}
                                </div>
                                <div class="col-6 mb-2">
                                    <i class="ti ti-clock me-1"></i> {{ form.time_to }}
                                </div>
                            </div>
                        </div>

                        <div class="p-1 col-12 mt-3" style="background: #e1e1e1;">
                            <h5 class="p-4 m-0">Booking This Car</h5>
                        </div>

                        <div class="col-12 pb-4" style="background: #fff;">
                            <form class="trip-form px-2" @submit.prevent="search">
                                <div class="row gy-3">

                                    <!-- Pickup Location -->
                                    <div class="col-12 mt-3">
                                        <el-select
                                            class="w-100"
                                            v-model="form.pickupLoc"
                                            size="large"
                                            placeholder="Pickup..."
                                            disabled>
                                        </el-select>
                                    </div>

                                    <!-- Date From + Time From -->
                                    <div class="col-12 col-md-7">
                                        <el-date-picker
                                            v-model="form.date_from"
                                            placeholder="Start date"
                                            size="large"
                                            format="YYYY/MM/DD"
                                            value-format="YYYY-MM-DD"
                                            :disabled-date="disabledDate" />
                                    </div>

                                    <div class="col-12 col-md-5">
                                        <select class="form-control rounded-1 w-100" v-model="form.time_from">
                                            <option v-for="h in 24" :key="h*2">{{ (h-1).toString().padStart(2, '0') }}:00</option>
                                            <option v-for="h in 24" :key="'h'+h">{{ (h-1).toString().padStart(2, '0') }}:30</option>
                                        </select>
                                    </div>

                                    <!-- Date To + Time To -->
                                    <div class="col-12 col-md-7">
                                        <el-date-picker
                                            v-model="form.date_to"
                                            placeholder="End date"
                                            size="large"
                                            format="YYYY/MM/DD"
                                            value-format="YYYY-MM-DD"
                                            :disabled-date="disabledDate" />
                                    </div>

                                    <div class="col-12 col-md-5">
                                        <select class="form-control rounded-1 w-100" v-model="form.time_to">
                                            <option v-for="h in 24" :key="'to'+h*2">{{ (h-1).toString().padStart(2, '0') }}:00</option>
                                            <option v-for="h in 24" :key="'to'+h">{{ (h-1).toString().padStart(2, '0') }}:30</option>
                                        </select>
                                    </div>

                                    <!-- Submit Button -->
                                    <div class="col-12">
                                        <input type="submit" value="Check Availability" class="btn-main btn-fullwidth w-100" style="background: #f9d602" />
                                    </div>

                                </div>
                            </form>
                        </div>

                        <div class="col-md-12 pb-4 mt-4" style="background: #e5e5e3; border: 3px solid #eed616;">
                            <div>
                                <p class="mt-3">Total Rental Price</p>
                                <h3>{{ currency + ' ' + vehicle.final_price }}</h3>
                                <p> For {{ daysNumber }} day{{ daysNumber < 2 ? '' : 's' }} -
                                    {{ currency + ' ' + parseFloat((vehicle.final_price / daysNumber)).toFixed(2) }} /
                                    per
                                    day </p>
                                <div class="row">
                                    <p class="col-md-8 col-8">Rental Cost</p>
                                    <p class="col-md-3 col-3">{{ currency + '&nbsp' + parseFloat(vehicle.final_price).toFixed(2) }}</p>
                                </div>
                                <div class="row">
                                    <p class="col-md-8 col-8">Extras</p>
                                    <p class="col-md-3 col-3">{{ currency + '&nbsp' + 0 }}</p>
                                </div>
                                <div class="row">
                                    <p class="col-md-8 col-8">Total Rental Cost</p>
                                    <p class="col-md-3 col-3">{{ currency + '&nbsp' + parseFloat(vehicle.final_price).toFixed(2) }}</p>
                                </div>
                                <hr style="margin-bottom: 2%; margin-top: 0"/>
                                <div class="row text-nowrap" v-if="selectedMethod === 2">
                                    <strong class="col-8 col-md-8">Pay Now</strong>
                                    <strong  class="col-4 col-md-4">{{ currency + ' ' + parseFloat(vehicle.final_price).toFixed(2) }}</strong>
                                </div>
                                <div class="row text-nowrap" v-if="selectedMethod === 3">
                                    <strong class="col-md-8 col-8">Pay Now</strong>
                                    <strong class="col-md-4 col-4">{{ currency + ' ' + parseFloat(vehicle.profit_price).toFixed(2) }}</strong>
                                    <strong class="col-md-8 col-8">Pay at office</strong>
                                    <strong  class="col-md-4 col-4">{{ currency + ' ' + parseFloat(vehicle.final_price - vehicle.profit_price).toFixed(2) }}</strong>
                                </div>

                                <div class="row text-nowrap" v-if="selectedMethod === 1">
                                    <strong class="col-md-8 col-8">Pay Now</strong>
                                    <strong class="col-md-4 col-4">{{ currency + ' 0' }}</strong>
                                    <strong class="col-md-8 col-8">Pay at office</strong>
                                    <strong  class="col-md-4 col-4">{{ currency + ' ' + parseFloat(vehicle.final_price).toFixed(2) }}</strong>
                                </div>

                                <hr style="margin-top: 1%;"/>
                            </div>
                        </div>

                    </div>
                    <Loader v-if="loading"/>
                    <div v-if="!loading" class="container bg-white col-md-7 offset-md-0 pt-5 pl-5 mt-4">
                        <div class="row web-card">
                        <div class="row">
                                <div class="col-md-6">
                                    <h4 class="" style=" font-size: 1.3vw; text-wrap: nowrap;">
                                        {{ vehicle.name }} <small style="font-weight: 50; ">OR&nbsp;Similar</small>&nbsp
                                        <el-tooltip placement="right-start">
                                            <template #content>
                                                <div style="font-size: 1vw;">
                                                    The supplier will provide a car with same class and
                                                    specifications,<br>
                                                    though the make may vary.
                                                </div>
                                            </template>
                                            <i class="fas fa-info-circle" style="color: #7373e1"/>
                                        </el-tooltip>

                                    </h4>
                                    <h5>{{ vehicle?.category?.name }}</h5>

                                </div>

                        </div>
                            <div class="row">
                                <div class="col-md-4">
                                    <div id="slider-carousel text-nowrap">
                                        <div class="row"></div>
                                        <div class="">
                                            <img
                                                :src=" '/img/vehicles/' + vehicle?.photo "
                                                width="300" height="180"/>
                                        </div>
                                        <div class="spacer-30"></div>

                                    </div>
                                </div>

                            <div class="col-md-6 ml-3 row">
                                <h3 class="mb-3 col-md-6 text-nowrap">{{ currency + ' ' + vehicle.final_price }}</h3>
                                <p class="col-md-6 text-nowrap" style="color: green;"><i
                                    class="fa fa-arrow-right"/>
                                    For {{ daysNumber }}
                                    day{{ daysNumber < 2 ? '' : 's' }} -
                                    {{
                                        currency + ' ' + parseFloat((vehicle.final_price / daysNumber)).toFixed(2)
                                    }}
                                    / per
                                    day </p>
                            </div>
                        </div>

                                <div class="row col-md-10">

                                    <div class="col-md-8 row de-spec text-nowrap">
                                        <div v-if="vehicle.specifications"
                                             v-for="specification in vehicle.specifications"
                                             class="col-md-6">

                                        <span class="text-nowrap" style="margin-top: -5%">
                                                    <img style="width: 25%; margin-right: 2px;"
                                                         :src="'/assets/images/icons/' + specification.icon + '.svg'"/>
                                           {{
                                                specification.value
                                            }} {{
                                                specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Conditioning' ||
                                                specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Conditioner' ||
                                                specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Transmission' ||
                                                specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Transmission' ||
                                                specification.name?.split(' ')[specification.name?.split(' ').length - 1] == 'Fuel'
                                                    ? '' : specification.name?.split(' ')[specification.name?.split(' ')?.length - 1]
                                            }}
                                        </span>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <el-tooltip v-if="vehicle.instant_confirmation"
                                                    placement="right-start">
                                            <template #content>
                                                <div style="font-size: 1vw;">
                                                    Receive instant booking confirmation!
                                                </div>
                                            </template>
                                            <div class="col-md-2 mt-2 text-nowrap bold">
                                                <div class="" id="instant_btn">
                                                    <p style="font-size: 1vw;"><img class="mb-2" width="50"
                                                                                    src="/images/icons/instant_confirmation.png"/>
                                                        Instant Confirmation <i class="fas fa-info-circle"
                                                                                style="color: #6969d8;"></i></p>
                                                </div>
                                            </div>
                                        </el-tooltip>

                                        <el-tooltip v-if="!vehicle.instant_confirmation"
                                                    placement="right-start">
                                            <template #content>
                                                <div style="font-size: 1vw;">
                                                    You will receive booking confirmation after the<br>
                                                    requested service availability is verified!
                                                </div>
                                            </template>
                                            <div class="col-md-2  text-nowrap bold">
                                                <div>
                                                    <p style="font-size: 1vw">
                                                        <i style="font-size: 1.8vw; color: gold;"
                                                           class=" px-2 fa fa-ban be_media-left be_media-middle"/>
                                                        <strong class="mb-5"> On request <i class=" fas fa-info-circle"
                                                                                            style="color: #6969d8;"></i></strong>
                                                    </p>
                                                </div>
                                            </div>
                                        </el-tooltip>

                                    </div>
                                    <div class="spacer-single"></div>
                                </div>

                                <div class=" rounded-2 py-1 mb-2 ml-1"
                                     style="background: #edecec; width: 90%; margin-top: -3%; ">
                                    <div class="d-supplier">
                                        <div class="col-md-2 d-img w-100" style="height: 50px">
                                            <img :src="'/img/' + vehicle?.supplier?.logo" height="50"
                                                 width="80" alt=""/>
                                        </div>
                                        <div class="col-md-2 row">
                                            <div>
                                                            <span style="font-size: medium;"
                                                                  class="text-nowrap">{{
                                                                    vehicle?.supplier?.company
                                                                }}</span>
                                            </div>
                                            <div>
                                                <div><a class="cursor-pointer text-primary text-decoration-underline"
                                                        href="javascript:void(0);"
                                                        @click="openRentalTerms(vehicle)">Rental&nbsp;Terms</a></div>
                                            </div>
                                        </div>
                                        <div class="col-md-1">
                                        <span class="py-2 px-1 rounded-1 ml-3"
                                              style=" background-color: #f9d602; font-size: 1.0em;font-weight: 600;">{{
                                                vehicle.supplier_rate
                                            }}/10</span>
                                        </div>
                                        <div class="col-md-2">
                                                        <span class="be_media-body"><h5> {{
                                                                vehicle?.supplier_rate >= 1 && vehicle?.supplier_rate <= 2 ? 'Terrible' :
                                                                    vehicle?.supplier_rate > 2 && vehicle?.supplier_rate <= 4 ? 'Ok' :
                                                                        vehicle?.supplier_rate > 4 && vehicle?.supplier_rate <= 6 ? 'Good' :
                                                                            vehicle?.supplier_rate > 6 && vehicle?.supplier_rate <= 8 ? 'Ver Good' :
                                                                                vehicle?.supplier_rate > 8 && vehicle?.supplier_rate <= 10 ? 'Excellent' :
                                                                                    ''
                                                            }}</h5>
                                                            <span style="font-size: medium;">(&nbsp;
                                                                <strong style="color: #f9d602">{{
                                                                        vehicle.supplier_number_of_reviews
                                                                    }}&nbsp;</strong>+&nbsp;reviews)</span></span>
                                        </div>
                                        <div class="col-md-4 ">
                                            <p class="text-nowrap mt-2" style="font-size: 18px;">
                                                <a target="_blank"
                                                   :href=" 'https://www.google.com/maps/search/?api=1&query=' +vehicle?.branch?.lat+','+vehicle?.branch?.lng">
                                                    <i class="fa fa-earth" style="color: navy;"/></a>
                                                &nbsp;Address:&nbsp;&nbsp;<small
                                                style="font-size: 18px;">{{ vehicle?.supplier?.address }}</small></p>
                                            <div>
                                                <el-tooltip placement="bottom">
                                                    <template #content>
                                                        <div style="font-size: 1vw;">
                                                            {{ vehicle?.fuel_policy?.description }}
                                                        </div>
                                                    </template>
                                                    <p style="margin-top: -20px;">
                                                        <strong class="text-nowrap" style="font-size: 1vw;"><i
                                                            class="fa fa-gas-pump"/></strong> &nbsp;Fuel Policy:
                                                        <strong class="text-nowrap">{{
                                                                vehicle?.fuel_policy?.name
                                                            }} </strong>
                                                    </p>
                                                </el-tooltip>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div class=" row ml-1 rounded-2 bg-light-gray pt-1 " style="width: 90%; ">
                                    <div class="row col-md-12">
                                        <p class="primary bold m-0" style="color: #5e9007;">What is Included!</p>
                                        <ul class="row">
                                            <div class="col-md-4">
                                                <li v-for="(item, index) in vehicle?.included?.slice(0 , (vehicle?.included?.length) /2)"
                                                    style="height: 30px">
                                                    <div class="row"
                                                         v-if="index <= (vehicle?.included?.length - 1) / 2">
                                                        <i class="col-md-1 fa fa-check fa-l mt-2 text-nowrap"
                                                           style="color: green;"/>
                                                        <el-tooltip v-if="item?.description?.length"
                                                                    placement="right-start"
                                                                    trigger="hover">
                                                            <template #content>
                                                                <div class="" style="font-size: 1vw;">
                                                                    {{ item.description }}
                                                                </div>
                                                            </template>
                                                            <p class="col-md-10 text-nowrap included-font"
                                                               style="font-size: 0.9vw;">
                                                                {{ item.what_is_included }} <i
                                                                class="fas fa-info-circle"
                                                                style="color: #7373e1"/></p>
                                                        </el-tooltip>
                                                        <p v-else class="col-md-10 included-font text-nowrap"
                                                           style="font-size: 0.9vw;">
                                                            {{ item.what_is_included }}</p>
                                                    </div>
                                                </li>
                                            </div>

                                            <div class="col-md-4">
                                                <li v-for="(item, index) in vehicle?.included?.slice( (vehicle?.included?.length-1) /2 +1 ,  vehicle?.included?.length)"
                                                    style="height: 30px">
                                                    <div class="row">
                                                        <i class="col-md-1 fa fa-check fa-l mt-2 text-nowrap"
                                                           style="color: green;"/>
                                                        <el-tooltip v-if="item?.description?.length"
                                                                    placement="right-start"
                                                                    trigger="hover">
                                                            <template #content>
                                                                <div class="" style="font-size: 1vw;">
                                                                    {{ item.description }}
                                                                </div>
                                                            </template>
                                                            <p class="col-md-10 text-nowrap included-font"
                                                               style="font-size: 0.9vw;">
                                                                {{ item.what_is_included }}</p>
                                                        </el-tooltip>
                                                        <p v-else class="col-md-10 included-font text-nowrap"
                                                           style="font-size: 0.9vw;">
                                                            {{ item.what_is_included }}</p>
                                                    </div>
                                                </li>
                                            </div>
                                            <div class="col-md-3">
                                                <p class="text-nowrap" v-if="vehicle?.location_type?.length"><i
                                                    :class="' fa fa-'+ vehicle?.location_type[0].icon  "/>&nbsp;
                                                    &nbsp;Location Type: <strong class="text-nowrap">{{
                                                            vehicle?.location_type?.length ? vehicle.location_type[0]?.name : ''
                                                        }}</strong></p>
                                                <p class="text-nowrap" style="font-size: .8vw"><i
                                                    class="fa fa-map-marker" style="font-size: 1.3vw"/>&nbsp;
                                                    &nbsp;Pickup: <strong>{{
                                                            vehicle?.branch ? vehicle.branch.location : ''
                                                        }}</strong></p>
                                            </div>


                                        </ul>
                                    </div>
                                </div>

                        </div>

                        <div class="row g-3 mobile-card">
                                <!-- Vehicle name and image -->
                                <div class="col-12 d-flex flex-column flex-md-row ">
                                    <div class="flex-grow-1">
                                        <h4 class="fs-5 text-nowrap">
                                            {{ vehicle.name }} <small class="fw-light">OR Similar</small>
                                            <el-tooltip placement="right-start">
                                                <template #content>
                                                    <div class="fs-6">The supplier will provide a similar car...</div>
                                                </template>
                                                <i class="fas fa-info-circle text-primary ms-1"></i>
                                            </el-tooltip>
                                        </h4>
                                        <h5 class="fs-6">{{ vehicle?.category?.name }}</h5>
                                    </div>
                                    <div class="text-center mt-3 mt-md-0">
                                        <img :src="'/img/vehicles/' + vehicle?.photo" class="img-fluid" style="max-width: 100%; height: auto;" />
                                    </div>
                                </div>

                                <!-- Price Info -->
                                <div class="col-12 col-md-6">
                                    <h3 class="fs-5 text-nowrap">{{ currency + '  ' + vehicle.final_price }}</h3>
                                    <p class=" text-nowrap" style="color: #5e9007">
                                        <i class="fa fa-arrow-right"></i> For {{ daysNumber }} day{{ daysNumber < 2 ? '' : 's' }} -
                                        {{ currency + ' ' + parseFloat(vehicle.final_price / daysNumber).toFixed(2) }}/day
                                    </p>
                                </div>

                                <!-- What's Included -->
                                <div class="col-12">
                                    <div class="bg-light rounded-2 p-3">
                                        <p class="fw-bold  mb-2" style="color: #5e9007;">What is Included!</p>
                                        <div class="row">
                                            <div class="col-6 col-md-4" v-for="(item, index) in vehicle?.included">
                                                <div class="d-flex align-items-center mb-2">
                                                    <i class="fa fa-check  me-2" style="color: #5e9007;"></i>
                                                    <el-tooltip v-if="item?.description?.length" placement="right">
                                                        <template #content>
                                                            <div class="fs-6">{{ item.description }}</div>
                                                        </template>
                                                        <span class="text-truncate d-block included-font">{{ item.what_is_included }}<i class="fas fa-info-circle text-primary ms-1"></i></span>
                                                    </el-tooltip>
                                                    <span v-else class="text-truncate d-block included-font">{{ item.what_is_included }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        <!-- Register and payment part -->
                        <div class="de-box row col-lg-12 mt-5 mb25">
                            <div class="col-lg-12">
                                <div class="row">
                                    <!-- If not logged in -->
                                    <div class="col-lg-12" v-if="!user">
                                        <h4 class="text-center">Register first to continue</h4>
                                        <hr />
                                        <form method="post" @submit.prevent="register">
                                            <div class="row g-3">
                                                <!-- Gender and Name -->
                                                <div class="col-12">
                                                    <div class="row g-2">
                                                        <el-select
                                                            v-model="RegisterForm.gender"
                                                            size="large"
                                                            class="col-4 col-md-3"
                                                            filterable
                                                            placeholder="Mr/Mrs..."
                                                            required
                                                        >
                                                            <el-option
                                                                v-for="item in ['Mr.', 'Mrs.']"
                                                                :key="item"
                                                                :label="item"
                                                                :value="item"
                                                            />
                                                        </el-select>
                                                        <el-input
                                                            v-model="RegisterForm.name"
                                                            size="large"
                                                            class="col-8 col-md-9"
                                                            placeholder="Enter Full name here..."
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <!-- Phone Code and Phone -->
                                                <div class="col-12">
                                                    <div class="row g-2">
                                                        <el-select
                                                            v-model="RegisterForm.mobile_code"
                                                            size="large"
                                                            class="col-4"
                                                            filterable
                                                            placeholder="Code..."
                                                            required
                                                        >
                                                            <el-option
                                                                v-for="item in countryCodes"
                                                                :key="item.code"
                                                                :label="getUnicodeFlagIcon(item.iso) + ' +' + item.code"
                                                                :value="'+' + item.code"
                                                            />
                                                        </el-select>
                                                        <el-input
                                                            v-model="RegisterForm.phone"
                                                            size="large"
                                                            class="col-8"
                                                            placeholder="Phone Number..."
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <!-- Country -->
                                                <div class="col-12 col-md-4" v-if="!user || user.role !== 'customer'">
                                                    <el-select
                                                        v-model="RegisterForm.country"
                                                        size="large"
                                                        class="w-100"
                                                        filterable
                                                        placeholder="Select Country..."
                                                        required
                                                    >
                                                        <el-option
                                                            v-for="item in countries.list.value"
                                                            :key="item.id"
                                                            :label="item.label"
                                                            :value="item.label"
                                                        />
                                                    </el-select>
                                                </div>

                                                <!-- Email -->
                                                <div class="col-12 col-md-6">
                                                    <el-input
                                                        v-model="RegisterForm.email"
                                                        size="large"
                                                        placeholder="E-mail..."
                                                        required
                                                    />
                                                </div>

                                                <!-- Password -->
                                                <div class="col-12 col-md-6">
                                                    <el-input
                                                        v-model="RegisterForm.password"
                                                        size="large"
                                                        type="password"
                                                        placeholder="Account Password..."
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <!-- If logged in as customer -->
                                    <div class="col-lg-12" v-else-if="user && user.role === 'customer'">
                                        <div class="bg-white rounded p-3" v-if="vehicle?.supplier?.payment_methods?.length > 0">
                                            <div class="card-header">Select Payment Method</div>
                                            <div class="card-body">
                                                <el-radio-group v-model="selectedMethod" @change="selectMethod">
                                                    <div
                                                        v-for="item in vehicle.supplier.payment_methods"
                                                        :key="item.name"
                                                        class="mb-2"
                                                    >
                                                        <el-radio :label="item.id">{{ item.name }}</el-radio>
                                                    </div>
                                                </el-radio-group>
                                            </div>

                                            <!-- Card Data -->
                                            <div v-if="selectedMethod === 3 || selectedMethod === 2">
                                                <div class="card-header">Enter Your Card Data</div>
                                                <div class="card-body">
                                                    <form method="post" @submit.prevent="register">
                                                        <div class="row g-3">
                                                            <div class="col-12 col-md-6">
                                                                <label class="formbold-form-label">Name On Card</label>
                                                                <el-input
                                                                    v-model="bookingForm.name_on_card"
                                                                    size="large"
                                                                    placeholder="Name on Card..."
                                                                    :disabled="loading"
                                                                    required
                                                                />
                                                            </div>
                                                            <div class="col-12 col-md-6">
                                                                <label class="formbold-form-label">Card Number</label>
                                                                <el-input
                                                                    v-model="bookingForm.card_number"
                                                                    size="large"
                                                                    placeholder="Enter front card number..."
                                                                    :disabled="loading"
                                                                    required
                                                                />
                                                            </div>
                                                            <div class="col-6 col-md-4">
                                                                <label class="formbold-form-label">CVV</label>
                                                                <el-input
                                                                    v-model="bookingForm.CVV"
                                                                    size="large"
                                                                    placeholder="CVV..."
                                                                    :disabled="loading"
                                                                    required
                                                                />
                                                            </div>
                                                            <div class="col-6 col-md-4">
                                                                <label class="formbold-form-label">Exp Date</label>
                                                                <el-input
                                                                    v-model="bookingForm.card_exp_date"
                                                                    size="large"
                                                                    placeholder="YY/MM"
                                                                    :disabled="loading"
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Checkboxes and Submit -->
                                <div class="mt-4">
                                    <el-checkbox class="mr-2" /> Remember me on this device. <br />
                                    <el-checkbox v-model="rental_terms" class="mr-2" />
                                    I confirm that I have read, understood,  and <br/> agree with the
                                    <a class="text-primary text-decoration-underline cursor-pointer" @click="openRentalTerms(vehicle)">Rental Terms</a>
                                    &amp;
                                    <a class="text-primary text-decoration-underline cursor-pointer" @click="openAutoursTerms()">Autours terms</a>.<br />
                                    <el-checkbox class="mr-2" /> Subscribe me to promotional emails.
                                </div>

                                <hr />

                                <ProgressBar v-if="loading" mode="indeterminate" style="height: 6px"></ProgressBar>

                                <button
                                    v-if="!loading"
                                    id="send_message"
                                    @click="book"
                                    :disabled="loading"
                                    class="btn-main btn-fullwidth col-12 col-md-5 offset-md-4 mt-3"
                                    style="background: #f9d602"
                                >
                                    Continue&nbsp;To&nbsp;Payment
                                </button>
                            </div>
                        </div>

                    </div>

                </div>


            </section>

        </div>
    </div>
    <Footer/>

    </body>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {usePage, useForm} from '@inertiajs/vue3';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import HeaderOne from '../components/HeaderOne.vue'
import {router} from "@inertiajs/vue3";
import {CAccordion, CAccordionItem, CAccordionHeader, CAccordionBody} from '@coreui/vue';
import Footer from "../components/Footer.vue";
import getUnicodeFlagIcon from "country-flag-icons/unicode";
import ProgressBar from 'primevue/progressbar';
import 'primevue/resources/themes/aura-light-amber/theme.css'
import Loader from '../components/Loader.vue'

const isOpen = ref(false)
const autoursRentalTerms = ref(false)

const closeModal = () => {
    isOpen.value = false;
    autoursRentalTerms.value = false;
}

const countryCodes = [
    {"country": "Algeria", "code": "213", "iso": "DZ"},
    {"country": "Australia", "code": "61", "iso": "AU"},
    {"country": "Bahrain", "code": "973", "iso": "BH"},
    {"country": "Canada", "code": "1", "iso": "CA"},
    {"country": "China", "code": "86", "iso": "CN"},
    {"country": "Denmark", "code": "45", "iso": "DK"},
    {"country": "Egypt", "code": "20", "iso": "EG"},
    {"country": "France", "code": "33", "iso": "FR"},
    {"country": "Germany", "code": "49", "iso": "DE"},
    {"country": "Greece", "code": "30", "iso": "GR"},
    {"country": "India", "code": "91", "iso": "IN"},
    {"country": "Indonesia", "code": "62", "iso": "ID"},
    {"country": "Iran", "code": "98", "iso": "IR"},
    {"country": "Iraq", "code": "964", "iso": "IQ"},
    {"country": "Italy", "code": "39", "iso": "IT"},
    {"country": "Jordan", "code": "962", "iso": "JO"},
    {"country": "Kuwait", "code": "965", "iso": "KW"},
    {"country": "Lebanon", "code": "961", "iso": "LB"},
    {"country": "Libya", "code": "218", "iso": "LY"},
    {"country": "Mexico", "code": "52", "iso": "MX"},
    {"country": "Morocco", "code": "212", "iso": "MA"},
    {"country": "Netherlands", "code": "31", "iso": "NL"},
    {"country": "Oman", "code": "968", "iso": "OM"},
    {"country": "Pakistan", "code": "92", "iso": "PK"},
    {"country": "Palestine", "code": "970", "iso": "PS"},
    {"country": "Poland", "code": "48", "iso": "PL"},
    {"country": "Portugal", "code": "351", "iso": "PT"},
    {"country": "Qatar", "code": "974", "iso": "QA"},
    {"country": "Russia", "code": "7", "iso": "RU"},
    {"country": "Saudi Arabia", "code": "966", "iso": "SA"},
    {"country": "Spain", "code": "34", "iso": "ES"},
    {"country": "Sweden", "code": "46", "iso": "SE"},
    {"country": "Switzerland", "code": "41", "iso": "CH"},
    {"country": "Syria", "code": "963", "iso": "SY"},
    {"country": "Tunisia", "code": "216", "iso": "TN"},
    {"country": "Turkey", "code": "90", "iso": "TR"},
    {"country": "United Arab Emirates", "code": "971", "iso": "AE"},
    {"country": "United Kingdom", "code": "44", "iso": "GB"},
    {"country": "United States", "code": "1", "iso": "US"},
];
const user = ref('')
const rental_terms = ref(false)
const value = ref(0);
const id = ref('')
const vehicle = ref([])
const currency = ref('')
const date = ref([]);
const priceTax = ref("");
const daysNumber = ref("");
const loading = ref(false);
const selectedMethod = ref(false);
const selectMethod = () => {
    console.log(selectedMethod.value)
}
const form = useForm({
    id: "",
    pickupLoc: "",
    date_from: "",
    date_to: "",
    time_from: "",
    time_to: "",
    vehicle: "",
    price: "",
    currency: localStorage.getItem('currency') ?? 'USD',
});
const countries = {
    loading: ref(false),
    all: ref([]),
    list: ref([]),
    options: ref([]),
};

const RegisterForm = useForm({
    name: '',
    phone: '',
    email: '',
    password: '',
    mobile_code: '',
    country: '',
    user_type: '',
    supplier: 0,
    gender: '',
});

const bookingForm = useForm({
    pickupLoc: "",
    date_from: "",
    date_to: "",
    time_from: "",
    time_to: "",
    id: "",
    card_number: "",
    name_on_card: "",
    CVV: "",
    card_exp_date: "",
    currency: ""
});
const $toast = useToast();
const getUser = async () => {
    try {
        const response = await axios.get('/get/user/data');
        user.value = response.data;
    } catch (error) {
        console.error(error);
    }
}
const activeRentalTerms = ref('');
const openRentalTerms = (vehicle) => {
    isOpen.value = true
    activeRentalTerms.value = vehicle.rental_terms
}
const openAutoursTerms = () => {
    autoursRentalTerms.value = true
}

const setParams = () => {
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

    if (urlParams.has('date')) {
        form.date = urlParams.get('date')
    }
    if (urlParams.has('id')) {
        id.value = urlParams.get('id')
        form.id = urlParams.get('id')
    }
    getVehicle()
}


const getVehicle = async () => {
    try {

        loading.value = true
        form.id = id.value;
        form.currency = localStorage.getItem('currency') ?? 'USD';

        const response = await axios.post('/get/vehicle/data', form)

        vehicle.value = response.data.data.vehicle
        form.vehicle = vehicle.value.id
        form.price = vehicle.value.final_price

        form.date_from = response.data.data.date_from
        form.date_to = response.data.data.date_to

        date.value = response.data.data.date
        daysNumber.value = response.data.data.days
        if (vehicle.value.supplier?.payment_methods?.length === 1) {
            selectedMethod.value = vehicle.value.supplier.payment_methods[0].id
        }
        loading.value = false

    } catch (error) {
        if (!error.response.data.status) {
            $toast.error(error.response.data.message, {position: 'top'})
            // router.get('/')
        }
        loading.value = false
        console.error(error)
    }
}


const book = async () => {
    try {
        loading.value = true;
        if (user.value === '' || user.value === null || user.value === undefined) {

            register();
            loading.value = false;
            return
        }

        if (user.value.role !== 'customer') {
            $toast.error("You are not a customer!", {position: 'top'})
            loading.value = false;

            return;
        }
        if (rental_terms.value !== true) {
            $toast.error("Please Approve on the rental terms !", {position: 'top'})
            loading.value = false;

            return;
        }

        bookingForm.id = id.value;
        bookingForm.pickupLoc = form.pickupLoc;
        bookingForm.date_from = form.date_from;
        bookingForm.date_to = form.date_to;
        bookingForm.time_from = form.time_from;
        bookingForm.time_to = form.time_to;
        bookingForm.currency = currency.value;

        const resposne = await axios.post("/book/vehicles", form.data());
        if (resposne.status) {
            $toast.success("Thank You for your payment!", {position: 'top', duration: 1000})
            $toast.success("Your Booking has been placed successfully", {position: 'top'})
            window.location.href = '/my-profile'
            loading.value = false;
        }
    } catch (e) {
        loading.value = false;

        $toast.error(e.response.data.message, {position: 'top'})
    }
};

const search = () => {
    getVehicle();
};

const register = async () => {
    loading.value = true

    if (RegisterForm.gender === undefined || RegisterForm.gender === null || RegisterForm?.gender?.length === 0) {
        $toast.error("Please Select Mr/Mrs", {position: 'top'});
        loading.value = false
        return;
    }
    if (RegisterForm.name === undefined || RegisterForm.name === null || RegisterForm?.name?.length === 0) {
        $toast.error("Please Insert valid Name", {position: 'top'});
        loading.value = false
        return;
    }
    if (RegisterForm.email === undefined || RegisterForm.email === null || RegisterForm?.email?.length === 0) {
        $toast.error("Please Insert valid Email", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.phone === undefined || RegisterForm.phone === null || RegisterForm?.phone?.length === 0) {
        $toast.error("Please Insert valid Phone number", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.mobile_code === undefined || RegisterForm.mobile_code === null || RegisterForm?.mobile_code?.length === 0) {
        $toast.error("Please Insert valid Phone number", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.country === undefined || RegisterForm.country === null || RegisterForm?.country?.length === 0) {
        $toast.error("Please Insert Select Country", {position: 'top'});
        loading.value = false

        return;
    }
    if (RegisterForm.password === undefined || RegisterForm.password === null || RegisterForm?.password?.length === 0) {
        $toast.error("Please Insert valid Password", {position: 'top'});
        loading.value = false

        return;
    }
    try {
        RegisterForm.name = RegisterForm.gender + ' ' + RegisterForm.name
        const response = await axios.post('/post/user/data', RegisterForm.data())
        if (response.data.status) {
            $toast.success('You Have Successfully Registered', {position: 'top'})
            setTimeout(function () {
                window.location.reload()
            }, 1000)
        }
    } catch ($error) {
        loading.value = false
        $toast.error($error.response.data.message, {position: 'top'})
    }
}

const fetchCountries = async () => {
    countries.loading.value = true;
    try {
        //
        const response = await axios.get('https://countriesnow.space/api/v0.1/countries', {})
        countries.all.value = response.data.data
        countries.list.value = countries.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item.country}`,
            iso: `${item.iso2}`
        }))
    } catch (error) {
        console.error(error)
    } finally {
        countries.loading.value = false;
    }
}

const disabledDate = (time) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0)
    return time < date
}

onMounted(() => {
    currency.value = localStorage.getItem('currency') ?? 'USD'
    setParams();
    fetchCountries()
    getUser()
    // fetchVehicles();
})

</script>

<style scoped>
li::before {
    display: none;
}

.item-list {
    display: grid;
    align-items: flex-end;
    padding: 20px;
    background: #ffffff;
    border: solid 1px #dddddd;
    box-shadow: 3px 3px 9px rgba(164, 164, 186, 0.2);
    border-radius: 6px;
}

.scv-badge.badge-white {
    display: flex;
    min-width: 10px;
    padding: 2px 6px 3px 3px;
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

.el-popper.is-dark {
    box-shadow: 5px 5px rgba(189, 189, 189, 0.49);
    background: #ffffff !important;
    color: black;
    border-color: rgba(0, 0, 0, 0.49);
    border-width: 2px;
    border-radius: 12px;
    font-weight: 500;
    text-wrap: balance;
    font-size: .5vw;
    inset: -30px auto auto -300px !important;
}

.el-popper__arrow {
    top: 90% !important;
    left: 130px !important;
    transform: translate(0px, 0px);
    display: none !important;
}
@media screen  and (min-width: 1000px){


    .web-card {
        display: block;
    }
    .mobile-card {
        display: none;
    }

}

@media screen  and (max-width: 999px){

    .web-card{
        display: none;
    }
    .mobile-card {
        display: block;

    }

}

@media  (max-width: 768px) {
    .steps{
        margin-top: -100px
    }
}
.stepper {
    display: flex;
    flex-direction: column;
}

@media (min-width: 768px) {
    .stepper {
        flex-direction: row;
    }
}

.step {
    position: relative;
    background-color: #f9d602;
    color: #000;
    padding: 12px 16px;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
}

.step:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 10px solid #f9d602;
    z-index: 1;
}

@media (max-width: 767px) {
    .step:not(:last-child)::after {
        right: 50%;
        top: 100%;
        transform: translateX(50%);
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-top: 10px solid #f9d602;
    }
}

.step.active-step {
    background-color: rgb(155, 147, 84);
}


@media (max-width: 767px) {
    .step.active-step::after {
        border-top-color: rgb(155, 147, 84);
    }
}

</style>
