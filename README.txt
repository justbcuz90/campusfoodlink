CampusFoodLink project

Files:
- index.html
- my-account.html
- manage-menu.html
- styles.css
- script.js
- account.js
- manage-menu.js
- data/menu.json
- data/feedback.json

Features:
- Menu loads from JSON
- Student demo login redirects to My Account
- Student account page shows a $50.00 demo meal plan balance
- Checkout deducts meal plan balance and stores purchase history
- Vendor demo login with redirect to Manage Menu
- Vendors can add and update menu items, prices, descriptions, and images
- Vendor-managed menu changes persist in localStorage
- Category filtering with JavaScript
- Real food images loaded from image URLs
- Front-end login using localStorage
- Review form with name, email, and text
- Cart with quantity controls
- Checkout section with total calculation

How to run:
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Use a local server extension, or run a simple local server.
4. Open index.html through the local server.

Why use a local server:
The project fetches data from data/menu.json. Some browsers block fetch for local file paths.

Vendor demo login:
- Email: vendor@campusfoodlink.com
- Password: vendor123

Student demo login:
- Email: student@campusfoodlink.com
- Password: student123
