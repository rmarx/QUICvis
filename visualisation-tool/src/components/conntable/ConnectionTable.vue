<template>
    <div id="conntable-container" v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px'}">
        <table class="table table-sm">
            <thead>
                <th scope="col" class="sortable" @click="sort('connid')">Conn</th>
                <th scope="col" class="sortable" v-for="column in columns" @click="sort(column.name)">{{ column.name }}</th>
            </thead>
            <tbody>
              <ConnRow v-for="conn in filteredconns" v-bind:traceid="conn.fileindex" v-bind:connid="conn.connid" v-bind:headerinfo="conn.headerinfo"/>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
import ConnRow from './ConnRow';
export default {
  name: "connectiontable",
  data() {
    return {
      sortedcolumn: 'connid',
      sorteddir: 'asc'
    }
  },
  computed: {
    containerwidth() {
      return window.innerWidth * (4 / 5);
    },
    containerheight() {
      return window.innerHeight * (3 / 10);
    },
    columns() {
      return this.$store.getters.getTableHeaders;
    },
    filteredconns() {
      let conns = this.$store.getters.getAllFilteredConns
      conns.sort((a,b) => {
        let modifier = 1
        if (this.sorteddir === 'desc')
          modifier = -1;

          if (this.sortedcolumn === 'connid') {
            if(a[this.sortedcolumn] < b[this.sortedcolumn]) return -1 * modifier;
            if(a[this.sortedcolumn] > b[this.sortedcolumn]) return 1 * modifier;
            return 0;
          }
          else {
            if(a['headerinfo'][this.sortedcolumn] < b['headerinfo'][this.sortedcolumn]) return -1 * modifier;
            if(a['headerinfo'][this.sortedcolumn] > b['headerinfo'][this.sortedcolumn]) return 1 * modifier;
            return 0;
          }
      })
      return conns;   
    }
  },
  methods:{
    sort:function(s) {
      if (s === this.sortedcolumn) {
        this.sorteddir = this.sorteddir==='asc'?'desc':'asc';
      }
      this.sortedcolumn = s;
    }
  },
  components: {
    ConnRow
  }
};
</script>
<style>
#conntable-container {
  overflow: auto;
  position: relative;
  margin-top: 34px;
}

.sortable{
  cursor: pointer;
}
</style>
