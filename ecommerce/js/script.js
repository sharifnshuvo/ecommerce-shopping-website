
/* =====================================================
   URBAN STYLE - MAIN JAVASCRIPT
   Version: 1.0
   Features: Navigation, Search, Cart, Wishlist, Newsletter
===================================================== */


/* =====================================================
   01. SELECT HTML ELEMENTS
===================================================== */

const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const navbar = document.querySelector(".navbar");

const searchToggle = document.querySelector(".search-toggle");
const searchContainer = document.querySelector(".search-container");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-form input");

const productCards = document.querySelectorAll(".product-card");

const cartCount = document.querySelector(".cart-count");
const wishlistCount = document.querySelector(".wishlist-count");

const newsletterForm = document.querySelector(".newsletter-form");


/* =====================================================
   02. LOCAL STORAGE CONFIGURATION
===================================================== */

const STORAGE_KEYS = {
    cart: "urbanStyleCart",
    wishlist: "urbanStyleWishlist"
};


/* =====================================================
   03. STORAGE HELPER FUNCTIONS
===================================================== */

function getStorageData(key, fallback = []) {

    try {

        const data = localStorage.getItem(key);

        return data ? JSON.parse(data) : fallback;

    } catch (error) {

        console.error("Storage reading error:", error);

        return fallback;

    }

}


function saveStorageData(key, data) {

    try {

        localStorage.setItem(key, JSON.stringify(data));

        return true;

    } catch (error) {

        console.error("Storage saving error:", error);

        showToast("Unable to save your data.");

        return false;

    }

}


/* =====================================================
   04. INITIALIZE CART AND WISHLIST
===================================================== */

let cart = getStorageData(STORAGE_KEYS.cart);

let wishlist = getStorageData(STORAGE_KEYS.wishlist);


/* =====================================================
   05. TOAST NOTIFICATION SYSTEM
===================================================== */

function showToast(message, type = "success") {

    let toast = document.querySelector(".toast-message");

    if (!toast) {

        toast = document.createElement("div");

        toast.className = "toast-message";

        toast.setAttribute("role", "status");

        toast.setAttribute("aria-live", "polite");

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.className = `toast-message ${type} show`;

    clearTimeout(toast.hideTimer);

    toast.hideTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =====================================================
   06. MOBILE NAVIGATION
===================================================== */

if (mobileMenuBtn && navbar) {

    mobileMenuBtn.addEventListener("click", () => {

        const isOpen = navbar.classList.toggle("active");

        mobileMenuBtn.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';

        mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));

    });


    // Close menu after clicking a navigation link

    navbar.addEventListener("click", (event) => {

        if (event.target.closest("a")) {

            navbar.classList.remove("active");

            mobileMenuBtn.innerHTML =
                '<i class="fa-solid fa-bars"></i>';

            mobileMenuBtn.setAttribute("aria-expanded", "false");

        }

    });

}


/* =====================================================
   07. SEARCH BOX TOGGLE
===================================================== */

if (searchToggle && searchContainer) {

    searchToggle.addEventListener("click", () => {

        const isOpen = searchContainer.classList.toggle("active");

        if (isOpen) {

            searchInput.focus();

        }

    });

}


/* =====================================================
   08. PRODUCT SEARCH FUNCTION
===================================================== */

function searchProducts(searchTerm) {

    const keyword = searchTerm.trim().toLowerCase();

    let visibleProducts = 0;

    productCards.forEach((card) => {

        const productName =
            card.querySelector("h3")?.textContent.toLowerCase() || "";

        const productCategory =
            card.querySelector(".product-category")?.textContent.toLowerCase() || "";

        const matches =
            productName.includes(keyword) ||
            productCategory.includes(keyword);

        card.style.display = matches ? "" : "none";

        if (matches) {

            visibleProducts++;

        }

    });


    // Display search result message

    let resultMessage = document.querySelector(".search-result-message");

    if (!resultMessage) {

        resultMessage = document.createElement("p");

        resultMessage.className = "search-result-message";

        const productSection = document.querySelector(".new-arrivals");

        productSection?.insertBefore(
            resultMessage,
            document.querySelector(".product-grid")
        );

    }

    if (keyword === "") {

        resultMessage.textContent = "";

    } else {

        resultMessage.textContent =
            `${visibleProducts} product(s) found`;

    }

}


// Search form submit

if (searchForm) {

    searchForm.addEventListener("submit", (event) => {

        event.preventDefault();

        searchProducts(searchInput.value);

        document.querySelector(".new-arrivals")
            ?.scrollIntoView({ behavior: "smooth" });

    });

}


/* =====================================================
   09. GET PRODUCT INFORMATION FROM HTML
===================================================== */

function getProductInformation(productId, card) {

    const name =
        card.querySelector("h3")?.textContent.trim() || "Unknown Product";

    const category =
        card.querySelector(".product-category")?.textContent.trim() || "";

    const image =
        card.querySelector(".product-image img")?.getAttribute("src") || "";

    const priceText =
        card.querySelector(".product-price span")?.textContent || "৳0";

    const price = Number(priceText.replace(/[^\d.]/g, ""));

    const oldPriceText =
        card.querySelector(".product-price del")?.textContent || "";

    const oldPrice = Number(oldPriceText.replace(/[^\d.]/g, ""));

    return {

        id: Number(productId),

        name,

        category,

        image,

        price,

        oldPrice: oldPrice || null,

        quantity: 1

    };

}


/* =====================================================
   10. UPDATE CART COUNTER
===================================================== */

function updateCartCounter() {

    const totalItems = cart.reduce((total, item) => {

        return total + Number(item.quantity || 0);

    }, 0);


    if (cartCount) {

        cartCount.textContent = totalItems;

    }

}


/* =====================================================
   11. ADD PRODUCT TO CART
===================================================== */

function addToCart(productId) {

    const button = document.querySelector(
        `.quick-add-btn[data-product-id="${productId}"]`
    );

    const card = button?.closest(".product-card");

    if (!card) {

        showToast("Product not found.", "error");

        return;

    }

    const product = getProductInformation(productId, card);


    // Check whether product already exists

    const existingProduct = cart.find((item) => {

        return Number(item.id) === Number(productId);

    });


    if (existingProduct) {

        existingProduct.quantity++;

    } else {

        cart.push(product);

    }


    // Save cart

    if (!saveStorageData(STORAGE_KEYS.cart, cart)) {

        return;

    }


    updateCartCounter();

    showToast(`${product.name} added to your bag!`);

}


/* =====================================================
   12. REMOVE PRODUCT FROM CART
===================================================== */

function removeFromCart(productId) {

    cart = cart.filter((item) => {

        return Number(item.id) !== Number(productId);

    });


    if (!saveStorageData(STORAGE_KEYS.cart, cart)) {

        return;

    }

    updateCartCounter();

    showToast("Product removed from cart.");

}


/* =====================================================
   13. UPDATE PRODUCT QUANTITY
===================================================== */

function updateCartQuantity(productId, newQuantity) {

    const product = cart.find((item) => {

        return Number(item.id) === Number(productId);

    });


    if (!product) {

        return;

    }


    if (newQuantity <= 0) {

        removeFromCart(productId);

        return;

    }


    product.quantity = Number(newQuantity);


    if (!saveStorageData(STORAGE_KEYS.cart, cart)) {

        return;

    }

    updateCartCounter();

}


/* =====================================================
   14. UPDATE WISHLIST COUNTER
===================================================== */

function updateWishlistCounter() {

    if (wishlistCount) {

        wishlistCount.textContent = wishlist.length;

    }

}


/* =====================================================
   15. ADD OR REMOVE WISHLIST
===================================================== */

function toggleWishlist(productId, button) {

    const card = button.closest(".product-card");

    if (!card) {

        return;

    }

    const existingIndex = wishlist.findIndex((item) => {

        return Number(item.id) === Number(productId);

    });


    if (existingIndex !== -1) {

        wishlist.splice(existingIndex, 1);

        showToast("Removed from wishlist.");

    } else {

        const product = getProductInformation(productId, card);

        wishlist.push(product);

        showToast("Added to wishlist!");

    }


    if (!saveStorageData(STORAGE_KEYS.wishlist, wishlist)) {

        return;

    }

    updateWishlistCounter();

    updateWishlistButtons();

}


/* =====================================================
   16. UPDATE WISHLIST BUTTON APPEARANCE
===================================================== */

function updateWishlistButtons() {

    document.querySelectorAll(".product-card").forEach((card) => {

        const button = card.querySelector(".wishlist-btn");

        const cartButton = card.querySelector(".quick-add-btn");

        if (!button || !cartButton) {

            return;

        }

        const productId = Number(cartButton.dataset.productId);

        const isFavorite = wishlist.some((item) => {

            return Number(item.id) === productId;

        });


        const icon = button.querySelector("i");

        if (icon) {

            icon.className = isFavorite
                ? "fa-solid fa-heart"
                : "fa-regular fa-heart";

        }

        button.setAttribute("aria-pressed", String(isFavorite));

    });

}


/* =====================================================
   17. EVENT DELEGATION
===================================================== */

document.addEventListener("click", (event) => {


    // ADD TO CART

    const addButton = event.target.closest(".quick-add-btn");

    if (addButton) {

        const productId = addButton.dataset.productId;

        addToCart(productId);

        return;

    }


    // WISHLIST

    const wishlistButton = event.target.closest(".wishlist-btn");

    if (wishlistButton) {

        const card = wishlistButton.closest(".product-card");

        const addButton = card?.querySelector(".quick-add-btn");

        const productId = addButton?.dataset.productId;

        if (productId) {

            toggleWishlist(productId, wishlistButton);

        }

    }

});


/* =====================================================
   18. NEWSLETTER VALIDATION
===================================================== */

if (newsletterForm) {

    newsletterForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const emailInput =
            newsletterForm.querySelector('input[type="email"]');

        const email = emailInput.value.trim();


        if (!email || !emailInput.checkValidity()) {

            showToast("Please enter a valid email address.", "error");

            return;

        }


        showToast("Thank you for subscribing!");

        newsletterForm.reset();

    });

}


/* =====================================================
   19. KEYBOARD SUPPORT
===================================================== */

document.addEventListener("keydown", (event) => {


    // Close search and mobile navigation with Escape

    if (event.key === "Escape") {

        searchContainer?.classList.remove("active");

        navbar?.classList.remove("active");


        if (mobileMenuBtn) {

            mobileMenuBtn.innerHTML =
                '<i class="fa-solid fa-bars"></i>';

            mobileMenuBtn.setAttribute("aria-expanded", "false");

        }

    }

});


/* =====================================================
   20. INITIALIZE WEBSITE
===================================================== */

function initializeWebsite() {

    updateCartCounter();

    updateWishlistCounter();

    updateWishlistButtons();

    console.log("Urban Style JavaScript initialized successfully!");

}


// Start application

initializeWebsite();
