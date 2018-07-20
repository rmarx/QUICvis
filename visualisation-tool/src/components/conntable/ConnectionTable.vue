<template>
    <div id="conntable-container" v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px'}">
      <button class="btn btn-sm btn-primary float-right" 
      type="button" data-toggle="collapse" data-target="#tablefilters" aria-expanded="false" aria-controls="tablefilters">
      Filters
      </button>
      <div class="border collapse" id="tablefilters">
        <div v-for="(column) in columns">
            <input type="checkbox" class="checkbox" v-bind:name="column.name" :checked="!column.filtered" @click="filterColumn(column.name)">
            {{ column.name }}
        </div>
      </div>
      <table class="table table-sm table-bordered">
          <thead>
              <th scope="col" class="sortable text-center" @click="sort('connid')">Conn</th>
              <th scope="col" class="sortable text-center" v-for="column in columns" @click="sort(column.packet_key)" v-if="column.filtered === false">{{ column.name }}</th>
          </thead>
          <tbody>
            <ConnRow v-for="conn in filteredconns" v-bind:traceid="conn.fileindex" v-bind:connid="conn.connid" v-bind:headerinfo="conn.headerinfo"/>
          </tbody>
          <tfoot>
            <th scope="col" class="sortable text-center" @click="sort('connid')">Conn</th>
              <th scope="col" class="sortable text-center" v-for="column in columns" @click="sort(column.packet_key)" v-if="column.filtered === false">{{ column.name }}</th>
          </tfoot>
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
      sorteddir: 'asc',
      containerwidth: Math.max(window.innerWidth, 1800),
      containerheight: Math.max(window.innerHeight * (3 / 10), 250)
    }
  },
  computed: {
    columns() {
      return this.$store.getters.getTableHeaders;
    },
    filteredconns() {
      let conns = this.$store.getters.getAllFilteredConns
      if (this.sortedcolumn !== 'connid') {
        conns.sort((a,b) => {
          let modifier = 1
          if (this.sorteddir === 'desc')
            modifier = -1;
            if(a['headerinfo'][this.sortedcolumn] < b['headerinfo'][this.sortedcolumn]) return -1 * modifier;
            if(a['headerinfo'][this.sortedcolumn] > b['headerinfo'][this.sortedcolumn]) return 1 * modifier;
            return 0;
        })
      }
      return conns;   
    }
  },
  methods:{
    sort:function(s) {
      if (s === this.sortedcolumn) {
        this.sorteddir = this.sorteddir==='asc'?'desc':'asc';
      }
      this.sortedcolumn = s;
    },
    filterColumn:function(colname){
      this.$store.dispatch('filterTableHeader', colname)
    },
    handleResize:function(event){
      this.containerwidth = Math.max(window.innerWidth, 1800),
      this.containerheight = Math.max(window.innerHeight * (3 / 10), 250)
    }
  },
  components: {
    ConnRow
  },
  ready: function () {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
  }
};
</script>
<style>
#conntable-container {
  overflow: auto;
  position: relative;
  margin-top: 24px;
}

.sortable{
  cursor: pointer;
}

#tablefilters{
  background-color: aquamarine;
  position: absolute;
}

#tablefilters > div{
  margin-left: 4px;
  margin-right: 4px;
  float: left;
}
</style>
