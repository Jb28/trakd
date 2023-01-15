<template>
  <main>
    <div>
      <Navbar></Navbar>
    </div>
    
    <div>
      <h1>This is the index page!</h1>
    </div>
  </main>
</template>

<script>
import Navbar from '../components/NavBar.vue';
export default {
  name: 'IndexPage',
  components: {
    Navbar
  },
}
</script>
