// ==UserScript==
// @name         fuck_qingjiao
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fuck 青骄第二课堂 全自动完成所有课程+学分自动获取
// @author       WindLeaf
// @match        *://www.2-class.com/*
// @grant        none
// @require      http://cdn.staticfile.org/jquery/3.6.1/jquery.min.js
// ==/UserScript==

(function() {
  'use strict';

  function isNone(anyObj) {
    return anyObj == undefined || anyObj == null;
  }

  if (isNone($.ajax) || isNone($.isNumeric)) {
    console.error('Cannot find jQuery function!')
    return;
  }

  const error = err => {
    // sadly error occurred
    console.error(`Error has occurred! Status code [${err.status}]`, err.responseText);
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
          console.debug(data);
          console.log(`Successfully get the data of course[${courseId}]: ${title}`);
          console.log('Successfully get answers:', answers);
          commit(answers);
        } else {
          startCourse(courseId);
        }
      },
      error: err => {
        console.error('Error has occurred!', err);
        return;
      }
    })

    function commit(answers) {
      console.log('Committing...')
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

      $.ajax({
        method: 'POST',
        url: 'https://www.2-class.com/api/exam/commit',
        contentType: 'application/json;charset=UTF-8', // use application/json or 415 error
        dataType: 'json', // maybe useless
        data: JSON.stringify(data), // must use JSON.stringify
        success: resp => {
          let flag = resp.data;
          if (flag) {
            console.log(`Successfully committed course [${courseId}]!`);
          } else {
            console.error(resp);
          }
        },
        error
      })
    }
  }

  function taskCourses() {
    $.ajax({
      method: 'GET',
      url: 'https://www.2-class.com/api/course/getHomepageGrade',
      success: resp1 => {
        let grades = resp1.data.map(it => it.value);
        console.debug('grades', grades);
        for (let grade of grades) {
          // get courses
          $.ajax({
            method: 'GET',
            url: `https://www.2-class.com/api/course/getHomepageCourseList?grade=${grade}&pageSize=24&pageNo=1`,
            success: resp2 => {
              let courses = resp2.data.list
                .filter(k => !k.isFinish && k.title != '期末考试') // skip finished and final exam
                .map(j => j.courseId); // courseId => list
              console.debug('courses', courses);
              for (let courseId of courses) {
                // [skip final exam]
                if (courseId == 'finalExam') {
                  console.debug('Skipped final exam.');
                  return;
                }
                // start course
                if (!isNone(courseId)) {
                  startCourse(courseId);
                } else {
                  console.error('courseId not found, skipped.');
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
      console.debug('grades', gradesTabElements);
      for (let element of gradesTabElements) {
        let grade = element.innerText;
        $.ajax({
          method: 'GET',
          url: `https://www.2-class.com/api/course/getHomepageCourseList?grade=自学&pageNo=1&pageSize=500&sort=&type=${grade}`,
          success: resp => {
            let courses = resp.data.list
              .filter(k => !k.isFinish && k.title != '期末考试') // skip finished and final exam
              .map(j => j.courseId); // courseId => list
            console.debug('courses', courses);
            for (let courseId of courses) {
              // [skip final exam]
              if (courseId == 'finalExam') {
                console.debug('Skipped final exam.');
                return;
              }
              // start course
              if (!isNone(courseId)) {
                startCourse(courseId);
              } else {
                console.error('courseId not found, skipped.');
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
          console.log(`Successfully add medal [${num}]!`);
        } else {
          console.error(`Cannot add medal, skipped!`)
        }
      }
    });

    // resources: 心理减压, 耕读学堂, 校园安全
    let categorys = [
      { categoryName: 'public_good', pageNo: 1, pageSize: 100, reqtoken, tag: 'read' },
      { categoryName: 'ma_yun_recommend', pageNo: 1, pageSize: 100, reqtoken, tag: 'labour' },
      { categoryName: 'school_safe', pageNo: 1, pageSize: 100, reqtoken, tag: 'safeVolunteer' }
    ];
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
              title: it.briefTitle, resourceId: it.resourceId
            };
          });
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
                  console.log(`Successfully synced resource [${resourceId}]: ${resource.title}!`);
                } else {
                  console.error(`Sync resource [${resourceId}] error, skipped!`);
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
                  console.log(`Successfully liked resource [${resourceId}]: ${count}!`);
                } else {
                  console.error(`Cannot like ${resourceId}, [already_like=${already_like}], skipped!`);
                }
              },
              error
            });
          }
        },
        error
      });
    }
  }
})();