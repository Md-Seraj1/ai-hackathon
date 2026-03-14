// Update 1
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Search } from './pages/Search';
import { Profile } from './pages/Profile';
import { ProductDetails } from './pages/ProductDetails';
import { CategoryPage } from './pages/CategoryPage';
import { Notifications } from './pages/Notifications';
import { TryOn } from './pages/TryOn';
import { Settings } from './pages/Settings';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Wishlist } from './pages/Wishlist';
import { PaymentMethods } from './pages/PaymentMethods';
import { Checkout } from './pages/CheckOut';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailure } from './pages/PaymentFailure';
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { useUserStore } from './lib/store';
import { supabase } from './lib/supabase';
import { Placeholder } from './pages/Placeholder';
import { SplashScreen } from './components/ui/SplashScreen';
import { useState } from 'react';

// Admin Imports
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { Products as AdminProducts } from './pages/admin/Products';
import { Orders as AdminOrders } from './pages/admin/Orders';
import { Users as AdminUsers } from './pages/admin/Users';
import { AiTryOn as AdminAiTryOn } from './pages/admin/AiTryOn';
// import { Variants as AdminVariants } from './pages/admin/Variants';
// import { Ratings as AdminRatings } from './pages/admin/Ratings';

const ProtectedRoute = () => {
  const user = useUserStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

function App() {
  const setUser = useUserStore((state) => state.setUser);
  const setProfile = useUserStore((state) => state.setProfile);
  const setWishlist = useUserStore((state) => state.setWishlist);
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const [showSplash, setShowSplash] = useState(true);

  const checkAdminStatus = async (userId) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      setIsAdmin(!!data && !error);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata);
        fetchWishlist(session.user.id);
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata);
        fetchWishlist(session.user.id);
        checkAdminStatus(session.user.id);
      } else {
        setProfile(null);
        setWishlist([]);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setWishlist]);

  const fetchWishlist = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', userId);

      if (!error && data) {
        setWishlist(data.map(item => item.product_id));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchProfile = async (userId, userMetadata = null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to avoid 406/error if not found

      if (!error && data) {
        if (data.is_suspended) {
          alert('Your account has been suspended. Please contact support.');
          await supabase.auth.signOut();
          setProfile(null);
          setUser(null);
          return;
        }
        setProfile(data);
      } else if (!data) {
        // Profile doesn't exist, create it if we have metadata
        const user = (await supabase.auth.getUser()).data.user;
        const metadata = userMetadata || user?.user_metadata;

        if (metadata) {
          const newProfile = {
            id: userId,
            full_name: metadata.full_name || metadata.name || 'User',
            avatar_url: metadata.avatar_url || metadata.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            created_at: new Date().toISOString(),
            is_suspended: false
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (!createError && createdProfile) {
            setProfile(createdProfile);
          } else {
            console.error('Error creating profile:', createError);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/try-on" element={<TryOn />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/Checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/payments" element={<PaymentMethods />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="ai-try-on" element={<AdminAiTryOn />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>

        <Route path="*" element={<Placeholder title="404 Not Found" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
