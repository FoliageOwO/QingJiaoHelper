import { scriptName, scriptVersion } from "./consts";
import { taskCourses } from "./tasks";
import { featureNotAvailable, getGMValue, showMessage } from "./utils";

/// imports end

("use strict");

/* ------------ 动态值 ------------ */
export let autoComplete = () => featureNotAvailable("自动完成");

export let isTaskCoursesEnabled = getGMValue<boolean>(
  "qjh_isTaskCoursesEnabled",
  false
);
export let isTaskSelfCourseEnabled = getGMValue<boolean>(
  "qjh_taskSelfCourseEnabled",
  false
);
export let customGradeLevels = getGMValue<string[]>(
  "qjh_customGradeLevels",
  []
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
  // {
  //   title: "自动获取每日学分",
  //   matcher: ["/admin/creditCenter"],
  //   task: taskCredit,
  //   enabled: credits,
  // },
  // {
  //   title: "手动完成",
  //   matcher: /\/courses\/exams\/(\d+)/,
  //   task: taskSingleCourse,
  //   enabled: true,
  // },
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
  // {
  //   title: "课程视频跳过",
  //   matcher: /\/courses\/(\d+)/,
  //   task: taskSkip,
  //   enabled: true,
  // },
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
