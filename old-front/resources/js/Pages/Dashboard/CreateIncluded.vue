<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Create Promo</h2>
            <div class="card">
                <div class="card-body">
                    <form @submit.prevent="postData">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="formbold-form-label"> What is included? (Promo Title) </label>
                                <el-input v-model="form.included" required placeholder="e.g. Free Cancellation"/>
                            </div>
                        </div>
                        <div class="text-center mt-5">
                            <button type="submit" class="btn btn-primary" :disabled="loading">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast();
const loading = ref(false)

const form = ref({
    included: '',
})

const postData = async () => {
    try {
        loading.value = true;
        const formData = new FormData();
        formData.append('included', form.value.included);
        
        const response = await axios.post('/post/included', formData);
        
        if(response.data.status) {
            $toast.success('Successfully Added', {position: 'top'})
            form.value.included = '';
        } else {
            $toast.error('Failed to add promo', {position: 'top'})
        }
    } catch (error) {
        console.error(error);
        $toast.error('An error occurred', {position: 'top'})
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
.mb-4 {
    margin-bottom: 1.5rem;
}
.mb-3 {
    margin-bottom: 1rem;
}
</style>
