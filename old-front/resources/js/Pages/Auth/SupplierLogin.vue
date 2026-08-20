<template>
    <header-one/>

    <body>
    <div id="wrapper">
        <!-- content begin -->
        <div class="no-bottom no-top" id="content">
            <div id="top"></div>
            <section id="section-hero" aria-label="section" class="jarallax login-section"
                     style="background: url(/images/background/2.jpg);">
                <div class="v-center">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-lg-4 offset-lg-4">
                                <div class="padding40 rounded-3 shadow-soft"
                                     style="background: #ffffff; border-radius: 10px;">
                                    <h4> Login</h4>
                                    <div class="spacer-10"></div>
                                    <form class="form-border" @submit.prevent="login">
                                        <div class="field-set mb-2">
                                            <input v-model="form.email" type="email" class="formbold-form-input"
                                                   placeholder="Email" required/>
                                        </div>
                                        <div class="field-set mb-2">
                                            <input v-model="form.password" type="password" class="formbold-form-input"
                                                   placeholder="Password" required/>
                                        </div>
                                        <div id="submit">
                                            <input style="background-color: #6a64f1; color: white;" type="submit"
                                                   class="btn-main btn-fullwidth rounded-3">
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <!-- content close -->
    </div>
    <Footer/>
    </body>
</template>

<script setup>
import {useForm} from '@inertiajs/vue3';
import HeaderOne from "../../components/HeaderOne.vue";
import Footer from "../../components/Footer.vue";

const form = useForm({
    email: '',
    password: '',
    remember: false,
});

const login = () => {
    form.post('/login'), {
        onFinish: () => form.reset('password'),
    };
};
</script>
