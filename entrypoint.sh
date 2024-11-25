#!/bin/sh

echo "Changing directory to /app/src"
cd /app/src

echo "Running Sequelize migrations..."
npx sequelize-cli db:migrate

echo "Returning to the parent directory"
cd ..

echo "Starting the Node.js server..."
npm run dev
