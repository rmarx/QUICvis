<template>
    <div>
        <div class="tracecontainer" v-bind:style="{ height: compheight + 'px', width: compwidth + 'px'}">
            <div class="tracename border h-100 float-left">
                <p class="text-truncate m-0">{{ trace._trace.name}}</p>
            </div>
            <div class="h-100 float-left">
                <ConnInfo v-for="n in filteredconns" v-bind:traceid="traceid" v-bind:connid="n" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import ConnInfo from './ConnInfo'
export default {
    name: "traceinfo",
    props: ['traceid'],
    data() {
        return {
            compwidth: 180
        }
    },
    computed: {
        trace() {
            return this.$store.getters.getFileByIndex(this.traceid);   
        },
        filteredconns() {
            return this.$store.getters.getFilteredConnsInFile(this.traceid)
        },
        compheight() {
            let connsettings = this.$store.state.vissettings.getFile(this.traceid).getAmountStreamsToShow();
            let height = 0
            connsettings.forEach(element => {
                if (element.streams > 0)
                    height += 60 * element.streams
                
                height += 62;
            });
            return height
        }
    },
    components: {
        ConnInfo
    }
}
</script>
<style>
.tracename{
    writing-mode: vertical-rl;
    -webkit-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    text-align: center;
}
.tracecontainer{
    display: flex;
}
</style>