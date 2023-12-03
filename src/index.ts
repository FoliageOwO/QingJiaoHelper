import { scriptName, scriptVersion } from "./consts";
import { features } from "./features";
import { prepareMenu } from "./menu";
import { getGMValue, login, showMessage, waitForElementLoaded } from "./utils";

/// imports end

("use strict");

export let isMultiTaskEnabled = () => getGMValue("qjh_multiTaskEnabled", false);
export let multiStudents: {
  account: string;
  password: string;
}[] = getGMValue("qjh_multiStudents", []);
export let multiStudentsDone = Array.from(multiStudents);
export let currentStudent: {
  account: string;
  password: string;
} | null = getGMValue("qjh_currentStudent", null);
export let runningTask: string | null = getGMValue("qjh_runningTask", null);
export let pendingTasks: string[] = getGMValue("qjh_pendingTask", []);

/**
 * 激活功能，如果地址不匹配会自动跳转
 * @param feature 功能
 * @param ignoreIsEnabled 是否忽略 `isEnabled`
 */
export async function featureTask(
  feature: feature,
  ignoreIsEnabled: boolean = false
): Promise<void> {
  const matcher = feature.matcher;
  const start = async () => {
    console.log("1 start", feature.key, feature.enabled(), ignoreIsEnabled);
    if (feature.enabled() || ignoreIsEnabled) {
      if (runningTask === null) {
        showMessage(`激活功能：${feature.title}`, "green");
        runningTask = feature.key;
        GM_setValue("qjh_runningTask", feature.key);
        console.log("2 runningtask", runningTask, pendingTasks);
        await feature.task(() => {
          console.log("says done");
          runningTask = null;
          GM_setValue("qjh_runningTask", null);
          if (pendingTasks.length > 0) {
            const nextTask = pendingTasks.shift();
            if (nextTask) {
              featureTask(
                features.find((it) => it.key === nextTask) as feature,
                ignoreIsEnabled
              );
            }
          }
          console.log("3 done", feature.key, pendingTasks);
        });
      } else {
        console.log("4 runningskip", runningTask, pendingTasks);
        pendingTasks.push(feature.key);
      }
    }
  };

  if (feature.enabled() || ignoreIsEnabled) {
    if (matcher instanceof RegExp) {
      if (location.pathname.match(matcher)) {
        await start();
      } else {
        showMessage("无法手动激活该功能，需要自行跳转至对应页面！", "red");
      }
    } else if (matcher.indexOf(location.pathname) !== -1) {
      await start();
    } else {
      location.pathname = matcher[0];

      if (!feature.enabled()) {
        await waitForElementLoaded("body");
        await start();
      }
    }
  }
}

/**
 * 触发功能
 */
function triggerFeatures(): void {
  // 匹配当前的地址，自动执行对应的功能
  if (location.pathname === "/" && !isMultiTaskEnabled()) {
    showMessage(`${scriptName}\n版本：${scriptVersion}`, "green");
  }
  features.forEach((feature: feature) => {
    let matcher = feature.matcher;
    let isMatched =
      matcher instanceof RegExp
        ? location.pathname.match(matcher)
        : matcher.indexOf(location.pathname) !== -1;
    if (isMatched && feature.enabled()) {
      featureTask(feature, false);
    }
  });
}

// 脚本主函数，注册一些东西，并执行功能
(async function () {
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

  console.log("5 run script", pendingTasks, runningTask, isMultiTaskEnabled());

  // 自动完成任务
  if (
    isMultiTaskEnabled() &&
    (runningTask !== null || currentStudent === null)
  ) {
    if (pendingTasks.length === 0) {
      console.log("6 pending0 multistudents", multiStudents);
      if (multiStudents.length > 0) {
        const student = multiStudents.shift();
        console.log("7 shift", student, multiStudents);
        GM_setValue("qjh_multiStudents", multiStudents);
        console.log(`正在完成学生：${student.account}...`);

        await login(student.account, student.password);
        await waitForElementLoaded(
          "#app > div > div.home-container > div > div > main > div.white-bg-panel > div.login_home > div > div.user-center-panel > div.user-info"
        );
        setTimeout(() => {}, 1000);

        currentStudent = student;
        GM_setValue("qjh_currentStudent", student);
        features.forEach((feature: feature) => {
          console.log("8 trytotask", feature.key, feature.enabled());
          featureTask(feature, false);
        });
      } else {
        const size = multiStudentsDone.length;
        console.log(`全自动完成功能已完成 ${size} 名学生！`);
        // 清空已完成的
        multiStudents = [];
        GM_setValue("qjh_multiStudents", []);
        GM_setValue("qjh_multiTaskEnabled", false);
      }
    }
  }
})();
