-- タスクテーブルの作成
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_date date not null,
  priority text not null,
  is_done boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS（行レベルセキュリティ）を有効化
alter table tasks enable row level security;

-- 自分が登録したタスクのみ表示できる
create policy "Users can view own tasks"
  on tasks for select
  using (auth.uid() = user_id);

-- 自分のタスクとして登録できる
create policy "Users can insert own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

-- 自分が登録したタスクのみ更新できる
create policy "Users can update own tasks"
  on tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 自分が登録したタスクのみ削除できる
create policy "Users can delete own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- ログイン済みユーザーにテーブルへの基本的な操作権限を付与
-- （実際にどの行を操作できるかはRLSポリシーで制御される）
grant select, insert, update, delete on tasks to authenticated;
