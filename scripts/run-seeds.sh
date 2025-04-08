#!/bin/bash

# Change directory to the project root (assuming this script is in "scripts")
cd "$(dirname "$0")/.." || { echo "Failed to change directory"; exit 1; }

seed_files=(
  "prisma/seeds/izomcsoportok.ts"
  "prisma/seeds/gyakorlatok.ts"
  "prisma/seeds/users.ts"
  "prisma/seeds/edzesek.ts"
)

for file in "${seed_files[@]}"; do
  echo "Running $file..."
  npx ts-node "$file" || { echo "Error executing $file"; exit 1; }
done

echo "All seeders executed successfully!"
