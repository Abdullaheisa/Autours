<template>
    <div class="card">
        <div class="card-body">
            <div class="formbold-main-wrapper">
                <div class="card shadow mb-4 w-75">
                    <div class="card-header py-3">
                        <h4 class="m-0 font-weight-bold text-primary">Membership</h4>
                    </div>
                    <div class="card-body">
                        <div class="text-center">

                            <button v-if="role === 'supplier'" @click="request()" class="btn btn-danger btn-icon-split">
                            <span class="icon text-white-50 d-flex align-items-center">
                                <i class="fas fa-question"></i>
                            </span>
                                <span class="text">Request Activation</span>
                            </button>

                            <button v-else-if="role === 'under_review'" class="btn btn-warning btn-icon-split">
                            <span class="icon text-white-50 d-flex align-items-center">
                                <i class="fas fa-exclamation-triangle"></i>
                            </span>
                                <span class="text">Under review</span>
                            </button>

                            <button v-else-if="role === 'active_supplier'" class="btn btn-success btn-icon-split">
                            <span class="icon text-white-50 d-flex align-items-center">
                                <i class="fas fa-check"></i>
                            </span>
                                <span class="text">You are an active supplier</span>
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'

const role = ref('')

const open = () => {
    ElMessage({
        showClose: true,
        message: 'Your request was sent successfully.',
        type: 'success',
    })
}

const getRole = async () => {
    try {
        const response = await axios.get('get/user/role');
        role.value = response.data;
    } catch (error) {
        console.error(error);
    }
}

const request = async () => {
    try {
        const response = await axios.post('post/request');
    } catch (error) {
        console.error(error);
    } finally {
        open();
        getRole();
    }
}

onMounted(() => {
    getRole();
})

</script>
