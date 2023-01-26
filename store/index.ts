// Zustand Reactの状態管理ライブラリ
// https://github.com/pmndrs/zustand
import { create } from 'zustand'

type User = {
  id: string | undefined
  email: string | undefined
}

type State = {
  user: User
  setUser: (payload: User) => void
}

const useStore = create<State>((set) => ({
  // 初期値
  user: { id: '', email: '' },
  // アップデート
  setUser: (payload) => set({ user: payload }),
}))

export default useStore
