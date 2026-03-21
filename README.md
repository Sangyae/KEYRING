# 🧀 Tiny Crafts - Handmade Felt Keyrings

A modern e-commerce web app for selling adorable needle-felted keyrings, built with vanilla JavaScript, Firebase authentication, and a Node.js backend.

## 📋 Project Status

**Version: 8.3.0**

✅ Frontend: Complete (HTML/CSS/JS)  
✅ Firebase Auth: Integrated  
✅ Shopping Cart: Fully functional  
✅ Wishlist: Implemented  
✅ Product Modal: With reviews  
✅ Multi-step Checkout: Implemented  
✅ Admin Dashboard: Sprint tracker + inventory management  
✅ Node.js Backend: API server with product endpoints  

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+) and npm installed
- Modern web browser

### Installation

1. **Install Dependencies**
```bash
cd /Users/rohittamatta/Keyring
npm install
```

2. **Start the Backend Server**
```bash
npm start
# Server runs on http://localhost:3000
```

3. **Open the Frontend**
- Open `index.html` in your browser
- Or use: `python -m http.server 8000` (then visit `http://localhost:8000`)

## 📁 File Structure

```
Keyring/
├── index.html          # Main HTML - all views
├── style.css           # Styling (120+ sections)
├── script.js           # Frontend logic (780+ lines)
├── server.js           # Node.js Express API server
├── package.json        # Dependencies & scripts
├── .gitignore          # Git ignore rules
└── [images]            # Place image files here (baby.jpg, panda.jpg, etc.)
```

## 🔧 Configuration

### Firebase Setup
Firebase config is in `script.js` (lines 10-17). To use your own Firebase project:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Email/Password and Google auth
3. Update `firebaseConfig` in `script.js`

### Backend API
The Node.js server runs on `http://localhost:3000` with these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Add new product (admin) |
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/orders` | Create order |
| GET | `/health` | Server health check |

## 🛒 Features

### User Features
- 👤 Register & Login (Email/Google/Social)
- 🛍️ Browse & filter 20+ keyrings
- ❤️ Wishlist management
- 🛒 Shopping cart with quantities
- 💳 Multi-step checkout
- ⭐ Product reviews
- 📦 Order history & tracking
- 🌙 Light/Dark theme toggle

### Admin Features
- 📊 Agile Sprint & Critical Path tracker
- 📦 Inventory management
- ➕ Add/Edit/Delete products
- 💰 View revenue & orders
- 🔄 Real-time stock updates

### Technical Features
- Responsive design (mobile-friendly)
- LocalStorage cache for offline support
- Firebase authentication
- Node.js RESTful API
- Error handling & fallbacks
- Confetti on successful order
- Toast notifications
- Live search with autocomplete

## 🎨 Styling

The project uses a cohesive orange/teal palette:
- Primary Color: `#F26A44` (Felt Orange)
- Accent: `#3BB2B8` (Teal)
- Secondary: `#F9D531` (Warm Yellow)
- Text: `#1A1A1A` (Dark) / `#666` (Gray)

CSS variables in `:root` make theming easy.

## 🐛 Troubleshooting

### Backend not connecting
- Make sure `npm start` is running on port 3000
- Check for CORS errors in browser console
- App has fallback to local products (defaultProducts array)

### Images not loading
- Place `.jpg` files in the same directory as `index.html`
- Images fallback to placeholder URLs automatically via `onerror` handler

### Firebase auth failing
- Firebase SDK loads via CDN (lines 508-510 in HTML)
- Check browser console for auth errors
- Authenticate via Google or mock social logins for testing

### localStorage limits
- Clears on version mismatch (see `APP_VERSION` in script.js)
- kcCart, kcWishlist, kcProducts, kcOrders stored separately

## 📝 Promo Code
Test the discount system with promo code: **CUTE20** (20% off)

## 🔐 Security Notes
- Firebase credentials are public (OK for client-side config)
- In production: implement backend validation & secure payment processing
- Add environment variables for sensitive data
- Implement proper order validation server-side

## 📈 Next Steps for Production

1. Replace mock payment with Stripe/PayPal integration
2. Set up proper database (Firestore/MongoDB)
3. Add email notifications
4. Implement user authentication verification (confirm email)
5. Add admin dashboard login
6. Set up CI/CD pipeline
7. SSL/HTTPS certificate
8. Rate limiting on API endpoints

## 📞 Support

For issues or feature requests, check:
- Browser console for errors
- Network tab for API failures
- Firebase Console for auth issues

---

**Made with 🧶 by Tiny Crafts**  
Version 8.3.0 | Last Updated: March 2026
# KEYRING
