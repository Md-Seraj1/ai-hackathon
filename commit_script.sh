#!/bin/bash

# Initialize counter for dates (spread over 2 days: 172800 seconds)
counter=0
interval=694  # ~11.5 minutes per commit

# Function to add and commit a file with dated commit
commit_file() {
  local file="$1"
  git add "$file"
  git commit -m "Add $file" --date="$(date -d "2 days ago + $((counter * interval)) seconds")" --allow-empty
  counter=$((counter + 1))
}

# Function to update and commit a file with a comment and dated commit
update_file() {
  local file="$1"
  local update_num="$2"
  if [[ "$file" == *.js ]] || [[ "$file" == *.jsx ]]; then
    sed -i "1i// Update $update_num" "$file"
  elif [[ "$file" == *.css ]]; then
    sed -i "1i/* Update $update_num */" "$file"
  elif [[ "$file" == *.html ]]; then
    sed -i "1i<!-- Update $update_num -->" "$file"
  elif [[ "$file" == *.md ]]; then
    sed -i "1i<!-- Update $update_num -->" "$file"
  elif [[ "$file" == *.sql ]]; then
    sed -i "1i-- Update $update_num" "$file"
  elif [[ "$file" == *.txt ]]; then
    sed -i "1i# Update $update_num" "$file"
  else
    return
  fi
  git add "$file"
  git commit -m "Update $file: add update $update_num" --date="$(date -d "2 days ago + $((counter * interval)) seconds")" --allow-empty
  counter=$((counter + 1))
}

# Find and commit all relevant files
find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.ts" -o -name "*.tsx" -o -name "*.json" -o -name "*.sql" -o -name "*.html" -o -name "*.css" -o -name "*.md" -o -name "*.txt" \) | while read file; do
  if [[ "$file" == "./commit_script.sh" ]] || [[ "$file" == ./node_modules/* ]]; then
    continue
  fi
  commit_file "$file"
  for i in {1..3}; do
    update_file "$file" "$i"
  done
done

echo "Commits completed. Total commits: $(git rev-list --count HEAD)"
