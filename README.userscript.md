# QingJiaoHelper

![](https://img.shields.io/greasyfork/v/452984?label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)
![](https://img.shields.io/greasyfork/dd/452984?color=red&label=%E6%97%A5%E5%AE%89%E8%A3%85)
![](https://img.shields.io/greasyfork/dt/452984?color=pink&label=%E6%80%BB%E5%AE%89%E8%A3%85)
![](https://img.shields.io/greasyfork/l/452984?label=%E8%AE%B8%E5%8F%AF%E8%AF%81)
![](https://img.shields.io/greasyfork/rating-count/452984?label=%E8%AF%84%E5%88%86)

青骄第二课堂小助手：长期更新 | 2022 知识竞赛 | 自动完成所有课程 | 每日领取学分 | 课程自动填充答案

**_（2023 版正在更新计划中）由于现在高三，很少有时间更新，望见谅，也希望有能力有时间的大佬一起维护，源代码库在下面的 `插件地址` 中 :)_**

**！！有问题请先看下面的常见问题解答！！**

**欢迎提供期末考试题库**，联系邮箱 `mc.windleaf@foxmail.com` 或在 [GitHub](https://github.com/WindLeaf233) 找我的联系方式！

## 免责声明

1. **该项目仅用于个人学习交流，禁止用于商业及非法用途，项目开发者对由脚本产生的问题或纠纷概不负责！**
2. **该项目无违反脚本规则，举报前请仔细阅读源码，阅读授权！不要闲着没事乱举报脚本，维护个脚本不容易！**

## 插件地址

**如果觉得还行的话请在 `GitHub` 上点个小星星吧 :)**

- [Greasy Fork - QingJiaoHelper](https://greasyfork.org/zh-CN/scripts/452984-qingjiaohelper)
- [GitHub - WindLeaf233/QingJiaoHelper](https://github.com/WindLeaf233/QingJiaoHelper/)

## 食用方法

1. 安装这个脚本
2. 选择一个方法激活功能（见下面 **激活方法**）

## 激活方法

- ① 跳转到页面来激活对应功能
  - https://www.2-class.com/courses - 自动完成所有课程（不包括期末考试）
  - https://www.2-class.com/selfCourse - 自动完成所有**自学**课程（不包括考试）
  - https://www.2-class.com/admin/creditCenter - 自动获取所有可以获取的学分，包括 `心理减压`、`耕读学堂`、`校园安全` 等等
  - **注意：默认都是关闭状态，你可以自定义开关对应功能 (点击油猴脚本图标 → QingJiaoHelper → 菜单 → 功能开关), 关闭后当你访问就不会自动激活**
- ② 在菜单中一键完成
  - 点击油猴脚本图标 → QingJiaoHelper → 菜单 → 功能开关
  - 可以看到三个功能，点击 `开始` 按钮即可激活对应功能
- ③ 一键完成＋领取学分（不推荐）
  - 点击油猴脚本图标 → QingJiaoHelper → 菜单 → 其他 → 一键完成
- ④ 手动完成课程
  - 进入单个课程考试页面（如 https://www.2-class.com/courses/exams/1309）
  - 点击开始答题，之后每一题都会自动选择，并在左上角显示答案
  - **注意：`下一题` 的按钮是要手动按的，而且不要点太快，否则可能无法自动填充答案**
- ⑤ 进入知识竞赛
  - 和 `手动完成课程` 一样，点击开始按钮后会自动弹出答案并自动选择

## 常见问题解答

- **是否支持批量导入账号并批量完成**

~~目前版本还未实现，由于青骄第二课堂更新了 `nvc` 无痕验证 (具体见 [阿里云验证码功能概述](https://help.aliyun.com/document_detail/122071.html))，目前并没有好的解决方案~~

目前发现一个可以自动填充账号密码的浏览器插件，之后完全更新至 `v0.3.0` 版本后我会贴出来供大家使用

- **支持知识竞赛、期末考试吗**

支持知识竞赛，**期末考试目前只支持 2022 年（高二、中职二）**（欢迎提供题库）

- **脚本出问题不工作了怎么办**

1. 先检查是不是最新版本，如果不是请先更新
2. 跳转到出问题的页面，按下 F12 打开 **开发者工具**
3. 切换到 `控制台`（英文是 `Console`）选项卡
4. 除了 `Failed to load resource` 开头的错误，查看有没有别的红色的消息（一般都是中文错误）
5. 截图控制台错误，在 `GreasyFork` 反馈，或者 `GitHub Issues` 反馈，并带上截图

## TODOs

- [x] 添加 UI 界面，控制功能开关
- [ ] 支持批量导入账号，实现全自动批量完成课程（v0.3.0）
- [ ] 设置完成自定义范围、数量的课程和手动完成课程（v0.3.0）
- [ ] 完成知识竞赛的脚本（v0.3.0）
- [ ] 期末考试的脚本（v0.3.0）
- [x] 使用异步重构代码，优化日志输出

## 特别感谢

- [HF0920](https://greasyfork.org/zh-CN/users/971958-hf0920) - 提供账号测试
- [GooGuJiang](https://github.com/GooGuJiang) - 更换脚本外部库 CDN、UI 改进
- [wyhh54321](https://greasyfork.org/zh-CN/users/973982-wyhh54321) - 提供官方题库
- [飞小RAN](https://github.com/xiaofeiTM233) - 提供账号测试
