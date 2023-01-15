<template>
    <div class="bg-gray-900 text-gray-100 py-3.5 px-6 shadow md:flex justify-between items-center">
         <div class="flex items-center cursor-pointer">
            <span class="text-orange-500 text-lg mr-1">
                <outline-annotation-icon class="w-8 h-8" />
            </span>
            <h1 class="text-xl">Trakd</h1>
         </div>
         <span @click="MenuOpen()" class="absolute md:hidden right-6 top-1.5 cursor-pointer text-4xl">        
            <div v-if="showMenu === true">
                <outline-x-icon class="w-8 h-8" />
            </div>
            <div v-else>                            
                <outline-menu-icon class="w-8 h-8" />
            </div>
         </span>
         <ul class="md:flex md:items-center md:px-0 px-10 md:pb-0 pb-10 md:static absolute bg-gray-900 
            md:w-auto w-full top-14 duration-200 ease-in"
            :class="ShowMenu">
            <li v-for="link in Links" :key= "link.name" class="md:mx-4 md:my-0 my-6"> 
                <div class="hover:text-orange-500">
                    <NuxtLink :to="link.link">{{ link.name }}</NuxtLink>
                </div>               
            </li>
            <Button v-on:click="LoginModal()">Login</Button>
         </ul>
        <div v-if="showLoginModal === true">
            <t-modal header="Title of the modal">
                Content of the modal.    
                <div class="flex justify-between">
                <t-button type="button">
                    Cancel
                </t-button>
                <t-button type="button">
                    Ok
                </t-button>
                </div>
            </t-modal>
        </div>
    </div>
</template>

<script>
import Button from '../components/Button.vue';
// import LoginModal from '../components/LoginModal.vue';
export default {
    components: {
        Button
    },
    data: () => ({
        showMenu: false,
        showLoginModal: false,
        Links: [
            {name: 'Home', link: '/'},
            {name: 'Garage', link: '/garage'},
        ]
    }),
    computed:{
        ShowMenu() {
            if (this.showMenu) {
                return 'left-0';
            }
            return 'left-[-100%]';
        },
    },
    methods: {
        MenuOpen() {
            console.log(this.showMenu)
            this.showMenu = !this.showMenu;
        },
        LoginModal() {
            console.log(this.showLoginModal)
            this.showLoginModal = !this.showLoginModal;
        }
    }
}
</script>