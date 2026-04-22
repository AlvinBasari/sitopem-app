import { createClient } from '@/utils/supabase/server'
import { updateUserRoleAndBranch } from './actions'
import { Users as UsersIcon, Settings } from 'lucide-react'

export default async function UsersPage() {
  const supabase = await createClient()

  // Ambil semua pengguna
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('*, branches(name)')
    .or('role.eq.staff,role.is.null')
    .order('created_at', { ascending: false })

  // Ambil data cabang untuk dropdown
  const { data: branches } = await supabase
    .from('branches')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <UsersIcon className="text-blue-600" /> Manajemen Pengguna & Penugasan Staf
        </h1>
        <p className="text-sm text-gray-500">
          Atur hak akses pengguna (Role) dan tugaskan Staff ke Cabang spesifik.
          (Catatan: Registrasi pengguna akun baru dilakukan via panel Auth Supabase untuk sementara).
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {profileErr && <div className="p-4 text-red-500 bg-red-50">Gagal memuat pengguna.</div>}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-600">
                <th className="p-4 font-semibold">Nama / ID</th>
                <th className="p-4 font-semibold">Role Saat Ini</th>
                <th className="p-4 font-semibold">Cabang Ditugaskan</th>
                <th className="p-4 font-semibold bg-blue-50/50">Aksi (Ubah Penugasan)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles?.map((profile: any) => (
                <tr key={profile.id} className="hover:bg-gray-50/50 transition duration-150">
                  <td className="p-4">
                    <p className="font-semibold text-gray-800">{profile.name}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5" title={profile.id}>
                      {profile.id.substring(0, 8)}...{profile.id.slice(-4)}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                      ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        profile.role === 'staff' ? 'bg-orange-100 text-orange-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {profile.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {profile.role === 'staff' ? (
                      profile.branches?.name ? (
                        <span className="flex items-center gap-1.5 font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-max">
                           📍 {profile.branches.name}
                        </span>
                      ) : (
                        <span className="text-red-500 italic text-xs">Belum Ditugaskan</span>
                      )
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 bg-blue-50/20">
                    <form action={async (formData) => {
                      'use server'
                      await updateUserRoleAndBranch(formData)
                    }} className="flex items-center gap-3">
                      <input type="hidden" name="id" value={profile.id} />
                      
                      <select name="role" defaultValue={profile.role} className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="supplier">Supplier</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>

                      <select name="branch_id" defaultValue={profile.branch_id || ''} className="text-sm bg-white border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[140px]">
                        <option value="">-- Pilih Cabang (Staff) --</option>
                        {branches?.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>

                      <button type="submit" className="p-1.5 bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white rounded-md transition" title="Simpan Perubahan">
                        <Settings size={18} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles?.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              Belum ada pengguna.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
