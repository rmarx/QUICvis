<template>
    <div>
        <div class="container border">
            {{ trace._trace.name}}
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
export default {
    name: "traceinfo",
    props: ['traceid'],
    computed: {
        trace() {
            return this.$store.getters.getFileByIndex(this.traceid);   
        }
    }
}
</script>
<style>

</style>