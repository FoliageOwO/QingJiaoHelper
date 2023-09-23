import { getAvailableGradeLevels } from "./api";

/// imports end

/* ------------ 脚本定义 ------------ */
export const scriptName = "QingJiaoHelper";
export const scriptVersion = "v0.3.0";
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
export const isLogined = () => JSON.stringify(userInfo()) !== "{}";
export const accountGradeLevel = () =>
  isLogined() ? userInfo().department.gradeName : "未登录";

// TODO 优化获取方式
// 似乎无法通过 API 获取自学年级名列表，目前只使用了手动列举
export const coursesGradeLevels = async () => await getAvailableGradeLevels();
export const selfCoursesGradeLevels = async () => [
  "小学",
  "初中",
  "高中",
  "中职",
  "通用",
];
