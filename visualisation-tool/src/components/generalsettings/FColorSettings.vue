<template>
    <div id="fcolorsettings" class="container w-50 float-left">
        <div v-for="color in framecolors" class="container border float-left w-50">
            <div class="colorpreview" v-bind:style="{'background-color': color.colour}"></div>
            {{ getName(color.framecode) }}
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

export default {
  name: "FColorSettings",
  data(){
      return {
          framenames: ['Padding', 'Rst_Stream', 'Connection_Close', 'Application_Close', 'Max_Data', 'Max_Stream_Data', 'Max_Stream_Id', 'Ping', 'Blocked', 'Stream_Blocked',
            'Stream_Id_Blocked', 'New_Connection_Id', 'Stop_Sending', 'Ack', 'Path_Challenge', 'Path_Response', 'Stream']
      }
  },
  computed:{ 
    framecolors() {
      return this.$store.state.framecolortables.getAllFrameColours()
  }},
  methods: {
      getName(index: number){
          return this.framenames[index]
      }
  }
}
</script>
<style>
.colorpreview{
    height: 20px;
    width: 20px;
    margin-right: 10px;
    float: left;
}
</style>
