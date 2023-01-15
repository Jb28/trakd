<template>
    <div class="bg-gray-900 text-gray-100 py-3.5 px-6 shadow md:flex justify-between items-center">
         <div class="flex items-center cursor-pointer">
            <span class="text-green-500 text-lg mr-1">
                <outline-annotation-icon class="w-8 h-8" />
            </span>
            <h1 class="text-xl">Trakd</h1>
         </div>
         <span @click="MenuOpen()" class="absolute md:hidden right-6 top-1.5 cursor-pointer text-4xl">        
            <div v-if="open === true">
                <outline-x-icon class="w-8 h-8" />
            </div>
            <div v-else>                            
                <outline-menu-icon class="w-8 h-8" />
            </div>
         </span>
         <ul class="md:flex md:items-center md:px-0 px-10 md:pb-0 pb-10 md:static absolute bg-gray-900 
            md:w-auto w-full top-14 duration-700 ease-in"
            :class="{ShowMenu}">
            <li v-for="link in Links" :key= "link.name" class="md:mx-4 md:my-0 my-6"> 
                <div class="hover:text-green-500">
                    <NuxtLink :to="link.link">{{ link.name }}</NuxtLink>
                </div>               
            </li>
            <Button>Login</Button>
         </ul>
    </div>
</template>

<script>
import Button from '../components/Button.vue'
import { ref } from '@vue/reactivity'
export default {
    components: {
        Button
    },
    data() {
        open = false;
    },
    setup(){    
        const Links = [
            {name: 'Home', link: '/'},
            {name: 'Garage', link: '/garage'},
        ];
        function MenuOpen() {
            console.log(open);
            open = !open
        }
        return { Links, MenuOpen };
    },
    computed:{
        ShowMenu() {
            // if (this.open) {
            //     return 'left-0';
            // }
            return 'left-[-100%]';
        }
    }
    //<i :class="[open ? 'bi bi-x' : 'bi bi-filter-left']"></i>
}
</script>