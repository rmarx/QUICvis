<template>
    <div>
        <div v-for="(file, fileindex) in traces" class="w-100 float-left">
            <TraceInfo v-bind:traceid="fileindex" />
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import TraceInfo from './TraceInfo'
export default {
    name: "connectioninfolist",
    computed: {
        traces() {
            return this.$store.getters.getFiles;   
        }
    },
    components: {
        TraceInfo
    }
}
</script>
<style>

</style>
