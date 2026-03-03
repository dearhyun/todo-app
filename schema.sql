-- AI TODO 서비스의 데이터베이스 스키마와 보안 정책을 정의하는 SQL 파일입니다.

-- 1. 사용자 프로필 테이블 (auth.users와 1:1 관계)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 할 일(Todo) 관리 테이블
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium' NOT NULL,
  category TEXT,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')) DEFAULT 'todo' NOT NULL,
  assignee TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS (Row Level Security) 설정
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 4. public.users 보안 정책
CREATE POLICY "사용자는 자신의 프로필만 조회할 수 있습니다." ON public.users FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "사용자는 자신의 프로필만 수정할 수 있습니다." ON public.users FOR
UPDATE USING (auth.uid () = id);

-- 5. public.todos 보안 정책
CREATE POLICY "사용자는 자신의 할 일만 조회할 수 있습니다." ON public.todos FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "사용자는 자신의 할 일만 생성할 수 있습니다." ON public.todos FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "사용자는 자신의 할 일만 수정할 수 있습니다." ON public.todos FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "사용자는 자신의 할 일만 삭제할 수 있습니다." ON public.todos FOR DELETE USING (auth.uid () = user_id);

-- 6. 트리거: auth.users에 새 사용자가 생성되면 public.users에도 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();