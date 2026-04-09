// =========================================================
// 1. FIREBASE CONFIGURATION & LOCAL CACHE RESET
// =========================================================
const APP_VERSION = "8.3";
if(localStorage.getItem('kcVersion') !== APP_VERSION) {
    localStorage.removeItem('kcProducts');
    localStorage.setItem('kcVersion', APP_VERSION);
}

const firebaseConfig = {
  apiKey: "AIzaSyB9UUGburEXWnRXXIozEM4et1J8rMzMW-s",
  authDomain: "tiny-crafts-b37e6.firebaseapp.com",
  projectId: "tiny-crafts-b37e6",
  storageBucket: "tiny-crafts-b37e6.firebasestorage.app",
  messagingSenderId: "358810305252",
  appId: "1:358810305252:web:b8007382e50af6acc0a2f1",
  measurementId: "G-25N130SF5M"
};

let auth, db;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    db = firebase.firestore();
} catch(e) {
    console.warn("Firebase failed to initialise — running in offline/local mode.", e);
    // Provide stub so auth calls don't throw
    auth = {
        onAuthStateChanged: (cb) => cb(null),
        signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase unavailable")),
        createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase unavailable")),
        signInWithPopup: () => Promise.reject(new Error("Firebase unavailable")),
        signOut: () => Promise.resolve(),
        currentUser: null
    };
    db = null;
}

// =========================================================
// 2. STATE MANAGEMENT & LOCAL DATA
// =========================================================
let cart = JSON.parse(localStorage.getItem('kcCart')) || [];
let wishlist = JSON.parse(localStorage.getItem('kcWishlist')) || [];
let orderHistory = JSON.parse(localStorage.getItem('kcOrders')) || [];
let discountMultiplier = 1;
let currentUser = null; 
let activeProductId = null;

const defaultProducts = [
    { id: 1, name: "Baby Penguin Felt Keyring", cat: "Animals", price: 12.00, stock: 20, desc: "An adorable hand-felted baby penguin to keep you company.", img: "images/baby.jpg", reviews: [] },
    { id: 2, name: "Happy Hedgehog Keyring", cat: "Animals", price: 14.00, stock: 15, desc: "A spiky but soft felted hedgehog friend.", img: "images/hedgehog.jpg", reviews: [] },
    { id: 3, name: "Panda with Bamboo", cat: "Animals", price: 15.00, stock: 10, desc: "Cute needle-felted panda holding a fresh bamboo shoot.", img: "images/panda.jpg", reviews: [] },
    { id: 4, name: "Sweet Cupcake Keyring", cat: "Food & Plants", price: 10.00, stock: 25, desc: "Pink frosted cupcake with a cherry on top. Zero calories!", img: "images/keyring4.jpg", reviews: [] },
    { id: 5, name: "Classic Teddy Bear", cat: "Animals", price: 12.50, stock: 30, desc: "A timeless, tiny brown teddy bear keychain.", img: "images/keyring2.jpg", reviews: [] },
    { id: 6, name: "Electric Mouse Keyring", cat: "Pop Culture & Fun", price: 16.00, stock: 20, desc: "Catch this familiar yellow electric friend for your keys.", img: "images/keyring3.jpg", reviews: [] },
    { id: 7, name: "Hanging Sloth", cat: "Animals", price: 14.50, stock: 18, desc: "Take it easy with this smiling sloth hanging from your bag.", img: "images/sloth.jpg", reviews: [] },
    { id: 8, name: "Evil Eye Charm", cat: "Symbols & Charms", price: 9.00, stock: 40, desc: "Protect your energy with this traditional blue evil eye.", img: "images/keyring.jpg", reviews: [] },
    { id: 9, name: "Woodland Fox Combo", cat: "Animals", price: 15.00, stock: 15, desc: "A clever little fox ready for daily adventures.", img: "images/banner6.jpg", reviews: [] },
    { id: 10, name: "Happy Avocado", cat: "Food & Plants", price: 11.00, stock: 22, desc: "A smiling avocado half. The perfect toast companion.", img: "images/banner5.jpg", reviews: [] },
    { id: 11, name: "Retro Hot Air Balloon", cat: "Symbols & Charms", price: 13.00, stock: 12, desc: "Float away with this colorful striped balloon.", img: "images/banner5.jpg", reviews: [] },
    { id: 12, name: "Fluffy Farm Sheep", cat: "Animals", price: 12.00, stock: 19, desc: "A super soft, textured sheep straight from the farm.", img: "images/banner5.jpg", reviews: [] },
    { id: 13, name: "Potted Cactus Emoji", cat: "Food & Plants", price: 10.50, stock: 24, desc: "A prickle-free smiling cactus in a tiny pot.", img: "images/banner6.jpg", reviews: [] },
    { id: 14, name: "Ocean Blue Whale", cat: "Animals", price: 13.50, stock: 16, desc: "A deep blue whale making a splash on your keyring.", img: "images/banner6.jpg", reviews: [] },
    { id: 15, name: "Sleepy Baby Sloth", cat: "Animals", price: 14.50, stock: 10, desc: "Another variation of our favorite slow-moving buddy.", img: "images/sloth.jpg", reviews: [] },
    { id: 16, name: "Red Cherry Cupcake", cat: "Food & Plants", price: 10.00, stock: 14, desc: "Deliciously cute felted bakery treat.", img: "images/keyring4.jpg", reviews: [] },
    { id: 17, name: "Bamboo Muncher Panda", cat: "Animals", price: 15.00, stock: 8, desc: "Detailed panda bear snacking on his favorite green plant.", img: "images/panda.jpg", reviews: [] },
    { id: 18, name: "Protective Eye Amulet", cat: "Symbols & Charms", price: 9.00, stock: 30, desc: "A vibrant blue talisman for good luck.", img: "images/keyring.jpg", reviews: [] },
    { id: 19, name: "Fuzzy Brown Bear", cat: "Animals", price: 12.50, stock: 11, desc: "Your standard, lovable fuzzy companion.", img: "images/keyring2.jpg", reviews: [] },
    { id: 20, name: "Spark Mouse", cat: "Pop Culture & Fun", price: 16.00, stock: 9, desc: "A nostalgic favorite for retro game fans.", img: "images/keyring3.jpg", reviews: [] }
];

let products = JSON.parse(localStorage.getItem('kcProducts')) || defaultProducts;
