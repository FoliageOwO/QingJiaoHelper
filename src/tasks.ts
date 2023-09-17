import {
  commitExam,
  getAvailableGradeLevels,
  getCourseAnswers,
  getCoursesByGradeLevel,
  getSelfCoursesByGradeLevel,
} from "./api";
import { reqtoken } from "./consts";
import { isNone, showMessage } from "./utils";

/// imports end

/* ------------ 功能函数 ------------ */
/**
 * 开始课程学习，获取并自动提交答案
 * @param courseId 课程 ID
 * @returns 是否提交成功（未测试）
 */
export async function startCourse(courseId: string): Promise<boolean> {
  const answers = await getCourseAnswers(courseId);
  console.debug(`正在提交课程 [${courseId}] 答案...`);
  const data = {
    courseId,
    examCommitReqDataList: answers.map((answer, index) => {
      return {
        examId: index + 1, // examId = index + 1
        answer: Number(answer) || answer, // 如果是单选，则必须要为数字
      };
    }),
    reqtoken: reqtoken(),
  };
  const response = await commitExam(data);
  console.debug(`提交课程 [${data.courseId}] 答案`, response);
  return !isNone(response);
}

/**
 * 开始 `课程中心` 或 `自学课堂` 的学习
 *
 * @param isSelfCourses 是否为自学
 */
export async function taskCourses(isSelfCourses: boolean): Promise<void> {
  // TODO 优化获取方式
  // 似乎无法通过 API 获取自学年级名列表，目前只使用了手动列举
  let gradeLevels = isSelfCourses
    ? ["小学", "初中", "高中", "中职", "通用"]
    : await getAvailableGradeLevels();
  console.debug("获取总年级名列表", gradeLevels);
  // ! ---- 加入年级选择 ----
  gradeLevels = gradeLevels.filter((it) => it === "小学");
  // ! --------------------
  for (const gradeLevel of gradeLevels) {
    const coursesList = isSelfCourses
      ? await getSelfCoursesByGradeLevel(gradeLevel)
      : await getCoursesByGradeLevel(gradeLevel);
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
        }
      } else {
        console.debug(`[${gradeLevel}] 无法找到 courseId，已跳过！`);
      }
    }

    // TODO 暂时还没完成 autoComplete
    showMessage(
      `成功完成了 ${committed} 个${isSelfCourses ? "自学" : ""}课程！`,
      "green"
    );
  }
}
