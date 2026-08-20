<template>
    <div class="card">
        <div class="card-body">
            <h2 class="mb-4">Select Company</h2>
            <div class="card">
                <div class=" d-flex justify-content-center ">
                    <div v-for="company in tableData">
                        <div class="profile_avatar mr-5">
                            <a class="btn text-nowrap logo-img" @click="changeCompany(company.id)">
                                <img width="200" height="100" :src="'/img/' + company.logo"/>
                            </a>
                            <h5>{{ company.name }}</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {useForm} from '@inertiajs/vue3';
import {onMounted, computed, ref} from 'vue'

import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const search = ref('')
const tableData = ref([])
const loading = ref(false)
const isOpen = ref(false)
const $toast = useToast()
const selectedCompany = ref()
const selectedParent = ref()
const form = useForm({
    parentCompany: '',
    selectedCompany: ''
});
const selectParent = (selectedCompanyId) => {
    selectedCompany.value = selectedCompanyId
    isOpen.value = true
}
const getData = async () => {
    try {
        loading.value = true;
        const response = await axios.get('/get/companies');
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}

const filterTableData = computed(() => {
        return tableData.value.filter((data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase()))
    }
)


const changeCompany = async (companyId) => {
    try {
        loading.value = true;
        form.selectedCompany = companyId
        const response = await axios.post('/change-company', form);
        if (response.data.success) {
            $toast.success('parent has been assigned successfully', {position: "top"})
        }
        window.location.href = '/company'
        await getData()
        tableData.value = response.data;
    } catch (error) {
        console.error(error);
    } finally {
        loading.value = false;
    }
}


onMounted(() => {
        getData()
    }
)

const closeModal = () => {
    isOpen.value = false;
}
</script>
<style>

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
</style>
