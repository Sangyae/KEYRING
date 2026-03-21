// =========================================================
// NODE.JS BACKEND SERVER FOR KEYRING SHOP
// =========================================================
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// =========================================================
// PRODUCT DATABASE (In-memory, can be replaced with DB)
// =========================================================
let products = [
    { id: 1, name: "Baby Penguin Felt Keyring", cat: "Animals", price: 12.00, stock: 20, desc: "An adorable hand-felted baby penguin to keep you company.", img: "baby.jpg", reviews: [] },
    { id: 2, name: "Happy Hedgehog Keyring", cat: "Animals", price: 14.00, stock: 15, desc: "A spiky but soft felted hedgehog friend.", img: "hedgehog.jpg", reviews: [] },
    { id: 3, name: "Panda with Bamboo", cat: "Animals", price: 15.00, stock: 10, desc: "Cute needle-felted panda holding a fresh bamboo shoot.", img: "panda.jpg", reviews: [] },
    { id: 4, name: "Sweet Cupcake Keyring", cat: "Food & Plants", price: 10.00, stock: 25, desc: "Pink frosted cupcake with a cherry on top. Zero calories!", img: "keyring4.jpg", reviews: [] },
    { id: 5, name: "Classic Teddy Bear", cat: "Animals", price: 12.50, stock: 30, desc: "A timeless, tiny brown teddy bear keychain.", img: "keyring2.jpg", reviews: [] },
    { id: 6, name: "Electric Mouse Keyring", cat: "Pop Culture & Fun", price: 16.00, stock: 20, desc: "Catch this familiar yellow electric friend for your keys.", img: "keyring3.jpg", reviews: [] },
    { id: 7, name: "Hanging Sloth", cat: "Animals", price: 14.50, stock: 18, desc: "Take it easy with this smiling sloth hanging from your bag.", img: "sloth.jpg", reviews: [] },
    { id: 8, name: "Evil Eye Charm", cat: "Symbols & Charms", price: 9.00, stock: 40, desc: "Protect your energy with this traditional blue evil eye.", img: "keyring.jpg", reviews: [] },
    { id: 9, name: "Woodland Fox Combo", cat: "Animals", price: 15.00, stock: 15, desc: "A clever little fox ready for daily adventures.", img: "banner6.jpg", reviews: [] },
    { id: 10, name: "Happy Avocado", cat: "Food & Plants", price: 11.00, stock: 22, desc: "A smiling avocado half. The perfect toast companion.", img: "banner5.jpg", reviews: [] },
    { id: 11, name: "Retro Hot Air Balloon", cat: "Symbols & Charms", price: 13.00, stock: 12, desc: "Float away with this colorful striped balloon.", img: "banner5.jpg", reviews: [] },
    { id: 12, name: "Fluffy Farm Sheep", cat: "Animals", price: 12.00, stock: 19, desc: "A super soft, textured sheep straight from the farm.", img: "banner5.jpg", reviews: [] },
    { id: 13, name: "Potted Cactus Emoji", cat: "Food & Plants", price: 10.50, stock: 24, desc: "A prickle-free smiling cactus in a tiny pot.", img: "banner6.jpg", reviews: [] },
    { id: 14, name: "Ocean Blue Whale", cat: "Animals", price: 13.50, stock: 16, desc: "A deep blue whale making a splash on your keyring.", img: "banner6.jpg", reviews: [] },
    { id: 15, name: "Sleepy Baby Sloth", cat: "Animals", price: 14.50, stock: 10, desc: "Another variation of our favorite slow-moving buddy.", img: "sloth.jpg", reviews: [] },
    { id: 16, name: "Red Cherry Cupcake", cat: "Food & Plants", price: 10.00, stock: 14, desc: "Deliciously cute felted bakery treat.", img: "keyring4.jpg", reviews: [] },
    { id: 17, name: "Bamboo Muncher Panda", cat: "Animals", price: 15.00, stock: 8, desc: "Detailed panda bear snacking on his favorite green plant.", img: "panda.jpg", reviews: [] },
    { id: 18, name: "Protective Eye Amulet", cat: "Symbols & Charms", price: 9.00, stock: 30, desc: "A vibrant blue talisman for good luck.", img: "keyring.jpg", reviews: [] },
    { id: 19, name: "Fuzzy Brown Bear", cat: "Animals", price: 12.50, stock: 11, desc: "Your standard, lovable fuzzy companion.", img: "keyring2.jpg", reviews: [] },
    { id: 20, name: "Spark Mouse", cat: "Pop Culture & Fun", price: 16.00, stock: 9, desc: "A nostalgic favorite for retro game fans.", img: "keyring3.jpg", reviews: [] }
];

// =========================================================
// API ENDPOINTS
// =========================================================

// GET all products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// GET single product by ID
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

// POST new order (placeholder)
app.post('/api/orders', (req, res) => {
    const { email, items, total, shippingAddress, paymentIntent } = req.body;
    
    if (!email || !items || !total) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production, this would validate payment, update DB, send confirmation email
    const order = {
        id: Date.now(),
        email,
        items,
        total,
        shippingAddress,
        paymentIntent,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    res.json({ success: true, order });
});

// UPDATE product stock (admin only)
app.patch('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    if (req.body.stock !== undefined) product.stock = req.body.stock;
    if (req.body.price !== undefined) product.price = req.body.price;
    
    res.json(product);
});

// DELETE product (admin only)
app.delete('/api/products/:id', (req, res) => {
    products = products.filter(p => p.id !== parseInt(req.params.id));
    res.json({ success: true });
});

// ADD new product (admin only)
app.post('/api/products', (req, res) => {
    const { name, cat, price, stock, desc, img } = req.body;
    
    if (!name || !cat || !price || stock === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name,
        cat,
        price,
        stock,
        desc: desc || '',
        img: img || 'placeholder.jpg',
        reviews: []
    };

    products.push(newProduct);
    res.json(newProduct);
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎯 Tiny Crafts Server is running on http://localhost:${PORT}`);
    console.log(`📦 API available at http://localhost:${PORT}/api/products`);
});
