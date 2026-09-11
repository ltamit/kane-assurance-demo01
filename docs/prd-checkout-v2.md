# PRD: Online Store Checkout

**Product:** ShopEasy Web Application
**Author:** Product Team
**Version:** 2.0
**Last Updated:** September 2026

---

## Overview

ShopEasy is an e-commerce web application. This PRD covers the checkout flow — from cart review through order confirmation. The checkout must support both registered users and guest buyers.

---

## User Roles

- **Registered User** — has an account, can save addresses and payment methods, earns loyalty points
- **Guest User** — no account required, must enter all details manually, cannot earn loyalty points

---

## Functional Requirements

### FR-1: Cart Review Page

The checkout begins at the cart review page. The user sees all items currently in their cart with the following details per item:
- Product name and thumbnail image
- Selected variant (size, color) if applicable
- Unit price and quantity (editable, minimum 1, maximum 10)
- Line total (unit price × quantity)

The page displays a cart summary section showing:
- Subtotal (sum of all line totals)
- Estimated tax (calculated based on shipping destination; shown as "TBD" until address is entered)
- Shipping cost (shown as "TBD" until shipping method is selected)
- Promo code input field with "Apply" button
- Order total

If the cart is empty, the page displays "Your cart is empty" with a "Continue Shopping" link. No checkout button is shown.

The "Proceed to Checkout" button is disabled until the cart contains at least one item with available inventory. If any item is out of stock, it is flagged with a red "Out of Stock" badge and the user must remove it before proceeding.

### FR-2: Shipping Address

After clicking "Proceed to Checkout," registered users see their saved addresses with the option to select one or add a new address. Guest users see an empty address form.

Required fields: full name, street address line 1, city, state/province, postal code, country.
Optional fields: street address line 2, phone number.

Address validation runs on submission. If the address cannot be validated, the user sees a suggestion ("Did you mean...?") and can accept the suggestion or keep their original input. Invalid postal code format for the selected country is a hard block — the form does not submit.

Supported countries for shipping: United States, Canada, United Kingdom, Germany, France, Australia.

### FR-3: Shipping Method Selection

After address entry, the user selects a shipping method. Available methods depend on the destination country and cart total:

| Method | Delivery Window | Cost | Availability |
|--------|----------------|------|-------------|
| Standard | 5–7 business days | $5.99 | All countries |
| Express | 2–3 business days | $14.99 | US, Canada, UK only |
| Next-Day | 1 business day | $24.99 | US only, orders placed before 2 PM EST |
| Free Standard | 5–7 business days | $0.00 | Orders over $75, all countries |

If only one method is available, it is pre-selected. The estimated delivery date is shown next to each option based on the current date.

Next-Day shipping is not available on weekends or US federal holidays. If selected on a Friday before 2 PM EST, the delivery date is Monday.

### FR-4: Payment

The payment step accepts:
- Credit/debit card (Visa, Mastercard, Amex) via a PCI-compliant embedded form
- PayPal (redirects to PayPal, returns to order review)
- Apple Pay (available when the browser supports the Payment Request API; one-tap checkout)
- Google Pay (where supported by the browser)

**Apple Pay specifics:**
- The Apple Pay button is shown only when `window.ApplePaySession` is available
- Tapping the button presents the Apple Pay sheet with the order total, shipping address, and selected shipping method pre-filled
- The merchant identifier is `merchant.com.shopeasy.checkout`
- If Apple Pay authorization succeeds, the user skips the manual payment form entirely and proceeds directly to order review
- If Apple Pay authorization fails or is cancelled, the user falls back to the standard payment form with no error penalty (the failure does not count toward the 3-attempt lockout)

Registered users can select a saved payment method or add a new one. Guest users must enter payment details manually.

Card validation: card number format is validated client-side using Luhn check. Expiry date must be in the future. CVV is 3 digits (4 for Amex).

If payment authorization fails, the user sees "Payment could not be processed. Please check your details or try another method." The user stays on the payment step. After 3 consecutive failed attempts, the user is shown a support contact message and the "Place Order" button is disabled for 15 minutes.

### FR-5: Order Review and Placement

Before final submission, the user sees a summary:
- All cart items with quantities and prices
- Shipping address (editable — clicking "Edit" returns to FR-2)
- Shipping method and estimated delivery (editable — clicking "Edit" returns to FR-3)
- Payment method (last 4 digits shown; editable — clicking "Edit" returns to FR-4)
- Promo code applied (if any)
- Subtotal, tax, shipping, and order total

The "Place Order" button submits the order. The button is disabled after the first click to prevent double-submission.

On success: the user is redirected to an order confirmation page showing order number, estimated delivery date, and a "Print Receipt" option. Registered users see the order in their order history. A confirmation email is sent within 5 minutes.

On failure (e.g., inventory went out of stock between cart and placement): the user sees an error identifying which item(s) are affected, with options to remove the item and retry or return to cart.

### FR-6: Promo Codes

- Only one promo code per order
- Promo codes are case-insensitive
- A valid code shows the discount amount and updated order total immediately
- An invalid or expired code shows "This promo code is not valid"
- Percentage-based discounts apply to the subtotal only (not tax or shipping)
- Fixed-amount discounts cannot reduce the subtotal below $0

### FR-7: Inventory Enforcement

Inventory is checked at three points:
1. Cart page load — out-of-stock items are flagged
2. "Proceed to Checkout" click — re-validated; if inventory dropped below requested quantity, the user is notified with the available quantity and can adjust
3. Order placement — final check; if inventory is gone, order fails gracefully per FR-5

Inventory holds are not implemented in v1. This means two users can have the same item in their carts, and the second to place the order may hit a failure.

### FR-8: Save Cart for Later (NEW in v2)

Registered users can save their current cart to return to it later:
- A "Save for Later" button appears next to each cart item
- Saved items are moved to a "Saved Items" section below the active cart
- Saved items do not count toward cart total, tax, or shipping calculations
- A "Move to Cart" button on each saved item returns it to the active cart
- Saved items persist across sessions (stored server-side)
- Guest users do not see the Save for Later feature

---

## Non-Functional Requirements

- **Performance:** Cart page loads in under 2 seconds on a 4G connection. Payment authorization completes within 5 seconds.
- **Accessibility:** All form fields have associated labels. Error messages are announced by screen readers. Keyboard navigation supports the full checkout flow without a mouse.
- **Mobile:** The checkout flow is fully functional on viewports as narrow as 320px. Touch targets are at least 44×44px.

---

## Out of Scope (v1)

- Subscription / recurring orders
- Gift cards as a payment method
- Split payments across methods
- Multi-currency (all prices in USD)
- Address auto-complete via third-party API
- Inventory holds / reservation system

---

## Open Questions

1. Should guest users be prompted to create an account after order placement?
2. What is the maximum number of items allowed in a single cart?
3. Do we need to support APO/FPO military addresses for US shipping?
