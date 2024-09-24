import { isFullAutomaticEmulationEnabled } from "./";
import {
  addMedal,
  addPCPlayPV,
  commitExam,
  getBeforeResourcesByCategoryName,
  getCourseAnswers,
  getCoursesByGradeLevel,
  getSelfCoursesByGradeLevel,
  likePC,
} from "./api";
import {
  accountGradeLevel,
  coursesGradeLevels,
  isLogined,
  reqtoken,
  selfCoursesGradeLevels,
} from "./consts";
import { customGradeLevels, customSelfGradeLevels } from "./menu";
import {
  accurateFind,
  fuzzyFind,
  isNone,
  removeSpaces,
  showMessage,
  toDisplayAnswer,
  waitForElementLoaded,
  toAnswer,
  nodeListToArray,
} from "./utils";

/// imports end

/* ------------ 功能函数 ------------ */
/**
 * 开始课程学习，获取并自动提交答案
 * @param courseId 课程 ID
 * @returns 是否提交成功（未测试）
 */
export async function startCourse(courseId: string): Promise<boolean> {
  const answers = await getCourseAnswers(courseId);
  if (answers === null) {
    showMessage(`[${courseId}] 无法获取当前课程的答案！`, "red");
    return false;
  } else {
    // console.debug(`正在提交课程 [${courseId}] 答案...`);
    // const data = {
    //   courseId,
    //   examCommitReqDataList: answers.map((answer, index) => {
    //     return {
    //       examId: index + 1, // examId = index + 1
    //       answer: Number(answer) || answer, // 如果是单选，则必须要为数字
    //     };
    //   }),
    //   reqtoken: reqtoken(),
    // };
    // const response = await commitExam(data);
    // console.debug(`提交课程 [${data.courseId}] 答案`, response);
    // return !isNone(response);

    location.href = `https://www.2-class.com/courses/exams/${courseId}`;
  }
}

/**
 * 开始 `课程中心` 或 `自学课堂` 的学习
 *
 * @param isSelfCourses 是否为自学
 */
export async function taskCourses(isSelfCourses: boolean): Promise<void> {
  if (!isLogined()) {
    showMessage("你还没有登录！", "red");
    return;
  }
  let gradeLevels = await (isSelfCourses
    ? selfCoursesGradeLevels
    : coursesGradeLevels)();
  if (gradeLevels === null) {
    showMessage(`获取年级名列表失败，功能已中止！`, "red");
    return;
  }
  console.debug("获取总年级名列表", gradeLevels);
  gradeLevels = isSelfCourses ? customSelfGradeLevels() : customGradeLevels();
  console.debug("已选择的年级列表", gradeLevels);
  for (const gradeLevel of gradeLevels) {
    const coursesList = isSelfCourses
      ? await getSelfCoursesByGradeLevel(gradeLevel)
      : await getCoursesByGradeLevel(gradeLevel);
    if (coursesList === null) {
      showMessage(
        `[${gradeLevel}] 获取当前年级的课程列表失败，已跳过当前年级！`,
        "red"
      );
    }
    // 忽略已完成的和期末考试
    const courseIds = coursesList
      .filter((it) => !it.isFinish && it.title !== "期末考试")
      .map((it) => it.courseId);

    if (courseIds.length === 0) {
      console.debug(
        `[${gradeLevel}] 所有${
          isSelfCourses ? "自学" : ""
        }课程都是完成状态，已跳过！`
      );
      return;
    }
    console.debug(
      `[${gradeLevel}] 未完成的${isSelfCourses ? "自学" : ""}课程`,
      courseIds
    );

    let committed = 0;
    for (const courseId of courseIds) {
      if (courseId === "finalExam") {
        return;
      }
      if (!isNone(courseId)) {
        const result = await startCourse(courseId);
        if (result) {
          committed++;
        } else {
          console.error(`[${courseId}] 无法提交当前课程，已跳过！`);
        }
      } else {
        console.error(`[${gradeLevel}] 无法找到 courseId，已跳过！`);
      }
    }

    // TODO 暂时还没完成 autoComplete
    showMessage(
      `成功完成了 ${committed} 个${isSelfCourses ? "自学" : ""}课程！`,
      "green"
    );
  }
}

/**
 * 开始单个课程自动完成
 */
export async function taskSingleCourse(): Promise<void> {
  if (!isLogined()) {
    showMessage("你还没有登录！", "red");
    return;
  }
  const courseId = location.pathname.match(/(\d+)/g)[0];
  const answers = await getCourseAnswers(courseId);
  await emulateExamination(
    answers,
    "#app > div > div.home-container > div > div > div > div > div > button",
    "#app > div > div.home-container > div > div > div > div > div > div.exam-content-btnbox > button",
    "#app > div > div.home-container > div > div > div > div > div > div.exam-content-btnbox > div > button.ant-btn-primary",
    (answers, _) => {
      const firstAnswer: string = answers.shift().toString();
      return {
        answer: firstAnswer,
        matchedQuestion: null,
      };
    },
    `答题 [${courseId}]`,
    answers.length
  );
  const passText = await waitForElementLoaded(
    "#app > div > div.home-container > div > div > div > div.exam-box > div > div > p.exam-pass-title"
  );
  if (passText) {
    const courses = [];
    const courseLevels = customGradeLevels();
    for (const courseLevel of courseLevels) {
      const result = await getCoursesByGradeLevel(courseLevel);
      for (const course of result) {
        courses.push(course);
      }
    }
    const courseIds = courses
      .filter((it) => !it.isFinish && it.title !== "期末考试")
      .map((it) => it.courseId);
    if (courseIds.length === 0) {
      showMessage("所有的课程已全部自动完成！", "green");
      location.href = "https://www.2-class.com/courses/";
    } else {
      location.href = `https://www.2-class.com/courses/exams/${courseIds[0]}`;
    }
  }
}

/**
 * 考试全自动完成模拟
 * @param answers 答案列表
 * @param startButtonSelector 开始按钮选择器
 * @param primaryNextButtonSelector 初下一题按钮选择器
 * @param secondaryNextButtonSelector 次下一题按钮选择器
 * @param answerHandler 答案处理器，传入答案和问题并由该处理器处理完毕后返回答案和匹配到的问题至本函数
 * @param examinationName 答题名称
 * @param size 最大题目数
 * @param interval 与下一题间隔的时间（单位为毫秒）
 * @param afterStart 点击开始按钮后要执行的操作（异步，适配最新知识竞赛）
 */
export async function emulateExamination(
  answers: string[],
  startButtonSelector: string,
  primaryNextButtonSelector: string,
  secondaryNextButtonSelector: string,
  answerHandler: (
    answers: string[],
    question: string
  ) => {
    answer: string;
    matchedQuestion: string | null;
  },
  examinationName: string,
  size = 100,
  interval = 50,
  afterStart: () => Promise<void> = async () => {}
): Promise<void> {
  // TODO 这个函数有些过于复杂了，之后有时间看看能不能简化并剥离出来
  let isExaminationStarted = false;
  let count = 0;

  /**
   * 下一题子函数
   * @param nextAnswers 下一题的答案
   * @param nextButton 下一题按钮，可以是初下一题按钮，也可以是次下一题按钮，也可以是提交按钮
   */
  const next = async (
    nextAnswers: string[],
    nextButton: HTMLElement = null
  ) => {
    // 获取问题元素
    const questionElement = await waitForElementLoaded(
      ".exam-content-question"
    );
    // 获取问题文本
    const questionText = removeSpaces(
      questionElement.innerText.split("\n")[0] // 获取第一行（题目都是在第一行）
    );
    // 如果考试还未开始，先等 `初下一题` 按钮加载完成，并重新传回此函数开始考试
    if (!isExaminationStarted) {
      const _firstNextButton = await waitForElementLoaded(
        primaryNextButtonSelector
      );
      isExaminationStarted = true;
      await next(nextAnswers, _firstNextButton);
    } else {
      // 如果已经开始过，那么 `count` 必定大于 0
      // 此时，会把下一步按钮从 `初下一题` 按钮更换为 `次下一题` 按钮
      if (count > 0) {
        nextButton = document.querySelector(secondaryNextButtonSelector);
      }

      // 根据题量大小 `size` 开始答题
      if (!isNone(size) && count < size) {
        // 用户点击 `下一步` 按钮会继续触发本函数，传入下一题的答案和下一题的按钮
        // * 延时根据 `interval` 参数决定
        nextButton.onclick = () => {
          setTimeout(() => next(nextAnswers, nextButton), interval);
          return;
        };

        // answer -> 1,2,3
        // `matchedQuestion` 为在题库匹配到的问题，可以是模糊匹配，也可以是精确匹配
        let { answer, matchedQuestion } = answerHandler(answers, questionText);
        // 获取选择框元素，有很多个
        const selections = document.getElementsByClassName(
          "exam-single-content-box"
        );
        console.debug("选择", answer, selections);
        const displayAnswer = toDisplayAnswer(answer);
        // 获取最终的问题文本
        const finalQuestion = matchedQuestion || questionText;
        if (!isFullAutomaticEmulationEnabled()) {
          showMessage(
            `${finalQuestion ? finalQuestion + "\n" : ""}第 ${
              count + 1
            } 题答案：${displayAnswer}`,
            "green"
          );
        }

        // 自动选择答案
        for (const answerIndex of answer.split(",").map((it) => Number(it))) {
          const selectionElement = selections[answerIndex] as HTMLElement;
          // 模拟点击
          selectionElement.click();
        }

        // 如果是全自动，会自动点击下一题的按钮
        if (isFullAutomaticEmulationEnabled()) {
          nextButton.click();
        }

        count++;
      }
    }
  };

  const startButton = await waitForElementLoaded(startButtonSelector);
  if (isFullAutomaticEmulationEnabled()) {
    showMessage(`自动开始 ${examinationName}！`, "blue");
    startButton.click();
    await afterStart();
    setTimeout(() => next(answers, null), interval);
  } else {
    startButton.onclick = async () => {
      showMessage(`开始 ${examinationName}！`, "blue");
      await afterStart();
      setTimeout(() => next(answers, null), interval);
    };
  }
}

/**
 * 自动在课程视频页面添加 `跳过` 按钮
 */
export async function taskSkip(): Promise<void> {
  if (!isLogined()) {
    showMessage("你还没有登录！", "red");
    return;
  }
  const courseId = location.pathname.match(/(\d+)/g)[0];
  const span = await waitForElementLoaded(
    "#app > div > div.home-container > div > div > div.course-title-box > div > a > span"
  );
  span.style.display = "inline-flex";
  const skipButton = document.createElement("button");
  skipButton.type = "button";
  // 和青骄第二课堂的按钮用同样的样式
  skipButton.className = "ant-btn ant-btn-danger ant-btn-lg";
  const skipSpan = document.createElement("span");
  skipSpan.innerText = "跳过";
  skipButton.appendChild(skipSpan);
  skipButton.onclick = () => {
    location.href = `/courses/exams/${courseId}`;
  };
  span.appendChild(skipButton);
}

/**
 * 自动获取学分
 */
export async function taskGetCredit(): Promise<void> {
  if (!isLogined()) {
    showMessage("你还没有登录！", "red");
    return;
  }

  const length = 5;

  // 领取禁毒学子勋章
  const num = await addMedal();
  if (num !== undefined) {
    showMessage(`成功领取禁毒徽章 [${num}]!`, "green");
  } else if (num === null) {
    showMessage("领取徽章失败！", "red");
  } else {
    showMessage("无法领取徽章（可能已领取过），已跳过！", "yellow");
    console.warn("无法领取徽章（可能已领取过），已跳过！");
  }

  // 完成耕读课堂
  // 心理减压、耕读学堂（耕读、电影、音乐、体育、美术、自然、公开课）、校园安全
  const categories = [
    { name: "public_good", tag: "read" },
    { name: "ma_yun_recommend", tag: "labour" }, // the `ma_yun_recommend` has lots of sub-categorys
    { name: "ma_yun_recommend", tag: "movie" },
    { name: "ma_yun_recommend", tag: "music" },
    { name: "ma_yun_recommend", tag: "physicalEducation" },
    { name: "ma_yun_recommend", tag: "arts" },
    { name: "ma_yun_recommend", tag: "natural" },
    { name: "ma_yun_recommend", tag: "publicWelfareFoundation" },
    { name: "school_safe", tag: "safeVolunteer" },
  ];
  let done = 0;
  let failed = 0;
  let liked = 0;

  for (const category of categories) {
    const data = {
      categoryName: category.name,
      pageNo: 1,
      pageSize: 100,
      reqtoken: reqtoken(),
      tag: category.tag,
    };
    const resources = await getBeforeResourcesByCategoryName(data);
    if (resources === null) {
      console.error(`无法获取分类 ${category.name} 的资源，已跳过！`);
      continue;
    }
    console.debug(`获取分类 ${category.name} 的资源`, resources);

    for (const resource of resources) {
      if (done >= length) break;

      const resourceId = resource.resourceId;
      // 假播放
      // 新版青骄课堂改成了 `addPCPlayPV` 的 api，不再是 `sync`
      const resourceData = { resourceId, reqtoken: reqtoken() };
      const result = await addPCPlayPV(resourceData);
      if (result) {
        console.debug(`成功完成资源 [${resourceId}]：${resource.title}`);
        done++;
      } else {
        console.error(`无法完成资源 ${resourceId}，已跳过！`);
        failed++;
      }

      // 点赞
      const likeResult = await likePC(resourceData);
      if (likeResult) {
        console.debug(`成功点赞资源 [${resourceId}]！`);
        liked++;
      } else {
        console.error(`资源点赞失败 [${resourceId}]，已跳过！`);
      }
    }
  }

  // 检查是否都已经完成了
  let beforeDone = done;
  const checkSuccess = setInterval(() => {
    if (done !== 0) {
      if (done === beforeDone) {
        showMessage(
          `成功完成 ${done}/${done + failed} 个资源，点赞 ${liked} 个！`,
          "green"
        );
        // TODO 自动完成
        // autoCompleteCreditsDone = true;
        // GM_setValue('qjh_autoCompleteCreditsDone', true);
        clearInterval(checkSuccess);
      } else {
        beforeDone = done;
      }
    }
  }, 500);
}

/**
 * 开始完成期末考试
 */
export async function taskFinalExamination(): Promise<void> {
  const supportedFinal: { [gradeLevel: string]: string } = libs.supportedFinal;
  // 如果用户的账号年级已被支持
  const gradeLevel = accountGradeLevel();
  if (supportedFinal.hasOwnProperty(gradeLevel)) {
    const paperName = supportedFinal[gradeLevel];
    let papers: {
      question: string;
      answer: string;
    }[] = libs[paperName];

    papers = papers.map((it) => {
      // it.answer -> ABC
      return { question: it.question, answer: toAnswer(it.answer) };
    });

    await emulateExamination(
      papers.map((it) => it.answer),
      "#app > div > div.home-container > div > div > div > div > div > button",
      "#app > div > div.home-container > div > div > div > div > div > div.exam-content-btnbox > button",
      "#app > div > div.home-container > div > div > div > div > div > div.exam-content-btnbox > div > button.ant-btn.ant-btn-primary",
      (_, question) => {
        const { answer, realQuestion } =
          accurateFind(papers, question) || fuzzyFind(papers, question);
        return {
          answer,
          matchedQuestion: realQuestion,
        };
      },
      "期末考试",
      10 // TODO 这个 10 是干什么的我还没搞清楚，之后再说
    );
  } else {
    showMessage(`你的年级 [${gradeLevel}] 暂未支持期末考试！`, "red");
    return;
  }
}

export async function taskMultiComplete(): Promise<void> {
  // TODO
}

/**
 * 此部分代码来自 `https://greasyfork.org/zh-CN/scripts/480897-qingjiaohelper`
 * 修改版作者 Hmjz100，地址 `https://github.com/hmjz100`
 */
export async function taskCompetition(): Promise<void> {
  const supportedCompetition = libs.supportedCompetition;
  const gradeLevel = accountGradeLevel();
  let gradeGroup;
  const gradesPrimary = {
    一年级: 1,
    二年级: 2,
    三年级: 3,
    四年级: 4,
    五年级: 5,
    六年级: 6,
  };
  if (gradeLevel in gradesPrimary) {
    gradeGroup = "小学组";
  } else {
    gradeGroup = "中学组";
  }

  if (supportedCompetition.hasOwnProperty(gradeGroup)) {
    showMessage(`已自动选择 [${gradeGroup}] 知识竞赛题库`, "cornflowerblue");

    const paperName = supportedCompetition[gradeGroup];
    let papers = libs[paperName];
    papers = papers.map((it) => {
      return { question: it.question, answer: toAnswer(it.answer) };
    });

    if (!Array.isArray(papers)) {
      showMessage(`[${gradeGroup}] 暂不支持知识竞赛！`, "red");
      return;
    }

    await emulateExamination(
      papers.map((it) => it.answer),
      "#app > div > div.home-container > div > div > div.competiotion-exam-box-all > div.exam-box > div > div.exam_content_bottom_btn > button",
      "#app > div > div.home-container > div > div > div.competiotion-exam-box-all > div.exam-box > div.competition-sub > button",
      "#app > div > div.home-container > div > div > div.competiotion-exam-box-all > div.exam-box > div.competition-sub > button.ant-btn.ant-btn-primary",
      (_, question) => {
        const { answer, realQuestion } =
          accurateFind(papers, question) || fuzzyFind(papers, question);
        return {
          answer,
          matchedQuestion: realQuestion,
        };
      },
      "知识竞赛",
      20, // 最大题目数，竞赛只有 20 道题目，如果未定义并打开了 `自动下一题并提交` 会导致循环提示最后一题 80 次
      3000, // 与下一题的间隔时间，单位毫秒，默认 3 秒
      async () => {
        // 适配最新知识竞赛
        const gradeGroupDialog = await waitForElementLoaded(
          "#app > div > div.home-container > div > div > div.competiotion-exam-box-all > div.dialog-mask > div"
        );
        const options = nodeListToArray(
          gradeGroupDialog.querySelectorAll(".option")
        );
        const filteredOptions = options.filter(
          (it) => it.innerHTML === gradeGroup
        );
        const resultOption: HTMLElement = filteredOptions[0] as HTMLElement;
        if (filteredOptions.length < 1 || isNone(resultOption)) {
          showMessage(`[${gradeGroup}] 暂不支持知识竞赛！`, "red");
          return;
        } else {
          resultOption.click();
        }
      }
    );
  } else {
    showMessage(`你的年级 [${gradeLevel}] 暂未支持知识竞赛！`, "red");
    return;
  }
}
