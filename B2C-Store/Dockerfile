# 1. Use a Node base image
FROM node:22-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package manager files and all source files
COPY . .

RUN npm install -g pnpm
RUN pnpm install

# 4. Build all apps/packages
RUN pnpm turbo build

# 6. Start your main app (change path as needed)
CMD ["pnpm", "turbo", "start"]