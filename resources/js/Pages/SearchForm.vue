<template>
    <div  class="justify-content-center" style="background: #f9d602; height: 280px">
<loader v-if="loading" />
            <form v-if="!loading" class="trip-form  d-flex  search-form " @submit.prevent="search"  style="max-width: 70%; top: 25%; left: 12%; ">
                <div class="row align-items-center w-100 d-flex " style="margin-left: 5%;">

                    <div class="row">
                    <div class=" date-range-alert-danger danger  display-none col-4 offset-4" > <li>Please Select Date Range</li></div>
                    <div class="danger pickup-location-alert-danger display-none col-5"> <li> Please select Location  </li> </div>
                    </div>
                    <div class="  col-md-3">
                        <el-select
                            v-model="location"
                            size="large"
                            filterable
                            class="col-md-10"
                            remote
                            reserve-keyword
                            placeholder="Pickup..."
                            remote-show-suffix
                        >
                            <el-option
                                v-for="location in locations.all.value"
                                @click=""
                                aria-required="true"
                                :key="location"
                                :label="location"
                                :change="showAlert()"
                                :value="location"
                            />
                        </el-select>

                    </div>
                    <div class=" col-md-5" >
                        <div class="form-control-wrap col-md-10">
                            <el-date-picker
                                v-model="date"
                                type="daterange"
                                range-separator="TO"
                                start-placeholder="Start date"
                                end-placeholder="End date"
                                size="large"
                                required="true"
                                :change="showAlert()"
                                format="YYYY/MM/DD"
                                value-format="YYYY-MM-DD"
                            />

                        </div>
                    </div>
                    <div class=" col-md-2" >
                        <input type="submit" value="Search" class="btn btn-fullwidth rounded-3" style=" padding:9px 25px; background: #0a3622; color: #f9d602;"/>
                    </div>

                </div>


            </form>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import {useForm, Link} from '@inertiajs/vue3';
import Loader from '../components/Loader.vue'
const form = useForm({
    pickupLoc: '',
    date: '',
    currency: ''
});
const logos = ref({})
const date = ref('')
const countries = ref('')
const location = ref('')
const locations = {
    all: ref([]),
    options: ref([]),
    loading: ref(false),
}
const loading = ref(false);
var field = ''
const vehicles = ref([])

const getLogos = async () => {
    try {
        loading.value = true
        const response = await axios.get('get/logos')
        logos.value = response.data
        loading.value = false

    } catch (error) {
        console.error(error)
    }
}
const fetchCountries = async () => {
    countries.loading.value = true;
    loading.value = true

    try {
        const response = await axios.get('https://api.countrystatecity.in/v1/countries', {
            headers: {
                'X-CSCAPI-KEY': 'NVZhakViaFdtOXBJZ0xoQW1lWkJGTmlGUW1Kb05XaElGbXhocnNNOA=='
            }
        })
        countries.all.value = response.data
        countries.list.value = countries.all.value.map((item) => ({
            id: `${item.id}`,
            label: `${item.name}`,
            iso: `${item.iso2}`
        }))
        loading.value = false
    } catch (error) {
        console.error(error)
    } finally {
        countries.loading.value = false;
    }
}
const getVehicles = async () => {
    try {
        loading.value = true

        const response = await axios.get('get/vehicles')
        vehicles.value = response.data
        loading.value = false
    } catch (error) {
        console.error(error)
    }
}

const getLocations = async () => {
    locations.loading.value = true;
    loading.value = true

    try {
        const response = await axios.get('/get/locations')
        locations.all.value = Object.values(response.data)
        console.log(locations)
        loading.value = false
    } catch (error) {
        console.error(error)
    } finally {
        locations.loading.value = false;
    }
}

const remoteLocations = (query) => {
    if (query) {
        locations.loading.value = true
        loading.value = true

        setTimeout(() => {
            locations.loading.value = false
            locations.options.value = locations.all.value.filter((item) =>
                item.toLowerCase().includes(query.toLowerCase())
            )
        }, 200)

        loading.value = false

    } else {
        locations.options.value = [];
    }
}

const search = () => {
    loading.value = true
    form.pickupLoc = location.value
    form.date = date.value
    form.currency = localStorage.getItem('currency') ?? 'USD'

    if(date.value == [] || date.value ===null) {
        $('.date-range-alert-danger').show()
        loading.value = false
        return;
    }



    if (location.value == null || location.value == []) {
        loading.value = false
        $('.pickup-location-alert-danger').show()
        return;
    }
    form.post('search/vehicles');
    loading.value = false
}
const showAlert = () =>{
    if(date.value != [] && date.value != null)
        $('.date-range-alert-danger').hide()

    if(location.value != [] && location.value != null)

        $('.pickup-location-alert-danger').hide()

}
onMounted(() => {
    getLocations();
    getVehicles();
    getLogos();
})


</script>

<style lang="scss" scoped>
@import '../../css/custom.css';

#banner {
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba($color: #000000, $alpha: .5);
    }
}

header {
    width: 100%;
    position: static;
    background: transparent;
    margin: 0;
    border-bottom: none;
}

.trip-form {
    border-radius: 7px;
    padding: 40px;
    background: #fff;
    position: relative;
    z-index: 3;
    -webkit-box-shadow: 0 15px 30px 0px rgba(0, 0, 0, 0.1);
    box-shadow: 0 15px 30px 0px rgba(0, 0, 0, 0.1);
}

$easing: cubic-bezier(0.680, -0.550, 0.265, 1.550);
$color: white;

.acc {
    .wrapper {
        width: 400px;
        margin: 0 auto;
        background: white;
        border-radius: 4px;
        position: relative;
        box-shadow: 0px 2px rgba(0, 0, 0, 0.12);

        p {
            display: block;
            margin-block-start: 1em;
            margin-block-end: 1em;
            margin-inline-start: 0px;
            margin-inline-end: 0px;
            transition: all .3s ease;
        }

        label {
            display: block;
            position: relative;
            color: #b5abab;
            overflow: hidden;
            cursor: pointer;
            height: 56px;
            -webkit-transition: text-indent 0.2s;
            text-indent: 20px;
            padding-top: 1px;
        }

        ul {
            margin: 0;
            padding: 0;
        }

        li {
            color: white;
            list-style-type: none;

            a {
                display: block;
                width: 100%;
                padding: 15px 0px;
                text-decoration: none;
                color: #434447;
                border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }

            a:hover {
                background-color: rgba(0, 0, 0, 0.06);
            }
        }

        label:hover {
            background: rgba(244, 216, 73, 0.5) !important;
            color: #434447;

            p {
                transform: translateX(20px);
            }
        }

        input[type="checkbox"] {
            display: none;
        }

        span {
            height: 3px;
            position: absolute;
            width: 0px;
            display: block;
            top: 58px;
            background: #f4d849;
        }

        .content {
            height: 0;
            background: rgba(244, 216, 73, 0.7);
            height: 300px;
            position: relative;
            border-top: 2px solid rgba(0, 0, 0, 0.12);
            top: 4px;
        }

        .lil_arrow {
            width: 5px;
            height: 5px;
            -webkit-transition: transform 0.8s;
            transition: transform 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-top: 2px solid rgba(0, 0, 0, 0.33);
            border-right: 2px solid rgba(0, 0, 0, 0.33);
            float: right;
            position: relative;
            top: -30px;
            right: 27px;
            transform: rotate(45deg)
        }

        input[type="checkbox"]:checked + label > .content {
            display: block;
        }

        input[type="checkbox"]:checked + label > span {
            display: none;
        }

        input[type="checkbox"]:checked + label > .lil_arrow {
            -webkit-transition: transform 0.8s;
            transition: transform 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
            transform: rotate(135deg)
        }

        input[type="checkbox"]:checked + label {
            display: block;
            background: rgba(244, 216, 73, 0.5) !important;
            color: #434447;
            text-indent: 30px;
            height: 275px;
            -webkit-transition: height 0.8s;
            transition: height 0.8s;
            -webkit-transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        label:hover > span {
            width: 100%;
            -webkit-transition-timing-function: $easing;
            transition: width 0.4s;
        }

        input[type='checkbox']:not(:checked) + label {
            display: block;
            -webkit-transition: height 0.8s;
            -moz-transition: height 0.8s;
            transition: height 0.8s;
            height: 60px;
            -webkit-transition-timing-function: $easing;
        }
    }
}

::-webkit-scrollbar {
    display: none;
}

// images

@mixin mQ($px) {
    @media screen and (max-width: $px) {
        @content;
    }
}

section {
    display: grid;
    grid-template-columns:25% 30% 15% 25%;
    gap: 15px;
    place-content: center;
    grid-template-rows: 50% 50%;
    height: 80vh;
    min-height: 460px;
    padding: max(2vh, 1.5rem);

    img {
        width: 100%;
        display: block;
        height: 100%;
        object-fit: cover;
    }

    h2 {
        color: white;
        font-size: clamp(1rem, 0.8750rem + 0.6250vw, 1.5rem);
        line-height: 1.3;
        font-weight: 700;
    }

    @include mQ(690px) {
        height: 65vh;
    }

    @include mQ(470px) {
        grid-template-columns:repeat(2, 1fr);
        grid-template-rows: repeat(3, 35%);
    }

    .card {
        border-radius: 25px;
        box-shadow: -2px 4px 15px rgb(0 0 0 / 26%);

        @include mQ(470px) {
            grid-column: span 1;
        }

        &:nth-child(2) {
            grid-column: 2/3;
            grid-row: span 2;

            @include mQ(690px) {
                grid-column: span 1;
                grid-row: span 1;
            }
        }

        &:nth-child(3) {
            grid-column: span 2;

            @include mQ(690px) {
                grid-column: 2/4;
                grid-row: 1/2;
            }
        }

        @include mQ(690px) {
            &:nth-child(6) {
                grid-column: 2/4;
                grid-row: 2/3;
            }
        }

        @include mQ(470px) {

            &:nth-child(5) {
                grid-column: span 2;
            }
        }

        p {
            font-size: clamp(0.9rem, 0.8750rem + 0.1250vw, 1rem);
            line-height: 1.4;
        }


        img {
            border-radius: 25px;
        }

        .card__img {
            position: relative;
            height: 100%;

            .card__overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                content: "";
                color: #fff;
                padding: clamp(0.938rem, 5vw, 1.563rem);
                background: rgb(2, 2, 46);
                background: linear-gradient(0deg, rgb(0 0 0 / 57%) 0%, rgb(255 255 255 / 0%) 100%);
                width: 100%;
                height: 100%;
                border-radius: 25px;
                display: flex;
                justify-content: flex-end;
                flex-direction: column;
            }

            span {
                position: absolute;
                top: 25px;
                left: min(2vmax, 1.563rem);
                color: #ff7b29;
                background: #fff;
                border-radius: 50px;
                padding: 2px 8px 2px 6px;
                display: flex;
                box-shadow: 0px 1px 20px #0000002b;

                @include mQ(690px) {
                    top: 20px;
                }

                @include mQ(470px) {
                    top: 15px;
                }

                svg {
                    fill: #ff7b29;
                    width: 20px;
                    margin-right: 2px;
                }
            }
        }
    }
}

.danger{
    color: red;
}
</style>
