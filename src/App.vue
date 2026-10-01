<script setup lang="ts">
import VeronaDisplay from './components/VeronaDisplay.vue';

import veronaPlayer from './assets/verona-player-simple-6.0.html?raw';
import unitDefinition from './assets/SAMPLE_UNITCONTENTS.HTM?raw';
</script>

<template>
    <VeronaDisplay :player="veronaPlayer" :unit-definition="unitDefinition" class="verona-host" />
</template>

<style scoped>
.verona-host {
    width: 800px;
    height: 600px;
}
</style>
