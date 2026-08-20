<template>


    <header class="" style=" position: relative; z-index: 50;width: 100%; padding: 0 25px; background: #f9d602; height: 60px;">
        <nav class="navbar navbar-expand-lg navbar-light">
            <Link href="/" class="col-2">
                <img style="max-width:150px;" src="/img/4k-logo.png" alt="logo">
            </Link>
            <CDropdown togglerText="Dropdown button" class="mt-1 offset-9">
                <CDropdownToggle component="a" style="color: rgba(30, 30, 30, 1);" aria-selected="true">
                    <img src="../../assets/images/profile/user-1.jpg" alt="" width="35" height="35" class="rounded-circle">
                </CDropdownToggle>
                <CDropdownMenu>
                    <CDropdownItem href="/company">My profile</CDropdownItem>
                    <CDropdownItem href="/logout">Log out</CDropdownItem>
                </CDropdownMenu>
            </CDropdown>

        </nav>
    </header>

</template>

<script setup>
import {Link} from '@inertiajs/vue3'
import {onMounted, ref} from 'vue'
import {CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle} from "@coreui/vue";

const user = ref('')

const getUser = async () => {
    try {
        const response = await axios.get('/get/user/data');
        user.value = response.data;
    } catch (error) {
        console.error(error);
    }
}

onMounted(() => {

    getUser();
})
</script>
