<template>

  <div v-if="isOpen" class="modal-mask">
    <div class="modal-wrapper" @click="$emit('close')">
      <div class="modal-container" style="margin: 15px 15px 150px 20% !important;" ref="target">
        <div class="modal-header">
          <slot name="header">Parent Companies</slot>
        </div>
        <div class="modal-body overflow-y-auto" style="max-height: 50%">
          <label>Select Parent Company: </label>
          <select
              v-model="selectedParent"
              size="large"
              class="form-select col-md-3"
              required>
            <option
                style="z-index: 0"
                v-for='item in filterTableData'
                class="form-group"
                :value="item.id"
            >
              {{ item.name }}
            </option>
          </select>

        </div>
        <div class="modal-footer">
          <slot name="footer">
            <div>
              <button class="btn btn-primary" @click="assignParent()">Submit</button>
            </div>
            <div>
              <button class="btn btn-danger" @click="closeModal()">Cancel</button>
            </div>
          </slot>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h2 class="mb-4">All Companies</h2>
      <div class="card">
        <div class=" d-flex justify-content-center col-md-12">
          <el-table :data="filterTableData" style="width: 100%" :loading="loading" stripe>
            <el-table-column label="Branch Name" prop="name"/>
            <el-table-column label="Country" prop="country"/>
            <el-table-column label="Address" prop="address"/>
            <el-table-column label="Email" prop="email"/>
            <el-table-column label="Parent Company" prop="parent.name"/>
            <el-table-column label="Role" prop="role">
              <template #default="scope">
                <button :class=" scope.row.role === 'under_review' ? 'btn btn-primary' : 'btn btn-success'" onclick="() => e.preventDefault()">{{scope.row.role}}</button>
              </template>
            </el-table-column>

            <el-table-column align="right">

              <template #header>
                <el-input v-model="search" size="small" placeholder="Type to search"/>
              </template>

              <template #default="scope">
                <el-button
                    size="small"
                    type="primary"
                    @click="selectParent(scope.row.id)"
                >Assign Parent
                </el-button>
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


const assignParent = async (index, row) => {
  try {
    loading.value = true;
    form.selectedCompany = selectedCompany.value
    form.parentCompany = selectedParent.value
    const response = await axios.post('/assign-parent', form);
    if (response.data.success) {
      isOpen.value = false
      $toast.success('parent has been assigned successfully', {position: "top"})
    }
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
