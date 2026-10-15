# PR #17 — Live Classroom Verification Checklist

Run this against a staging deployment built from branch `test/progress-persistence`, not the production classroom. Use two separate browser profiles (teacher and student) with distinct authenticated accounts.

## Preconditions
- Apply the migration `20261031000000_lesson_answer_persistence.sql` to the staging Supabase project.
- Confirm the student account has the normal student role and the teacher account can host a room.
- Use a lesson with at least one fill-in-the-blank and one radio/checkbox question.
- Keep the browser console and Supabase logs open for failures.

## Student answer persistence
- [ ] Student enters an answer and sees live correct/try-again feedback.
- [ ] Reload the student's lesson; the answer is restored.
- [ ] Confirm restored values do not create duplicate writes or change the saved correctness.
- [ ] Select a radio option and a checkbox; verify both selections restore after reload.
- [ ] Temporarily disconnect the student's network, change an answer, reload while offline if supported, and confirm the local queued answer remains visible.
- [ ] Reconnect and verify the queued answer syncs to Supabase and remains after another reload.

## Teacher synchronization and reset
- [ ] Teacher sees student responses update during the lesson.
- [ ] Disconnect and reconnect the student; confirm the teacher receives the student's current values and radio/checkbox checked state.
- [ ] Teacher uses **Reset Student Answers** for the currently loaded lesson.
- [ ] Confirm the connected student's fields and feedback clear, and the server rows for that student + lesson are deleted.
- [ ] Reload the student lesson and confirm cleared answers do not reappear.
- [ ] Simulate a failed server delete (for example, temporarily block the request); confirm the UI reports failure and does not claim the reset succeeded.
- [ ] Confirm a reset packet from a non-host peer or for a different lesson is ignored.
- [ ] Repeat with the student disconnected: document that the current implementation only sends reset requests to connected students. Do not consider disconnected-student reset supported.

## Privacy / permissions
- [ ] As student A, confirm saved answers from student B cannot be read.
- [ ] Confirm anonymous requests cannot read answer rows.
- [ ] Confirm teacher and founder accounts cannot read student answer rows through the student-answer API unless an explicit, separately authorized teacher reporting policy is introduced.
- [ ] Confirm answer keys and teacher notes remain unavailable to student clients.

## Release decision
- [ ] Record browser, OS, lesson identifier, test accounts/roles, and any console/network errors.
- [ ] Attach evidence or a concise result summary to PR #17.
- [ ] Do not merge or deploy until the teacher/student test and the reset failure-path test pass.

Automated CI passing is necessary but does not replace this two-browser test. Disconnected-student reset and lesson-by-lesson authored explanations remain separate follow-up work.
