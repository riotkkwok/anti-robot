interface ISignature {
  pageUrl: string; // 页面地址
  referrer: string; // 页面来源
  pageTime: number; // 进入页面的时间
  historyLength: number; // 历史栈长度
  options?: any // 用户自定义维度
}
interface IRobotInfo {
  eventTarget?: HTMLElement | EventTarget;
}
interface IHandler {
  (reasonCode: Reasons, info?: IRobotInfo): any;
}
enum Reasons {
  UA_KEYWORD = 1, // UA包含模拟器、爬虫、机器人、无头浏览器等信息
  NO_MOVE_CLICK, // 没有鼠标／键盘交互的点击事件（如按键精灵等）
  FAKE_CLICK // 非人为的点击事件（如程序调用等）
};
enum ClickType {
  NULL,
  KEYBOARD,
  MOUSE
}
interface ClickInfo {
  type: ClickType;
  time: number;
}

const ErrorPrefix = 'Uncaught TypeError: Failed to execute \'detectRobot\' method: ';

const UA = window.navigator.userAgent;
const IsMobileDevice = /iPhone|iPod|iPad|Android/i.test(UA);

let duration = 10000;

let signature: ISignature = genSignature();

const handlerList: IHandler[] = [];

class ClickTypeStack {
  list: ClickInfo[];
  constructor () {
    this.list = [];
  }
  public shiftIn = function (type: ClickType) {
    if (this.list.length === 5) {
      this.shiftOut();
    }
    const info: ClickInfo = {
      type,
      time: Date.now()
    };
    this.list.unshift(info);
  }
  public shiftOut = function () {
    this.list.shift();
  }
  public isAllEqualsTo = function (type: ClickType) {
    if (this.list.length === 0) {
      return false;
    }
    for (let t of this.list) {
      if (t.type !== type) {
        return false;
      }
    }
    return true;
  }
  public getOldestTime = function (): number | undefined {
    if (this.list.length > 0) {
      return this.list[0].time;
    } else {
      return undefined;
    }
  }
  public size = function (): number {
    return this.list.length;
  }
}
const clickTypeStack = new ClickTypeStack();

const lastEvents = {
  click: 0,
  keydown: {
    key: '',
    time: 0
  },
  mousedown: 0,
  mousemove: 0
};

export function detectRobot (handler: IHandler, signOpts?: any, threshold?: number) {
  if (!handler || typeof handler !== 'function') {
    throw new Error(ErrorPrefix + 'The type of argument \'handler\' is invalid.');
  }
  handlerList.push(handler);
  if (signOpts && typeof signOpts === 'object') {
    signature.options = signOpts;
  }
  if (threshold > 0) {
    duration = threshold;
  }
  if (checkUA()) {
    robotHandler(Reasons.UA_KEYWORD);
    return;
  }
  setDeviceEventListener();
}

function genSignature (signOpts?: any): ISignature {
  const sign: ISignature = {
    pageUrl: '',
    referrer: '',
    pageTime: -1,
    historyLength: -1
  };
  sign.pageUrl = window.location.href;
  sign.referrer = document.referrer;
  if (window.performance && window.performance?.now() > 0) {
    sign.pageTime = Date.now() - Math.floor(window.performance.now());
  } else {
    sign.pageTime = Date.now();
  }
  sign.historyLength = history.length;
  if (signOpts && typeof signOpts === 'object') {
    sign.options = signOpts;
  }
  return sign;
}

/**
 * check if the signature presents the same as latest state
 * @param signOpts 
 * @returns true if it is nothing changed, otherwise returns false..
 */
export function checkSignature (signOpts?: any): boolean {
  const nowSign = genSignature();
  let key: (keyof ISignature);
  for (key in nowSign) {
    if (nowSign[key] !== signature[key]) {
      return false;
    }
  }
  if (signOpts && typeof signOpts === 'object') {
    if (!signature.options || typeof signature.options !== 'object') {
      return false;
    }
    if (Object.keys(signOpts) !== Object.keys(signature.options)) {
      return false;
    }
    for (let key in signOpts) {
      if (signOpts[key] !== signature?.options[key]) {
        return false;
      }
    }
  }
  return true;
}

export function reset () {
  signature = genSignature();
  while (handlerList.length > 0) {
    handlerList.pop();
  }
}

function checkUA (): boolean {
  const regExp = /emulator|headless|spider|null|undefined|robot|[^\x00-\xff]/i;
  return regExp.test(UA);
}

function setDeviceEventListener () {
  if (IsMobileDevice) { // mobile device
    // TODO:
  } else {
    document.addEventListener('keydown', keyDownListener, true);
    document.addEventListener('mousedown', mouseDownListener, true);
    document.addEventListener('mousemove', mouseMoveListener, true);
    document.addEventListener('click', clickListener, true);
  }
}

function keyDownListener (evt: KeyboardEvent) {
  lastEvents.keydown.key = evt.key;
  lastEvents.keydown.time = Date.now();
}

function mouseDownListener (evt: MouseEvent) {
  lastEvents.mousedown = Date.now();
}

function mouseMoveListener (evt: MouseEvent) {
  lastEvents.mousemove = Date.now();
}

function clickListener (evt: MouseEvent) {
  lastEvents.click = Date.now();
  const key2click = lastEvents.click - lastEvents.keydown.time;
  const mouse2click = lastEvents.click - lastEvents.mousedown;

  if (key2click < 500 && lastEvents.keydown.key === 'Enter' && key2click < mouse2click) {
    // 0.5秒内键盘点击Enter键，且该触发时间比鼠标点击时间更接近
    clickTypeStack.shiftIn(ClickType.KEYBOARD);
  } else if (mouse2click < 500 && mouse2click < key2click) {
    // 0.5秒内鼠标点击，且该触发时间比键盘点击时间更接近
    clickTypeStack.shiftIn(ClickType.MOUSE);
  } else {
    clickTypeStack.shiftIn(ClickType.NULL);
    robotHandler(Reasons.FAKE_CLICK, {
      eventTarget: evt.target
    });
    return;
  }

  if (clickTypeStack.size() === 5 && clickTypeStack.isAllEqualsTo(ClickType.MOUSE)
   && lastEvents.click - clickTypeStack.getOldestTime() < duration
   && lastEvents.click - lastEvents.mousemove > duration) {
    // 最近5次点击事件的类型都是鼠标、并在一定的时间内触发（默认10秒）、且期间没有触发过鼠标移动
    robotHandler(Reasons.NO_MOVE_CLICK, {
      eventTarget: evt.target
    });
  }
}

function robotHandler (reasonCode: Reasons, info?: IRobotInfo) {
  for (let fn of handlerList) {
    fn(reasonCode, info);
  }
}
