#!/bin/bash
# Create simple icons using ImageMagick

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "ImageMagick not found. Creating placeholder icons..."
    # Create simple colored squares as fallback
    echo "P3 16 16 255" > icon16.ppm
    for i in {1..256}; do echo "76 175 80"; done >> icon16.ppm
    convert icon16.ppm icon16.png 2>/dev/null || echo "Please install ImageMagick or use custom icons"
    rm -f icon16.ppm
else
    # Create icons with ImageMagick
    convert -size 16x16 xc:"#4CAF50" -gravity center -pointsize 12 -fill white -annotate +0+0 "G" icon16.png
    convert -size 48x48 xc:"#4CAF50" -gravity center -pointsize 32 -fill white -annotate +0+0 "G" icon48.png
    convert -size 128x128 xc:"#4CAF50" -gravity center -pointsize 80 -fill white -annotate +0+0 "G" icon128.png
    echo "Icons created successfully!"
fi
