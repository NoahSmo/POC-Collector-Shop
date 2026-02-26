#!/bin/sh

# Wait for database to be ready (optional but recommended)
echo "Waiting for database..."
# For simplicity in this POC, we'll just try to run migrations immediately
# In a real environment, you'd use a tool like 'wait-for-it' or 'nc'

# Sync database schema
npx prisma db push

# Run seed
npx prisma db seed

# Start the application
npm start
