<template>
    <div id="filesettings" class="container w-50 float-left">
        <div id="filenameSelectContainer">
            <button @click="toggleFileContainer()">DEBUG</button>
            <select @change="onfilenameselected()" v-model="selectedFilename" class="ml-1">
                <option disabled value="">Select a file to load</option>
                <option v-for="option in filenames" v-bind:key="option" v-bind:value="option">
                    {{ option }}
                </option>
            </select>
        </div>
        <br/>
        <div id="testcaseContainer">
            <div id="currentTestcaseLabel">Current test case: {{currentTestcaseName}} {{loadingIndicator}}</div>
            <div class="float-left ml-1">Timeline testcases:</div><br/>
            <div v-for="testcase in testcases" class="float-left ml-1">
                <button v-if="testcase.type === 'timeline'" @click="loadTestcase(testcase)">{{testcase.name}}</button>
            </div>
            <div style="clear: both;" />
            <div class="float-left ml-1">Sequence Diagram testcases:</div><br/>
            <div v-for="testcase in testcases" class="float-left ml-1">
                <button v-if="testcase.type === 'sequence'" @click="loadTestcase(testcase)">{{testcase.name}}</button>
            </div>
        </div>
        
        
        <div id="fileContainer" v-if="fileContainerOpen">
            <div v-for="(file, fileindex) in traces" v-bind:key="fileindex" class="container border w-25 float-left">
                <div v-bind:id="file.filename + '-span'">
                <div class="container border">
                    {{ file.filename}}
                </div>
                <div v-bind:id="file.filename + '-conns'" v-bind:aria-labelledby="file.filename + '-conns'" v-bind:data-parent="file.filename + '-span'">
                    <div class="container border">
                        <div v-for="(conn, connindex) in file.conns" v-bind:key="connindex">
                            <input type="checkbox" class="checkbox" v-bind:name="file.filename + '-conn' + connindex" :checked="!conn" @click="filterConn(fileindex, connindex)">
                            {{ 'conn' + (connindex + 1) }}
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import TraceWrapper from '../../data/TraceWrapper';
import { Ngtcp2LogParser } from '../../parser/Ngtcp2LogParser'
import { QuickerLogParser } from '../../parser/QuickerLogParser';
import { PcapParser } from '../../parser/pcapparser';

export default {
  name: "FileSettings",
  data() {
      return {
        testcases:[
            { 
                name: "Network down",
                type: "timeline",
                files: [
                    "ntwrk-off-cl-ngtcp2.quicker-log.js",
                    "ntwrk-off-se-ngtcp2.ngtcp2-log.js",
                    "ntwrk-off-ts-ngtcp2.json.js",

                    "ntwrk-off-cl-quicker.quicker-log.js",
                    "ntwrk-off-se-quicker.quicker-log.js",
                    "ntwrk-off-ts-quicker.json.js",
                ]
            },
            { 
                name: "Network down (extended)",
                type: "timeline",
                files: [
                    "ntwrk-off-cl-ngtcp2.quicker-log.js",
                    "ntwrk-off-se-ngtcp2.ngtcp2-log.js",
                    "ntwrk-off-ts-ngtcp2.json.js",
                    
                    "ntwrk-off-cl-quicker.quicker-log.js",
                    "ntwrk-off-se-quicker.quicker-log.js",
                    "ntwrk-off-ts-quicker.json.js",
                    
                    "ntwrk-off-cl-quant.quicker-log.js",
                    "ntwrk-off-ts-quant.json.js"
                ]
            },
            { 
                name: "Multistream",
                type: "sequence",
                files: [
                    "ngtcp-multistreams-client.ngtcp2-log.js",
                    "ngtcp-multistreams-server.ngtcp2-log.js",
                ],
                time_scale: 5
            },
            { 
                name: "Network down (ngtcp2)",
                type: "sequence",
                files: [
                    "ntwrk-off-cl-ngtcp2.quicker-log.js",
                    "ntwrk-off-se-ngtcp2.ngtcp2-log.js",
                ],
                time_scale: 1
            },
            { 
                name: "Conn closers",
                type: "sequence",
                files: [
                    "dupli-pkts-ts-ngtcp2.json.js"
                ],
                time_scale: 1
            }

        ],
        standaloneFilenames: 
        [   "inc-0rtt-cl-ngtcp2.quicker-log.js",
            "inc-0rtt-cl-quant.quicker-log.js",
            "inc-0rtt-cl-quicker.quicker-log.js",
            "inc-0rtt-se-ngtcp2.ngtcp2-log.js",
            "inc-0rtt-se-quicker.quicker-log.js",
            "inc-0rtt-ts-ngtcp2.json.js",
            "inc-0rtt-ts-quant.json.js",
            "inc-0rtt-ts-quicker.json.js",
            "two-initial-cl-ngtcp2.quicker-log.js",
            "two-initial-cl-quant.quicker-log.js",
            "two-initial-cl-quicker.quicker-log.js",
            "two-initial-se-ngtcp2.ngtcp2-log.js",
            "two-initial-se-quicker.quicker-log.js",
            "two-initial-ts-ngtcp2.json.js",
            "two-initial-ts-quant.json.js",
            "two-initial-ts-quicker.json.js",
            "dupli-pkts-cl-ngtcp2.quicker-log.js",
            "dupli-pkts-cl-quant.quicker-log.js",
            "dupli-pkts-cl-quicker.quicker-log.js",
            "dupli-pkts-se-ngtcp2.ngtcp2-log.js",
            "dupli-pkts-se-quicker.quicker-log.js",
            "dupli-pkts-ts-ngtcp2.json.js",
            "dupli-pkts-ts-quant.json.js",
            "dupli-pkts-ts-quicker.json.js",
            "exceed-md-cl-ngtcp2.quicker-log.js",
            "exceed-md-cl-quant.quicker-log.js",
            "exceed-md-cl-quicker.quicker-log.js",
            "exceed-md-se-ngtcp2.ngtcp2-log.js",
            "exceed-md-se-quicker.quicker-log.js",
            "exceed-md-ts-ngtcp2.json.js",
            "exceed-md-ts-quant.json.js",
            "exceed-md-ts-quicker.json.js",
            "ngtcp-multistreams-client.ngtcp2-log.js",
            "ngtcp-multistreams-server.ngtcp2-log.js",
            "ngtcp2-multistreams-tshark.json.js",
            "ntwrk-off-cl-ngtcp2.quicker-log.js",
            "ntwrk-off-cl-quant.quicker-log.js",
            "ntwrk-off-cl-quicker.quicker-log.js",
            "ntwrk-off-se-ngtcp2.ngtcp2-log.js",
            "ntwrk-off-se-quicker.quicker-log.js",
            "ntwrk-off-ts-ngtcp2.json.js",
            "ntwrk-off-ts-quant.json.js",
            "ntwrk-off-ts-quicker.json.js",
            "pkts-reorder-cl-ngtcp2.quicker-log.js",
            "pkts-reorder-cl-quant.quicker-log.js",
            "pkts-reorder-cl-quicker.quicker-log.js",
            "pkts-reorder-se-ngtcp2.ngtcp2-log.js",
            "pkts-reorder-se-quicker.quicker-log.js",
            "pkts-reorder-ts-ngtcp2.json.js",
            "pkts-reorder-ts-quant.json.js",
            "pkts-reorder-ts-quicker.json.js"
        ],
        conncolors: [
            '#f98b7f',
            '#f9b97f',
            '#f2dc8e',
            '#a5965e',
            '#e4ef83',
            '#b1dd6e',
            '#82d87d',
            '#7dd8bb',
            '#7dd4d8',
            '#9189ff'
        ],
        selectedFilename: "",
        fileContainerOpen: false,
        currentTestcase: undefined,
        loading: false
      }
  },
  computed:{ 
    traces() {
      return this.$store.getters.getFilesSettings;
    },
    filenames() {
        return this.standaloneFilenames;
    },
    currentTestcaseName(){
        return (this.currentTestcase) ? this.currentTestcase.name : "No testcase selected";
    },
    loadingIndicator(){
        return (this.loading) ? "(loading...)" : "";
    }
  },
  mounted(){
      this.loadFile("ntwrk-off-cl-ngtcp2.quicker-log.js");
      this.loadFile("ntwrk-off-se-ngtcp2.ngtcp2-log.js");
      this.loadFile("dupli-pkts-se-ngtcp2.ngtcp2-log.js");
      this.loadFile("dupli-pkts-ts-ngtcp2.json.js");
      this.loadFile("ngtcp-multistreams-client.ngtcp2-log.js");
  },
  methods: {
      toggleFileContainer(){
          this.fileContainerOpen = !this.fileContainerOpen;
      },
      filterConn(fileindex, connindex){
          let data = {
              fileindex,
              connindex
          }
          this.$store.dispatch('filterConn', data);
      },
      removeFile(fileindex){
          this.$store.dispatch('removeFile', fileindex);
      },
      loadTestcase(testcase){
            // we want to hide all currently visible traces, because we're loading new ones! 
            // TODO: optimize: if one of the newly needed files is already in the cache, don't load it again, obviously 
            let allFiles = this.$store.getters.getFiles;
            for( let [index, val] of allFiles.entries() ){
                for( let [connindex, connval] of val._conns.entries() ){

                    // TODO: this correctly shows stuff, but screws with ordering again... existing files will not be viewed in the correct order for the testcase... aaargh 
                    // only way to do that for now would be to add things twice, but that would take additional refactoring etc...
                    // if we add proper naming of the stuffs in front of the rows soon, this should be less of an issue anyway
                    if( testcase.files.indexOf(val.getTrace().name + ".js") >= 0 ){ // filename contains.js, traceWrap.name doesn't
                        if( connval.getIsFiltered() ) // if was hidden: re-enable 
                            this.filterConn( index, connindex );
                        else
                            continue; // keep showing files belonging to the selected testcase 
                    }

                    if( !connval.getIsFiltered() ) // otherwhise we would toggle 
                        this.filterConn( index, connindex );
                }
            }

            // load new traces, but we need to make sure they are in-order.
            // this is a bit more difficult, as we don't want to load sequentially
            // so we start loading in parallel, gather everything here, and then append in the correct order.
            // we tried just adding them and then re-sorting the file-array directly, but this is mega-slow, 
            // as everything is re-rendered for some reason.
            console.log("FileSettings:loadTestcase : ", testcase);
            this.currentTestcase = testcase; 
            this.loading = true;
            
            let amountToLoad = testcase.files.length;
            let amountLoaded = 0;
            let traceCache = [];
            let vm = this;

            let onFileLoaded = (traceWrap) => {
                amountLoaded++;

                if( traceWrap ) { // is undefined if file was already loaded before 
                    for( let entry of traceCache ){
                        if( entry.filename.indexOf(traceWrap.getTrace().name) >= 0 ) // filename contains.js, traceWrap.name doesn't, so use substr-check
                            entry.traceWrap = traceWrap;
                    }

                    console.log("FileSettings:LoadedTrace", amountLoaded, amountToLoad, traceCache);
                }
                else    
                    console.log("FileSettings:LoadedTrace : trace was previously loaded", amountLoaded, amountToLoad);

                if( amountLoaded == amountToLoad ){
                    for( let entry of traceCache ){
                        if( entry.traceWrap ) // will be undefined if file was already loaded before
                            vm.$store.dispatch('addFile', entry.traceWrap);
                    }

                    if( testcase.type == "sequence" ){

                        let allFiles = this.$store.state.vissettings.getAllFileNames();
                        let index1 = allFiles.indexOf( testcase.files[0].replace( new RegExp(/.js$/), "") ); // assume [0] is always the left side, client
                        let index2 = undefined;
                        if( testcase.files[1] )
                            index2 = allFiles.indexOf( testcase.files[1].replace( new RegExp(/.js$/), "") );

                        console.log("Sequence setting ", index1, index2, allFiles, testcase.files);
                        
                        let data = {
                            tracenumber: 1,
                            traceindex: index1
                        };
                        this.$store.dispatch('setSequenceTraceIndex', data);

                        let conndata = {
                            connnumber: 1,
                            connindex: 0
                        };
                        this.$store.dispatch('setSequenceConnIndex', conndata);

                        if( index2 ){
                            let vm = this;
                            setTimeout( () => {
                                let data = {
                                    tracenumber: 2,
                                    traceindex: index2
                                };
                                vm.$store.dispatch('setSequenceTraceIndex', data);

                                let conndata = {
                                    connnumber: 2,
                                    connindex: 0
                                };
                                vm.$store.dispatch('setSequenceConnIndex', conndata);
                            }, 20);
                        }

                        if( testcase.time_scale )
                            this.$store.dispatch('setSequenceScale', testcase.time_scale)
                    }

                    this.loading = false;
                }
            };

            for( let file of testcase.files ){
                traceCache.push( { filename: file, traceWrap: undefined } ); // placeholders, added in correct order, later looked up by .filename
                this.loadFile( file, onFileLoaded );
            }
      },
      loadFile(filename:string, doneCallback:any){

            let fileIndex = this.standaloneFilenames.indexOf(filename);
            if( fileIndex >= 0 ){
                this.standaloneFilenames.splice(fileIndex, 1 );
            }
            else
                console.log("File not found in standalonefilenames was already gone?", filename);

            console.log("FileSettings: Loading file ", filename);

            let filepath = filename;

            // the check to prevent double-loading above is only if this component stays mounted
            // it gets re-mounted when moving from timeline to seqdiagram, so need to prevent it agai nwith some global state
            // in a clean application, this would be on this.$store, but WE ARE NOT A CLEAN APPLICATION (at the moment)
            let varname = filepath.substr(0, filepath.indexOf(".")); // dupli-pkts-cl-ngtcp2.quicker-log.js -> dupli-pkts-cl-ngtcp2
            varname = varname.replace(new RegExp("-", 'g'), "_"); // dupli-pkts-cl-ngtcp2 -> dupli_pkts_cl_ngtcp2

            if( window[varname] == "loaded" ){
                console.log("FileSettings:loadFile : file was already loaded, doing nothing", filepath);
                if( doneCallback )
                    doneCallback(undefined);
                
                return;
            }

            let vm = this;
            let scriptelement = document.createElement('script');
            scriptelement.onload = function () {
                // the standalone file has a single variable in it, named after the file, so we can get the contents
                // e.g., var dupli_pkts_cl_ngtcp2 = {...}
                // since it's a 'var' and not 'let', we can access it via the window[]
                let varname = filepath.substr(0, filepath.indexOf(".")); // dupli-pkts-cl-ngtcp2.quicker-log.js -> dupli-pkts-cl-ngtcp2
                varname = varname.replace(new RegExp("-", 'g'), "_"); // dupli-pkts-cl-ngtcp2 -> dupli_pkts_cl_ngtcp2

                //@ts-ignore 
                let file = window[varname];
                window[varname] = "loaded"; // make sure it can be gc'ed if necessary

                let tracewrap = new TraceWrapper();
                let parsedfile = undefined;

                if (file['fileext'] === '.json') {
                    let pcapparser = new PcapParser();
                    parsedfile = pcapparser.parse(file['filename'], file['filecontent'])
                }
                if (file['fileext'] === '.ngtcp2-log') {
                    let ngtcp2parser = new Ngtcp2LogParser();
                    parsedfile = ngtcp2parser.parse(file['filename'], file['filecontent'])
                }
            
                if (file['fileext'] === '.quicker-log') {
                    let quickerparser = new QuickerLogParser();
                    parsedfile = quickerparser.parse(file['filename'], file['filecontent'])
                }

                tracewrap.setTrace(parsedfile, 0, vm.conncolors);
                if( !doneCallback )
                    vm.$store.dispatch('addFile', tracewrap);
                else
                    doneCallback(tracewrap);

            };

            scriptelement.src = "standalone/" + filepath;

            document.head.appendChild(scriptelement);
      },
      onfilenameselected(){
          if( this.selectedFilename === undefined )
            return;

          this.loadFile( this.selectedFilename );
      }
  }
}
</script>