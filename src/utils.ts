import Toastify from "toastify-js";

import { toastifyDuration, toastifyGravity, toastifyPosition } from "./consts";

/// imports end

/* ------------ 实用函数 ------------ */
/**
 * 展示消息实用函数
 * @param text 消息文本
 * @param color 颜色
 */
export function showMessage(text: string, color: string): void {
  Toastify({
    text,
    duration: toastifyDuration,
    newWindow: true,
    gravity: toastifyGravity,
    position: toastifyPosition,
    stopOnFocus: true,
    style: { background: color },
  }).showToast();
}

/**
 * 提示功能暂时不可用
 *
 * 如果有些功能需要等待脚本加载完全完成之后才能使用，在加载完全前调用功能就会触发此函数
 *
 * 因此如果多次见到这个提示，很可能是脚本 bug
 * @param name 功能名
 */
export function featureNotAvailable(name: string = "(未知)"): void {
  showMessage(
    `${name} 功能当前不可用，请尝试刷新页面。如果没用请上报这个 bug！`,
    "red"
  );
}

/**
 * 判断一个对象是否是无效对象
 * @param obj 对象
 * @returns 是否是无效对象
 */
export function isNone(obj: any | undefined | null): boolean {
  return obj == undefined || obj == null;
}

/**
 * 获取油猴本地变量
 * @param name 本地变量名
 * @param defaultValue 默认值
 * @returns 值
 */
export function getGMValue<T>(name: string, defaultValue: T): T {
  let value = GM_getValue(name) as T;
  if (isNone(value)) {
    value = defaultValue;
    GM_setValue(name, defaultValue);
  }
  return value;
}
