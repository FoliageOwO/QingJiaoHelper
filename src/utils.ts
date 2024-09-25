import Toastify from "toastify-js";

import {
  toastifyDuration,
  toastifyGravity,
  toastifyPosition,
  fuzzyFindConfidenceTreshold,
} from "./consts";

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
    `${name} 功能当前不可用，请尝试刷新页面。如果问题依旧请上报这个 bug！`,
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

/**
 * 等待页面某个元素完全加载完成并获取这个元素对象
 * @param querySelector 选择器
 */
export async function waitForElementLoaded(
  querySelector: string
): Promise<HTMLElement> {
  return new Promise<HTMLElement>((resolve, reject) => {
    let attempts = 0;
    const tryFind = () => {
      const element = document.querySelector(querySelector) as HTMLElement;
      if (element) {
        resolve(element);
      } else {
        attempts++;
        if (attempts >= 30) {
          console.error(`无法找到元素 [${querySelector}]，已放弃！`);
          reject();
        } else {
          setTimeout(tryFind, 250 * Math.pow(1.1, attempts));
        }
      }
    };
    tryFind();
  });
}

/**
 * 删除文本里的所有空格
 * @param string 输入文本
 * @returns 删除空格后的文本
 */
export function removeSpaces(string: string | null): string | null {
  return isNone(string) ? null : string.replace(/\s*/g, "");
}

/**
 * 把通用答案转为显示友好答案
 * @param answers 通用答案，如 `0,1,2`
 * @returns 显示友好答案，如 `ABC`
 */
export function toDisplayAnswer(answer: string): string {
  const alphas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  let result = "";
  for (const singleAnswer of answer.split(",")) {
    const index = Number(singleAnswer);
    result = result + alphas[index];
  }
  return result;
}

/**
 * 把元素节点列表转换为元素数组
 * @param nodeList 元素节点列表
 * @returns 元素数组
 */
export function nodeListToArray(nodeList: NodeList): Element[] {
  return Array.prototype.slice.call(nodeList);
}

/**
 * 把 HTML 元素集合转换为元素数组
 * @param htmlCollection HTML 元素集合
 * @returns 元素数组
 */
export function htmlCollectionToArray<T extends Element>(
  htmlCollection: HTMLCollectionOf<T>
): T[] {
  const result: T[] = [];
  for (const element of htmlCollection) result.push(element);
  return result;
}

/**
 * 比较两个数组之间的差异并返回结果
 * @param array1 第一个数组
 * @param array2 第二个数组
 * @returns 两个数组之间的差异的数组
 */
export function arrayDiff<T>(array1: T[], array2: T[]): T[] {
  return array1.concat(array2).filter((v, _, array) => {
    return array.indexOf(v) === array.lastIndexOf(v);
  });
}

/**
 * 判断两个字符串是否模糊相同
 * @param a 第一个字符串
 * @param b 第二个字符串
 * @returns 相似度是否超过设定阈值和相似度
 */
export function fuzzyMatch(
  a: string,
  b: string
): { matched: boolean; confidence: number } {
  const aChars = a.split("");
  const bChars = b.split("");
  const diff = arrayDiff(aChars, bChars);
  const diffLength = diff.length;
  const unconfidence = diffLength / length;
  return {
    matched: 1 - unconfidence >= fuzzyFindConfidenceTreshold,
    confidence: 1 - unconfidence,
  };
}

/**
 * 在题库中精确匹配问题
 * @param papers 待查找的问题列表
 * @param question 网页显示的问题文本
 * @returns 匹配出来的答案文本和真正的问题文本列表，匹配不到会返回 `null`
 */
export function accurateFind(
  papers: { question: string; answer: string }[],
  question: string
): [{ answer: string; realQuestion: string }[], n: number] | null {
  const results = papers.filter((it) => removeSpaces(it.question) === question);
  if (results.length > 0) {
    console.debug(`精确匹配问题：${question} → ${question}`);
    return [
      results.map((it) => {
        return { answer: it.answer, realQuestion: it.question };
      }),
      results.length,
    ];
  } else {
    return null;
  }
}

/**
 * 在题库中模糊匹配问题
 * @param papers 待查找的问题列表
 * @param question 网页显示的问题文本
 * @returns 匹配出来的答案文本和真正的问题文本列表，如果未找到高度匹配的结果返回 `null`
 */
export function fuzzyFind(
  papers: { question: string; answer: string }[],
  question: string
): [{ answer: string; realQuestion: string }[], n: number] | null {
  // 先把问题文本转为字符列表
  const chars = question.split("");
  // 取它的长度（即文本的长度）
  const length = chars.length;
  // 临时存储
  const percentages: {
    question: string;
    answer: string;
    confidence: number;
  }[] = [];

  for (const paper of papers) {
    // 把题库中的问题文本转为字符列表
    const questionChars = paper.question.split("");
    // 比较原文本和题库的题，并拿到不重复的部分
    const { matched, confidence } = fuzzyMatch(question, paper.question);
    if (matched) {
      percentages.push({
        question: paper.question,
        answer: paper.answer,
        confidence,
      });
    }
  }

  // 通过排序，获得不匹配度最低的（即匹配度最高的）
  const theMostConfidents = percentages
    .filter((it) => it.confidence > 0)
    .sort((a, b) => a.confidence - b.confidence);

  if (theMostConfidents.length <= 0) {
    console.error(`模糊匹配未找到高度匹配的结果：${question}`);
    return null;
  }

  // 获得匹配度最高的问题的问题文本和答案，返回
  console.debug(
    `模糊匹配问题：${question} → ${theMostConfidents
      .map((it) => `（${it.confidence}）${it.question}`)
      .join("||")}`
  );
  return [
    theMostConfidents.map((it) => {
      return { answer: it.answer, realQuestion: it.question };
    }),
    theMostConfidents.length,
  ];
}
/**
 * 插入值到HTML输入元素
 * @param input 要插入值的输入元素
 * @param value 要插入到输入元素的值
 */
export async function insertValue(
  input: ReactHTMLInputElement,
  value: string
): Promise<void> {
  input.value = value;
  const event: SimulatedEvent = new Event("input", {
    bubbles: true,
  }) as SimulatedEvent;
  const tracker = input._valueTracker;
  event.simulated = true;
  if (tracker) {
    tracker.setValue(value);
  }
  input.dispatchEvent(event);
}

/**
 * 模拟登录
 * @param account 账号
 * @param password 密码
 */
export async function login(account: string, password: string): Promise<void> {
  const loginButton = await waitForElementLoaded(
    "#app > div > div.home-container > div > div > main > div.white-bg-panel > div.login_home > div > div.padding-panel.btn-panel > div > button"
  );
  loginButton.click();
  const accountInput: ReactHTMLInputElement = (await waitForElementLoaded(
    "#account"
  )) as ReactHTMLInputElement;
  const passwordInput: ReactHTMLInputElement = (await waitForElementLoaded(
    "#password"
  )) as ReactHTMLInputElement;
  passwordInput.type = "text";
  const submitButton = await waitForElementLoaded(
    "body > div:nth-child(14) > div > div.ant-modal-wrap > div > div.ant-modal-content > div > form > div > div > div > button"
  );

  // 等待完全加载完毕再输入
  await new Promise((resolve) => setTimeout(resolve, 500));

  await insertValue(accountInput, account);
  await insertValue(passwordInput, password);
  submitButton.click();

  // 不出意外都会弹出滑块验证，等待弹出后开始模拟验证
  waitForElementLoaded("#login_nc")
    .then(async () => {
      showMessage("正在进行模拟滑块验证，请稍等...", "green");
      await mockVerify();
      waitForElementLoaded(
        "div > div > div > div.ant-notification-notice-description"
      ).then(() => {
        showMessage(
          "检测到滑块验证登入失败，请重新刷新网页并确保开发者工具处于开启状态！",
          "red"
        );
      });
    })
    .catch(() => {
      console.log("无滑块验证出现，已直接登入");
    });
}

/**
 * 模拟完成滑块验证
 */
export async function mockVerify(): Promise<void> {
  const mockDistance = 394; // 滑块验证的长度
  const mockInterval = 20; // 滑动间隔
  const mockButtonId = "nc_1_n1z"; // 滑块验证的可交互按钮 ID

  const verifyButton = document.getElementById(mockButtonId);
  const clientRect = verifyButton.getBoundingClientRect();
  const x = clientRect.x;
  const y = clientRect.y;

  // 创建鼠标点击事件
  const mousedown = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    // view: window,
    clientX: x,
    clientY: y,
  });

  // 触发鼠标点击事件
  verifyButton.dispatchEvent(mousedown);

  let dx = 0;
  let dy = 0;
  const timer = setInterval(function () {
    const _x = x + dx;
    const _y = y + dy;

    // 创建鼠标移动事件
    const mousemoveEvent = new MouseEvent("mousemove", {
      bubbles: true,
      cancelable: true,
      // view: window,
      clientX: _x,
      clientY: _y,
    });
    // 触发鼠标移动事件
    verifyButton.dispatchEvent(mousemoveEvent);

    if (_x - x >= mockDistance) {
      clearInterval(timer);

      // 创建鼠标释放事件
      const mouseupEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        // view: window,
        clientX: _x,
        clientY: _y,
      });

      // 触发鼠标释放事件
      verifyButton.dispatchEvent(mouseupEvent);
    } else {
      dx += Math.ceil(Math.random() * 50);
    }
  }, mockInterval);
}
