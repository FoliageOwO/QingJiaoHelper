import { getGMValue } from "./utils";

/// imports end

/* ------------ 动态值 ------------ */
export const isTaskCoursesEnabled = () =>
  getGMValue("qjh_isTaskCoursesEnabled", false);
export const isTaskSelfCourseEnabled = () =>
  getGMValue("qjh_isTaskSelfCourseEnabled", false);
export const isTaskGetCreditEnabled = () =>
  getGMValue("qjh_isTaskGetCreditEnabled", false);
export const isTaskSingleCourseEnabled = () =>
  getGMValue("qjh_isTaskSingleCourseEnabled", false);
export const isTaskSkipEnabled = () =>
  getGMValue("qjh_isTaskSkipEnabled", false);
export const isTaskFinalExaminationEnabled = () =>
  getGMValue("qjh_isTaskFinalExaminationEnabled", false);
export const isFullAutomaticEmulationEnabled = () =>
  getGMValue("qjh_isFullAutomaticEmulationEnabled", false);

/* ------------ 功能 ------------ */
export const features: feature[] = [
  {
    key: "courses",
    title: "自动完成所有课程（不包括考试）",
    matcher: ["/courses", "/drugControlClassroom/courses"],
    // task: () => taskCourses(false),
    task: async (callback) => {
      console.log("自动完成所有课程（不包括考试）");
      setTimeout(() => {
        console.log("done")
        callback()
      }, 2000)
    },
    enabled: isTaskCoursesEnabled,
  },
  {
    key: "selfCourse",
    title: "自动完成所有自学课程（不包括考试）",
    matcher: ["/selfCourse", "/drugControlClassroom/selfCourse"],
    // task: () => taskCourses(true),
    task: async (callback) => {
      console.log("自动完成所有自学课程（不包括考试）");
      setTimeout(() => {
        console.log("done")
        callback()
      }, 2000)
    },
    enabled: isTaskSelfCourseEnabled,
  },
  {
    key: "credit",
    title: "自动获取每日学分（会花费一段时间，请耐心等待）",
    matcher: ["/admin/creditCenter"],
    // task: taskGetCredit,
    task: async (callback) => {
      console.log("自动获取每日学分");
      setTimeout(() => {
        console.log("done")
        callback()
      }, 2000)
    },
    enabled: isTaskGetCreditEnabled,
  },
  {
    key: "singleCourse",
    title: "单个课程自动完成",
    matcher: /\/courses\/exams\/(\d+)/,
    // task: taskSingleCourse,
    task: async (callback) => {
      console.log("单个课程自动完成");
      setTimeout(() => {
        console.log("done")
        callback()
      }, 2000)
    },
    enabled: isTaskSingleCourseEnabled,
  },
  // {
  //   title: "知识竞赛",
  //   matcher: ["/competition"],
  //   task: taskCompetition,
  //   task: async () => {console.log("知识竞赛")},
  //   enabled: true,
  // },
  {
    key: "finalExamination",
    title: "期末考试",
    matcher: ["/courses/exams/finalExam"],
    // task: taskFinalExamination,
    task: async (callback) => {
      console.log("期末考试");
      // 等待两秒
      setTimeout(() => {
        console.log("done")
        callback()
      }, 2000)
    },
    enabled: isTaskFinalExaminationEnabled,
  },
  {
    key: "skip",
    title: "显示课程视频跳过按钮",
    matcher: /\/courses\/(\d+)/,
    // task: taskSkip,
    task: async (callback) => {
      console.log("显示课程视频跳过按钮");
      setTimeout(() => {
        console.log("done")
        callback()
      }, 2000)
    },
    enabled: isTaskSkipEnabled,
  },
];
