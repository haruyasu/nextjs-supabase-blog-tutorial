'use client'

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { useSupabase } from '../supabase-provider'

import type { Database } from '../../../utils/database.types'

import Loading from '../../loading'
import useStore from '../../../store'

type Blog = Database['public']['Tables']['blogs']['Row']
type PageProps = {
  blog: Blog
}

// ブログ編集
const BlogEdit = ({ blog }: PageProps) => {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { user } = useStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File>(null!)
  const [loading, setLoading] = useState(false)
  const [myBlog, setMyBlog] = useState(false)

  useEffect(() => {
    // 自分が投稿したブログチェック
    if (user.id !== blog.user_id) {
      // ブログ詳細に遷移
      router.push(`/blog/${blog.id}`)
    } else {
      // 初期値設定
      setTitle(blog.title)
      setContent(blog.content)
      setMyBlog(true)
    }
  }, [])

  // 画像アップロード
  const onUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files?.length == 0) {
      return
    }
    setImage(files[0])
  }, [])

  // 送信
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (user.id) {
      let image_url = blog.image_url

      if (image) {
        // supabaseストレージに画像をアップロード
        const { data: storageData, error: storageError } = await supabase.storage
          .from('blogs')
          .upload(`${user.id}/${uuidv4()}`, image)

        if (storageError) {
          alert(storageError.message)
          setLoading(false)
          return
        }

        // ファイル名取得
        const fileName = image_url.split('/').slice(-1)[0]

        // 古い画像を削除
        await supabase.storage.from('blogs').remove([`${user.id}/${fileName}`])

        // 画像のURLを取得
        const { data: urlData } = supabase.storage.from('blogs').getPublicUrl(storageData.path)

        image_url = urlData.publicUrl
      }

      // ブログをアップデート
      const { error: updateError } = await supabase
        .from('blogs')
        .update({
          title,
          content,
          image_url,
        })
        .eq('id', blog.id)

      if (updateError) {
        alert(updateError.message)
        setLoading(false)
        return
      }

      // ブログ詳細に遷移
      router.push(`/blog/${blog.id}`)
      router.refresh()
    }

    setLoading(false)
  }

  // 自分が投稿したブログを表示
  const renderBlog = () => {
    if (myBlog) {
      return (
        <div className="max-w-screen-md mx-auto">
          <form onSubmit={onSubmit}>
            <div className="mb-5">
              <div className="text-sm mb-1">タイトル</div>
              <input
                className="w-full bg-gray-100 rounded border py-1 px-3 outline-none focus:bg-transparent focus:ring-2 focus:ring-yellow-500"
                type="text"
                id="title"
                placeholder="Title"
                value={title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-5">
              <div className="text-sm mb-1">画像</div>
              <input type="file" id="thumbnail" onChange={onUploadImage} />
            </div>

            <div className="mb-5">
              <div className="text-sm mb-1">内容</div>
              <textarea
                className="w-full bg-gray-100 rounded border py-1 px-3 outline-none focus:bg-transparent focus:ring-2 focus:ring-yellow-500"
                id="content"
                placeholder="Content"
                rows={15}
                value={content}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="text-center mb-5">
              {loading ? (
                <Loading />
              ) : (
                <button
                  type="submit"
                  className="w-full text-white bg-yellow-500 hover:brightness-110 rounded py-1 px-8"
                >
                  編集
                </button>
              )}
            </div>
          </form>
        </div>
      )
    }
  }

  return <>{renderBlog()}</>
}

export default BlogEdit
