<script setup>
import {ref} from 'vue'
const stars = [
    {name: "Excellent"},
    {name: "Excellent"},
    {name: "Very Good"},
    {name: "Very Good"},
    {name: "Good"},
    {name: "Good"},
    {name: "Bad"},
    {name: "Bad"},
    {name: "Terrible"},
    {name: "Terrible"},
]
const value = ref('');
</script>

<template>
    <div class="container">
        <div class="container__items">

            <template v-for="(item,index) in stars" >
                <input type="radio" :value="index + 1" v-model="value" :id="'st' + index">
                <label :for="'st' + index">
                    <div class="star-stroke">
                        <div class="star-fill"></div>
                    </div>
                    <div class="label-description" :data-content="item.name"></div>
                </label>
            </template>

        </div>
    </div>
</template>

<style scoped>

*{
    margin: 0;
    padding: 0;

    transition: .3s;

    box-sizing: border-box;
}

body{
    width: 100vw;
    height: 100vh;

    overflow: hidden;

    background: #28b876;

    font-family: sans-serif;
    color: #ba9537;
}

.container{
    position: relative;
    top: 50%;
    left: 50%;

    width: 40%;
    height: 20%;

    transform: translate(-50%, -50%) rotateY(180deg);
}

.container .container__items{
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 0 .5em;

    width: 100%;
    height: 100%;
}

.container .container__items input{
    display: none;
}

.container .container__items label{
    width: 20%;
    aspect-ratio: 1;
    cursor: pointer;
}

.container .container__items label .star-stroke{
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    background: #0a3622;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.container .container__items label .star-stroke .star-fill{
    width: 70%;
    aspect-ratio: 1;
    background: #ffffff;
    clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.container .container__items input:hover ~ label .star-stroke,.container .container__items input:checked ~ label .star-stroke{
    background:  #d8b311;
}

.container .container__items input:checked ~ label .star-stroke .star-fill{
    background:  #d8b311;
}

.container .container__items label:hover .label-description::after{
    content: attr(data-content);
    position: fixed;
    left: 0;
    right: 0;

    margin-top: 1em;
    margin-inline: auto;

    width: 100%;
    height: 2em;

    color: #1e1e1e;

    text-align: center;
    font-size: 2rem;
    font-weight: bold;

    transform: rotateY(180deg);
}
</style>
