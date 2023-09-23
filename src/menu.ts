import { features } from "./";
import {
  coursesGradeLevels,
  scriptVersion,
  selfCoursesGradeLevels,
} from "./consts";
import {
  getGMValue,
  nodeListToArray,
  showMessage,
  waitForElementLoaded,
} from "./utils";

/// imports end

/* ------------ 渲染菜单 ------------ */
export const customGradeLevels = getGMValue<string[]>(
  "qjh_customGradeLevels",
  []
);
export const customSelfGradeLevels = getGMValue<string[]>(
  "qjh_customSelfGradeLevels",
  []
);

/**
 * 解析菜单 HTML
 */
export async function prepareMenu() {
  const menuElement = await waitForElementLoaded("#qjh-menu");
  const coursesGradeLevelsList = await coursesGradeLevels();
  const selfCoursesGradeLevelsList = await selfCoursesGradeLevels();

  // 标题添加版本号
  const titleElement = await waitForElementLoaded("#qjh-menu-title");
  titleElement.append(scriptVersion);

  // 添加年级列表
  // TODO 优化这里的命名和逻辑，太阴间了
  for (const {
    selector,
    gradeLevels,
    customGradeLevelsList,
    customGradeLevelsListChangeHandler,
  } of [
    {
      selector: "#qjh-menu-feat-courses",
      gradeLevels: coursesGradeLevelsList,
      customGradeLevelsList: customGradeLevels,
      customGradeLevelsListChangeHandler: (value: string[]) =>
        GM_setValue("qjh_customGradeLevels", value),
    },
    {
      selector: "#qjh-menu-feat-self-courses",
      gradeLevels: selfCoursesGradeLevelsList,
      customGradeLevelsList: customSelfGradeLevels,
      customGradeLevelsListChangeHandler: (value: string[]) =>
        GM_setValue("qjh_customSelfGradeLevels", value),
    },
  ]) {
    const element = await waitForElementLoaded(selector);
    for (const gradeLevel of gradeLevels) {
      const label = document.createElement("label");
      label.className = "form-checkbox form-inline";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked =
        // gradeLevel === converToGenericGradeLevel(accountGradeLevel()) ||
        customGradeLevelsList().indexOf(gradeLevel) !== -1;
      input.onchange = () => {
        if (input.checked) {
          customGradeLevelsListChangeHandler(
            Array.of(...customGradeLevelsList(), gradeLevel)
          );
        } else {
          customGradeLevelsListChangeHandler(
            customGradeLevelsList().filter((it) => it !== gradeLevel)
          );
        }
      };

      const i = document.createElement("i");
      i.className = "form-icon";

      label.appendChild(input);
      label.appendChild(i);
      label.append(gradeLevel);

      element.appendChild(label);
    }
  }

  // 添加关闭按钮反馈
  const closeButton = await waitForElementLoaded("#qjh-menu-close-button");
  closeButton.onclick = () => {
    menuElement.style.display = "none";
  };

  // 添加切换改变监测
  const toggleInputs = nodeListToArray(
    document.querySelectorAll("input")
  ).filter(
    (element) => element.getAttribute("qjh-type") === "toggle"
  ) as HTMLInputElement[];
  for (const toggleInput of toggleInputs) {
    const key = toggleInput.getAttribute("qjh-key");
    toggleInput.checked = GM_getValue(key);
    toggleInput.onchange = () => {
      GM_setValue(key, toggleInput.checked);
    };
  }

  // 添加一键完成按钮点击监测
  const featButtons = nodeListToArray(
    document.querySelectorAll("button")
  ).filter(
    (element) => element.getAttribute("qjh-feat-key") !== null
  ) as HTMLButtonElement[];
  for (const featButton of featButtons) {
    const key = featButton.getAttribute("qjh-feat-key");
    const feature = features.find((feature) => feature.key === key);
    featButton.onclick = () => {
      if (feature.enabled()) {
        showMessage(`手动激活功能：${feature.title}`, "green");
        feature.task();
      } else {
        showMessage(`功能 ${feature.title} 未被启用！`, "red");
      }
    };
  }
}
