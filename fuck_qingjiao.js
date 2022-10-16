// ==UserScript==
// @name                 fuck_qingjiao_local
// @namespace            http://tampermonkey.net/
// @version              0.2
// @description          Fuck 青骄第二课堂 全自动完成所有课程+学分自动获取
// @author               WindLeaf
// @match                *://www.2-class.com/*
// @grant                GM_addStyle
// @grant                GM_getResourceText
// @license              GPL-3.0
// @require              http://cdn.staticfile.org/jquery/3.6.1/jquery.min.js
// @require              https://cdn.jsdelivr.net/npm/toastify-js
// @resource toastifycss https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// ==/UserScript==

'use strict';

if (isNone($.ajax) || isNone($.isNumeric)) {
  showMessage('无法找到脚本所需的 jQuery 函数!', 'red');
  return;
}

function isNone(anyObj) {
  return anyObj == undefined || anyObj == null;
}

function showMessage(text, color) {
  Toastify({
    text,
    duration: 5 * 1000,
    newWindow: true,
    gravity: 'top',
    position: 'right',
    stopOnFocus: true,
    style: { background: color }
  }).showToast();
}

const error = err => {
  showMessage(`在请求的时候发生了个错误, 错误代码 [${err.status}], 具体响应内容在控制台中`, 'red')
  console.error(`[${err.status}]`, err.responseText);
  return;
}

function request(method, api, success, data={}) {
  let url = `https://www.2-class.com/api${api}`;
  console.debug(`[${method}] ${url}`, data);
  if (method === 'GET') {
    return $.ajax({ method: 'GET', url, success, error });
  } else {
    return $.ajax({
      method: 'POST', url, success, error,
      contentType: 'application/json;charset=UTF-8',
      dataType: 'json',
      data: JSON.stringify(data)
    });
  }
}

function processSiteScript() {
  for (let script of document.getElementsByTagName('script')) {
    if (script.innerText.indexOf('window.__DATA__') != -1) {
      eval(script.innerText);
    }
  }
}

function startCourse(courseId) {
  request('GET', `/exam/getTestPaperList?courseId=${courseId}`, resp => {
    let data = resp.data;
    let title = data.papaerTitle; // typo xD
    let testPaperList = data.testPaperList;
    if (!isNone(testPaperList)) {
      let answers = testPaperList.map(column => column.answer);
      console.debug(`成功获取到课程 [${courseId}] 的数据: ${title}`);
      console.debug('成功获取到答案', answers);
      commit(answers);
    } else {
      let errorMsg = data.errorMsg;
      if (errorMsg !== '该课程课时考试已经完成') {
        startCourse(courseId);
      }
    }
  });

  function commit(answers) {
    console.debug(`正在提交课程 [${courseId}] 答案...`);
    let data = {
      courseId,
      examCommitReqDataList: answers.map((answer, index) => {
        return {
          examId: index + 1, // examId = index + 1
          answer: $.isNumeric(answer) ? Number(answer) : answer // single answer must be a number
        }
      }),
      reqtoken
    };
    let committed = 0;

    request('POST', '/exam/commit', resp => {
      let flag = resp.data;
      if (flag) {
        console.debug(`成功提交课程 [${courseId}] 答案!`);
        committed++;
      } else {
        console.error(`无法提交课程 [${courseId}] 答案!`, resp);
      }
    }, data);

    let beforeCommitted = committed;
    let checkCommitUpdate = setInterval(() => {
      if (committed != 0) {
        if (committed == beforeCommitted) {
          showMessage(`成功完成了 ${committed} 个课程!`, 'green');
          clearInterval(checkCommitUpdate);
        } else {
          beforeCommitted = committed;
        }
      }
    }, 500);
  }
}


(function() {
  // script pre-loads
  GM_addStyle(GM_getResourceText('toastifycss')); // apply toastifycss style file

  processSiteScript();
  const location = document.location;
  const pathname = location.pathname;
  const reqtoken = window.__DATA__.reqtoken;
  
  const features = [
    { path: ['/courses', '/drugControlClassroom/courses'], title: '自动完成所有课程 (不包括考试)', func: taskCourses },
    { path: ['/selfCourse', '/drugControlClassroom/selfCourse'], title: '自动完成所有课程 (自学) (不包括考试)', func: taskSelfCourses },
    { path: ['/admin/creditCenter'], title: '自动获取每日学分', func: taskCredit }
  ];

  for (let feature of features) {
    if (feature.path.indexOf(pathname) != -1) {
      showMessage(`激活功能: ${feature.title}`, 'green');
      feature.func();
    }
  }

  function taskCourses() {
    request('GET', '/course/getHomepageGrade', resp1 => {
      let grades = resp1.data.map(it => it.value);
      console.debug('获取年级列表', grades);
      for (let grade of grades) {
        // get courses
        request('GET', `/course/getHomepageCourseList?grade=${grade}&pageSize=24&pageNo=1`, resp2 => {
          let courses = resp2.data.list
            .filter(k => !k.isFinish && k.title != '期末考试') // skip finished and final exam
            .map(j => j.courseId); // courseId => list
          console.debug(`年级 [${grade}] 可用的课程 (没学过的):`, courses);
          if (courses.length === 0) {
            showMessage(`年级 [${grade}] 所有课程都是完成状态, 已跳过!`, 'blue');
            return;
          }
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
              console.debug('[!] 无法找到 `courseId`, 已跳过!');
            }
          }
        });
      }
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
        request('GET', `/course/getHomepageCourseList?grade=自学&pageNo=1&pageSize=500&sort=&type=${grade}`, resp => {
          let courses = resp.data.list
            .filter(k => !k.isFinish && k.title != '期末考试') // skip finished and final exam
            .map(j => j.courseId); // courseId => list
            console.debug(`年级 [${grade}] 可用的课程 (自学) (没学过的):`, courses);
          if (courses.length === 0) {
            showMessage(`年级 [${grade}] 所有课程都是完成状态, 已跳过!`, 'blue');
            return;
          }
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
              console.debug('[!] 无法找到 `courseId`, 已跳过!');
            }
          }
        });
      }
    }
  }

  function taskCredit() {
    // medal: 领取禁毒学子勋章
    request('GET', '/medal/addMedal', medalResp => {
      let data = medalResp.data;
      let status = data.status;
      let num = data.medalNum;
      if (status) {
        showMessage(`成功领取禁毒徽章 [${num}]!`, 'green');
      } else {
        console.debug(`[!] 无法领取徽章 (可能已领取过), 已跳过!`)
      }
    });

    // resources: 心理减压, 耕读学堂 [耕读, 电影, 音乐, 体育, 美术, 自然, 公开课], 校园安全
    let categorys = [
      { name: 'public_good', tag: 'read' },
      { name: 'ma_yun_recommend', tag: 'labour' }, // the `ma_yun_recommend` has lots of sub-categorys
      { name: 'ma_yun_recommend', tag: 'movie' },
      { name: 'ma_yun_recommend', tag: 'music' },
      { name: 'ma_yun_recommend', tag: 'physicalEducation' },
      { name: 'ma_yun_recommend', tag: 'arts' },
      { name: 'ma_yun_recommend', tag: 'natural' },
      { name: 'ma_yun_recommend', tag: 'publicWelfareFoundation' },
      { name: 'school_safe', tag: 'safeVolunteer' }
    ];
    let synced = 0;
    let liked = 0;

    for (let category of categorys) {
      request('POST', '/resource/getBeforeResourcesByCategoryName', resourcesResp => {
        let resources = resourcesResp.data.list.map(it => {
          return {
            title: it.description, resourceId: it.resourceId
          };
        });

        console.debug(`获取分类 ${category.name} 的资源`, resources);
        for (let resource of resources) {
          let resourceId = resource.resourceId;
          let data = { resourceId, reqtoken };
          // sync resource
          request('POST', '/growth/sync/resource', resourcePostResp => {
            let result = resourcePostResp.data.result;
            if (result) {
              console.debug(`成功同步资源 [${resourceId}]: ${resource.title}!`);
              synced++;
            } else {
              console.debug(`[!] 同步资源 [${resourceId}] 失败, 已跳过!`);
            }
          }, data);

          // like resource
          request('POST', '/resource/likePC', resourceLikeResp => {
            let count = resourceLikeResp.data;
            let flag = resourceLikeResp.success;
            let already_like = !$.isNumeric(count) && count.errorCode === 'ALREADY_like';
            if ($.isNumeric(count) && flag) {
              console.debug(`成功点赞资源 [${resourceId}]: ${count}!`);
              liked++;
            } else {
              console.debug(`[!] 无法点赞资源 [${resourceId}], 是否已点赞: ${already_like}, 已跳过!`);
            }
          }, data);
        }
      }, { categoryName: category.name, pageNo: 1, pageSize: 100, reqtoken, tag: category.tag });
    }

    let beforeSynced = synced;
    let checkSuccess = setInterval(() => {
      if (synced != 0) {
        if (synced == beforeSynced) {
          showMessage(`成功同步 ${synced} 个资源, 点赞 ${liked} 个!`, 'green');
          clearInterval(checkSuccess);
        } else {
          beforeSynced = synced;
        }
      }
    }, 500);
  }
})();