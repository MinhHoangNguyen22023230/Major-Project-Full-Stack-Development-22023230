# 1. Use a Node base image
FROM node:22-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package manager files and all source files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY ./packages ./packages
COPY ./apps ./apps
COPY ./README.md ./

RUN npm install -g pnpm
RUN pnpm install

# 4. Build all apps/packages
RUN pnpm build

# 5. Expose port (change as needed)
EXPOSE 3000

# 6. Start your main app (change path as needed)
CMD ["pnpm", "start", "--filter", "apps/admin"]