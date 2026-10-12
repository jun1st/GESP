# GESP Learning Site

A site that teaches children C++ for the GESP exam, graded by Level, with paid Member access.

## Language

**Level (级)**:
A GESP exam grade, 1 through 8.
_Avoid_: 乐园, 级别 as a separate concept

**Fundamentals (基础常识)**:
Free introductory material on computing basics. Not a Level, although it is taught in the same Course format.
_Avoid_: Level 0, 零级

**Lesson (课)**:
One teaching unit inside a Level or Fundamentals, with its own check-in and Exercises.

**Course**:
The page that teaches one Level (or Fundamentals) as an ordered set of Lessons. Level Courses are gated to Members.
_Avoid_: 乐园, 学习乐园, 课程 as a synonym for Level

**Member (会员)**:
A registered user who has been activated and can open Level Courses. Fundamentals is open to everyone. Membership is activated per Tier (Levels 1-3, 4-5, 6-7, 8), each activation lasting one quarter (90 days); repeating it extends the expiry.

**Past Paper Library (真题资料库)**:
The archive of official historical GESP exam papers, organised by exam session and Level, each with questions, official answers and analysis. Separate from any Course.
_Avoid_: 题库, 真题库

**Session (考季)**:
One official GESP exam sitting, identified by year and month (e.g. 2023-03). Not every Level is offered in every Session.
_Avoid_: batch, 批次, 场次

**Paper (试卷)**:
The exam for one Level within one Session.
_Avoid_: 卷子 as a synonym for Session

**Past Question (真题)**:
One official question in a Paper, of type single-choice, true/false, or programming.
_Avoid_: 题 on its own, 练习

**Exercise (练习)**:
A practice question written for a Lesson. Not a Past Question; it belongs to the Lesson, not the Past Paper Library.
_Avoid_: 真题, quiz

**Mock Exam (模拟考)**:
A Member sitting one official Paper as-is, in its original question order.
_Avoid_: 测验, 考试 as a synonym for Paper

**Attempt (作答记录)**:
One Member's recorded run of a Mock Exam: their answers and resulting score.

**Parent View (家长页)**:
A read-only view of a Member's own learning progress, meant for the child's parent. There is no separate parent account: one Member account is one child, and the parent uses that same account.
_Avoid_: 家长账号, parent account

**Weak Spot (薄弱项)**:
A Lesson in which a Member repeatedly answers its related Past Questions wrong. Every Past Question is mapped to exactly one Lesson of its own Level.
_Avoid_: 薄弱知识点, 弱项 as a separate tag system

**Syllabus Item (考点)**:
One topic of the official GESP syllabus for a Level (e.g. 一级的「变量」), split out of the official per-Level text. A Syllabus Item is covered by one or more Lessons of its Level, and a Lesson may cover several Syllabus Items. A Past Question belongs to a Syllabus Item through its Lesson, so one Past Question can count under more than one Syllabus Item.
_Avoid_: 知识点 as a synonym, 考纲条目

**Uncovered Question (未覆盖题)**:
A Past Question that fits no existing Lesson of its Level. It counts toward no Weak Spot, and the number of them shows which Lessons are missing from a Course.

**Self-assessment (自评)**:
The Member's own judgement of how well they solved a programming Past Question in a Mock Exam, chosen after seeing the reference solution. It is recorded in the Attempt separately from the automatically graded score.
_Avoid_: 判题, 评测 (the site does not judge programs)

**Pass Line (通过线)**:
The official GESP score thresholds on a 100-point scale: 60 to pass, 75 for excellent. Shown as reference lines next to a Member's Attempt scores; the site never predicts whether a Member will pass.
_Avoid_: 过级预测

**Sample (样例题)**:
The 5 Past Questions per Level that a non-Member may view with answers: the first 5 single-choice questions of the most recent Session offering that Level. Mock Exams are never part of the Sample.
_Avoid_: 试看, 预览题

## Relationships

- A **Mock Exam** is based on exactly one **Paper**; each run produces one **Attempt**.

- A **Paper** contains many **Past Questions**.
- An **Exercise** belongs to one **Lesson**; a **Past Question** belongs to one **Paper**.

- A **Session** contains one **Paper** per Level offered in it.

- The **Past Paper Library** belongs to no **Course** or **Lesson**.
- The full content of the **Past Paper Library** (questions, answers, analysis) is open to **Members** only; non-Members see only official external links and a few samples.

- A **Level** is taught by exactly one **Course**; **Fundamentals** is taught by one **Course** too.
- A **Course** contains many ordered **Lessons**.
- Only a **Member** can open a Level's **Course**; **Fundamentals** is open to all.

## Flagged ambiguities

- "Level 0" was used for Fundamentals in code and data (`level-0.json`, `id === 0`); resolved: Fundamentals is not a Level.
- "乐园" and "课程" were used interchangeably for a Level's page; resolved: **Course**.
