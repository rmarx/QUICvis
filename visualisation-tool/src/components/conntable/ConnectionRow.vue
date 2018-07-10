<template>
    <tr>
    </tr>
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