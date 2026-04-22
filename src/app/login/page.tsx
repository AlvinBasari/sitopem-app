import { login } from './actions'

export default async function LoginPage(
  props: {
    searchParams: Promise<{ error?: string }>
  }
) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SITOPEM
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Sistem Toko Penitipan Makanan</p>
        </div>

        <form action={login} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="email">
              Email atau No. Telepon
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              placeholder="08xxxxxxxxxx atau email@anda.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-200 text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {searchParams?.error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 text-center animate-pulse">
              {searchParams.error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Masuk ke Dashboard
            </button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Punya produk untuk dititipkan?{' '}
                <a href="/register" className="text-blue-600 font-bold hover:underline">
                  Daftar Jadi Supplier
                </a>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
