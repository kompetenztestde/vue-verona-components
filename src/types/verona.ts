export type Parameter = {
    key: string;
    value: string;
};

export type Progress = 'none' | 'some' | 'complete';

export type Page = {
    id: string;
    label: string;
};

export type UnitState = {
    dataParts: Record<string, string>;
    presentationProgress: Progress;
    responseProgress: Progress;
    unitStateDataType: string;
};

export type PlayerState = {
    validPages: Page[];
    currentPage: string;
    sharedParameters: Parameter[];
};

export type Log = {
    timeStamp: string;
    key: string;
    content: string;
};

export type NavigationTarget = 'next' | 'previous' | 'first' | 'last' | 'end';

export type VopReadyNotification = {
    type: 'vopReadyNotification';
    metadata: string;
};

export type State = {
    timeStamp: string;
    unitState?: UnitState;
    playerState: PlayerState;
    log?: Log[];
};

export type VopStateChangedNotification = {
    type: 'vopStateChangedNotification';
    sessionId: string;
    timeStamp: string;
    unitState?: UnitState;
    playerState: PlayerState;
    log?: Log[];
};

export type VopWindowFocusChangedNotification = {
    type: 'vopWindowFocusChangedNotification';
    timeStamp: string;
    hasFocus: boolean;
};

export type VopUnitNavigationRequestedNotification = {
    type: 'vopUnitNavigationRequestedNotification';
    sessionId: string;
    target: NavigationTarget;
};

export type RuntimeError = {
    code: string;
    message: string;
};

export type VopRuntimeErrorNotification = {
    type: 'vopRuntimeErrorNotification';
    sessionId: string;
    code: string;
    message: string;
};

export type VopWidgetCall = {
    type: 'vopWidgetCall';
    sessionId: string;
    callId: string;
    widgetType: 'WIDGET_CALC' | 'WIDGET_PERIODIC_TABLE' | 'WIDGET_MOLECULE_EDITOR' | 'UNIT';
    parameters: Parameter[];
    state: string;
};

export type VeronaPlayerSendMessage =
    | VopReadyNotification
    | VopStateChangedNotification
    | VopWindowFocusChangedNotification
    | VopUnitNavigationRequestedNotification
    | VopRuntimeErrorNotification
    | VopWidgetCall;

export type LogPolicy = 'disabled' | 'lean' | 'rich' | 'debug';
export type PagingMode = 'separate' | 'buttons' | 'concat-scroll' | 'concat-scroll-snap';
export type PrintMode = 'off' | 'on' | 'on-with-ids';

export type PlayerConfig = {
    unitNumber?: number;
    unitTitle?: string;
    unitId?: string;
    logPolicy?: LogPolicy;
    pagingMode?: PagingMode;
    printMode?: PrintMode;
    enabledNavigationTargets?: NavigationTarget[];
    startPage?: string;
    directDownloadUrl?: string;
    sharedParameters?: Parameter[];
};

export type NavigationDeniedReason = 'presentationIncomplete' | 'responsesIncomplete';

export type VopStartCommand = {
    type: 'vopStartCommand';
    sessionId: string;
    unitDefinition?: string;
    unitDefinitionType?: string;
    unitState?: UnitState;
    playerConfig?: PlayerConfig;
};
export type VopPageNavigationCommand = {
    type: 'vopPageNavigationCommand';
    sessionId: string;
    target: string;
};

export type VopNavigationDeniedNotification = {
    type: 'vopNavigationDeniedNotification';
    sessionId: string;
    reason: NavigationDeniedReason[];
};

export type VopPlayerConfigChangedNotification = {
    type: 'vopPlayerConfigChangedNotification';
    sessionId: string;
    playerConfig?: PlayerConfig;
};

export type VopWidgetReturn = {
    type: 'vopWidgetReturn';
    sessionId: string;
    callId: string;
    state: string;
};

export type VeronaPlayerReceiveMessage =
    | VopStartCommand
    | VopPageNavigationCommand
    | VopNavigationDeniedNotification
    | VopPlayerConfigChangedNotification
    | VopWidgetReturn;
