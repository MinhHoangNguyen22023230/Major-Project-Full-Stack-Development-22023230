# Remove all node_modules in project
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Techstack

next.js react turborepo tailwind mongodb and awss3(for image storage)

# DB configuration

# To ensure the page is run smoothly you must run these command in sequence

turbo db:generate
turbo db:push

# If there are no data in cloud you can run this command to seed data

turbo db:seed 
