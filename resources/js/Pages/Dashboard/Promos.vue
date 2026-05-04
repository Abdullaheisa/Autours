<template>
  <div class="card">
    <div class="card-body">
      <h2 class="mb-4">Promos</h2>
      <div class="card">
        <div class="card-body">
          <el-table :data="filterTableData" :loading="loading" stripe>
            <el-table-column label="Select Promotion">
              <template #default="scope">
                <input :disabled="promos.indexOf(scope.row.id) > -1" type="radio" :value="scope.row.id" v-model="selectedIncluded"/>
              </template>
            </el-table-column>
            <el-table-column label="What is included?" prop="what_is_included"/>
            <el-table-column label="Is Promoted ?">
              <template #default="scope">
                {{promos.indexOf(scope.row.id) > -1 ? 'Promoted' : 'Not Promoted'}}
              </template>
            </el-table-column>
            <el-table-column align="center">
              <template #header>
                <el-input v-model="search" size="small" placeholder="Type to search"/>
              </template>
            </el-table-column>
            <el-table-column >
              <template #default="scope">
                <button v-if="promos.indexOf(scope.row.id) > -1" class="btn btn-danger" @click="deletePromo(scope.row.id)"> Remove promo</button>
              </template>
            </el-table-column>

          </el-table>


        </div>
      </div>
      <div v-if="selectedIncluded">
        <hr/>
        <h2>Select Vehicle</h2>
        <div class="card">

          <div class="row p-3">
            <div class="formbold-mb-3 col-md-2">
              <label class="formbold-form-label">Country</label>
              <el-select
                  v-model="country"
                  size="large"
                  filterable
                  remote
                  reserve-keyword
                  placeholder="Countries..."
                  remote-show-suffix
                  :loading="countries.loading.value"
                  v-on:change="getBranches()"
                  required>
                <el-option
                    v-for="item in countries.list.value"
                    :key="item.id"
                    :label="item.label"
                    :value="item.label"
                />
              </el-select>
            </div>
            <div class="formbold-mb-3 col-md-2">
              <label class="formbold-form-label">Branches</label>
              <el-select
                  v-model="branch"
                  size="large"
                  filterable
                  remote
                  reserve-keyword
                  v-on:change="getVehicles()"
                  placeholder="Branches..."
                  remote-show-suffix
                  :loading="branches.loading.value"
                  required>
                <el-option
                    v-for="item in branches.list.value"
                    :key="item.id"
                    :label="item.label"
                    :value="item.id"
                />
              </el-select>
            </div>
            <div class="formbold-mb-3 col-md-2">
              <label class="formbold-form-label">Vehicles</label>
              <el-select
                  v-model="selectedVehicles"
                  size="large"
                  filterable
                  remote
                  multiple
                  reserve-keyword
                  placeholder="Vehicles..."
                  remote-show-suffix
                  :loading="vehicles.loading.value"
                  required>
                <el-option
                    v-for="item in vehicles.list.value"
                    :key="item.id"
                    :label="item.label"
                    :value="item.id"
                >
                  <div class="d-flex" style="gap:10px;">
                    <img :src="'img/vehicles/' + item.photo" style="width:50px;">
                    {{ item.label }}
                  </div>
                </el-option>
              </el-select>
            </div>
            <div class="mt-4 col-md-1">
              <button class="mt-2 btn btn-primary col-md-12" type="button" @click="getVehiclesData">Search</button>
            </div>
          </div>
          <hr/>
          <div class="card-body">
            <el-table :data="vehicleFilterTableData" style="width: 100%" :loading="loading" stripe>
              <el-table-column label="What is included?" prop="what_is_included">

                <template #default="scope">
                  <el-checkbox :value="scope.row.id" @click="selectVehicle(scope.row.vehicle_id)"/>
                </template>
              </el-table-column>
              <el-table-column label="Photo" prop="">
                <template #default="scope">
                  <img :src="'/img/vehicles/' + scope.row.photo" width="150" height="100">
                </template>
              </el-table-column>
              <el-table-column label="Vehicle Name" prop="vehicle_name"/>
              <el-table-column label="Country" prop="branch_country"/>
              <el-table-column label="Branch Name" prop="branch_name"/>
            </el-table>

          </div>
        </div>

        <button class="btn btn-primary" @click="AddPromo()"> Add Promo</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, onMounted, ref} from 'vue'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast();
const search = ref('')
const tableData = ref([])
const vehicleTableData = ref([])
const loading = ref(false)

const selectedIncluded = ref("")
const selectedVehicles = ref([])
const promos = ref([])
const countries = {
  loading: ref(false),
  all: ref([]),
  list: ref([]),
  options: ref([]),
};
const suppliers = {
  loading: ref(false),
  all: ref([]),
  list: ref([]),
  options: ref([]),
};
const branches = {
  loading: ref(false),
  all: ref([]),
  list: ref([]),
  options: ref([]),
};
const vehicles = {
  loading: ref(false),
  all: ref([]),
  list: ref([]),
  options: ref([]),
};
const branch = ref('')
const country = ref('')
const supplier = ref('')
const getData = async () => {
  try {
    loading.value = true;
    const response = await axios.get('get/included');
    tableData.value = response.data;
    console.log(response.data)
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

const deletePromo = async (promo) => {
  const response = await axios.delete('/promo/'+ promo);
  window.location.reload()
}

const AddPromo = async () => {
  try {
    if (selectedIncluded.value === [] || selectedIncluded.value === undefined || selectedIncluded.value === null) {
      $toast.error("Please select promo first form whats included", {position: "top"})
      return
    }
    if (selectedVehicles.value.length === 0) {
      $toast.error("Please select Vehicles to apply the promo on", {position: "top"})
      return
    }
    const formData = new FormData();
    formData.set("included_id", selectedIncluded.value)
    formData.set("selected_vehicles", selectedVehicles.value)

    const response = await axios.post('/promo', formData);
    window.location.reload()

    console.log(response)
  } catch (e) {
    $toast.error("something went wrong")
    console.error(e)
  }
}
const selectVehicle = (vehicle) => {
  console.log(vehicle)
  if (selectedVehicles.value?.indexOf(vehicle) >= 0) {
    selectedVehicles.value.splice(selectedVehicles.value.indexOf(vehicle), 1);
  } else {
    selectedVehicles.value.push(vehicle);
  }
  console.log(selectedVehicles.value)
}

const filterTableData = computed(() => {
      if (typeof search.value === 'string')
        return tableData.value.filter((data) => !search.value || data.what_is_included != undefined || data.what_is_included.toLowerCase().includes(search.value.toLowerCase()))
      else search.value = ''
    })
const vehicleFilterTableData = computed(() => {

  const dataArray = Array.isArray(vehicleTableData.value) ? vehicleTableData.value : [];

  return dataArray.filter((data) =>
      !search.value
      || !country.value
      || (data.vehicle_name && data.vehicle_name.toLowerCase().includes(search.value.toLowerCase()))
      || (data.vehicle_name && data.vehicle_name.toLowerCase().includes(country.value.toLowerCase()))
      || (data.branch_name && data.branch_name.toLowerCase().includes(search.value.toLowerCase()))
      || (data.branch_country && data.branch_country.toLowerCase().includes(search.value.toLowerCase()))
  );

})
const getPromos = async () => {
  try {
    loading.value = true
    const response = await axios.get('/promo');
    console.log(response.data)
    promos.value = response.data
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}
const getVehiclesData = async (index) => {
  try {
    loading.value = true
    const params = {};
    if (country.value) params.country = country.value
    if (supplier.value) params.supplier = supplier.value
    if (branch.value) params.branch = branch.value
    if (selectedVehicles.value) params.selectedVehicles = selectedVehicles.value

    const response = await axios.get('/get/profit', {params: params});
    vehicleTableData.value = response.data.data
    supplier.value = response.data.supplier_id
    for (const key in vehicleTableData.value[index]) {
      data.value[key] = vehicleTableData.value[index][key] || '';
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}



const getBranches = async () => {
  try {
    const response = await axios.get('get/branches', {
      params: {
        'company_id': supplier.value,
        'country' : country.value
      }
    });
    branches.all.value = response.data
    branches.list.value = branches.all.value.map((item) => ({
      value: `${item.name}`,
      label: `${item.name}`,
      id: `${item.id}`,
    }))
  } catch (error) {
    console.error(error);
  }
};

const getVehicles = async () => {
  try {
    const response = await axios.get('get/vehicles', {
      params: {
        'branch_id': branch.value,
      }
    });
    vehicles.all.value = response.data
    vehicles.list.value = vehicles.all.value.map((item) => ({
      value: `${item.name}`,
      label: `${item.name}`,
      id: `${item.id}`,
      photo: `${item.photo}`,
    }))
  } catch (error) {
    console.error(error);
  }
};
const fetchCountries = async () => {
  countries.loading.value = true;
  try {
    //
    const response = await axios.get('/get/countries', {})
    countries.all.value = response.data
    console.log(response);
    countries.list.value = countries.all.value.map((item) => ({
      id: `${item}`,
      label: `${item}`,
      iso: `${item}`
    }))
  } catch (error) {
    console.error(error)
  } finally {
    countries.loading.value = false;
  }
}

onMounted(() => {
  getData()
  getVehiclesData()
  getPromos()
  fetchCountries()

});

</script>

