<script setup lang="ts">
import type { NavigationTarget, PlayerConfig, RuntimeError, State } from '@/types/verona';
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

// the sample player hides its unit navigation buttons unless the targets are enabled
const playerConfig: PlayerConfig = {
    enabledNavigationTargets: ['first', 'previous', 'next', 'last', 'end'],
};

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
            class="verona-host"
            @state-changed="onStateChanged"
            @navigation-requested="onNavigationRequested"
            @focus-changed="onFocusChanged"
            @runtime-error="onRuntimeError"
        />

        <section class="emit-log" data-testid="emit-log">
            <header class="emit-log-header">
                <h2>Emitted events ({{ events.length }})</h2>
                <button type="button" @click="clearLog">Clear</button>
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
