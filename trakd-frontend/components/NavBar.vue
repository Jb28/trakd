<template>
    <div>
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
            md:w-auto w-full top-14 duration-200 ease-in" :class="ShowMenu">
                <li v-for="link in Links" :key="link.name" class="md:mx-4 md:my-0 my-6">
                    <div class="hover:text-orange-500">
                        <NuxtLink :to="link.link">{{ link.name }}</NuxtLink>
                    </div>
                </li>
                <div v-if="user !== null">
                    <button @click="logout"
                        class="bg-orange-400 hover:bg-orange-500 duration-300 fron-sm text-white rounded py-1.5 px-4">
                        Logout
                    </button>
                </div>
                <div v-else>
                    <button @click="onToggle"
                        class="bg-orange-400 hover:bg-orange-500 duration-300 fron-sm text-white rounded py-1.5 px-4">
                        Login
                    </button>
                </div>
            </ul>

        </div>
        <div id="loginModalDiv">
            <transition name="fade">
                <div v-if="isModalVisible">
                    <div @click="onToggle" class="absolute bg-black opacity-70 inset-0 z-0"></div>
                    <div class="w-full max-w-lg p-3 relative mx-auto my-auto rounded-xl shadow-lg bg-white">
                        <form>
                            <div class="identity-input mb-4">
                                <label for="identity" class="block text-gray-700 text-sm font-bold mb-2">
                                    Email
                                </label>
                                <input id="identity"
                                    class="shadow appearance-none borderrounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                    type="text" placeholder="Email" aria-describedby="emailHelp" v-model="email" />
                                <span class="text-xs text-red-700" id="emailHelp"></span>
                            </div>

                            <div class="password-input mb-6">
                                <label for="identity"
                                    class="block text-gray-700 text-sm font-bold mb-2">Password</label>

                                <input aria-describedby="passwordHelp" v-model="password"
                                    class="shadow appearance-none borderrounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                                    id="password" type="password" placeholder="*******" />

                                <span class="text-xs text-red-700" id="passwordHelp"></span>
                            </div>
                            <div class="flex items-center justify-between">

                                <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                                    href="#">
                                    Forgot Password?
                                </a>
                                <button @click="login"
                                    class="bg-orange-400 hover:bg-orange-500 duration-300 fron-sm text-white rounded py-1.5 px-4">
                                    Sign In
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script>
import Button from '../components/Button.vue';
// import LoginModal from '../components/LoginModal.vue';
import { authDataApiService } from "../common/api-service.js";
export default {
    components: {
        Button
    },
    created: function(){
        this.getUserProfile()
    }, 
    data: () => ({
        showMenu: false,
        showLoginModal: false,
        Links: [
            { name: 'Home', link: '/' },
            { name: 'Garage', link: '/garage' },
        ],
        isOpen: false,
        user: null,
        email: '',
        password: '',
    }),
    computed: {
        ShowMenu() {
            if (this.showMenu) {
                return 'left-0';
            }
            return 'left-[-100%]';
        },
        isModalVisible() {
            return this.isOpen;
        }
    },
    methods: {
        MenuOpen() {
            this.showMenu = !this.showMenu;
        },
        getUserProfile() {
            console.log('getUserProfile')
            authDataApiService.getUserProfile()
                .then((response) => {
                    this.user = response.data
                    console.log('Got user: ' + this.user);
                })
                .catch(err => {
                    console.log(err);
                    this.user = null;
                });
        },
        LoginModal() {
            this.showLoginModal = !this.showLoginModal;
        },
        onToggle() {
            this.isOpen = !this.isOpen;
        },
        login(e) {
            e.preventDefault();
            console.log("logging in");
            authDataApiService.loginUser({ email: this.$data.email, password: this.$data.password })
                .then((response) => {
                    console.log(response);
                    this.onToggle();
                    return this.getUserProfile()
                })
                .catch(err => {
                    //todo: toast notification
                    console.log('Big problem logging in ' + err);
                });
        },
        logout(e) {
            e.preventDefault();
            console.log('logging out');
            authDataApiService.logoutUser()
                .then((response) => {
                    console.log(response);
                    this.user = null;
                })
                .catch(err => {

                });
        }
    }
}
</script>