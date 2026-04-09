# Tiny Crafts - Modular Architecture Guide

## 📂 Project Structure

```
KEYRING/
├── index.html                 # Main HTML file
├── styles.css                 # Global CSS styles
├── script.js                  # Core state & Firebase config (KEEP ORIGINAL)
├── server.js                  # Node.js backend API
├── package.json               # Dependencies
└── modules/                   # New modular JavaScript files
    ├── utils.js               # Utilities (Toast, Modals, Navigation)
    ├── auth.js                # Authentication (Sign in, Register, Logout)
    ├── shop.js                # Shop & Products (Filter, Search, Reviews)
    ├── cart.js                # Cart & Checkout (Add/Remove, Payment)
    ├── wishlist.js            # Wishlist functionality
    ├── profile.js             # User Profile & Order History
    └── admin.js               # Admin Dashboard & Inventory
```

## 🔧 What Each Module Does

### **1. modules/utils.js** ⚙️
**Utilities & Navigation Helpers**
- `showToast()` - Display notifications (success/error)
- `openModal()` / `closeModal()` - Modal management
- `toggleTheme()` - Dark/Light mode toggle
- `showView()` - Main navigation between pages
- Browser back button handling

### **2. modules/auth.js** 🔐
**Authentication & User Management**
- `loginUser()` - Email/password sign in
- `registerUser()` - Create new account
- `signInWithGoogle()` - Google OAuth
- `signInWithFacebook()` - Facebook OAuth
- `signInWithGitHub()` - GitHub OAuth
- `logout()` - Sign out & clear session
- Auth state listener (Firebase integration)

### **3. modules/shop.js** 🛍️
**Product Display & Filtering**
- `handleLiveSearch()` - Real-time product search
- `filterProducts()` - Filter by category/price/sort (fetches from Node.js API)
- `renderProducts()` - Display product cards
- `openProductModal()` - Show product details
- `renderReviews()` / `submitReview()` - Customer reviews
- `renderRelatedProducts()` - Related items suggestion

### **4. modules/cart.js** 🛒
**Shopping Cart & Checkout Process**
- `addToCart()` - Add items to cart
- `removeItem()` / `updateQty()` - Cart management
- `getCartTotal()` - Calculate total price
- `applyPromo()` - Apply discount codes (CUTE20 = 20% off)
- `renderCart()` - Display cart items
- **Checkout Steps:**
  - `goToCheckout()` - Start checkout
  - `nextCheckoutStep()` - Multi-step form navigation
  - `updateCardUI()` / `flipCard()` - Interactive card UI
  - `confirmOrder()` - Submit order to Node.js API
  - Handles offline fallback (saves to localStorage)

### **5. modules/wishlist.js** ❤️
**Wishlist Management**
- `toggleWishlist()` - Add/remove from wishlist
- `renderWishlist()` - Display wishlist items
- Syncs with localStorage

### **6. modules/profile.js** 👤
**User Profile & Order History**
- `renderProfile()` - Display user profile
  - Fetches orders from Node.js API
  - Shows total spent & order count
  - Displays order history with dates & status
  - Fallback to localStorage if backend is offline

### **7. modules/admin.js** 👑
**Admin Dashboard & Inventory Management**
- `renderAdmin()` - Show admin dashboard
- `renderSprintTracker()` - Agile sprint tracking (WBS & Critical Path)
- `adminUpdateStock()` - Modify product inventory
- `adminDelete()` - Remove products
- `previewImageFile()` - Image upload preview
- Global revenue & order stats (from Node.js)

### **8. script.js** (Keep Original!) 📜
**Core Configuration - DO NOT MODIFY**
- Firebase configuration
- Global state variables:
  - `cart[]` - Shopping cart items
  - `wishlist[]` - Wishlist IDs
  - `currentUser` - Logged-in user
  - `products[]` - Product database
  - `discountMultiplier` - Promo code multiplier
- localStorage cache keys
- App version management

---

## 🔄 Data Flow

### **Frontend → Backend Communication**
```
Client (Browser)
    ↓ Fetch Request
Node.js Server (server.js port 3000)
    ↓ In-memory Database
Response (JSON)
```

### **API Endpoints Used:**
1. `GET /api/products` - Fetch all products
2. `GET /api/products/:id` - Fetch single product
3. `POST /api/orders` - Save new order
4. `GET /api/orders/:email` - Get user's orders
5. `GET /api/orders/all` - Get all orders (admin)

### **Offline Fallback:**
- If Node.js server is offline, app uses `localStorage`
- Products stored in `kcProducts`
- Orders stored in `kcOrders`
- Automatically syncs when server comes back online

---

## 🚀 How to Use

### **Running the Project**
```bash
# Terminal 1: Start Node.js backend
node server.js

# Terminal 2: Open in browser with live server
# OR use VS Code Live Server extension
# Go to: http://localhost:5500 (or similar)
```

### **Admin Access**
- Email: `admin@keyringcrafters.com` or `admin@tinycrafts.com`
- Password: Any password (Firebase will validate)
- Note: Change in `modules/auth.js` auth state listener if needed

### **Test Promo Code**
- Code: `CUTE20`
- Discount: 20% off order

---

## ✅ No Breaking Changes

- **Original `script.js` is UNTOUCHED** - All state & config preserved
- **Modular files are ADDITIVE** - Just new imports
- **All functions remain the same** - No refactoring
- **localStorage & Firebase unchanged** - Data persistence intact
- **Server.js unchanged** - Backend API works same way

---

## 📊 File Size Comparison

| File | Lines | Purpose |
|------|-------|---------|
| script.js (original) | ~1200 | Everything (monolithic) |
| **modules/utils.js** | ~50 | Navigation & UI helpers |
| **modules/auth.js** | ~100 | Authentication |
| **modules/shop.js** | ~140 | Shopping & reviews |
| **modules/cart.js** | ~180 | Cart & checkout |
| **modules/wishlist.js** | ~20 | Wishlist |
| **modules/profile.js** | ~60 | User profile & orders |
| **modules/admin.js** | ~100 | Admin dashboard |
| **Total modular** | ~650 | ✅ More organized! |

---

## 🎯 Benefits of Modular Structure

✅ **Easier to maintain** - Each file has single responsibility  
✅ **Easier to debug** - Find bugs faster in smaller files  
✅ **Easier to test** - Can test modules independently  
✅ **Easier to add features** - Know where to add code  
✅ **Better performance** - Can lazy-load modules in future  
✅ **Team-friendly** - Multiple devs can work on different modules  
✅ **Scalable** - Easy to add new features

---

## 📝 Notes

- Script load order in HTML is critical (utils → auth → shop → etc.)
- All modules depend on global variables from `script.js`
- Firebase auth state is monitored in `modules/auth.js`
- localStorage is the fallback data store
- Server.js uses in-memory database (no persistent DB file)

---

## 🔄 Next Steps (Optional)

1. **Add error handling** to fetch calls
2. **Add loading animations** during API requests
3. **Add input validation** before form submission
4. **Create constants file** for API URLs & promo codes
5. **Add unit tests** for individual modules
6. **Convert to async/await** instead of .then() chains

---

**Created: April 9, 2026**  
**Project: Tiny Crafts Handmade Felt Keyrings E-commerce**
