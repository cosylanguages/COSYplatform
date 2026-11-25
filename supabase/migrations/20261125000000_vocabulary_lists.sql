-- Personal vocabulary lists owned by the signed-in student.
create table if not exists public.vocabulary_lists (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 80),
  language text not null default 'en' check (char_length(language) between 2 and 8),
  note text check (note is null or char_length(note) <= 400),
  words jsonb not null default '[]'::jsonb check (jsonb_typeof(words) = 'array'),
  last_practiced_at timestamptz,
  practice_rounds integer not null default 0 check (practice_rounds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vocabulary_lists_student_updated_idx
  on public.vocabulary_lists (student_id, updated_at desc);

alter table public.vocabulary_lists enable row level security;

drop policy if exists "Students manage their own vocabulary lists" on public.vocabulary_lists;
create policy "Students manage their own vocabulary lists"
  on public.vocabulary_lists
  for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

comment on table public.vocabulary_lists is
  'Student-owned vocabulary lists. Words are stored as a JSON array of {id, term, meaning, example, pos, source}.';
