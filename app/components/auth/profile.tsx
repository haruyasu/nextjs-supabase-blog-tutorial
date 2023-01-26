'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../supabase-provider'
import { v4 as uuidv4 } from 'uuid'

import useStore from '../../../store'
import Image from 'next/image'
import Loading from '../../loading'

// プロフィール
const Profile = () => {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { user } = useStore()
  const nameRef = useRef<HTMLInputElement>(null!)
  const [email, setEmail] = useState<string>(null!)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingLogout, setLoadingLogout] = useState(false)

  // 画像アップロード
  const onUploadImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files?.length == 0) {
      return
    }
    setAvatar(files[0])
  }, [])

  useEffect(() => {
    if (user.id) {
      // プロフィール取得
      const getProfile = async () => {
        const { data: userData, error } = await supabase
          .from('profiles')
          .select()
          .eq('id', user.id)
          .single()

        // プロフィール取得失敗
        if (error) {
          alert(error.message)
          return
        }

        // 名前設定
        if (userData.name) {
          nameRef.current.value = userData.name
        }

        // 画像URL設定
        if (userData.avatar_url) {
          setAvatarUrl(userData.avatar_url)
        }
      }

      getProfile()
      setEmail(user.email!)
    }
  }, [user])

  // 送信
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    if (user.id) {
      let avatar_url = avatarUrl

      // 画像をアップロードした場合
      if (avatar) {
        // supabaseストレージに画像アップロード
        const { data: storageData, error: storageError } = await supabase.storage
          .from('profile')
          .upload(`${user.id}/${uuidv4()}`, avatar)

        if (storageError) {
          alert(storageError.message)
          setLoading(false)
          return
        }

        if (avatar_url) {
          const fileName = avatar_url.split('/').slice(-1)[0]

          // 古い画像を削除
          await supabase.storage.from('profile').remove([`${user.id}/${fileName}`])
        }

        // 画像のURLを取得
        const { data: urlData } = await supabase.storage
          .from('profile')
          .getPublicUrl(storageData.path)

        avatar_url = urlData.publicUrl
      }

      // プロフィールアップデート
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: nameRef.current.value,
          avatar_url: avatar_url,
        })
        .eq('id', user.id)

      if (updateError) {
        alert(updateError.message)
        setLoading(false)
        return
      }

      // トップページ遷移
      router.push('/')
      router.refresh()
    }

    setLoading(false)
  }

  // ログアウト
  const logout = async () => {
    setLoadingLogout(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setLoadingLogout(false)
  }

  return (
    <div className="max-w-sm mx-auto">
      <form onSubmit={onSubmit}>
        <div className="mb-5">
          <div className="flex justify-center mb-5">
            <Image
              src={avatarUrl ? avatarUrl : '/default.png'}
              className="rounded-full"
              alt="avatar"
              width={100}
              height={100}
            />
          </div>
          <input type="file" id="thumbnail" onChange={onUploadImage} />
        </div>

        <div className="mb-5">
          <div className="text-sm mb-1">名前</div>
          <input
            className="w-full bg-gray-100 rounded border py-1 px-3 outline-none focus:bg-transparent focus:ring-2 focus:ring-yellow-500"
            ref={nameRef}
            type="text"
            id="name"
            placeholder="Name"
            required
          />
        </div>

        <div className="mb-5">
          <div className="text-sm mb-1">メールアドレス</div>
          <div>{email}</div>
        </div>

        <div className="text-center mb-10">
          {loading ? (
            <Loading />
          ) : (
            <button
              type="submit"
              className="w-full text-white bg-yellow-500 hover:brightness-110 rounded py-1 px-8"
            >
              変更
            </button>
          )}
        </div>
      </form>

      <div className="text-center">
        {loadingLogout ? (
          <Loading />
        ) : (
          <div className="inline-block text-red-500 cursor-pointer" onClick={logout}>
            ログアウト
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
