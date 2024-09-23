import axios, { AxiosError, AxiosResponse } from "axios";

import { isNone, showMessage } from "./utils";

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
const apiAddMedal: api = {
  method: "GET",
  api: "/medal/addMedal",
};
const apiGetBeforeResourcesByCategoryName: api = {
  method: "POST",
  api: "/resource/getBeforeResourcesByCategoryName",
};
const apiAddPCPlayPV: api = {
  method: "POST",
  api: "/resource/addPCPlayPV",
};
const apiLikePC: api = {
  method: "POST",
  api: "/resource/likePC",
};

/* ------------ API 调用函数 ------------ */
/**
 * 获取 API
 * @param api API
 * @param params 插入参数
 * @param data 附带数据（POST 方法）
 * @returns 获取到的 API 返回数据
 */
export async function requestAPI(
  api: api,
  params?: object,
  data?: object
): Promise<any | null> {
  const method = api.method;
  // const origin = location.origin;
  const origin = "https://www.2-class.com";
  let url = `${origin}/api${api.api}`;
  for (const key in params) {
    url = url.replaceAll("${" + key + "}", params[key]);
  }
  if (method === "GET") {
    return await axios({
      method: "GET",
      url,
    })
      .then((response: AxiosResponse) => {
        const rdata = response.data;
        console.debug(`[${method}] ${url}`, data, rdata);
        if (rdata.success === false || rdata.data === null) {
          const errorMessage: string = rdata.errorMsg;
          const errorCode: string = rdata.errorCode;
          console.error(
            `API 返回错误 [${errorCode}]：${errorMessage}，请刷新页面重试！`
          );
          return null;
        } else {
          return rdata;
        }
      })
      .catch((reason: AxiosError) => {
        showMessage(
          `请求 API 失败（${reason.code}）：${reason.message}\n请将控制台中的具体报错提交！`,
          "red"
        );
        console.error(
          `请求失败（${reason.status}/${reason.code}）→${reason.message}→`,
          reason.toJSON(),
          reason.response,
          reason.stack
        );
      });
  } else {
    return await axios({
      method: "POST",
      url,
      withCredentials: true,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
      },
      data,
    }).then((response: AxiosResponse) => {
      const rdata = response.data;
      console.debug(`[${method}] ${url}`, data, rdata);
      if (rdata.success === false || rdata.data === null) {
        const errorMessage: string = rdata.errorMsg;
        const errorCode: string = rdata.errorCode;
        console.error(
          `API 返回错误 [${errorCode}]：${errorMessage}，请刷新页面重试！`
        );
        return null;
      } else {
        return rdata;
      }
    });
  }
}

/**
 * 获取所有的年级名，如五年级
 * @returns 所有年级名
 */
export async function getAvailableGradeLevels(): Promise<string[] | null> {
  return await requestAPI(apiGetGradeLevels).then((data) => {
    return data ? data.data.map((it: any) => it.value) : null;
  });
}

/**
 * 获取指定年级名可用的课程列表
 * @param gradeLevel 年级名
 * @returns 所有可用的课程列表
 */
export async function getCoursesByGradeLevel(
  gradeLevel: string
): Promise<any[] | null> {
  return await requestAPI(apiGetCoursesByGradeLevel, {
    grade: gradeLevel,
  }).then((data) => {
    return data ? data.data.list : null;
  });
}

/**
 * 获取指定年级名可用的自学课程列表
 * @param gradeLevel 年级名
 * @returns 所有可用的自学课程列表
 */
export async function getSelfCoursesByGradeLevel(
  gradeLevel: string
): Promise<any[] | null> {
  return await requestAPI(apiGetSelfCoursesByGradeLevel, {
    grade: gradeLevel,
  }).then((data) => {
    return data ? data.data.list : null;
  });
}

/**
 * 获取指定课程 ID 的考试题列表
 * @param courseId 课程 ID
 * @returns 考试题列表
 */
export async function getTestPaperList(
  courseId: string
): Promise<any[] | null> {
  return await requestAPI(apiGetTestPaperList, { courseId }).then((data) => {
    return data ? data.data.testPaperList : null;
  });
}

/**
 * 获取指定课程 ID 的考试题答案列表
 * @param courseId 课程 ID
 * @returns 答案列表，如 ["1,2", "0,1", "2,3"]
 */
export async function getCourseAnswers(
  courseId: string
): Promise<string[] | null> {
  return await getTestPaperList(courseId).then((testPaperList) => {
    if (!isNone(testPaperList)) {
      const answers = testPaperList.map((column) => column.answer) as string[];
      console.debug(`成功获取课程 [${courseId}] 的答案`, answers);
      return answers.map((it) => it.split("").join(","));
    } else {
      console.error(`无法获取课程 [${courseId}] 答案！`);
      return null;
    }
  });
}

/**
 * 提交考试
 * @param data 考试数据
 * @returns 请求后的 API 返回数据
 */
export async function commitExam(data: any): Promise<any | null> {
  return await requestAPI(apiCommitExam, {}, data);
}

/**
 * 领取禁毒学子勋章
 * @returns 如果获取成功，返回徽章的序号
 */
export async function addMedal(): Promise<number | null | undefined> {
  return await requestAPI(apiAddMedal).then((data) => {
    if (isNone(data)) {
      return null;
    } else {
      const flag = data.flag;
      const num = data.medalNum;
      if (flag) {
        return num;
      } else {
        return undefined;
      }
    }
  });
}

/**
 * 获取所有的资源
 * @returns 资源对象
 */
export async function getBeforeResourcesByCategoryName(data: object): Promise<
  | {
      title: string;
      resourceId: string;
    }[]
  | null
> {
  return await requestAPI(apiGetBeforeResourcesByCategoryName, {}, data).then(
    (data) =>
      data
        ? data.data.list.map(
            (it: { briefTitle: string; resourceId: string }) => {
              return {
                title: it.briefTitle,
                resourceId: it.resourceId,
              };
            }
          )
        : null
  );
}

/**
 * 添加资源假播放
 * @param data 资源数据
 * @returns 是否成功
 */
export async function addPCPlayPV(data: object): Promise<boolean | null> {
  return await requestAPI(apiAddPCPlayPV, {}, data).then((data) => {
    return data ? data.data.result : null;
  });
}

/**
 * 给资源点赞
 * @param data 点赞数据
 * @returns 是否点赞成功
 */
export async function likePC(data: object): Promise<boolean | null> {
  return await requestAPI(apiLikePC, {}, data).then((data) => {
    if (isNone(data)) {
      return null;
    } else {
      const rdata = data.data;
      return !Number.isNaN(Number(rdata)) || rdata.errorCode === "ALREADY_like";
    }
  });
}
