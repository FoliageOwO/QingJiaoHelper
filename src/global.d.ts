/**
 * 油猴内部的样式添加函数
 * @param styleText 样式文本
 */
declare function GM_addStyle(styleText: string): void;

/**
 * 油猴内部的获取元属性资源文本函数
 * @param resourceName 元属性资源名
 * @returns 获取到的资源文本
 */
declare function GM_getResourceText(resourceName: string): string;

/**
 * 油猴内部的注册菜单命令函数
 * @param menuText 菜单按钮名
 * @param func 对应的脚本函数
 */
declare function GM_registerMenuCommand(menuText: string, func: Function): void;

/**
 * 油猴内部的获取本地变量函数
 * @param name 本地变量名
 */
declare function GM_getValue(name: string): any;

/**
 * 油猴内部的设置本地变量值函数
 * @param name 本地变量名
 * @param value 值
 */
declare function GM_setValue(name: string, value: any): void;

/**
 * 青骄课堂 API 类型定义
 */
type api = {
  method: "GET" | "POST";
  api: string;
};

/**
 * 外部菜单展示函数定义（在编译时添加的函数）
 */
declare function showMenu(): void;
