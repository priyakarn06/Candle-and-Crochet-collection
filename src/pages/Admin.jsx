import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logoAsset from '../assets/logo.jpeg';
import AdminFeedbackQueue from '../components/AdminFeedbackQueue';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const emptyForm = {
  store_type: 'candles',
  name: '',
  price: '',
  details: '',
  image_url: '',
  in_stock: true,
};

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoSrc, setLogoSrc] = useState(logoAsset);
  const [pendingProductDelete, setPendingProductDelete] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Products & CRUD state
  const [products, setProducts] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [session]);

  async function fetchProducts() {
    setListLoading(true);
    setStatusMessage('');
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setStatusMessage(`Could not load products: ${error.message}`);
    } else {
      setProducts(data ?? []);
    }
    setListLoading(false);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    setSubmittingAuth(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
    setSubmittingAuth(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    resetForm();
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      store_type: item.store_type,
      name: item.name,
      price: String(item.price),
      details: item.details ?? '',
      image_url: item.image_url ?? '',
      in_stock: Boolean(item.in_stock),
    });
    setImageFile(null);
    setStatusMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function uploadImageIfSelected() {
    if (!imageFile) {
      return form.image_url || null;
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${form.store_type}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageFile, { upsert: false });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSaveProduct(e) {
    e.preventDefault();
    setStatusMessage('');

    const numericPrice = Number(form.price);
    if (!form.name.trim() || Number.isNaN(numericPrice) || numericPrice <= 0) {
      setStatusMessage('Enter a valid product name and price greater than 0.');
      return;
    }

    setSavingProduct(true);
    try {
      const finalImageUrl = await uploadImageIfSelected();
      const payload = {
        store_type: form.store_type,
        name: form.name.trim(),
        price: numericPrice,
        details: form.details.trim() || null,
        image_url: finalImageUrl,
        in_stock: form.in_stock,
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);
        if (error) throw new Error(error.message);
        setStatusMessage('Product updated.');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw new Error(error.message);
        setStatusMessage('Product added.');
      }

      resetForm();
      await fetchProducts();
    } catch (err) {
      setStatusMessage(err.message);
    } finally {
      setSavingProduct(false);
    }
  }

  async function handleToggleStock(item) {
    setStatusMessage('');
    const { error } = await supabase
      .from('products')
      .update({ in_stock: !item.in_stock })
      .eq('id', item.id);

    if (error) {
      setStatusMessage(`Stock update failed: ${error.message}`);
    } else {
      setProducts((prev) =>
        prev.map((row) =>
          row.id === item.id ? { ...row, in_stock: !item.in_stock } : row
        )
      );
    }
  }

  function requestDeleteProduct(item) {
    setPendingProductDelete(item);
  }

  async function confirmDeleteProduct() {
    if (!pendingProductDelete) return;
    const item = pendingProductDelete;

    setDeletingProduct(true);
    setStatusMessage('');

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', item.id);

    setDeletingProduct(false);
    setPendingProductDelete(null);

    if (error) {
      setStatusMessage(`Delete failed: ${error.message}`);
    } else {
      setProducts((prev) => prev.filter((row) => row.id !== item.id));
      if (editingId === item.id) {
        resetForm();
      }
      setStatusMessage('Product deleted.');
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6F5] text-[#2D2226] flex items-center justify-center">
        Checking session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#FDF6F5] text-[#2D2226] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white border border-[#C8A262]/60 shadow-lg p-6 space-y-5">
          <div className="flex flex-col items-center text-center gap-2">
            <img
              src={logoSrc}
              alt="Kirei Collection"
              onError={() => setLogoSrc('/logo.jpeg')}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C8A262] bg-[#F7E4E2]"
            />
            <h1 className="text-xl font-bold text-[#2D2226]">Admin Login</h1>
          </div>

          <div className="flex justify-end">
            <Link
              to="/"
              className="text-xs font-medium text-[#5A4A4F] hover:text-[#B8335A]"
            >
              Back to Home
            </Link>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-[#FDF6F5] border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
                placeholder="kireicollection11@gmail.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-[#FDF6F5] border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full rounded-full bg-[#B8335A] hover:bg-[#9E2448] disabled:opacity-50 text-[#FDF6F5] border border-[#C8A262]/60 font-semibold py-2.5 text-sm shadow-sm transition"
            >
              {submittingAuth ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const visibleProducts =
    filterType === 'all'
      ? products
      : products.filter((item) => item.store_type === filterType);

  return (
    <div className="min-h-screen bg-[#FDF6F5] text-[#2D2226]">
      <header className="border-b border-[#C8A262]/50 bg-[#FDF6F5]/95 sticky top-0 z-20 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/">
              <img
                src={logoSrc}
                alt="Kirei Collection"
                onError={() => setLogoSrc('/logo.jpeg')}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#C8A262] bg-[#F7E4E2]"
              />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#2D2226]">Store Admin</h1>
              <p className="text-xs text-[#5A4A4F]">{session.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link
              to="/candles"
              className="text-[#5A4A4F] hover:text-[#B8335A] font-medium"
            >
              Candles
            </Link>
            <Link
              to="/crochet"
              className="text-[#5A4A4F] hover:text-[#B8335A] font-medium"
            >
              Crochet
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-full bg-[#F7E4E2] hover:bg-[#B8335A] text-[#2D2226] hover:text-[#FDF6F5] border border-[#C8A262]/60 px-3.5 py-1.5 text-xs font-semibold transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Add / Edit Form */}
        <section className="lg:col-span-5 rounded-2xl bg-white border border-[#C8A262]/55 shadow-sm p-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#2D2226]">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-[#B8335A] hover:underline"
              >
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                Collection
              </label>
              <select
                value={form.store_type}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, store_type: e.target.value }))
                }
                className="w-full rounded-lg bg-[#FDF6F5] border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
              >
                <option value="candles">Candles</option>
                <option value="crochet">Crochet</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                Product Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder={
                  form.store_type === 'candles'
                    ? 'Vanilla Soy Jar Candle'
                    : 'Chunky Crochet Tote Bag'
                }
                className="w-full rounded-lg bg-[#FDF6F5] border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                Price (INR)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={form.price}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="499"
                className="w-full rounded-lg bg-[#FDF6F5] border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                {form.store_type === 'candles'
                  ? 'Scent / Burn Time / Size (optional)'
                  : 'Yarn / Dimensions / Care (optional)'}
              </label>
              <input
                type="text"
                value={form.details}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, details: e.target.value }))
                }
                placeholder={
                  form.store_type === 'candles'
                    ? 'Vanilla & Amber • ~35 hr burn'
                    : '100% Cotton Yarn • 14x12 in'
                }
                className="w-full rounded-lg bg-[#FDF6F5] border border-[#C8A262]/60 px-3 py-2 text-sm text-[#2D2226] focus:outline-none focus:border-[#B8335A]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A4A4F] mb-1">
                Product Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-[#5A4A4F] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border file:border-[#C8A262]/60 file:bg-[#F7E4E2] file:text-[#2D2226] file:font-medium hover:file:bg-[#B8335A] hover:file:text-[#FDF6F5] file:transition-colors"
              />
              {form.image_url && !imageFile && (
                <p className="text-[11px] text-[#5A4A4F] mt-1 truncate">
                  Current image set
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-[#2D2226] cursor-pointer">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, in_stock: e.target.checked }))
                }
                className="rounded border-[#C8A262] accent-[#B8335A]"
              />
              In Stock
            </label>

            <button
              type="submit"
              disabled={savingProduct}
              className="w-full rounded-full bg-[#B8335A] hover:bg-[#9E2448] disabled:opacity-50 text-[#FDF6F5] border border-[#C8A262]/60 font-semibold py-2.5 text-sm shadow-sm transition"
            >
              {savingProduct
                ? 'Saving...'
                : editingId
                ? 'Update Product'
                : 'Add Product'}
            </button>
          </form>

          {statusMessage && (
            <p className="mt-4 text-xs font-medium text-[#9E2448] bg-[#F7E4E2] border border-[#C8A262]/60 rounded-lg p-3">
              {statusMessage}
            </p>
          )}
        </section>

        {/* Product List */}
        <section className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-[#2D2226]">
              Catalog Items ({visibleProducts.length})
            </h2>
            <div className="flex gap-1.5 text-xs">
              {['all', 'candles', 'crochet'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-3.5 py-1 rounded-full capitalize border transition-colors ${
                    filterType === tab
                      ? 'bg-[#B8335A] text-[#FDF6F5] border-[#B8335A] font-semibold'
                      : 'bg-white text-[#2D2226] border-[#C8A262]/55 hover:border-[#B8335A]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {listLoading ? (
            <p className="text-sm text-[#5A4A4F]">Loading products...</p>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-2xl bg-white/80 border border-[#C8A262]/50 p-8 text-center text-sm text-[#5A4A4F]">
              No items in this view yet. Add one on the left.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleProducts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white border border-[#C8A262]/50 shadow-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-[#F7E4E2] border border-[#C8A262]/40"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#F7E4E2] border border-[#C8A262]/40 shrink-0 flex items-center justify-center text-[10px] text-[#5A4A4F]">
                        No img
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#2D2226] truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-[#F7E4E2] text-[#2D2226] border border-[#C8A262]/40">
                          {item.store_type}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            item.in_stock
                              ? 'bg-[#FDF6F5] text-[#9E2448] border border-[#C8A262]/70'
                              : 'bg-[#F7E4E2] text-[#5A4A4F]'
                          }`}
                        >
                          {item.in_stock ? 'In Stock' : 'Sold Out'}
                        </span>
                      </div>
                      <p className="text-xs text-[#B8335A] font-bold mt-0.5">
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </p>
                      {item.details && (
                        <p className="text-xs text-[#5A4A4F] truncate mt-0.5">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleStock(item)}
                      className="px-2.5 py-1.5 rounded-full bg-[#FDF6F5] hover:bg-[#F7E4E2] text-[#2D2226] border border-[#C8A262]/55 text-xs font-medium transition-colors"
                    >
                      {item.in_stock ? 'Mark Sold Out' : 'Mark In Stock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="px-2.5 py-1.5 rounded-full bg-[#FDF6F5] hover:bg-[#F7E4E2] text-[#2D2226] border border-[#C8A262]/55 text-xs font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => requestDeleteProduct(item)}
                      className="px-2.5 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <AdminFeedbackQueue />

      <ConfirmDeleteModal
        isOpen={Boolean(pendingProductDelete)}
        title="Delete Product"
        itemName={pendingProductDelete?.name}
        loading={deletingProduct}
        onSave={() => setPendingProductDelete(null)}
        onDelete={confirmDeleteProduct}
      />
    </div>
  );
}