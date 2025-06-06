

# Techstack

next.js react turborepo tailwind mongodb and awss3(for image storage) trpc prisma-ORM

# Repo structure
root
 - apps
  + web
  + admin
 - packages
  + trpc
  + s3
  + db
 - turbo.json

apps folder store the nextjs app admin (for admin) and web (the b2c page)

packges folder store trpc (handle db crud, upload image to s3, login and session management), s3 (setup s3 client for trpc), db (setup mongodb cloud using prisma) 

# Step to run the development

First, run pnpm install at root to install dependency

Second, rename the .env.example to .env and place it in the root and every packages and apps

Third, run the development by type turbo dev at root or pnpm turbo dev or pnpm dev

Note: db like will not work due to the mongodb database is store in cloud and required manual setup in the cloud to grant the permission for the corresponding ip address

# DB configuration

# To ensure the page is run smoothly you must run these command in sequence

turbo db:generate
turbo db:push

# If there are no data in cloud you can run this command to seed data

turbo db:seed (deprecated due to update in schema without update the seed)


# Useful commands

# Remove all node_modules in project
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Install vitest

pnpm add -D vitest @vitest/ui @vitest/coverage-v8 

# Access ec2 through ssh

ssh -i "au-dell.pem" ec2-user@ec2-13-210-72-239.ap-southeast-2.compute.amazonaws.com