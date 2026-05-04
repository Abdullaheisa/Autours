<template>
    <header-one/>

<body>
    <div id="wrapper">
        <!-- content begin -->
        <div class="no-bottom no-top" id="content">
            <div id="top"></div>
            <section id="section-hero" aria-label="section" class="jarallax login-section" style="background: url(images/background/2.jpg);">

                <div class="v-center">
                    <div class="container">
                            <div class="row align-items-center">
                                <div class="col-lg-4 offset-lg-4">
                                    <div class="padding40 rounded-3 shadow-soft" style="background: #ffffff; border-radius: 10px;">
                                        <h4>Login</h4>
                                        <div class="spacer-10"></div>
                                        <form class="form-border" @submit.prevent="login">
                                            <div class="field-set mb-2">
                                                <input v-model="form.email" type="email" class="formbold-form-input" placeholder="Email"  required />
                                            </div>
                                            <div class="field-set mb-2">
                                                <input v-model="form.password" type="password" class="formbold-form-input" placeholder="Password" required />
                                            </div>
                                            <div id="submit">
                                                <input type="submit" class="btn-main btn-fullwidth rounded-3">
                                            </div>
                                        </form>
                                        <div class="title-line">Or&nbsp;sign&nbsp;up&nbsp;with</div>
                                        <div class="row g-2">
                                            <div class="col-lg-6">
                                                <a class="btn-sc btn-fullwidth mb10 d-flex justify-content-center" href="#"><img src="images/svg/google_icon.svg" alt="">Google</a>
                                            </div>
                                            <div class="col-lg-6">
                                                <a class="btn-sc btn-fullwidth mb10 d-flex justify-content-center" href="#"><img src="images/svg/facebook_icon.svg" alt="">Facebook</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>
            </section>
        </div>
        <!-- content close -->
    </div>
</body>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';
import HeaderOne from "../../components/HeaderOne.vue";

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
