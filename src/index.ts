import { scriptName, scriptVersion } from "./consts";
import {
  taskCourses,
  taskGetCredit,
  taskSingleCourse,
  taskSkip,
} from "./tasks";
import { featureNotAvailable, getGMValue, showMessage } from "./utils";

/// imports end

("use strict");

/* ------------ 动态值 ------------ */
export const isTaskCoursesEnabled = getGMValue<boolean>(
  "qjh_isTaskCoursesEnabled",
  false
);
export const isTaskSelfCourseEnabled = getGMValue<boolean>(
  "qjh_isTaskSelfCourseEnabled",
  false
);
export const isTaskGetCreditEnabled = getGMValue<boolean>(
  "qjh_isTaskGetCreditEnabled",
  false
);
export const isTaskSingleCourseEnabled = getGMValue<boolean>(
  "qjh_isTaskSingleCourseEnabled",
  true
);
export const customGradeLevels = getGMValue<string[]>(
  "qjh_customGradeLevels",
  []
);
export const isFullAutomaticEmulation = getGMValue<boolean>(
  "qjh_isFullAutomaticEmulation",
  false
);

/* ------------ 自动完成的一些值 ------------ */
export let autoComplete = () => featureNotAvailable("自动完成");
export let autoCompleteCreditsDone = getGMValue<boolean>(
  "qjh_autoCompleteCreditsDone",
  false
);

/* ------------ 功能 ------------ */
type feature = {
  title: string;
  matcher: RegExp | string[];
  task: Function;
  enabled: boolean;
};

const features: feature[] = [
  {
    title: "自动完成所有课程（不包括考试）",
    matcher: ["/courses", "/drugControlClassroom/courses"],
    task: () => taskCourses(false),
    // enabled: isTaskCoursesEnabled,
    enabled: true,
  },
  {
    title: "自动完成所有自学课程（不包括考试）",
    matcher: ["/selfCourse", "/drugControlClassroom/selfCourse"],
    task: () => taskCourses(true),
    // enabled: isTaskSelfCourseEnabled,
    enabled: true,
  },
  {
    title: "自动获取每日学分",
    matcher: ["/admin/creditCenter"],
    task: taskGetCredit,
    // enabled: isTaskGetCreditEnabled,
    enabled: true,
  },
  {
    title: "手动完成",
    matcher: /\/courses\/exams\/(\d+)/,
    task: taskSingleCourse,
    // enabled: isTaskSingleCourseEnabled,
    enabled: true,
  },
  // {
  //   title: "知识竞赛",
  //   matcher: ["/competition"],
  //   task: taskCompetition,
  //   enabled: true,
  // },
  // {
  //   title: "期末考试",
  //   matcher: ["/courses/exams/finalExam"],
  //   task: taskFinalExam,
  //   enabled: true,
  // },
  {
    title: "显示课程视频跳过按钮",
    matcher: /\/courses\/(\d+)/,
    task: taskSkip,
    enabled: true,
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
    if (isMatched && feature.enabled) {
      showMessage(`激活功能：${feature.title}`, "green");
      feature.task();
    }
  });
}

// 脚本主函数，注册一些东西，并执行功能
(function () {
  // 加载 `__DATA__`
  for (let script of document.getElementsByTagName("script")) {
    if (script.innerText.indexOf("window.__DATA__") != -1) {
      eval(script.innerText);
    }
  }

  // 脚本初加载
  // 应用 `toastifycss` 样式
  GM_addStyle(GM_getResourceText("toastifycss"));
  GM_addStyle(GM_getResourceText("spectrecss"));
  // 注册菜单
  GM_registerMenuCommand("菜单", showMenu);

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
  autoComplete = () =>
    features.forEach((feature: feature) => {
      showMessage(`自动激活功能：${feature.title}`, "green");
      feature.task();
    });
})();
