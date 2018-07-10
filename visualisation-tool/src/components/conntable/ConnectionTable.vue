<template>
    <div id="conntable-container" v-bind:style="{width: containerwidth + 'px', height: containerheight + 'px'}">
        <table class="table table-sm">
            <thead>
                <th scope="col" v-for="column in columns">{{ column.name }}</th>
            </thead>
            <tbody>
                
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
export default {
  name: "connectiontable",
  computed: {
    containerwidth() {
      return window.innerWidth * (4 / 5);
    },
    containerheight() {
      return window.innerHeight * (3 / 10);
    },
    columns() {
      return this.$store.getters.getTableHeaders;
    }
  }
};
</script>
<style>
#conntable-container {
  overflow: auto;
  position: relative;
  margin-top: 34px;
}
</style>
