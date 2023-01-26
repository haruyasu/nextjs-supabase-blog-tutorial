import { notFound } from 'next/navigation'
import { createClient } from '../../../utils/supabase-server'
import type { BlogListType } from '../../../utils/blog.types'

import BlogDetail from '../../components/blog/blog-detail'

type PageProps = {
  params: {
    blogId: string
  }
}

// ブログ詳細
const BlogDetailPage = async ({ params }: PageProps) => {
  const supabase = createClient()

  // ブログ詳細取得
  const { data: blogData } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', params.blogId)
    .single()

  // ブログが存在しない場合
  if (!blogData) return notFound()

  // プロフィール取得
  const { data: profileData } = await supabase
    .from('profiles')
    .select()
    .eq('id', blogData.user_id)
    .single()

  // 表示ブログ詳細作成
  const blog: BlogListType = {
    id: blogData.id,
    created_at: blogData.created_at,
    title: blogData.title,
    content: blogData.content,
    image_url: blogData.image_url,
    user_id: blogData.user_id,
    name: profileData!.name,
    avatar_url: profileData!.avatar_url,
  }

  return <BlogDetail blog={blog} />
}

export default BlogDetailPage
