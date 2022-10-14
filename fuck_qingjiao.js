// ==UserScript==
// @name         fuck_qingjiao
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Fuck 青骄第二课堂 全自动完成所有课程+学分自动获取
// @author       WindLeaf
// @match        *://www.2-class.com/*
// @grant        none
// @license      GPL-3.0
// @require      http://cdn.staticfile.org/jquery/3.6.1/jquery.min.js
// ==/UserScript==

(function() {
  'use strict';

  function isNone(anyObj) {
    return anyObj == undefined || anyObj == null;
  }

  if (isNone($.ajax) || isNone($.isNumeric)) {
    console.error('无法找到脚本所需的 jQuery 函数!')
    return;
  }

  const error = err => {
    // sadly error occurred
    console.error(`在请求的时候发生了个错误, 错误代码 [${err.status}]`, err.responseText);
    return;
  }

  let location = document.location;
  let pathname = location.pathname;
  let reqtoken = window.__DATA__.reqtoken; // so easy get dumb developer LMFAOOO

  // check url
  if (pathname === '/courses' || pathname === '/drugControlClassroom/courses') {
    taskCourses();
  } else if (pathname === '/selfCourse' || pathname === '/drugControlClassroom/selfCourse') {
    taskSelfCourses();
  } else if (pathname === '/admin/creditCenter') {
    taskCredit();
  }

  function startCourse(courseId) {
    $.ajax({
      method: 'GET',
      url: `https://www.2-class.com/api/exam/getTestPaperList?courseId=${courseId}`,
      success: resp => {
        let data = resp.data;
        let title = data.papaerTitle; // typo xD
        let testPaperList = data.testPaperList;
        if (!isNone(testPaperList)) {
          let answers = testPaperList.map(column => column.answer);
          console.debug(`成功获取到课程 [${courseId}] 的数据: ${title}`);
          console.debug('成功获取到答案', answers);
          commit(answers);
        } else {
          startCourse(courseId);
        }
      },
      error
    })

    function commit(answers) {
      console.debug(`正在提交课程 [${courseId}] 答案...`)
      let data = {
        courseId,
        examCommitReqDataList: answers.map((answer, index) => {
          return {
            examId: index + 1, // examId = index + 1
            answer: $.isNumeric(answer) ? Number(answer) : answer // single answer must be a number
          }
        }),
        reqtoken
      }
      let committed = 0;

      $.ajax({
        method: 'POST',
        url: 'https://www.2-class.com/api/exam/commit',
        contentType: 'application/json;charset=UTF-8', // use application/json or 415 error
        dataType: 'json', // maybe useless
        data: JSON.stringify(data), // must use JSON.stringify
        success: resp => {
          let flag = resp.data;
          if (flag) {
            console.debug(`成功提交课程 [${courseId}] 答案!`);
            committed++;
          } else {
            console.error(`无法提交课程 [${courseId}] 答案!`, resp);
          }
        },
        error
      });

      let beforeCommitted = committed;
      let checkCommitUpdate = setInterval(() => {
        if (committed != 0) {
          if (committed == beforeCommitted) {
            console.log(`成功提交了 ${committed} 个课程!`);
            clearInterval(checkCommitUpdate);
          } else {
            beforeCommitted = committed;
          }
        }
      }, 500);
    }
  }

  function taskCourses() {
    $.ajax({
      method: 'GET',
      url: 'https://www.2-class.com/api/course/getHomepageGrade',
      success: resp1 => {
        let grades = resp1.data.map(it => it.value);
        console.debug('获取年级列表', grades);
        for (let grade of grades) {
          // get courses
          $.ajax({
            method: 'GET',
            url: `https://www.2-class.com/api/course/getHomepageCourseList?grade=${grade}&pageSize=24&pageNo=1`,
            success: resp2 => {
              let courses = resp2.data.list
                .filter(k => !k.isFinish && k.title != '期末考试') // skip finished and final exam
                .map(j => j.courseId); // courseId => list
              console.debug(`年级 [${grade}] 可用的课程 (没学过的):`, courses);
              for (let courseId of courses) {
                // [skip final exam]
                if (courseId == 'finalExam') {
                  console.debug('已跳过期末考试!');
                  return;
                }
                // start course
                if (!isNone(courseId)) {
                  startCourse(courseId);
                } else {
                  console.warn('无法找到 `courseId`, 已跳过!');
                }
              }
            },
            error
          })
        }
      },
      error
    });
  }

  function taskSelfCourses() {
    // get all grades (bad method)
    let gradesTabElements = [];
    let timer = setInterval(() => {
      gradesTabElements = document.getElementsByClassName('ant-tabs-tab');
      if (gradesTabElements.length != 0) {
        resolveGrades();
      }
    }, 500);

    function resolveGrades() {
      clearInterval(timer);
      console.debug('获取年级列表 (自学)', gradesTabElements);
      for (let element of gradesTabElements) {
        let grade = element.innerText;
        $.ajax({
          method: 'GET',
          url: `https://www.2-class.com/api/course/getHomepageCourseList?grade=自学&pageNo=1&pageSize=500&sort=&type=${grade}`,
          success: resp => {
            let courses = resp.data.list
              .filter(k => !k.isFinish && k.title != '期末考试') // skip finished and final exam
              .map(j => j.courseId); // courseId => list
              console.debug(`年级 [${grade}] 可用的课程 (自学) (没学过的):`, courses);
            for (let courseId of courses) {
              // [skip final exam]
              if (courseId == 'finalExam') {
                console.debug('已跳过期末考试!'); // seems that selfCourses don't have final exam
                return;
              }
              // start course
              if (!isNone(courseId)) {
                startCourse(courseId);
              } else {
                console.warn('无法找到 `courseId`, 已跳过!');
              }
            }
          },
          error
        })
      }
    }
  }

  function taskCredit() {
    // medal: 领取禁毒学子勋章
    $.ajax({
      method: 'GET',
      url: 'https://www.2-class.com/api/medal/addMedal',
      success: medalResp => {
        let data = medalResp.data;
        let status = data.status;
        let num = data.medalNum;
        if (status) {
          console.debug(`成功领取禁毒徽章 [${num}]!`);
        } else {
          console.warn(`无法领取徽章 (可能已领取过), 已跳过!`)
        }
      }
    });

    // resources: 心理减压, 耕读学堂 [耕读, 电影, 音乐, 体育, 美术, 自然, 公开课], 校园安全
    let categorys = [
      { categoryName: 'public_good', pageNo: 1, pageSize: 100, reqtoken, tag: 'read' },
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'labour' }, // the `ma_yun_recommend` has lots of sub-categorys
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'movie' },
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'music' },
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'physicalEducation' },
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'arts' },
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'natural' },
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'publicWelfareFoundation' },
      { categoryName: 'school_safe', pageNo: 1, pageSize: 100, reqtoken, tag: 'safeVolunteer' }
    ];
    let synced = 0;
    let liked = 0;

    for (let category of categorys) {
      $.ajax({
        method: 'POST',
        url: 'https://www.2-class.com/api/resource/getBeforeResourcesByCategoryName',
        contentType: 'application/json;charset=UTF-8',
        dataType: 'json',
        data: JSON.stringify(category),
        success: resourcesResp => {
          let resources = resourcesResp.data.list.map(it => {
            return {
              title: it.description, resourceId: it.resourceId
            };
          });
          console.debug(`获取分类 ${category.categoryName} 的资源`, resources);
          for (let resource of resources) {
            let resourceId = resource.resourceId;
            // sync resource
            $.ajax({
              method: 'POST',
              url: 'https://www.2-class.com/api/growth/sync/resource',
              contentType: 'application/json;charset=UTF-8',
              dataType: 'json',
              data: JSON.stringify({
                resourceId, reqtoken
              }),
              success: resourcePostResp => {
                let result = resourcePostResp.data.result;
                if (result) {
                  console.debug(`成功同步资源 [${resourceId}]: ${resource.title}!`);
                  synced++;
                } else {
                  console.warn(`同步资源 [${resourceId}] 失败, 已跳过!`);
                }
                return;
              }
            });

            // like resource
            $.ajax({
              method: 'POST',
              url: 'https://www.2-class.com/api/resource/likePC',
              contentType: 'application/json;charset=UTF-8',
              dataType: 'json',
              data: JSON.stringify({
                resourceId, reqtoken
              }),
              success: resourceLikeResp => {
                let count = resourceLikeResp.data;
                let flag = resourceLikeResp.success;
                let already_like = !$.isNumeric(count) && count.errorCode === 'ALREADY_like';
                if ($.isNumeric(count) && flag) {
                  console.debug(`成功点赞资源 [${resourceId}]: ${count}!`);
                  liked++;
                } else {
                  console.warn(`无法点赞资源 [${resourceId}], 是否已点赞: ${already_like}, 已跳过!`);
                }
              },
              error
            });
          }
        },
        error
      });
    }

    let beforeSynced = synced;
    let checkSuccess = setInterval(() => {
      if (synced != 0) {
        if (synced == beforeSynced) {
          console.log(`成功同步 ${synced} 个资源, 点赞 ${liked} 个!`);
          clearInterval(checkSuccess);
        } else {
          beforeSynced = synced;
        }
      }
    }, 500);
  }
})();