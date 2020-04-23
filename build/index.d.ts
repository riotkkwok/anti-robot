interface IRobotInfo {
    eventTarget?: HTMLElement | EventTarget;
}
interface IHandler {
    (reasonCode: Reasons, info?: IRobotInfo): any;
}
declare enum Reasons {
    UA_KEYWORD = 1,
    NO_MOVE_CLICK = 2,
    FAKE_CLICK = 3
}
export declare function detectRobot(handler: IHandler, signOpts?: any, threshold?: number): void;
export declare function checkSignature(signOpts?: any): boolean;
export declare function reset(): void;
export {};
