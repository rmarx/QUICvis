<template>
    <div>
        <div class="tracecontainer" v-bind:style="{ height: compheight + 'px', width: compwidth + 'px'}">
            <div v-if="filteredconns.length > 0" class="tracename border h-100 float-left" style="width: 150px;">
                <p class="text-truncate m-0" v-html="trace_name"></p>
            </div>
            <div class="h-100 float-left" style="width: 155px;">
                <ConnInfo v-for="n in filteredconns" v-bind:key="n.connid" v-bind:traceid="traceid" v-bind:connid="n" />
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue'
import ConnInfo from './ConnInfo.vue'
export default {
    name: "traceinfo",
    props: ['traceid'],
    data() {
        return {
            compwidth: 305
        }
    },
    computed: {
        trace() {
            return this.$store.getters.getFileByIndex(this.traceid);   
        },
        trace_name() {
            let name = this.trace._trace.name;
            console.log( name );
            let testcase = "UNKNOWN";
            let endpoint = "UNKNOWN";
            let implementation = "UNKNOWN";

            // "standard" naming goes like this:
            // testcase-name-endpoint-implementation.logtype
            // logtype can also contain quicker, ngtcp2, quant etc. so we match explicitly on the implementation 
            if( name.indexOf("-cl-") >= 0 ){
                endpoint = "Client";
            }
            else if( name.indexOf("-se-") >= 0 ){
                endpoint = "Server";
            }
            else if( name.indexOf("-ts-") >= 0 ){
                endpoint = "TShark";
            }

            if( name.indexOf("-ngtcp2.") >= 0){
                implementation = "ngtcp2";
            }
            else if( name.indexOf("-quicker.") >= 0){
                implementation = "quicker";
            }
            else if( name.indexOf("-quant.") >= 0){
                implementation = "quant";
            }

            // testcase is always the first 2 split point combined (e.g., split("-")[0] + [1])
            let beforeEndpoint = name.indexOf( "-", name.indexOf("-") + 1 );
            testcase = name.substr(0, beforeEndpoint);

            //let testcase = name.substring()
            // of course there is 1 testcase that doesn't follow the standard
            // with 3 files: 
            // "ngtcp-multistreams-client.ngtcp2-log.js",
            // "ngtcp-multistreams-server.ngtcp2-log.js",
            // "ngtcp2-multistreams-tshark.json.js",
            if( name == "ngtcp-multistreams-client.ngtcp2-log" ){
                implementation = "ngtcp2";
                endpoint = "Client";
                testcase = "Multistream"
            }
            else if( name == "ngtcp-multistreams-server.ngtcp2-log" ){
                implementation = "ngtcp2";
                endpoint = "Server";
                testcase = "Multistream"
            }
            else if( name == "ngtcp2-multistreams-tshark.json" ){
                implementation = "ngtcp2";
                endpoint = "TShark";
                testcase = "Multistream"
            }

            return testcase + " <br /> " + implementation + " - " + endpoint;
        },
        filteredconns() {
            return this.$store.getters.getFilteredConnsInFile(this.traceid)
        },
        //calculate height of file name: depending if streams are being displayed
        compheight() {
            let connsettings = this.$store.state.vissettings.getFile(this.traceid).getAmountStreamsToShow();
            let height = 0;
            // TODO: get the default svg height values from the svg lanes, not hardcoded here! 
            connsettings.forEach(element => {
                if (element.streams > 0)
                    height += 30 * element.streams
                
                height += 62; // connection is 2 lanes high, so 2 * 30 + 2 (padding)
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
    font-size: 0.9em;
    padding-left: 5px;
    /*
    writing-mode: vertical-rl;
    -webkit-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    text-align: center;
    */
}
.tracecontainer{
    display: flex;
}
</style>