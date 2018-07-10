<template>
    <tr v-bind:style="{'background-color': bgcolor}">
      <td>Conn{{connid + 1}}</td>
      <td v-for="column in columns">{{ headerinfo[column.name]}}</td>
    </tr>
</template>

<script lang="ts">
export default {
  name: "connrow",
  props: ['traceid', 'connid', 'headerinfo'],
  computed: {
    filenamerows(){
      return this.$store.getters.getFilteredConnsInFile(this.traceid).length
    },
    bgcolor(){
      return this.$store.state.vissettings.getFile(this.traceid).getConn(this.connid).getBgColor()
    },
    columns() {
      return this.$store.getters.getTableHeaders;
    }
  },
};
</script>