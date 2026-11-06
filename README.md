# vue-verona-components

This repository contains a Vue.js component that implements the VERONA specification to host a VERONA player.

## Installation

```sh
npm install vue-verona-components
```

The package requires Vue 3.5 or later as a peer dependency.

## Usage

Import the component's stylesheet once, e.g. in your app's entry file (`main.ts`):

```typescript
import 'vue-verona-components/style.css';
```

Without it, the player's `<iframe>` keeps the browser's default border.

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

The iframe has no border and is displayed as a block element (both set by `vue-verona-components/style.css`, see
[Usage](#usage)). It has no fixed size, so set its width and
height from the parent, e.g. with a class on the component.

### Props

| Prop              | Type           | Required | Description                                                                                                                                       |
| ----------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `player`          | `string`       | yes      | The **HTML source** of the Verona player (not a URL). It is used as the iframe's `srcdoc`.                                                        |
| `unit-definition` | `string`       | yes      | The **content** of the unit definition (not a URL) that the player should display.                                                                |
| `player-config`   | `PlayerConfig` | no       | Configuration passed to the player. Defaults to `{}`.                                                          |
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

### Events

| Event                  | Payload                                 | Emitted when                                                                     |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------------------------- |
| `state-changed`        | `(state: State)`                        | The player reports a changed unit or player state or new log messages (`vopStateChangedNotification`). |
| `navigation-requested` | `(target: NavigationTarget)`            | The player asks the host to navigate to another unit (`vopUnitNavigationRequestedNotification`). |
| `focus-changed`        | `(timestamp: string, hasFocus: boolean)` | The player reports if it's iframe gains or loses focus (`vopWindowFocusChangedNotification`).  |
| `runtime-error`        | `(error: RuntimeError)`                 | The player reports an error (`vopRuntimeErrorNotification`).                     |

All prop and payload types (`PlayerConfig`, `UnitState`, `State`, `NavigationTarget`, `RuntimeError`, ...) are
exported from the package:

```typescript
import type { NavigationTarget, PlayerConfig, State, UnitState } from 'vue-verona-components';
```

Players usually only send the parts of the state that changed, so merge `unitState.dataParts` from
successive `state-changed` events if you want to keep the complete state, e.g. to pass it back as
`unit-state` later.

### Limitations

The widget interface is not supported: `vopWidgetCall` messages from the player are not answered and
are only logged to the console as errors.

### Example

```typescript
<script setup lang="ts">
    import { ref } from 'vue';
    import {
        VeronaDisplay,
        type NavigationTarget,
        type PlayerConfig,
        type State,
    } from 'vue-verona-components';

    const player = 'EXAMPLE PLAYER HTML';
    const unitDefinition = 'EXAMPLE UNIT DEFINITION CONTENT';
    const playerConfig = ref<PlayerConfig>({ pagingMode: 'separate', logPolicy: 'lean' });

    function onStateChanged(state: State) {
        console.log('New state', state.unitState);
    }

    function onNavigationRequested(target: NavigationTarget) {
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
