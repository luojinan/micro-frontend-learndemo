<template>
  <div id="app">
    app {{ count }}
    <button @click="addCount">add</button>
    <button @click="getWindowA">get window.a</button>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'App',

  setup () {
    const count = ref(0)
    function addCount () {
      count.value++
    }
    function getWindowA () {
      console.log(window.a)
    }
    return {
      count,
      addCount,
      getWindowA
    }
  }
}
</script>
