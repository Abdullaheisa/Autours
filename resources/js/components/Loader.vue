<script setup>

</script>

<template>
    <div class="col-md-2" style="left: 50%" >
       <img  src="/gif/loading.gif" height="200" width="400" />
    </div>

</template>

<style scoped>
/* HTML: <div class="loader"></div> */
.loader {
    width: 220px;
    height: 22px;
    border-radius: 20px;
    color: rgb(225, 201, 57);
    border: 2px solid;
    position: relative;
}
.loader::before {
    content: "";
    position: absolute;
    margin: 2px;
    inset: 0 100% 0 0;
    border-radius: inherit;
    background: currentColor;
    animation: l6 2s infinite;
}
@keyframes l6 {
    100% {inset:0}
}
</style>
