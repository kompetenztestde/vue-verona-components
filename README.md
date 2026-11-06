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

## `VeronaDisplay`

`VeronaDisplay` renders an `<iframe>` that hosts a [Verona](https://verona-interfaces.github.io/) player and
handles the host side of the Verona `postMessage` protocol. When the player reports that it is ready, the
component starts a new session and sends it the unit definition, the player configuration and, if given,
a saved unit state.

The iframe has no border and is displayed as a block element. It has no fixed size, so set its width and
height from the parent, e.g. with a class on the component.

### Props

| Prop              | Type           | Required | Description                                                                                                                                       |
| ----------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `player`          | `string`       | yes      | The **HTML source** of the Verona player (not a URL). It is used as the iframe's `srcdoc`.                                                        |
| `unit-definition` | `string`       | yes      | The **content** of the unit definition (not a URL) that the player should display.                                                                |
| `player-config`   | `PlayerConfig` | no       | Configuration passed to the player. Defaults to `{}`. See [PlayerConfig](#playerconfig).                                                          |
| `unit-state`      | `UnitState`    | no       | A previously saved unit state. It is sent with every start command. |

#### Reacting to prop changes

Prop changes only reload as much as necessary:

- A new `player` reloads the iframe. The player starts again and gets a new session.
- A new `unit-definition` keeps the loaded player and starts a new session with the new unit.
- A new `player-config` is sent to the running session as a `vopPlayerConfigChangedNotification`;
  the unit is not reloaded.
- A new `unit-state` is not sent on its own. It is only used the next time a session starts.

Changes are detected by reference. To change the player configuration, assign a new object instead of
mutating the existing one:

```typescript
playerConfig.value = { ...playerConfig.value, pagingMode: 'concat-scroll' };
```

#### `PlayerConfig`

All fields are optional. See the
[Verona player configuration](https://verona-interfaces.github.io/player/) for their exact meaning.

| Field                      | Type                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| `unitNumber`               | `number`                                                            |
| `unitTitle`                | `string`                                                            |
| `unitId`                   | `string`                                                            |
| `logPolicy`                | `'disabled' \| 'lean' \| 'rich' \| 'debug'`                         |
| `pagingMode`               | `'separate' \| 'buttons' \| 'concat-scroll' \| 'concat-scroll-snap'` |
| `printMode`                | `'off' \| 'on' \| 'on-with-ids'`                                    |
| `enabledNavigationTargets` | `NavigationTarget[]`                                                |
| `startPage`                | `string`                                                            |
| `directDownloadUrl`        | `string`                                                            |
| `sharedParameters`         | `{ key: string; value: string }[]`                                  |

### Events

| Event                  | Payload                                 | Emitted when                                                                     |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| `state-changed`        | `(state: State)`                        | The player reports a changed unit or player state or new log messages (`vopStateChangedNotification`). |
| `navigation-requested` | `(target: NavigationTarget)`            | The player asks the host to navigate to another unit (`vopUnitNavigationRequestedNotification`). |
| `focus-changed`        | `(timestamp: string, hasFocus: boolean)` | The player reports if it's iframe gains or loses focus (`vopWindowFocusChangedNotification`).  |
| `runtime-error`        | `(error: RuntimeError)`                 | The player reports an error (`vopRuntimeErrorNotification`).                     |

The payload types have the following shape:

```typescript
type NavigationTarget = 'next' | 'previous' | 'first' | 'last' | 'end';

type State = {
    timeStamp: string;
    unitState?: {
        dataParts: Record<string, string>;
        presentationProgress: 'none' | 'some' | 'complete';
        responseProgress: 'none' | 'some' | 'complete';
        unitStateDataType: string;
    };
    playerState: {
        validPages: { id: string; label: string }[];
        currentPage: string;
        sharedParameters: { key: string; value: string }[];
    };
    log?: { timeStamp: string; key: string; content: string }[];
};

type RuntimeError = {
    code: string;
    message: string;
};
```

Players usually only send the parts of the state that changed, so merge `unitState.dataParts` from
successive `state-changed` events if you want to keep the complete state, e.g. to pass it back as
`unit-state` later.

### Example

```typescript
<script setup lang="ts">
    import { ref } from 'vue';
    import { VeronaDisplay } from 'vue-verona-components';

    const player = 'EXAMPLE PLAYER HTML';
    const unitDefinition = 'EXAMPLE UNIT DEFINITION CONTENT';
    const playerConfig = ref({ pagingMode: 'separate', logPolicy: 'lean' } as const);

    function onStateChanged(state) {
        console.log('New state', state.unitState);
    }

    function onNavigationRequested(target) {
        console.log('Player wants to navigate to', target);
    }
</script>

<template>
    <VeronaDisplay
        class="player"
        :player="player"
        :unit-definition="unitDefinition"
        :player-config="playerConfig"
        @state-changed="onStateChanged"
        @navigation-requested="onNavigationRequested"
        @focus-changed="(timestamp, hasFocus) => console.log(timestamp, hasFocus)"
        @runtime-error="(error) => console.error(error.code, error.message)"
    />
</template>

<style scoped>
    .player {
        width: 100%;
        height: 600px;
    }
</style>
```
