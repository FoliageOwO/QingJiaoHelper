import { scriptName, scriptVersion } from "./consts";
import { prepareMenu } from "./menu";
import {
  taskCourses,
  taskFinalExamination,
  taskGetCredit,
  taskSingleCourse,
  taskSkip,
  taskCompetition,
} from "./tasks";
import { featureNotAvailable, getGMValue, showMessage } from "./utils";

/// imports end

("use strict");

/* ------------ 动态值 ------------ */
export const isTaskCoursesEnabled = () =>
  getGMValue("qjh_isTaskCoursesEnabled", false);
export const isTaskSelfCourseEnabled = () =>
  getGMValue("qjh_isTaskSelfCourseEnabled", false);
export const isTaskGetCreditEnabled = () =>
  getGMValue("qjh_isTaskGetCreditEnabled", false);
export const isTaskFinalExaminationEnabled = () =>
  getGMValue("qjh_isTaskFinalExaminationEnabled", false);
export const isFullAutomaticEmulationEnabled = () =>
  getGMValue("qjh_isFullAutomaticEmulationEnabled", false);
export const isTaskCompetitionEnabled = () =>
  getGMValue("qjh_isTaskCompetitionEnabled", true);

/* ------------ 自动完成的一些值 ------------ */
export let autoComplete = () => featureNotAvailable("自动完成");
export let autoCompleteCreditsDone = () =>
  getGMValue("qjh_autoCompleteCreditsDone", false);

/* ------------ 功能 ------------ */
type feature = {
  key: string;
  title: string;
  matcher: RegExp | string[];
  task: Function;
  enabled: () => boolean;
};

export const features: feature[] = [
  {
    key: "courses",
    title: "自动完成所有课程（不包括考试）",
    matcher: ["/courses", "/drugControlClassroom/courses"],
    task: () => taskCourses(false),
    enabled: isTaskCoursesEnabled,
  },
  {
    key: "selfCourse",
    title: "自动完成所有自学课程（不包括考试）",
    matcher: ["/selfCourse", "/drugControlClassroom/selfCourse"],
    task: () => taskCourses(true),
    enabled: isTaskSelfCourseEnabled,
  },
  {
    key: "credit",
    title: "自动获取每日学分（会花费一段时间，请耐心等待）",
    matcher: ["/admin/creditCenter"],
    task: taskGetCredit,
    enabled: isTaskGetCreditEnabled,
  },
  {
    key: "singleCourse",
    title: "单个课程自动填充答案",
    matcher: /\/courses\/exams\/(\d+)/,
    task: taskSingleCourse,
    enabled: () => true,
  },
  {
    key: "competition",
    title: "知识竞赛",
    matcher: ["/competition"],
    task: taskCompetition,
    enabled: isTaskCompetitionEnabled,
  },
  {
    key: "finalExamination",
    title: "期末考试",
    matcher: ["/courses/exams/finalExam"],
    task: taskFinalExamination,
    enabled: isTaskFinalExaminationEnabled,
  },
  {
    key: "skip",
    title: "显示课程视频跳过按钮",
    matcher: /\/courses\/(\d+)/,
    task: taskSkip,
    enabled: () => true,
  },
];

/**
 * 触发功能
 */
function triggerFeatures(): void {
  // 匹配当前的地址，自动执行对应的功能
  if (location.pathname === "/") {
    showMessage(`${scriptName}\n版本：${scriptVersion}`, "green");
  }
  features.forEach((feature: feature) => {
    let matcher = feature.matcher;
    let isMatched =
      matcher instanceof RegExp
        ? location.pathname.match(matcher)
        : matcher.indexOf(location.pathname) !== -1;
    if (isMatched && feature.enabled()) {
      showMessage(`激活功能：${feature.title}`, "green");
      feature.task();
    }
  });
}

// 脚本主函数，注册一些东西，并执行功能
(function () {
  // 加载 `__DATA__`
  for (let script of document.getElementsByTagName("script")) {
    if (script.innerText.indexOf("window.__DATA__") !== -1) {
      eval(script.innerText);
    }
  }

  // 脚本初加载
  // 应用 `toastifycss` 样式
  GM_addStyle(GM_getResourceText("toastifycss"));
  GM_addStyle(GM_getResourceText("spectrecss"));
  // 注册菜单
  GM_registerMenuCommand("菜单", showMenu);
  prepareMenu();

  // 检测地址改变，并触发对应的功能
  let pathname = location.pathname;
  setInterval(() => {
    const newPathName = location.pathname;
    if (newPathName !== pathname) {
      console.debug(`地址改变`, pathname, newPathName);
      pathname = newPathName;
      triggerFeatures();
    }
  });

  // 默认触发一次
  triggerFeatures();

  // 如果 `自动完成` 功能启用，每次刷新页面就会执行以下函数，即依次开启所有功能
  // TODO
  // autoComplete = () =>
  //   features.forEach((feature: feature) => {
  //     showMessage(`自动激活功能：${feature.title}`, "green");
  //     feature.task();
  //   });
})();
