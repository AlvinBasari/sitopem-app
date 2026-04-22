'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { processTransaction, type CartItem } from './actions'
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Receipt, Tag, Banknote } from 'lucide-react'

// Kita render sbg client component sepenuhnya untuk handle keranjang interaktif
export default function PosTerminalPage() {
  const [stock, setStock] = useState<any[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // State diskon & pembayaran
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [cashReceived, setCashReceived] = useState<string>('')

  const DISCOUNT_PRESETS = [500, 1000, 2000, 5000]

  const [supabase] = useState(() => createClient())

  useEffect(() => {
    fetchStock()
  }, [])

  async function fetchStock() {
    console.log("1. fetchStock started");
    try {
      setLoading(true)
      setErrorMsg('')
      
      // Ambil user yang sedang login dulu
      console.log("2. Getting current user...");
      const { data: authData, error: authErr } = await supabase.auth.getUser()
      console.log("2b. Auth result:", authData?.user?.id, "Error:", authErr);

      if (authErr || !authData?.user) {
        setErrorMsg('Sesi tidak valid. Silakan login ulang.')
        setLoading(false)
        return
      }

      console.log("3. Init supabase call to profiles...");
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('branch_id')
        .eq('id', authData.user.id)  // ← filter by user ID
        .single()
      console.log("4. Finished call. Profile:", profile, "Error:", profileErr);
      
      if (profileErr) {
        console.error("Profile fetch error:", profileErr)
        setErrorMsg('Gagal mengambil data profil: ' + profileErr.message)
        setLoading(false)
        return
      }

      if (!profile?.branch_id) {
        console.log("5. No branch ID found for user:", authData.user.id);
        setErrorMsg('Akun Anda belum dikaitkan ke cabang manapun. Hubungi admin.')
        setLoading(false)
        return
      }

      console.log("6. Fetching consignments for branch:", profile.branch_id);
      const { data, error } = await supabase
        .from('consignments')
        .select('id, quantity, products(id, name, type, retail_price, supplier_price)')
        .eq('branch_id', profile.branch_id)
        .eq('status', 'diterima')
        .gt('quantity', 0)
        .order('created_at', { ascending: true })
      
      console.log("7. Consignments fetched:", data, "Error:", error);

      if (error) {
        console.error("Consignments fetch error:", error)
        setErrorMsg('Gagal mengambil data produk: ' + error.message)
      } else if (data) {
        setStock(data)
      }
    } catch (err: any) {
      console.error("7. Fetch stock exception:", err)
      setErrorMsg(err.message || 'Terjadi kesalahan sistem')
    } finally {
      console.log("8. Finally block reached, setting loading false");
      setLoading(false)
    }
  }

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find(i => i.consignment_id === item.id)
      if (existing) {
        if (existing.quantity >= item.quantity) return prev // out of stock
        return prev.map(i => i.consignment_id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, {
        consignment_id: item.id,
        product_id: item.products.id,
        name: item.products.name,
        retail_price: item.products.retail_price,
        supplier_price: item.products.supplier_price,
        quantity: 1
      }]
    })
    setShowCart(true) // Otomatis buka keranjang di mobile
  }

  const changeQty = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.consignment_id === id) {
          const max = stock.find(s => s.id === id)?.quantity || 0
          const newQty = Math.max(1, Math.min(max, i.quantity + delta))
          return { ...i, quantity: newQty }
        }
        return i
      })
    })
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.consignment_id !== id))

  const subtotal = cart.reduce((sum, i) => sum + (i.retail_price * i.quantity), 0)

  // Hitung total & kembalian
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount)
  const cashNum = parseFloat(cashReceived) || 0
  const kembalian = cashNum - totalAfterDiscount

  const handleCheckout = async () => {
    if (cart.length === 0) return
    if (cashNum > 0 && cashNum < totalAfterDiscount) {
      setErrorMsg('Uang yang diterima kurang dari total pembayaran.')
      return
    }
    setCheckingOut(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    try {
      const res = await processTransaction(cart, { discount: discountAmount })
      if (res?.error) {
        setErrorMsg(res.error)
      } else {
        setCart([])
        setDiscountAmount(0)
        setCashReceived('')
        setSuccessMsg(`Transaksi berhasil! Kembalian: Rp ${Math.max(0, kembalian).toLocaleString()}`)
        await fetchStock()
      }
    } catch (e: any) {
      setErrorMsg(e.message)
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="relative h-[calc(100vh-160px)] flex flex-col md:flex-row gap-6">
      
      {/* Kiri: Daftar Produk */}
      <div className="flex-1 md:flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center z-10 shrink-0">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Receipt className="text-blue-500" /> Katalog Penjualan
          </h2>
          <span className="md:hidden text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase">Mobile View</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {errorMsg && cart.length === 0 && (
            <div className="mb-4 bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
              <h3 className="font-bold mb-1">Gagal Memuat Data</h3>
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : stock.length === 0 ? (
            <div className="m-auto text-center py-20">
              <p className="text-gray-400">Stok kosong atau belum ada titipan yang diterima.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 pb-20 md:pb-0">
              {stock.map((item) => {
                const cartQty = cart.find(c => c.consignment_id === item.id)?.quantity || 0
                const available = item.quantity - cartQty

                return (
                  <button 
                    key={item.id}
                    onClick={() => available > 0 && addToCart(item)}
                    disabled={available <= 0}
                    className={`flex flex-col justify-between p-3 md:p-4 rounded-xl border text-left transition transform active:scale-95
                      ${available <= 0 ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed' : 'bg-white border-blue-100 shadow-sm hover:border-blue-300 hover:shadow-md'}`}
                  >
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight mb-1">{item.products.name}</h3>
                      <p className="text-xl md:text-2xl font-black text-blue-600 my-1 md:my-2">Rp {item.products.retail_price.toLocaleString()}</p>
                    </div>
                    <div className="w-full mt-2 flex justify-between items-center text-[10px] md:text-xs font-semibold uppercase">
                      <span className={`${available <= 0 ? 'text-red-500' : 'text-emerald-500'} bg-black/5 px-2 py-1 rounded`}>
                        {available} Stok
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Toggle untuk Mobile */}
      {cart.length > 0 && (
        <button 
          onClick={() => setShowCart(true)}
          className="md:hidden fixed bottom-24 right-4 z-40 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 animate-bounce"
        >
          <ShoppingCart />
          <span className="font-bold">{cart.length}</span>
        </button>
      )}

      {/* Overlay Background Mobile */}
      {showCart && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setShowCart(false)}
        />
      )}

      {/* Kanan / Drawer: Keranjang */}
      <div className={`
        fixed inset-x-0 bottom-0 z-[70] h-[85vh] transition-transform duration-300 transform bg-white rounded-t-3xl shadow-2xl flex flex-col overflow-hidden
        md:relative md:flex-[1] md:min-w-[320px] md:h-full md:rounded-2xl md:shadow-sm md:border md:border-gray-100 md:translate-y-0 md:z-auto md:bg-white
        ${showCart ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
      `}>
        {/* Header Keranjang */}
        <div className="p-4 border-b border-gray-100 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} />
            <span className="font-bold">Keranjang Belanja</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs ml-2">{cart.length}</span>
          </div>
          <button 
            onClick={() => setShowCart(false)}
            className="md:hidden p-2 hover:bg-white/10 rounded-full"
          >
            <Minus size={20} />
          </button>
        </div>

        {/* List Item */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="m-auto text-center text-gray-400">
              <ShoppingCart size={48} className="mx-auto text-gray-200 mb-3" />
              <p>Belum ada item dipilih</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.consignment_id} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-gray-800 leading-tight pr-4">{item.name}</span>
                  <button onClick={() => removeFromCart(item.consignment_id)} className="text-gray-300 hover:text-red-500 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-auto text-sm">
                  <span className="font-semibold text-blue-600">Rp {(item.retail_price * item.quantity).toLocaleString()}</span>
                  
                  <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200">
                    <button onClick={() => changeQty(item.consignment_id, -1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-l-lg" disabled={item.quantity <= 1}>
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-700">{item.quantity}</span>
                    <button onClick={() => changeQty(item.consignment_id, 1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-r-lg">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Ringkasan & Tombol Checkout */}
        <div className="p-4 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100 shrink-0 space-y-3">
          
          {/* Subtotal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-gray-700">Rp {subtotal.toLocaleString()}</span>
          </div>

          {/* Diskon Preset */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-700 uppercase tracking-wide">
                <Tag size={12} /> Diskon
              </div>
              {discountAmount > 0 && (
                <button
                  onClick={() => setDiscountAmount(0)}
                  className="text-xs text-yellow-600 hover:text-yellow-800 font-semibold underline"
                >
                  Hapus
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {DISCOUNT_PRESETS.map(preset => (
                <button
                  key={preset}
                  onClick={() => setDiscountAmount(discountAmount === preset ? 0 : preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    discountAmount === preset
                      ? 'bg-yellow-400 text-white border-yellow-400 shadow-sm'
                      : 'bg-white text-yellow-700 border-yellow-200 hover:border-yellow-400'
                  }`}
                >
                  Rp {preset.toLocaleString()}
                </button>
              ))}
            </div>
            {discountAmount > 0 && (
              <div className="text-xs text-yellow-700 font-semibold">
                Potongan: − Rp {discountAmount.toLocaleString()}
              </div>
            )}
          </div>

          {/* Total setelah diskon */}
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-700">Total Bayar</span>
            <span className="text-2xl font-black text-gray-900">Rp {totalAfterDiscount.toLocaleString()}</span>
          </div>

          {/* Uang Masuk */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-wide">
              <Banknote size={12} /> Uang Diterima
            </div>
            <input
              type="number"
              min="0"
              placeholder="Masukkan jumlah uang..."
              value={cashReceived}
              onChange={e => setCashReceived(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 font-bold"
            />
            {cashNum > 0 && (
              <div className={`text-sm font-black flex justify-between ${
                kembalian >= 0 ? 'text-emerald-600' : 'text-red-500'
              }`}>
                <span>{kembalian >= 0 ? 'Kembalian:' : 'Kurang:'}</span>
                <span>Rp {Math.abs(kembalian).toLocaleString()}</span>
              </div>
            )}
          </div>

          {errorMsg && <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded-lg">{errorMsg}</p>}
          {successMsg && <p className="text-emerald-600 text-xs text-center font-bold bg-emerald-50 p-2 rounded-lg">{successMsg}</p>}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkingOut}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all text-white shadow-xl
              ${cart.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95'}
            `}
          >
            {checkingOut ? (
              <span className="animate-spin border-2 border-white/40 border-t-white h-5 w-5 rounded-full" />
            ) : (
              <><CreditCard size={20} /> Selesaikan Transaksi</>
            )}
          </button>
          
          {/* Support Bottom Nav Padding */}
          <div className="h-4 md:hidden" />
        </div>
      </div>
    </div>
  )
}
