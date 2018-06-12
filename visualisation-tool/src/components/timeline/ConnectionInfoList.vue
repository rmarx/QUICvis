<template>
    <div>
        <div v-for="(file, fileindex) in traces" class="container border w-100 float-left">
            {{ file._trace.name}}
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default {
    name: "connectioninfolist",
    computed: {
        traces() {
            console.log(this.$store.getters.getFiles)
            return this.$store.getters.getFiles;   
        }
    }
}
</script>
<style>

</style>
