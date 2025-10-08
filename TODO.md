# TODO: Fix Checkout Amount Display

## Overview
Fix the checkout amount in CheckoutPage.jsx to display dynamically based on products in the cart, and add cart items display.

## Tasks
- [x] Update CheckoutPage.jsx:
  - [x] Import useCart from "../context/CartContext"
  - [x] Destructure cart from useCart()
  - [x] Calculate subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  - [x] Calculate tax = subtotal * 0.08
  - [x] Calculate total = subtotal + tax
  - [x] Update Order Summary JSX to display dynamic subtotal, tax, total with .toFixed(2)
  - [x] Update PayPal createOrder amount.value to total.toFixed(2)
- [x] Add a section to display cart items in read-only format, similar to Cart.jsx (Removed as per user request)
- [x] Update CheckoutPage.css if needed for cart items styling
- [ ] Test the functionality:
  - [ ] Add products to cart
  - [ ] Go to checkout
  - [ ] Verify totals match cart
  - [ ] Verify cart items are displayed
  - [ ] Verify PayPal amount is correct
