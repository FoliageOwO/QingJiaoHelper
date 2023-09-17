import axios, { AxiosResponse } from "axios";

import { isNone } from "./utils";

/// imports end

/* ------------ API ------------ */
const apiGetGradeLevels: api = {
  method: "GET",
  api: "/course/getHomepageGrade",
};
const apiGetCoursesByGradeLevel: api = {
  method: "GET",
  api: "/course/getHomepageCourseList?grade=${grade}&pageSize=50&pageNo=1",
};
const apiGetSelfCoursesByGradeLevel: api = {
  method: "GET",
  api: "/course/getHomepageCourseList?grade=自学&pageNo=1&pageSize=500&sort=&type=${grade}",
};
const apiGetTestPaperList: api = {
  method: "GET",
  api: "/exam/getTestPaperList?courseId=${courseId}",
};
const apiCommitExam: api = {
  method: "POST",
  api: "/exam/commit",
};

/* ------------ API 调用函数 ------------ */
/**
 * 获取 API
 * @param api API
 * @param params 插入参数
 * @param data 附带数据（POST 方法）
 */
export async function requestAPI(
  api: api,
  params?: object,
  data?: object
): Promise<AxiosResponse> {
  const method = api.method;
  let url = `https://www.2-class.com/api${api.api}`;
  for (const key in params) {
    url = url.replaceAll("${" + key + "}", params[key]);
  }
  console.debug(`[${method}] ${url}`, data);
  if (method === "GET") {
    return await axios({ method: "GET", url });
  } else {
    return await axios({
      method: "POST",
      url,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      data,
    });
  }
}

/**
 * 获取所有的年级名，如五年级
 * @returns 所有年级名
 */
export async function getAvailableGradeLevels(): Promise<string[]> {
  return await requestAPI(apiGetGradeLevels).then((response: AxiosResponse) => {
    return response.data.data.map((it) => it.value);
  });
}

/**
 * 获取指定年级名可用的课程列表
 * @param gradeLevel 年级名
 * @returns 所有可用的课程列表
 */
export async function getCoursesByGradeLevel(
  gradeLevel: string
): Promise<any[]> {
  return await requestAPI(apiGetCoursesByGradeLevel, {
    grade: gradeLevel,
  }).then((response: AxiosResponse) => {
    return response.data.data.list;
  });
}

/**
 * 获取指定年级名可用的自学课程列表
 * @param gradeLevel 年级名
 * @returns 所有可用的自学课程列表
 */
export async function getSelfCoursesByGradeLevel(
  gradeLevel: string
): Promise<any[]> {
  return await requestAPI(apiGetSelfCoursesByGradeLevel, {
    grade: gradeLevel,
  }).then((response: AxiosResponse) => {
    return response.data.data.list;
  });
}

/**
 * 获取指定课程 ID 的考试题列表
 * @param courseId 课程 ID
 * @returns 考试题列表
 */
export async function getTestPaperList(courseId: string): Promise<any[]> {
  return await requestAPI(apiGetTestPaperList, { courseId }).then(
    (response: AxiosResponse) => {
      return response.data.data.testPaperList;
    }
  );
}

/**
 * 获取指定课程 ID 的考试题答案列表
 * @param courseId 课程 ID
 * @returns 考试题答案列表
 */
export async function getCourseAnswers(courseId: string): Promise<any[]> {
  const testPaperList = await getTestPaperList(courseId);
  if (!isNone(testPaperList)) {
    const answers = testPaperList.map((column) => column.answer);
    console.debug(`成功获取课程 [${courseId}] 的答案`, answers);
    return answers;
  }
  return null;
}

/**
 * 提交考试
 * @param data 考试数据
 * @returns 请求后的 API 返回数据
 */
export async function commitExam(data: any): Promise<any> {
  const response = await requestAPI(apiCommitExam, {}, data);
  return response.data;
}
