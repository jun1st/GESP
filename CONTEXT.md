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
One teaching unit inside a Level or Fundamentals, with its own check-in and quiz.

**Course**:
The page that teaches one Level (or Fundamentals) as an ordered set of Lessons. Level Courses are gated to Members.
_Avoid_: 乐园, 学习乐园, 课程 as a synonym for Level

**Member (会员)**:
A registered user who has been activated and can open Level Courses. Fundamentals is open to everyone.

## Relationships

- A **Level** is taught by exactly one **Course**; **Fundamentals** is taught by one **Course** too.
- A **Course** contains many ordered **Lessons**.
- Only a **Member** can open a Level's **Course**; **Fundamentals** is open to all.

## Flagged ambiguities

- "Level 0" was used for Fundamentals in code and data (`level-0.json`, `id === 0`); resolved: Fundamentals is not a Level.
- "乐园" and "课程" were used interchangeably for a Level's page; resolved: **Course**.
