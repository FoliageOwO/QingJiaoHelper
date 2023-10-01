# QingJiaoHelper

![](https://img.shields.io/greasyfork/v/452984?label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)
![](https://img.shields.io/greasyfork/dd/452984?color=red&label=%E6%97%A5%E5%AE%89%E8%A3%85)
![](https://img.shields.io/greasyfork/dt/452984?color=pink&label=%E6%80%BB%E5%AE%89%E8%A3%85)
![](https://img.shields.io/greasyfork/l/452984?label=%E8%AE%B8%E5%8F%AF%E8%AF%81)
![](https://img.shields.io/greasyfork/rating-count/452984?label=%E8%AF%84%E5%88%86)

青骄第二课堂小助手：长期更新 | 2022 知识竞赛 | 自动完成所有课程 | 每日领取学分 | 课程自动填充答案

**_（2023 版正在更新中）由于现在高三，很少有时间更新，望见谅，也希望有能力有时间的大佬一起维护，源代码库在下面的 `插件地址` 中（技术栈：`HTML5`、`TypeScript`）_**

**！！有问题请先看下面的常见问题解答！！**

**欢迎提供期末考试或知识竞赛题库**，联系邮箱 `mc.windleaf@foxmail.com` 或以 [GitHub](https://github.com/WindLeaf233) 注明的联系方式联系我

## 免责声明

1. **该项目仅用于个人学习交流，禁止用于商业及非法用途，项目开发者对由脚本产生的任何性质的问题或纠纷概不负责！**
2. **该项目没有违反脚本规则，举报前请仔细阅读源码，阅读授权！不要闲着没事乱举报脚本，维护脚本不容易！**

## 支持与反馈

**如果觉得此脚本帮到了你，欢迎在 `GitHub` 上为我点颗星星，或者请我喝杯奶茶，谢谢！**

- [GitHub 仓库](https://github.com/WindLeaf233/QingJiaoHelper/)
- [爱发电](https://afdian.net/a/foliageowo)
- [捐赠列表](https://github.com/WindLeaf233/QingJiaoHelper/blob/master/FUNDERS.md)

## 使用方法

1. 安装这个脚本
2. 选择一个方法激活功能（见下面 **激活方法**）

## 激活方法

**注意：大部分功能默认都是关闭状态，你可以自定义开关对应功能（点击油猴脚本图标 → QingJiaoHelper → 菜单 → 功能名前的开关），关闭后将会无法激活**

- ① 跳转到页面来激活对应功能
  - https://www.2-class.com/courses - 自动完成所有课程（不包括期末考试）
  - https://www.2-class.com/selfCourse - 自动完成所有**自学**课程（不包括考试）
  - https://www.2-class.com/admin/creditCenter - 自动获取所有可以获取的学分，包括 `心理减压`、`耕读学堂`、`校园安全` 等等
  - https://www.2-class.com/courses/exams/finalExam - 期末考试（推荐和 `自动下一题并提交` 功能一起使用）
- ② 在菜单中一键完成
  - 点击油猴脚本图标 → QingJiaoHelper → 菜单 → 一键完成
- ③ 手动完成课程
  - 进入单个课程考试页面（如 https://www.2-class.com/courses/exams/1309）
  - 点击开始答题，之后每一题都会自动选择，并在左上角显示答案
  - **注意：`下一题` 的按钮是要手动按的，而且不要点太快，否则可能无法自动填充答案。如果出现答案未填充的情况，请刷新页面**

## 常见问题解答

- **是否支持批量导入账号并批量完成**

~~目前发现一个可以自动填充账号密码的浏览器插件，之后完全更新至 `v0.3.0` 版本后我会贴出来供大家使用~~

目前版本还未实现，由于青骄第二课堂更新了 `nvc` 无痕验证 (具体见 [阿里云验证码功能概述](https://help.aliyun.com/document_detail/122071.html))

经过测试，插件和脚本并不能完成自动填充并登录。如果需要此功能，请使用 `Python`、录制宏之类的工具软件辅助本脚本

本人精力有限，这个问题就先放在这里，还望大佬提供更好的解决方案

- **支持知识竞赛和期末考试吗**

2023 知识竞赛还没有开始，**2023 期末考试目前只支持（五年级、六年级、七年级、八年级、九年级、高一、高二）**（欢迎提供题库）

- **脚本出问题不工作了怎么办**

1. 先检查是不是最新版本，如果不是请先更新
2. 跳转到出问题的页面，按下 F12 打开 **开发者工具**
3. 切换到 `控制台`（英文是 `Console`）选项卡
4. 除了 `Failed to load resource` 开头的错误，查看有没有别的红色的消息（一般都是中文错误）
5. 截图控制台错误，在 `GreasyFork` 反馈，或者 `GitHub Issues` 反馈，并带上截图

## TODOs

- [x] 添加 UI 界面，控制功能开关
- [ ] ~~支持批量导入账号，实现全自动批量完成课程~~
- [x] 设置完成自定义范围的课程和手动完成课程
- [ ] 完成 2023 知识竞赛的脚本（v0.3.0）
- [x] 完成 2023 期末考试的脚本（v0.3.0）
- [x] 使用异步重构代码，优化日志输出

## 特别感谢

- [HF0920](https://greasyfork.org/zh-CN/users/971958-hf0920) - 提供账号测试
- [GooGuJiang](https://github.com/GooGuJiang) - 更换脚本外部库 CDN、UI 改进
- [wyhh54321](https://greasyfork.org/zh-CN/users/973982-wyhh54321) - 提供官方题库
- [飞小 RAN](https://github.com/xiaofeiTM233) - 提供账号测试
- Tzimorotas - 提供 2023 年五年级到高二期末考试题库

## 版权

本脚本使用了以下库，它们的名字与开源许可如下：

- [toastify-js](https://github.com/apvarun/toastify-js) - Pure JavaScript library for better notification messages - MIT
- [axios](https://github.com/axios/axios) - Promise based HTTP client for the browser and node.js - MIT
- [spectre](https://github.com/picturepan2/spectre) - A Lightweight, Responsive and Modern CSS Framework（经修改） - MIT
