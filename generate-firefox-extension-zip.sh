#!/bin/bash

OUTPUT="codeforces-darktheme-firefox-extension.zip"

# Ensure extension folder exists
if [[ ! -d "extension-firefox" ]]; then
    echo "Error: extension folder not found."
    exit 1
fi

cd extension-firefox || exit 1

# Remove old zip if exists
rm -f "../$OUTPUT"

# Create zip with the full extension contents, including nested folders
shopt -s dotglob nullglob
FILES=(*)

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "Error: extension-firefox is empty."
    exit 1
fi

zip -r "../$OUTPUT" "${FILES[@]}"

echo "Created $OUTPUT with all extension files and folders!"