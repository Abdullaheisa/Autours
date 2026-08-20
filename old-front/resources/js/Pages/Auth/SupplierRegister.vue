<template>
    <header-one/>

    <body>
    <div id="wrapper">
        <!-- content begin -->
        <div class="no-bottom no-top" id="content">
            <div id="top"></div>

            <!-- section begin -->
            <section id="subheader" class="jarallax text-light">
                <img src="/images/background/subheader.jpg" class="jarallax-img" alt=""
                    style="
                    object-fit: cover;
                    object-position: 50% 50%;
                    max-width: none;
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    overflow: hidden;
                    pointer-events: none;
                    transform-style: preserve-3d;
                    backface-visibility: hidden;
                    will-change: transform, opacity;
                    margin-top: 161.5px;
                    transform: translate3d(0px, -161.5px, 0px);">
                    <div class="center-y relative text-center">
                        <div class="container">
                            <div class="row">
                                <div class="col-md-12 text-center">
									<h1>Supplier Register</h1>
                                </div>
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
            </section>
            <!-- section close -->


            <section aria-label="section">
                <div class="container">
					<div class="row">
						<div class="col-md-8 offset-md-2">
							<h3>Wants to join us? Register now.</h3>
                        	<div class="spacer-10"></div>

							<form class="form-border" @submit.prevent="postUserData">

                                <div class="row">

                                    <div class="col-md-6">
                                        <div class="field-set">
                                            <label>Name:</label>
                                            <input v-model="form.name" type="text" class="formbold-form-input" required />
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="field-set">
                                            <label>Email Address:</label>
                                            <input v-model="form.email" type="email" class="formbold-form-input" required />
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="field-set">
                                            <label>Phone:</label>
                                            <input v-model="form.phone" type='text' name='phone' id='phone' class="form-control">
                                        </div>
                                    </div>

                                    <div class="col-md-6">
                                        <div class="field-set">
                                            <label>Password:</label>
                                            <input v-model="form.password" type="password" class="formbold-form-input" required />
                                        </div>
                                    </div>

                                    <!-- <div class="col-md-6">
                                        <div class="field-set">
                                            <label>Re-enter Password:</label>
                                            <input type='text' name='re-password' id='re-password' class="form-control">
                                        </div>
                                    </div> -->


                                    <div class="col-md-12 mt-2">

                                        <div id='submit' class="pull-left">
                                            <input style="background-color: #6a64f1; color: white;" type='submit' id='send_message' value='Register Now' class="btn-main color-2">
                                        </div>

                                        <div id='mail_success' class='success'>Your message has been sent successfully.</div>
                                        <div id='mail_fail' class='error'>Sorry, error occured this time sending your message.</div>
                                        <div class="clearfix"></div>

                                    </div>

                                </div>
                            </form>

						</div>
                    </div>
				</div>
            </section>


        </div>
        <!-- content close -->

        <a href="#" id="back-to-top"></a>

    </div>

</body>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3';
import HeaderOne from "../../components/HeaderOne.vue";

const form = useForm({
    name: '',
    phone: '',
    email: '',
    password: '',
    supplier: 1,
});

const postUserData = () => {
    form.post('/post/user/data'), {
        onFinish: () => form.reset('password'),
    };
};
</script>

<style scoped>

#subheader h1 {
    font-family: 'Outfit';
    margin-top: 50px;
    margin-bottom: 10px;
    letter-spacing: -2px;
}

</style>
