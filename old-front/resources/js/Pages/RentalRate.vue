<template>
    <div id="wrapper">
        <header-one/>
        <div class="no-bottom no-top zebra" id="content">
            <section class="h-100">
                <div class="container mt-5">
                    <h2 class="text-center">Thanks for renting your car via Autours!</h2>
                    <h3 class="text-center">How was your renting experience with us?</h3>

                    <div class="rental-info mt-4 mb-5">
                        <div>
                            <div>
                                <strong>Rental:</strong> <small>{{ rental?.order_number }}</small>
                            </div>
                            <strong>Rental date:</strong> <small>{{ rental?.start_date }} to {{
                                rental?.end_date
                            }}</small>
                        </div>
                        <div>
                            <strong>Car Model:</strong> <small>{{ rental?.vehicle?.name }}</small>
                        </div>
                        <div>
                            <strong>Company:</strong> <small>{{ rental?.supplier?.name }}</small>
                        </div>

                    </div>

                    <h4 class="text-center">Your feedback is valuable and will help us improve our services.</h4>

                    <div class="card border-dark rating-section mb-5">
                        <div class="card-body">

                            <h3 class="text-center">Please rate the following:</h3>
                            <div v-for="(question, index) in questions" :key="index" class="mb-5 ml-4">
                                <p style="font-size: 1.5vw; font-weight: 500;">{{ question.question }}</p>
                                <Rating class="offset-2" v-model="values[index]" @change="onChangeRate" :stars="10"
                                        :cancel="false">
                                    <template #onicon>
                                        <img src="https://media.lordicon.com/icons/wired/lineal/237-star-rating.svg"
                                             height="50" width="50"/>
                                    </template>
                                    <template #officon>
                                        <img src="https://www.svgrepo.com/show/418551/star-rating.svg" height="50"
                                             width="50"/>
                                    </template>
                                </Rating>
                            </div>
                            <div class="row">
                                <p style="font-size: 1.5vw; font-weight: 600; margin-left: 2%;">Comment</p>
                                <textarea id="comment" class="col-md-8 ml-4 form-control" rows="5" v-model="comment"
                                          placeholder="Leave any comment here!"/>
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-primary btn-submit" @click="submitReview">Submit my Review</button>
                </div>
            </section>
        </div>
    </div>
    <Footer/>

</template>

<script setup>
import {onMounted, ref} from 'vue';
import Rating from 'primevue/rating';
import {useForm} from "@inertiajs/vue3";
import HeaderOne from '../components/HeaderOne.vue';
import Footer from "../components/Footer.vue";
import axios from 'axios'; // Ensure axios is imported for API calls
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast();

const values = ref([]);
const loading = ref(false);
const comment = ref("");
const form = useForm({});
const id = ref(null);
const key = ref(null);
const rental = ref(null);
const questions = ref([]);

const onChangeRate = () => {
    console.log("Rating changed!");
};

const submitReview = async () => {
    try {
        const validated = values.value.filter(el => el !== -1 )
        if(validated.length <= 0 ) {
            $toast.error("Please fill all questions", {position: "top"})
            return
        }
        const response = await axios.post('/rating', {id: id.value, rates: values.value, comment: comment.value});

        if (response.status) {
            $toast.success("Thanks you for your review!", {position: "top"})
        }
    } catch (e) {
        $toast.error(e.response.data.message, {position:"top"});
    }
}
const getRatingQuestions = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/get/rating/questions', {params: {id: id.value,key: key.value}});
        questions.value = response.data.data.questions;
        rental.value = response.data.data.rental;
        values.value = Array(questions.value.length).fill(-1);

    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    let params = new URLSearchParams(document.location.search);
    id.value = params.get('id');
    key.value = params.get('key');
    getRatingQuestions();
});
</script>

<style scoped>
#content {
    padding: 20px;
}

.rental-info {
    background: #f8f9fa; /* Light background color for contrast */
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.rating-section {
    margin-top: 30px;
}

.btn-submit {
    display: block;
    margin: 0 auto; /* Center the button */
    padding: 10px 20px; /* Larger clickable area */
    font-size: 18px; /* Larger font size for better readability */
    border-radius: 5px; /* Rounded edges for the button */
}

.text-center {
    text-align: center;
}
</style>
