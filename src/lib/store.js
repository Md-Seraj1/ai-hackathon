import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const items = get().items;
                const existingItem = items.find((item) => item.id === product.id);
                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity: 1 }] });
                }
            },
            removeItem: (productId) =>
                set({
                    items: get().items.filter((item) => item.id !== productId),
                }),
            updateQuantity: (productId, quantity) => {
                if (quantity < 1) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            total: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: 'shopping-cart',
        }
    )
);

export const useUserStore = create((set) => ({
    user: null,
    profile: null,
    isAdmin: false,
    wishlist: [], // Array of product IDs
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setIsAdmin: (isAdmin) => set({ isAdmin }),
    setWishlist: (wishlist) => set({ wishlist }),
    toggleWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter(id => id !== productId)
            : [...state.wishlist, productId]
    })),
    logout: () => set({ user: null, profile: null, wishlist: [], isAdmin: false }),
}));
