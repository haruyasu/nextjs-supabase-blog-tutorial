'use client'

import { useRef, FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../supabase-provider'

import Link from 'next/link'
import Loading from '../../loading'

// ログイン
const Login = () => {
  const { supabase } = useSupabase()
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  // 送信
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // ログイン処理
    // 認証はクライアントコンポーネントで行う
    const { error: signinError } = await supabase.auth.signInWithPassword({
      email: emailRef.current!.value,
      password: passwordRef.current!.value,
    })

    if (signinError) {
      alert(signinError.message)
      setLoading(false)
      return
    }

    // トップページ遷移
    router.push('/')

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={onSubmit}>
        <div className="mb-5">
          <div className="text-sm mb-1">メールアドレス</div>
          <input
            className="w-full bg-gray-100 rounded border py-1 px-3 outline-none focus:bg-transparent focus:ring-2 focus:ring-yellow-500"
            ref={emailRef}
            type="email"
            id="email"
            placeholder="Email"
            required
          />
        </div>

        <div className="mb-5">
          <div className="text-sm mb-1">パスワード</div>
          <input
            className="w-full bg-gray-100 rounded border py-1 px-3 outline-none focus:bg-transparent focus:ring-2 focus:ring-yellow-500"
            ref={passwordRef}
            type="password"
            id="password"
            placeholder="Password"
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
              ログイン
            </button>
          )}
        </div>
      </form>

      <div className="text-center">アカウントが未登録ですか？</div>
      <div className="text-center">
        <Link href="/auth/signup" className="cursor-pointer font-bold">
          サインアップ
        </Link>
      </div>
    </div>
  )
}

export default Login
