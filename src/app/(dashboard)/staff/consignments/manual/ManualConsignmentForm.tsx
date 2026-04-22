'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, UserPlus, Plus, Loader2, Save } from 'lucide-react'
import { createManualConsignment, ManualConsignmentPayload } from '../actions'

type Profile = { id: string; name: string }
type Product = { id: string; name: string; type: string; supplier_price: number; retail_price: number; supplier_id: string }

interface Props {
  suppliers: Profile[]
  products: Product[]
}

export default function ManualConsignmentForm({ suppliers, products }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [supplierInput, setSupplierInput] = useState('')
  // Untuk menyimpan state apakah kita menambah supplier baru atau memilih yang sudah ada
  const selectedSupplier = suppliers.find(s => s.name.toLowerCase() === supplierInput.toLowerCase())

  // Filter produk berdasarkan supplier yang (akan) dipilih
  const availableProducts = selectedSupplier 
    ? products.filter(p => p.supplier_id === selectedSupplier.id)
    : products 

  const [items, setItems] = useState<ManualConsignmentPayload['items']>([
    { product_name: '', quantity: 1, type: 'harian', supplier_price: 0, retail_price: 0 }
  ])

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    const item = newItems[index]
    
    // @ts-ignore
    item[field] = value
    
    // Jika ganti nama produk, coba cari produk existing
    if (field === 'product_name') {
      const existingProd = availableProducts.find(p => p.name.toLowerCase() === value.toLowerCase())
      if (existingProd) {
        item.product_id = existingProd.id
        item.type = existingProd.type as any
        item.supplier_price = existingProd.supplier_price
        item.retail_price = existingProd.retail_price
      } else {
        item.product_id = undefined
      }
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { product_name: '', quantity: 1, type: 'harian', supplier_price: 0, retail_price: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!supplierInput.trim()) {
      setError('Nama supplier tidak boleh kosong.')
      setLoading(false)
      return
    }

    // Validasi harga jual tidak boleh < harga setoran
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const sp = Number(item.supplier_price)
      const rp = Number(item.retail_price)
      if (rp < sp) {
        setError(`Baris ${i + 1} ("${item.product_name || 'item'}"): Harga jual (Rp ${rp.toLocaleString()}) tidak boleh kurang dari harga setoran (Rp ${sp.toLocaleString()}).`)
        setLoading(false)
        return
      }
    }

    const payload: ManualConsignmentPayload = {
      supplier: {
        id: selectedSupplier?.id,
        name: supplierInput.trim()
      },
      items: items.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        type: item.type,
        supplier_price: Number(item.supplier_price),
        retail_price: Number(item.retail_price),
        quantity: Number(item.quantity)
      }))
    }

    const res = await createManualConsignment(payload)
    
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push('/staff/consignments')
      router.refresh()
    }
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
        <Package className="text-blue-500" />
        Input Titipan Masuk Manual
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SUPPLIER SECTION */}
        <section className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserPlus size={16} className="text-indigo-500" /> Profil Supplier
          </h3>
          
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Nama Supplier
            </label>
            <input 
              type="text" 
              value={supplierInput}
              onChange={(e) => setSupplierInput(e.target.value)}
              list="suppliers-list"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900"
              placeholder="Ketik atau pilih nama supplier..."
              required
            />
            <datalist id="suppliers-list">
              {suppliers.map(s => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
            
            {supplierInput && !selectedSupplier && (
              <p className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 inline-block px-2 py-1 rounded">
                * Supplier "{supplierInput}" belum terdaftar. Akun profil akan dibuat otomatis.
              </p>
            )}
            {selectedSupplier && (
              <p className="mt-2 text-xs text-emerald-600 font-medium bg-emerald-50 inline-block px-2 py-1 rounded">
                ✓ Supplier "{selectedSupplier.name}" ditemukan.
              </p>
            )}
          </div>
        </section>

        {/* ITEMS SECTION */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Package size={16} className="text-orange-500" /> Daftar Barang Titipan
            </h3>
            <button 
              type="button" 
              onClick={addItem}
              className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Tambah Baris
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
                
                {items.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute -top-3 -right-3 bg-red-100 text-red-500 p-1.5 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    &times;
                  </button>
                )}

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nama Barang</label>
                  <input
                    type="text"
                    value={item.product_name}
                    onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                    list="products-list"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Nama roti/kue..."
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tipe</label>
                  <select
                    value={item.type}
                    onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                    disabled={!!item.product_id}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 bg-gray-50 outline-none disabled:opacity-70"
                  >
                    <option value="harian">Harian</option>
                    <option value="tahan_lama">Tahan Lama</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Harga Setoran</label>
                  <input
                    type="number"
                    min="0"
                    value={item.supplier_price}
                    onChange={(e) => handleItemChange(index, 'supplier_price', e.target.value)}
                    disabled={!!item.product_id}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none disabled:opacity-70 disabled:bg-gray-50"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Harga Jual</label>
                  <input
                    type="number"
                    min={item.supplier_price || 0}
                    value={item.retail_price}
                    onChange={(e) => handleItemChange(index, 'retail_price', e.target.value)}
                    disabled={!!item.product_id}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:ring-1 outline-none disabled:opacity-70 disabled:bg-gray-50 ${
                      !item.product_id && Number(item.retail_price) > 0 && Number(item.retail_price) < Number(item.supplier_price)
                        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-400'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {!item.product_id && Number(item.retail_price) > 0 && Number(item.retail_price) < Number(item.supplier_price) && (
                    <p className="text-red-500 text-[11px] mt-1 font-semibold">⚠ Harga jual harus ≥ harga setoran</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Kuantitas</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 border-indigo-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-indigo-700 bg-indigo-50/30"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <datalist id="products-list">
            {availableProducts.map(p => (
              <option key={p.id} value={p.name} />
            ))}
          </datalist>
        </section>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-3 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition"
          >
            Batal
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Simpan Barang Masuk
          </button>
        </div>
      </form>
    </div>
  )
}
