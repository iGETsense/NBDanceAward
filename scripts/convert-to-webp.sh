#!/bin/bash

# Script to convert all dancer images to WebP format
# This reduces file size by 30-80% while maintaining quality

echo "🖼️  Converting dancer images to WebP format..."

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Installing..."
    echo "Run: sudo apt-get install webp (Ubuntu/Debian)"
    echo "Or: brew install webp (macOS)"
    exit 1
fi

# Create backup directory
BACKUP_DIR="public/dancers_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 Backing up original images to: $BACKUP_DIR"
cp -r public/dancers/* "$BACKUP_DIR/"

# Convert all images to WebP
CONVERTED=0
FAILED=0

for img in public/dancers/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
    # Skip if file doesn't exist (glob didn't match)
    [ -e "$img" ] || continue
    
    # Get filename without extension
    filename=$(basename "$img")
    name="${filename%.*}"
    
    # Convert to WebP with 85% quality (good balance)
    output="public/dancers/${name}.webp"
    
    echo "Converting: $filename → ${name}.webp"
    
    if cwebp -q 85 "$img" -o "$output" 2>/dev/null; then
        # Get file sizes
        original_size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")
        new_size=$(stat -f%z "$output" 2>/dev/null || stat -c%s "$output")
        
        # Calculate reduction
        reduction=$(( 100 - (new_size * 100 / original_size) ))
        
        echo "✅ Saved ${reduction}% ($(numfmt --to=iec $original_size) → $(numfmt --to=iec $new_size))"
        
        # Remove original (optional - comment out to keep both)
        # rm "$img"
        
        ((CONVERTED++))
    else
        echo "❌ Failed to convert: $filename"
        ((FAILED++))
    fi
done

echo ""
echo "✨ Conversion complete!"
echo "   Converted: $CONVERTED images"
echo "   Failed: $FAILED images"
echo "   Backup: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Update image paths in your code (.jpg → .webp)"
echo "2. Test the website"
echo "3. Delete backup if everything works: rm -rf $BACKUP_DIR"
