import { showMessage } from "./utils";

/// imports end

/* ------------ 脚本定义 ------------ */
export const scriptName = "QingJiaoHelper";
export const scriptVersion = "0.2.9";
export const location = globalThis.location;
export const toastifyDuration = 3 * 1000;
export const toastifyGravity = "top";
export const toastifyPosition = "left";

/* ------------ 青骄第二课堂数据 ------------ */
// 这几个都需要懒加载
export const __DATA__: () => {
  reqtoken: string;
  userInfo: {
    account: string;
    department: {
      gradeName: string;
    };
  };
} = () => window["__DATA__"];
export const reqtoken = () => __DATA__().reqtoken;
export const userInfo = () => __DATA__().userInfo;
export const gradeName = () =>
  JSON.stringify(userInfo()) !== "{}"
    ? userInfo().department.gradeName
    : showMessage("你还没有登录！", "red");
