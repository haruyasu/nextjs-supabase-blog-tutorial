import 'server-only'

import SupabaseListener from './components/supabase-listener'
import SupabaseProvider from './components/supabase-provider'
import '../styles/globals.css'
import Navigation from './components/navigation'
import { createClient } from '../utils/supabase-server'

// キャッシュをしない
export const revalidate = 0

// レイアウト
const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient()

  // セッション情報取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html>
      <body>
        <SupabaseProvider>
          <SupabaseListener serverAccessToken={session?.access_token} />

          <div className="flex flex-col min-h-screen">
            <Navigation />

            <main className="flex-1 container max-w-screen-xl mx-auto px-5 py-10">{children}</main>

            <footer className="py-5 border-t">
              <div className="text-center text-sm text-gray-500">
                Copyright © All rights reserved | FullStackChannel
              </div>
            </footer>
          </div>
        </SupabaseProvider>
      </body>
    </html>
  )
}

export default RootLayout
