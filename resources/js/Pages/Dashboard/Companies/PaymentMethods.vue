<template>
  <div class="card">
    <div class="card-body">
      <h2 class="mb-4">Payment Methods</h2>
      <div class="card">
        <div class=" d-flex justify-content-center col-md-12">
          <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
            <el-table-column label="Method Name" prop="name"/>
            <el-table-column label="Description" prop="description"/>
              <el-table-column label="Activation" prop="description">
                  <template #default="scope">
                      <el-checkbox
                          size="large"
                          type="primary"
                          v-model="scope.row.activation"
                          @click="activeMethod(scope.row.id)"
                      >
                      </el-checkbox>
                  </template>
              </el-table-column>


            <el-table-column align="right">

              <template #header>
                <el-input v-model="search" size="small" placeholder="Type to search"/>
              </template>

            </el-table-column>
          </el-table>
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

const form = useForm({
  parentCompany: '',
  selectedCompany: ''
});
const activeMethod = async (selectedMethodId) => {
    try {
        loading.value = true;
        const response = await axios.post('/payment_methods', {selectedMethodId: selectedMethodId});
        tableData.value = response?.data?.data?.payment_methods;
        $toast.success(response.data.message, {position: "top"})
    } catch (error) {
        console.log(error)
        if(error?.response?.status === 403) {
          $toast.error(error.response.data.message, {position: 'top'});
        }
    } finally {
        await getData();
        loading.value = false;
    }
}
const getData = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/get/payment_methods');
    tableData.value = response.data.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

const filterTableData = computed(() => {
      return tableData?.value?.filter((data) => !search.value || data.name.toLowerCase().includes(search.value.toLowerCase()))
    }
)





onMounted(() => {
      getData()
    }
)


</script>
