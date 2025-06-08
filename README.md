# Project Overview

# Techstack

- next.js 
- react 
- turborepo 
- tailwind.css 
- mongodb 
- awss3(for image storage) 
- trpc(type-safe api) 
- prisma-ORM(database management for mongodb in the cloud)
- ec2(for hosting the web)
- docker/docker-compose(for building lightweight images and run it in the cloud)
- nginx and certbot (for proxy management and assigned certification to allow the app run on https)
- vitest for unit test(partial)
- playwright for e2e test(not implement)

# There are only one admin with SuperAdmin role which can make change to admin user.

username: admin@example.com password:123123123

# Repo structure
root
 - apps
  + web
  + admin
 - packages
  + trpc
  + e2e(however, there are no test implemented)
  + s3
  + db
 - turbo.json
 - docker-compose.yml
 - nginx
  + nginx.http.conf
  + nginx.https.conf

# Turbo Packages description

- **s3**

  The `s3` package (in `packages/s3/`) provides all AWS S3 integration for the project. It establishes a connection to the AWS S3 bucket using the AWS SDK, manages credentials, and exports utility functions for uploading, retrieving, listing, and deleting images. These utilities are used by the `trpc` package to handle image storage for users, admins, brands, categories, and products. The package is fully type-safe and tested with Vitest.

- **db**

  The `db` package (in `packages/db/`) manages all database access. It connects to MongoDB Atlas (cloud) and uses Prisma ORM for schema management, migrations, and type-safe queries. The Prisma client is generated and exported for use in the `trpc` package. The package includes the Prisma schema, migration scripts, and seed scripts for initial data population. All database CRUD operations for users, admins, products, brands, categories, orders, etc., are ultimately handled through this package.

- **trpc**

  The `trpc` package (in `packages/trpc/`) is the core backend logic for the monorepo. It defines all tRPC routers and procedures for the API, including authentication, session management, CRUD for all entities, and S3 image management. It imports the Prisma client from the `db` package and S3 utilities from the `s3` package. The package is used by both the `web` and `admin` Next.js apps to provide a type-safe, full-stack API layer. All business logic, validation, and access control are implemented here.

- **e2e**

  The `e2e` package (in `packages/e2e/`) is intended for end-to-end testing using Playwright. While the folder and config exist, there are currently no tests implemented. This package is set up for future browser-based integration tests covering the full stack.

- **ui**

  The `ui` package (in `packages/ui/`) contains shared React UI components and design system elements used across both the `web` and `admin` apps. This enables consistent styling and code reuse for buttons, forms, and other UI primitives.

- **eslint-config**

  The `eslint-config` package (in `packages/eslint-config/`) provides shared ESLint configurations for code quality and consistency across all packages and apps in the monorepo.

- **typescript-config**

  The `typescript-config` package (in `packages/typescript-config/`) provides shared TypeScript configuration files for all packages and apps, ensuring consistent type checking and build settings.

# Step to run local development

- **First**, run pnpm install at root to install dependency

- **Second**, rename the .env.example to .env and place it in the root and every packages and apps

- **Third**, run the development by type pnpm turbo dev at root

- **Alternatively**, you can run pnpm turbo build and pnpm turbo start for a smoother experience

**Note**: db likely will not work due to the mongodb database is store in cloud and required manual setup in the cloud to grant the permission for the corresponding ip address. Or you can add your own mongo db cloud api key and follow the step below at # db configuration

# Deployment Documentation

This project is designed for deployment on AWS EC2 using Docker Compose, Nginx, and Certbot for HTTPS. Below are the detailed steps for building, pushing, and running the application securely in production.

## 1. Build and Push Docker Images

- On your local machine, build the app image:
  ```powershell
  docker compose build app
  ```
- Push the built image to your private Docker Hub repository:
  ```powershell
  docker compose push app
  ```

## 2. Prepare EC2 Instance

- On your EC2 instance, install Docker and Docker Compose if not already installed.
  - For Amazon Linux 2023, use:
    ```bash
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
    # Log out and log back in for group changes to take effect
    # Install Docker Compose v2 (plugin)
    sudo yum install -y docker-compose-plugin
    # Test installation
    docker compose version
    ```
- Copy the following files and folders from your local machine to the EC2 instance:
  - `nginx/` (contains `nginx.http.conf` and `nginx.https.conf`)
  - `docker-compose.yml`
- Ensure your MongoDB Atlas (cloud) allows connections from your EC2 instance's public IP address.

## 3. Initial HTTPS Certificate Generation

- On the EC2 instance, rename `nginx.http.conf` to `nginx.conf`:
  ```bash
  mv nginx/nginx.http.conf nginx/nginx.conf
  ```
- Start the app and nginx (HTTP-only) containers:
  ```bash
  docker compose up -d app nginx
  ```
- Generate SSL certificates for your domains using Certbot:
  ```bash
  docker compose up certbot
  docker compose up certbot-admin
  ```
  - `certbot` will generate certificates for `b2cstores.pw` and `www.b2cstores.pw`.
  - `certbot-admin` will generate certificates for `admin.b2cstores.pw`.

## 4. Switch to HTTPS Nginx Config

- After certificates are generated, stop the running containers:
  ```bash
  docker compose down
  ```
- Rename the configs:
  ```bash
  mv nginx/nginx.conf nginx/nginx.http.conf
  mv nginx/nginx.https.conf nginx/nginx.conf
  ```
- Start the app and nginx (now with HTTPS):
  ```bash
  docker compose up -d app nginx
  ```

## 5. Database Access

- Make sure your MongoDB Atlas cluster allows access from the EC2 instance's public IP.
- Update your `.env` files with the correct MongoDB connection string if needed.

## 6. Session Security

- By default, both user and admin sessions are configured with `Secure: true` in `B2C-Store/packages/trpc/src/utils/session.ts`, which means cookies will only be sent over HTTPS. If you need to test locally over HTTP, set `Secure: false` in that file.

## 7. Useful Docker Compose Commands

- To view logs:
  ```bash
  docker compose logs -f app
  docker compose logs -f nginx
  ```
- To restart services:
  ```bash
  docker compose restart app nginx
  ```
- To rebuild and redeploy after code changes:
  ```bash
  docker compose build app
  docker compose push app
  # On EC2:
  docker compose pull app
  docker compose up -d app
  ```

## 8. Notes

- Certbot containers are only needed for certificate issuance/renewal. You do not need to keep them running.
- If you need to renew certificates, repeat the HTTP config and certbot steps above.
- All environment variables must be set in `.env` files in the root and each package/app as required.
- The EC2 instance must have ports 80 and 443 open in its security group.
- For production, always use HTTPS for security and proper session handling.

# API documentation

## Overview

This project uses [tRPC](https://trpc.io/) for type-safe API endpoints, shared between the `web` (customer-facing) and `admin` (dashboard) Next.js apps. All API routes are defined in the `packages/trpc` package and consumed by both apps.

- **API Base Path:** All tRPC endpoints are available under `/api/trpc` in both apps.

---

## Authentication
- Session authentication is handled via secure, HTTP-only cookies. There are two session types:
  - `session_web` for regular users (web app)
  - `admin_session` for admin users (admin app)
- On successful login, a session cookie is set using tRPC procedures (`session.createSession` for users, `adminSession.createAdminSession` for admins).
- Session cookies are validated on each request to protected endpoints. If the session is missing or invalid, the user is considered unauthenticated.
- Logging out deletes the session cookie via `session.deleteSession` or `adminSession.deleteAdminSession`.
- Only the admin user (`admin@example.com` / `123123123`) has SuperAdmin privileges for admin CRUD. Admin authentication uses a separate session and login procedure from regular users.
- Passwords are securely hashed and verified using the `verifyPassword` utility.
- All authentication logic is implemented in the `trpc` package, specifically in the `loginProcedure.ts`, `adminloginProcedure.ts`, `sessionProcedure.ts`, and `adminSessionProcedure.ts` files.

---

## tRPC Routers & Procedures

### Common Endpoints (web & admin)

#### User
- `session.getSession`  
  **GET** `/api/trpc/session.getSession`  
  Returns the current user session (if logged in).

- `login`  
  **POST** `/api/trpc/login`  
  Body: `{ email: string, password: string }`  
  Returns `{ userId }` on success. Updates lastLogin.

- `signup`  
  **POST** `/api/trpc/signup`  
  Registers a new user. (If implemented)

- `session.deleteSession`  
  **POST** `/api/trpc/session.deleteSession`  
  Logs out the current user.

#### Products
- `crud.getProducts`  
  **GET** `/api/trpc/crud.getProducts`  
  Returns a list of all products.

- `crud.getProductById`  
  **GET** `/api/trpc/crud.getProductById?id=string`  
  Returns details for a single product by ID.

- `crud.getBrands`  
  **GET** `/api/trpc/crud.getBrands`  
  Returns all brands.

- `crud.getCategories`  
  **GET** `/api/trpc/crud.getCategories`  
  Returns all categories.

- `crud.getCartItems`  
  **GET** `/api/trpc/crud.getCartItems`  
  Returns cart items for the current user.

- `crud.getWishLists`  
  **GET** `/api/trpc/crud.getWishLists`  
  Returns wishlist items for the current user.

- `crud.addToCart`  
  **POST** `/api/trpc/crud.addToCart`  
  Body: `{ productId: string, quantity: number }`  
  Adds a product to the user's cart.

- `crud.removeFromCart`  
  **POST** `/api/trpc/crud.removeFromCart`  
  Body: `{ productId: string }`  
  Removes a product from the user's cart.

- `crud.createOrder`  
  **POST** `/api/trpc/crud.createOrder`  
  Body: `{ ...orderData }`  
  Places a new order for the current user.

- `crud.getOrders`  
  **GET** `/api/trpc/crud.getOrders`  
  Returns order history for the current user.

---

### Admin-Only Endpoints
> Only accessible to SuperAdmin (admin@example.com).

#### Admin Login & Session
- `adminLog`  
  **POST** `/api/trpc/adminLog`  
  Body: `{ email: string, password: string }`  
  Returns `{ userId }` on success. Updates lastLogin for admin.

- `adminSession.createAdminSession`  
  **POST** `/api/trpc/adminSession.createAdminSession`  
  Body: `{ userId: string }`  
  Creates an admin session.

- `adminSession.deleteAdminSession`  
  **POST** `/api/trpc/adminSession.deleteAdminSession`  
  Deletes the admin session.

- `adminSession.getAdminSession`  
  **GET** `/api/trpc/adminSession.getAdminSession`  
  Returns `{ userId }` if admin session exists.

#### Admin CRUD
- `crud.getUsers`  
  **GET** `/api/trpc/crud.getUsers`  
  Returns all users.

- `crud.createUser`  
  **POST** `/api/trpc/crud.createUser`  
  Body: `{ ...userData }`  
  Creates a new user.

- `crud.updateUser`  
  **POST** `/api/trpc/crud.updateUser`  
  Body: `{ id: string, ...userData }`  
  Updates an existing user.

- `crud.deleteUser`  
  **POST** `/api/trpc/crud.deleteUser`  
  Body: `{ id: string }`  
  Deletes a user by ID.

- `crud.createProduct`  
  **POST** `/api/trpc/crud.createProduct`  
  Body: `{ ...productData }`  
  Creates a new product.

- `crud.updateProduct`  
  **POST** `/api/trpc/crud.updateProduct`  
  Body: `{ id: string, ...productData }`  
  Updates an existing product.

- `crud.deleteProduct`  
  **POST** `/api/trpc/crud.deleteProduct`  
  Body: `{ id: string }`  
  Deletes a product by ID.

- `crud.createBrand`  
  **POST** `/api/trpc/crud.createBrand`  
  Body: `{ ...brandData }`  
  Creates a new brand.

- `crud.updateBrand`  
  **POST** `/api/trpc/crud.updateBrand`  
  Body: `{ id: string, ...brandData }`  
  Updates an existing brand.

- `crud.deleteBrand`  
  **POST** `/api/trpc/crud.deleteBrand`  
  Body: `{ id: string }`  
  Deletes a brand by ID.

- `crud.createCategory`  
  **POST** `/api/trpc/crud.createCategory`  
  Body: `{ ...categoryData }`  
  Creates a new category.

- `crud.updateCategory`  
  **POST** `/api/trpc/crud.updateCategory`  
  Body: `{ id: string, ...categoryData }`  
  Updates an existing category.

- `crud.deleteCategory`  
  **POST** `/api/trpc/crud.deleteCategory`  
  Body: `{ id: string }`  
  Deletes a category by ID.

#### S3 Image Management
Overview: s3 packages defined all the necessary function to upload and delete images. The intergration between s3 and typescript is make possible by creating an accesskey and shared it to the packages. By using the @aws-sdk/client-s3 packages in root, the packages able to established connection with the s3 bucket and granted the app permission to upload and delete images.

- `s3.uploadAdminImage`  
  **POST** `/api/trpc/s3.uploadAdminImage`  
  Body: `{ adminId: string, filename: string, body: number[], contentType?: string }`  
  Uploads an admin profile image to S3 and updates the admin's imageUrl in the database. Returns the image URL.

- `s3.getAdminImage`  
  **GET** `/api/trpc/s3.getAdminImage`  
  Query: `{ adminId: string, filename: string }`  
  Returns the S3 URL for the admin's image.

- `s3.deleteAdminImage`  
  **POST** `/api/trpc/s3.deleteAdminImage`  
  Body: `{ adminId: string }`  
  Deletes all images in the admin's S3 folder and resets the imageUrl to a default.

- `s3.listAdminImages`  
  **GET** `/api/trpc/s3.listAdminImages`  
  Query: `{ adminId: string }`  
  Lists all images for the admin in S3.

- `s3.uploadBrandImage` / `s3.getBrandImage` / `s3.deleteBrandImage` / `s3.listBrandImages`  
  Same as above, but for brands. Use `brandId` instead of `adminId`.

- `s3.uploadCategoryImage` / `s3.getCategoryImage` / `s3.deleteCategoryImage` / `s3.listCategoryImages`  
  Same as above, but for categories. Use `categoryId`.

- `s3.uploadUserImage` / `s3.getUserImage` / `s3.deleteUserImage` / `s3.listUserImages`  
  Same as above, but for users. Use `userId`.

- `s3.uploadProductImage` / `s3.getProductImage` / `s3.deleteProductImage` / `s3.listProductImages`  
  Same as above, but for products. Use `productId`.

- `s3.getDefaultImage`  
  **GET** `/api/trpc/s3.getDefaultImage`  
  Query: `{ filename: string }`  
  Returns the default image URL from S3.

- `s3.getSignedDefaultImageUrl`  
  **GET** `/api/trpc/s3.getSignedDefaultImageUrl`  
  Query: `{ filename: string, expiresInSeconds?: number }`  
  Returns a signed S3 URL for a default image, optionally with a custom expiration.

---

## API Usage Example

**Fetch all products:**
```http
GET /api/trpc/crud.getProducts
```

**Add product to cart:**
```http
POST /api/trpc/crud.addToCart
Body: { productId: string, quantity: number }
```

**Admin: Create a new product:**
```http
POST /api/trpc/crud.createProduct
Body: { name: string, price: number, ... }
```

**Admin: Login:**
```http
POST /api/trpc/adminLog
Body: { email: string, password: string }
```

---

## Test

### Unit Testing

- **Test Framework:**
  - All unit tests are written using [Vitest](https://vitest.dev/).
  - Test files are located in the `B2C-Store/packages/trpc/src/procedure/`, `B2C-Store/packages/db/src/`, `B2C-Store/packages/s3/src/`, and `B2C-Store/apps/admin/src/` directories, with filenames ending in `.test.ts`.

- **Web Tests:**
  - Web currently doesn't have test due to time constraint

- **Admin Tests:**
  - Example: `adminloginProcedure.test.ts` in `trpc` and test files in `apps/admin/src/` test admin login logic, middleware, and admin-specific features.
  - These tests mock Prisma and password utilities to ensure only the authentication logic is tested.
  - **Note:** Some admin unit tests are currently not passing. Please review and update the tests or implementation as needed.

- **Packages Tests:**
  - The `db` and `s3` packages include unit tests for database and S3 utility functions, such as connection, upload, and access logic.
  - Example: `client.test.ts`, `seed.test.ts` in `db`; `access.test.ts`, `utils.test.ts` in `s3`.

- **How to Run Unit Tests:**
  - From the root of the project, run:
    ```powershell
    pnpm --filter @b2c-store/trpc test
    ```
  - Or, to run tests in a specific package or app:
    ```powershell
    cd B2C-Store/packages/trpc
    pnpm test
    ```
    ```powershell
    cd B2C-Store/packages/db
    pnpm test
    ```
    ```powershell
    cd B2C-Store/packages/s3
    pnpm test
    ```
    ```powershell
    cd B2C-Store/apps/admin
    pnpm test
    ```

- **Test Coverage (trpc package only):**
  - To view coverage for the trpc package, run:
    ```powershell
    pnpm --filter @b2c-store/trpc test:coverage
    ```
  - Or, inside the trpc package:
    ```powershell
    cd B2C-Store/packages/trpc
    pnpm test:coverage
    ```

### E2E Testing

- The `e2e` package is set up for Playwright-based end-to-end tests, but currently no e2e tests are implemented.

## Notes
- All API endpoints are type-safe and auto-documented via tRPC.
- Use the tRPC client in your Next.js apps for best DX and type safety.
- For direct HTTP calls, use the `/api/trpc/[procedure]` endpoint with the correct method and body.

## DB configuration

# To ensure the page is run smoothly you must run these command in sequence

turbo db:generate
turbo db:push

# If there are no data in cloud you can run this command to seed data

turbo db:seed

## Useful commands

# Remove all node_modules in project
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Install vitest

pnpm add -D vitest @vitest/ui @vitest/coverage-v8 

# Remove all stopped containers
docker container prune -f

# Remove all unused images (including <none> tags)
docker image prune -a -f

# Remove all unused volumes
docker volume prune -f

# Remove all unused networks
docker network prune -f

# Remove all build cache
docker builder prune -a -f

## Limitation and future consideration

- **Testing Coverage:**
  - No end-to-end (e2e) tests are implemented. The `e2e` package is set up for Playwright but contains no tests.
  - Unit tests exist only for the admin app and core packages (`trpc`, `db`, `s3`). The web app has no unit tests.
  - Admin unit tests are only partial and do not cover all features.

- **Authentication & Security:**
  - No multi-factor authentication (MFA) or two-step verification is implemented.
  - User account verification via email is not supported.
  - Only a single SuperAdmin exists; there is no UI or backend logic for assigning roles or permissions to other admins.

- **Payments:**
  - No payment gateway is integrated. Future versions may use Stripe or another provider for payment processing.

- **Database & Permissions:**
  - The database schema is not fully robust for production use. For example, SuperAdmin cannot assign or manage permissions for other admin accounts.
  - No audit logging or advanced user management features are present.

- **UI/UX:**
  - The UI is functional but lacks polish and advanced features in some areas, especially in the admin dashboard and web storefront.
  - Accessibility and responsive design improvements are needed.

- **Other:**
  - No email notifications or transactional email support.
  - No rate limiting or advanced security hardening.
  - Some error handling and edge cases may not be fully addressed.