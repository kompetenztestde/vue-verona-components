# vue-verona-components

This repository contains a Vue.js component that implements the VERONA specification to host a VERONA player.

## Usage

```typescript
<script setup lang="ts">
    import { VeronaDisplay } from 'vue-verona-components';

    const player = 'EXAMPLE PLAYER HTML';
    const unitDefinition = 'EXAMPLE UNIT DEFINITION CONTENT';
</script>

<template>
    <VeronaDisplay :player="player" :unit-definition="unitDefinition" />
</template>
```
