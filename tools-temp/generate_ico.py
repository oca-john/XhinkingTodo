#!/usr/bin/env python3
"""
Generate Windows ICO file with proper icon embedding
"""

from PIL import Image
import os

def generate_ico_from_png(png_path, ico_path):
    """Generate ICO file from PNG with multiple sizes"""
    print(f"Loading source image: {png_path}")
    
    # Load and convert to RGBA
    img = Image.open(png_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    print(f"Source image size: {img.size}, mode: {img.mode}")
    
    # ICO file needs these specific sizes for Windows
    ico_sizes = [
        (16, 16),
        (32, 32),
        (48, 48),
        (64, 64),
        (128, 128),
        (256, 256)
    ]
    
    print(f"Generating ICO with sizes: {ico_sizes}")
    
    # Save as ICO with multiple sizes
    img.save(ico_path, format='ICO', sizes=ico_sizes)
    
    file_size = os.path.getsize(ico_path)
    print(f"✅ Generated: {ico_path}")
    print(f"   File size: {file_size:,} bytes")
    
    return file_size

if __name__ == "__main__":
    source = "src-tauri/icons/XhinkingTodo.png"
    output = "src-tauri/icons/icon.ico"
    
    if not os.path.exists(source):
        print(f"❌ Source file not found: {source}")
        exit(1)
    
    try:
        size = generate_ico_from_png(source, output)
        print(f"\n✅ ICO file generated successfully!")
        print(f"   This file will be used for:")
        print(f"   - exe program icon")
        print(f"   - desktop shortcut icon")
        print(f"   - taskbar icon")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
