'use client'

import { format } from 'date-fns'
import type { BlogListType } from '../../../utils/blog.types'

import Link from 'next/link'
import Image from 'next/image'

// ブログアイテム
const BlogItem = (blog: BlogListType) => {
  const MAX_LENGTH = 55
  let content = blog.content.replace(/\r?\n/g, '')

  // 文字数制限
  if (content.length > MAX_LENGTH) {
    content = content.substring(0, MAX_LENGTH) + '...'
  }

  return (
    <div className="break-words">
      <div className="mb-5">
        <Link href={`blog/${blog.id}`}>
          <Image
            src={blog.image_url}
            className="rounded-lg aspect-video object-cover"
            alt="image"
            width={640}
            height={360}
          />
        </Link>
      </div>
      <div className="text-gray-500 text-sm">
        {format(new Date(blog.created_at), 'yyyy/MM/dd HH:mm')}
      </div>
      <div className="font-bold text-xl">{blog.title}</div>
      <div className="mb-3 text-gray-500">{content}</div>

      <div className="flex items-center space-x-3">
        <Image
          src={blog.avatar_url ? blog.avatar_url : '/default.png'}
          className="rounded-full"
          alt="avatar"
          width={45}
          height={45}
        />
        <div className="font-bold">{blog.name}</div>
      </div>
    </div>
  )
}

export default BlogItem
