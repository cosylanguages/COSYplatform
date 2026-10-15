# Classroom-scoped answer reset — design note

## Why a connected-peer broadcast is not enough

The current reset command is sent over PeerJS to students who are connected at that moment. A disconnected student can later restore their saved answer rows from Supabase. The current `lesson_answers` primary key is `(student_id, lesson_id, field_key)`, so it cannot distinguish a student's work for the same lesson in two different classes.

The PeerJS room ID and room key are generated when a teacher starts a room. They are session credentials, not durable classroom identities. Using either as a permanent class identifier would not reliably reset progress across future sessions and could couple data to a secret.

## Required model change

1. Introduce a durable `classroom_id` UUID owned by a teacher/class entity already authorized by the platform. Reuse the platform's canonical class ID if one exists; do not mint a second competing class identity.
2. Scope saved answer rows to that class: `student_id`, `classroom_id`, `lesson_id`, `field_key`. Migrate the unique/primary key and update save, load, queue, flush, and delete paths together. Existing rows need an explicit migration policy; do not guess which class owns historical answers.
3. Enforce class membership and teacher ownership in database policies or narrowly scoped RPCs. A client-supplied classroom UUID alone is not authorization. Students must not be able to reset another student's data or write reset markers.
4. Add a durable reset generation/marker keyed by `(classroom_id, lesson_id)`. A teacher reset increments the generation through a server-authorized operation.
5. On lesson load/reconnect, the student client compares the saved generation with the current class/lesson generation. If it advanced, it clears only that student's answers for that class and lesson, removes matching local pending queue items, and records the generation observed. This handles students who were offline during the reset.
6. Make save/flush reject stale generations so an old offline queue cannot repopulate answers after a reset. The check and write must be atomic server-side (for example, an RPC or transaction); a client-only check has a race.
7. Keep a compatibility path for students without a durable classroom assignment: do not silently treat them as members of a class or delete their lesson-wide history.

## Acceptance tests

- Student offline during reset returns later and sees cleared fields.
- Reset in class A does not clear the same student's answers for class B.
- A queued pre-reset write cannot resurrect a cleared answer after reconnect.
- A student cannot forge another classroom ID to read, write, or reset its answers.
- A teacher can reset only a class they own or are authorized to teach.
- Existing historical rows are preserved or migrated according to an explicit, reviewed policy.
- Anonymous, cross-student, cross-class, teacher/founder access rules are tested at the database layer.

## Release gate

Do not implement disconnected-student reset by deleting all rows for `(student_id, lesson_id)`: that would destroy progress across classes. Implement this after identifying the platform's canonical class/membership schema and defining the migration for existing answer rows. Until then, describe reset as connected-students-only in the UI and QA checklist.
