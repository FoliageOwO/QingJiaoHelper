# QingJiaoHelper

![](https://img.shields.io/greasyfork/v/452984?label=%E6%9C%80%E6%96%B0%E7%89%88%E6%9C%AC)
![](https://img.shields.io/greasyfork/dd/452984?color=red&label=%E6%97%A5%E5%AE%89%E8%A3%85)
![](https://img.shields.io/greasyfork/dt/452984?color=pink&label=%E6%80%BB%E5%AE%89%E8%A3%85)
![](https://img.shields.io/greasyfork/l/452984?label=%E8%AE%B8%E5%8F%AF%E8%AF%81)
![](https://img.shields.io/greasyfork/rating-count/452984?label=%E8%AF%84%E5%88%86)

青骄第二课堂小助手: 自动完成所有课程 | 每日领取学分 | 课程自动填充答案

## 插件地址

**如果觉得还行的话请在 Github 上点个小星星吧 :)**

+ [Greasy Fork - QingJiaoHelper](https://greasyfork.org/zh-CN/scripts/452984-qingjiaohelper)
+ [GitHub - WindLeaf233/QingJiaoHelper](https://github.com/WindLeaf233/QingJiaoHelper/)

## 食用方法

1. 安装这个脚本
2. 选择一个方法激活功能 (见下面 **激活方法**)
3. 所有的调试日志都在 devtools 控制台中, 成功/失败的消息会在右上角提示

## 激活方法
* 手动跳转到对应的网址来激活对应功能
  + https://www.2-class.com/courses - 自动完成所有课程 (不包括期末考试)
  + https://www.2-class.com/selfCourse - 自动完成所有**自学**课程 (不包括考试)
  + https://www.2-class.com/admin/creditCenter - 自动获取所有可以获取的学分, 包括 `心理减压, 耕读学堂, 校园安全` 等等
  + **注意: 你可以自定义开关对应功能 (点击油猴脚本图标 -> QingJiaoHelper -> 菜单 -> 功能开关), 关闭后当你访问就不会激活, 默认都是关闭状态!**
* 在菜单中一键完成
  + 点击油猴脚本图标 -> QingJiaoHelper -> 菜单 -> 功能开关
  + 可以看到三个功能, 点击 `开始` 按钮即可激活功能
* 一键完成 + 领取学分
  + 点击油猴脚本图标 -> QingJiaoHelper -> 菜单 -> 其他 -> 一键完成
* 单独完成课程
  + 进入课程考试页面 (如 https://www.2-class.com/courses/exams/1309)
  + 点击开始答题, 之后每一题都会自动选择, 并在左上角显示答案
  + **注意: `下一题` 的按钮是要手动按的, 而且不要点太快, 否则无法自动填充答案!**

## 常见问题解答

+ **是否支持批量导入账号并批量完成**

目前版本还未实现, 由于青骄第二课堂更新了 `nvc` 无痕验证 (具体见 [阿里云验证码功能概述](https://help.aliyun.com/document_detail/122071.html)), 目前并没有好的解决方案

+ **支持知识竞赛/期末考试吗**

暂时不支持

+ **为什么装了脚本之后, 页面布局变得很奇怪**

这个菜单我写的比较仓促, 所以偷了一下懒, 我使用了 `vue + buefy` 作为菜单页面, 但是 `buefy` 的 css 和青骄本身的 css 冲突, 就出现了这个问题

*我会尽快使用别的库来重写菜单*

## TODOs

+ [x] 优化日志
+ [x] 优化代码, 实现高复用
+ [x] 添加 UI 界面, 控制功能开关
+ [ ] 支持批量导入账号, 实现全自动批量完成课程
+ [ ] 点赞失败后会先尝试取消赞, 再进行点赞
+ [ ] 重写菜单, 修复 css 冲突
+ [ ] 实现登录 (批量导入)
+ [x] 设置完成自定义范围/数量的课程和手动完成课程
+ [ ] 完成知识竞赛/期末考试的脚本 (正在制作中)
+ [ ] 使用异步重构代码, 优化日志输出

## 更新日志

#### v0.2.7
* [+] `完成课程` 功能现在支持自定义年级
* [+] 支持课程单独手动完成
* [*] 默认三个功能都不会跳转激活
* [*] 使菜单更易于操作
* [!] 修复菜单抖动 bug
* [.] 内置菜单 HTML 结构

#### v0.2.6
* [*] 更换脚本名字
* [*] 更人性化的消息
* [!] 修复一键完成背景 bug

#### v0.2.5
* [+] 添加菜单
* [+] 添加开关功能
* [+] 添加一键完成
* [+] 添加 `ToastifyJs` 来显示消息
* [!] 修复 `request` 函数无限递归的 bug
* [!] 修复 `request` 函数的 `method` 不匹配问题
* [.] 简化代码, 提取公共函数

#### v0.2
* [+] 添加 `耕读学堂` 的子分类的解析 (耕读, 电影, 音乐, 体育, 美术, 自然, 公开课)
* [+] 添加日志输出获取资源的结果
* [+] 添加日志输出完成课程的数量
* [*] 使用中文日志

#### v0.1
* [.] 第一个版本, 添加基础功能
