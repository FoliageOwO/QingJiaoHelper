import { features } from "./";
import {
  coursesGradeLevels,
  scriptVersion,
  selfCoursesGradeLevels,
} from "./consts";
import { taskMulti } from "./tasks";
import {
  createAccountPasswordTemplate,
  featureTask,
  getGMValue,
  nodeListToArray,
  resolveAccountPasswordTemplate,
  showMessage,
  waitForElementLoaded,
} from "./utils";

/// imports end

/* ------------ 渲染菜单 ------------ */
export const customGradeLevels = () =>
  getGMValue<string[]>("qjh_customGradeLevels", []);
export const customSelfGradeLevels = () =>
  getGMValue<string[]>("qjh_customSelfGradeLevels", []);

/**
 * 解析菜单 HTML
 */
export async function prepareMenu() {
  const menuElement = await waitForElementLoaded("#qjh-menu");
  const coursesGradeLevelsList = await coursesGradeLevels();
  const selfCoursesGradeLevelsList = await selfCoursesGradeLevels();
  if (coursesGradeLevels === null || selfCoursesGradeLevelsList === null) {
    showMessage(`课程年级列表或自学课程年级列表获取失败！`, "red");
  }

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
    if (gradeLevels === null) {
      continue;
    }
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
        featureTask(feature);
      } else {
        showMessage(`功能 ${feature.title} 未被启用！`, "red");
      }
    };
  }

  // 添加自动完成的表格下载与上传
  const multiDownloadButton = await waitForElementLoaded("#multi-dlxlsx");
  multiDownloadButton.onclick = () => {
    createAccountPasswordTemplate();
  };
  const multiUpload: HTMLInputElement = (await waitForElementLoaded(
    "#multi-ulxlsx"
  )) as HTMLInputElement;
  multiUpload.onchange = async () => {
    const file = multiUpload.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target.result;
        const mutiUploadInfo = await waitForElementLoaded("#multi-ulinfo");
        const { isCorrectFile, students, studentsSize } =
          await resolveAccountPasswordTemplate(content);
        if (isCorrectFile) {
          mutiUploadInfo.innerText = `成功从 ${file.name} 中读取到 ${studentsSize} 个学生`;
          const startButton = await waitForElementLoaded("#multi-ulstart");
          startButton.className = startButton.className
            .split(" ")
            .filter((it) => it !== "disabled")
            .join(" ");
          startButton.onclick = async () => {
            await taskMulti(students);
          };
        } else {
          mutiUploadInfo.innerText = "读取失败！请确保格式正确并重新上传";
        }
      };
      reader.readAsBinaryString(file);
    }
  };
}
