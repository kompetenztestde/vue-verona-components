<script setup lang="ts">
import type {
    NavigationTarget,
    PlayerConfig,
    RuntimeError,
    State,
    UnitState,
    VeronaPlayerReceiveMessage,
    VeronaPlayerSendMessage,
    VopPlayerConfigChangedNotification,
    VopStartCommand,
} from '@/types/verona';
import { onMounted, ref, useTemplateRef, watch, type Ref } from 'vue';

type Props = {
    player: string;
    unitDefinition: string;
    playerConfig?: PlayerConfig;
    unitState?: UnitState;
};

const { player, unitDefinition, unitState, playerConfig = {} } = defineProps<Props>();
const emit = defineEmits<{
    navigationRequested: [target: NavigationTarget];
    stateChanged: [state: State];
    runtimeError: [error: RuntimeError];
    focusChanged: [timestamp: string, hasFocus: boolean];
}>();

const veronaHost = useTemplateRef('verona-host');
const sessionId: Ref<string | null> = ref(null);
const LOG_TAG = 'Verona Display';
let suppressPlayerConfigChange = false;

function handlePlayerMessage(event: Event) {
    if (!(event instanceof MessageEvent)) {
        return;
    }

    const data: VeronaPlayerSendMessage = event.data;
    switch (data.type) {

        case 'vopReadyNotification':
            sendPlayerStartCommand();
            break;

        case 'vopStateChangedNotification':
            emit('stateChanged', {
                timeStamp: data.timeStamp,
                unitState: data.unitState,
                log: data.log,
                playerState: data.playerState,
            });
            break;

        case 'vopWindowFocusChangedNotification':
            emit('focusChanged', data.timeStamp, data.hasFocus);
            break;

        case 'vopUnitNavigationRequestedNotification':
            emit('navigationRequested', data.target);
            break;

        case 'vopRuntimeErrorNotification':
            emit('runtimeError', { code: data.code, message: data.message });
            break;

        // ignore messages without type
        case undefined:
            break;

        default:
            console.error(
                '[%s] Unknown verona message type: %s, Message: %o',
                LOG_TAG,
                data.type,
                data
            );
    }
}

watch(
    [() => player, () => unitDefinition, () => playerConfig],
    async (
        [newPlayer, newUnitDefinition, newPlayerConfig],
        [oldPlayer, oldUnitDefinition, oldPlayerConfig]
    ) => {
        if (newPlayer !== oldPlayer) {
            // if the player url changed a new verona player is loaded
            console.debug('[%s] VERONA player has changed', LOG_TAG);
            await loadVeronaPlayer();
        } else if (newUnitDefinition !== oldUnitDefinition) {
            // if only the unit definition url changed the old player remains and only the
            // the unit definition is loaded
            console.debug('[%s] VERONA unit definition has changed', LOG_TAG);
            await sendPlayerStartCommand();
        } else if (newPlayerConfig !== oldPlayerConfig) {
            if (suppressPlayerConfigChange) {
                suppressPlayerConfigChange = false;
            } else {
                // if only the player config changed, the unit defintion and player
                // doesn't have to get reloaded
                console.debug('[%s] VERONA player configuration has changed', LOG_TAG);
                sendPlayerConfigChangedCommand();
            }
        }
    }
);

/**
 * Initialize the VERONA player iFrame with a new player
 */
async function loadVeronaPlayer() {
    if (veronaHost.value) {
        veronaHost.value.srcdoc = player;
    }
}

/**
 * Send start command to player which loads the current unit
 * into the verona player
 *
 * It also sends the current player config if given in
 */
async function sendPlayerStartCommand() {
    sessionId.value = crypto.randomUUID();

    const message: VopStartCommand = {
        type: 'vopStartCommand',
        sessionId: sessionId.value,
        unitDefinition: unitDefinition,
        playerConfig: playerConfig,
        ...(unitState ? { unitState } : {}),
    };
    sendMessageToPlayer(message);
}

function sendPlayerConfigChangedCommand() {
    if (!sessionId.value) {
        return;
    }

    const message: VopPlayerConfigChangedNotification = {
        type: 'vopPlayerConfigChangedNotification',
        sessionId: sessionId.value,
        playerConfig: playerConfig,
    };
    sendMessageToPlayer(message);
}

function sendMessageToPlayer(message: VeronaPlayerReceiveMessage) {
    if (veronaHost.value) {
        veronaHost.value.contentWindow?.postMessage(message, '*');
    }
}

onMounted(async () => {
    window.addEventListener('message', handlePlayerMessage);
    await loadVeronaPlayer();
});
</script>

<template>
    <iframe ref="verona-host" class="verona-frame"></iframe>
</template>

<style scoped>
.verona-frame {
    border: none;
    display: block;
}
</style>
