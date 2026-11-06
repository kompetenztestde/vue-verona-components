<script setup lang="ts">
import type {
    NavigationTarget,
    PlayerConfig,
    RuntimeError,
    State,
    UnitState,
} from '@/types/verona';
import { ref } from 'vue';
import VeronaDisplay from './components/VeronaDisplay.vue';

import veronaPlayer from './assets/verona-player-simple-6.0.html?raw';
import unitDefinition from './assets/SAMPLE_UNITCONTENTS.HTM?raw';

type EmitLogEntry = {
    id: number;
    receivedAt: string;
    name: string;
    payload: unknown;
};

const MAX_LOG_ENTRIES = 100;
const UNIT_STATE_STORAGE_KEY = 'verona-demo-unit-state';

// the sample player hides its unit navigation buttons unless the targets are enabled
const playerConfig: PlayerConfig = {
    enabledNavigationTargets: ['first', 'previous', 'next', 'last', 'end'],
};

// the last unit state reported by the player is kept in the session storage, so a page reload
// restores it the way a real host would restore a saved state
const savedUnitState = loadSavedUnitState();
const hasSavedUnitState = ref(savedUnitState !== undefined);

function loadSavedUnitState(): UnitState | undefined {
    try {
        const stored = sessionStorage.getItem(UNIT_STATE_STORAGE_KEY);
        return stored ? (JSON.parse(stored) as UnitState) : undefined;
    } catch {
        return undefined;
    }
}

function saveUnitState(unitState: UnitState) {
    try {
        sessionStorage.setItem(UNIT_STATE_STORAGE_KEY, JSON.stringify(unitState));
        hasSavedUnitState.value = true;
    } catch {
        // storage unavailable, the state is just not restored after a reload
    }
}

function resetSavedUnitState() {
    try {
        sessionStorage.removeItem(UNIT_STATE_STORAGE_KEY);
    } catch {
        // nothing to remove
    }
    location.reload();
}

const events = ref<EmitLogEntry[]>([]);
let nextEntryId = 0;

function logEmit(name: string, payload: unknown) {
    events.value.unshift({
        id: nextEntryId++,
        receivedAt: new Date().toLocaleTimeString(),
        name,
        payload,
    });
    events.value.splice(MAX_LOG_ENTRIES);
}

function onStateChanged(state: State) {
    logEmit('stateChanged', state);
    if (state.unitState) {
        saveUnitState(state.unitState);
    }
}

function onNavigationRequested(target: NavigationTarget) {
    logEmit('navigationRequested', target);
}

function onFocusChanged(timestamp: string, hasFocus: boolean) {
    logEmit('focusChanged', { timestamp, hasFocus });
}

function onRuntimeError(error: RuntimeError) {
    logEmit('runtimeError', error);
}

function clearLog() {
    events.value = [];
}
</script>

<template>
    <div class="demo">
        <VeronaDisplay
            :player="veronaPlayer"
            :unit-definition="unitDefinition"
            :player-config="playerConfig"
            :unit-state="savedUnitState"
            class="verona-host"
            @state-changed="onStateChanged"
            @navigation-requested="onNavigationRequested"
            @focus-changed="onFocusChanged"
            @runtime-error="onRuntimeError"
        />

        <section class="emit-log" data-testid="emit-log">
            <header class="emit-log-header">
                <h2>Emitted events ({{ events.length }})</h2>
                <div class="emit-log-actions">
                    <button
                        type="button"
                        data-testid="reset-unit-state"
                        :disabled="!hasSavedUnitState"
                        @click="resetSavedUnitState"
                    >
                        Reset saved state
                    </button>
                    <button type="button" @click="clearLog">Clear</button>
                </div>
            </header>

            <p v-if="events.length === 0" class="emit-log-empty">No events yet</p>

            <ol v-else class="emit-log-entries">
                <li
                    v-for="entry in events"
                    :key="entry.id"
                    class="emit-entry"
                    :class="`emit-entry--${entry.name}`"
                    data-testid="emit-entry"
                    :data-emit="entry.name"
                >
                    <div class="emit-entry-head">
                        <span class="emit-entry-name">{{ entry.name }}</span>
                        <time class="emit-entry-time">{{ entry.receivedAt }}</time>
                    </div>
                    <pre class="emit-entry-payload">{{
                        JSON.stringify(entry.payload, null, 2)
                    }}</pre>
                </li>
            </ol>
        </section>
    </div>
</template>

<style scoped>
.demo {
    display: flex;
    align-items: flex-start;
    gap: 16px;
}

.verona-host {
    flex: none;
    width: 800px;
    height: 600px;
}

.emit-log {
    flex: 1;
    min-width: 280px;
    height: 600px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    font-family: sans-serif;
    font-size: 14px;
}

.emit-log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #ccc;
}

.emit-log-actions {
    display: flex;
    gap: 8px;
}

.emit-log-header h2 {
    margin: 0;
    font-size: 16px;
}

.emit-log-empty {
    margin: 0;
    padding: 12px;
    color: #666;
}

.emit-log-entries {
    flex: 1;
    margin: 0;
    padding: 0;
    overflow: auto;
    list-style: none;
}

.emit-entry {
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
}

.emit-entry-head {
    display: flex;
    justify-content: space-between;
    gap: 8px;
}

.emit-entry-name {
    font-weight: bold;
}

.emit-entry--runtimeError .emit-entry-name {
    color: #b00020;
}

.emit-entry-time {
    color: #666;
}

.emit-entry-payload {
    margin: 4px 0 0;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
