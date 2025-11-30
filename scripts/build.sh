#!/bin/bash
#
# Linux build script for XhinkingTodo
# Builds deb, rpm, and tar.gz packages
#

set -e

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
PRODUCT_NAME="XhinkingTodo"
BINARY_NAME="xhinking-todo"
PRODUCT_NAME_LOWER="xhinkingtodo"
ARCH=$(uname -m)

# Map architecture names
case "$ARCH" in
    x86_64) ARCH_NAME="x64" ;;
    aarch64) ARCH_NAME="arm64" ;;
    *) ARCH_NAME="$ARCH" ;;
esac

echo "========================================"
echo "Building $PRODUCT_NAME v$VERSION for Linux ($ARCH)"
echo "========================================"

# Build the application
if [ "$1" != "--skip-build" ]; then
    echo -e "\n[1/5] Building Tauri application..."
    npm run tauri:build
fi

# Define paths
TAURI_TARGET="src-tauri/target/release"
BUNDLE_DIR="$TAURI_TARGET/bundle"
OUTPUT_DIR="release/linux"

# Create output directory
echo -e "\n[2/5] Preparing output directory..."
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Copy deb package
echo -e "\n[3/5] Copying deb package..."
DEB_FILE=$(find "$BUNDLE_DIR/deb" -name "*.deb" 2>/dev/null | head -1)
if [ -n "$DEB_FILE" ]; then
    DEB_NAME="${PRODUCT_NAME_LOWER}_${VERSION}_${ARCH_NAME}.deb"
    cp "$DEB_FILE" "$OUTPUT_DIR/$DEB_NAME"
    echo "  Created: $DEB_NAME"
else
    echo "  Warning: deb package not found"
fi

# Copy rpm package
echo -e "\n[4/5] Copying rpm package..."
RPM_FILE=$(find "$BUNDLE_DIR/rpm" -name "*.rpm" 2>/dev/null | head -1)
if [ -n "$RPM_FILE" ]; then
    RPM_NAME="${PRODUCT_NAME_LOWER}_${VERSION}_${ARCH_NAME}.rpm"
    cp "$RPM_FILE" "$OUTPUT_DIR/$RPM_NAME"
    echo "  Created: $RPM_NAME"
else
    echo "  Warning: rpm package not found"
fi

# Create tar.gz portable package
echo -e "\n[5/5] Creating tar.gz portable package..."
TARBALL_DIR="$OUTPUT_DIR/${PRODUCT_NAME_LOWER}_${VERSION}_${ARCH_NAME}"
mkdir -p "$TARBALL_DIR"

# Copy executable
if [ -f "$TAURI_TARGET/$BINARY_NAME" ]; then
    cp "$TAURI_TARGET/$BINARY_NAME" "$TARBALL_DIR/$PRODUCT_NAME_LOWER"
    chmod +x "$TARBALL_DIR/$PRODUCT_NAME_LOWER"
else
    echo "  Warning: Executable not found"
fi

# Copy icon
if [ -f "src-tauri/icons/icon.png" ]; then
    cp "src-tauri/icons/icon.png" "$TARBALL_DIR/$PRODUCT_NAME_LOWER.png"
fi

# Copy 128x128 icon for desktop entry
if [ -f "src-tauri/icons/128x128.png" ]; then
    cp "src-tauri/icons/128x128.png" "$TARBALL_DIR/${PRODUCT_NAME_LOWER}_128.png"
fi

# Create desktop entry
cat > "$TARBALL_DIR/$PRODUCT_NAME_LOWER.desktop" << EOF
[Desktop Entry]
Name=XhinkingTodo
Comment=A modern desktop todo application
Exec=$PRODUCT_NAME_LOWER
Icon=$PRODUCT_NAME_LOWER
Terminal=false
Type=Application
Categories=Office;TextEditor;Utility;
Keywords=todo;task;productivity;
StartupWMClass=$PRODUCT_NAME_LOWER
EOF

# Create install script
cat > "$TARBALL_DIR/install.sh" << 'INSTALL_SCRIPT'
#!/bin/bash
#
# Install script for XhinkingTodo
# Installs to user's local bin and applications directories
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PRODUCT_NAME_LOWER="xhinkingtodo"

# Directories
USER_BIN="$HOME/.local/bin"
USER_APPS="$HOME/.local/share/applications"
USER_ICONS="$HOME/.local/share/icons/hicolor"

echo "Installing XhinkingTodo..."

# Create directories
mkdir -p "$USER_BIN"
mkdir -p "$USER_APPS"
mkdir -p "$USER_ICONS/128x128/apps"
mkdir -p "$USER_ICONS/512x512/apps"

# Copy executable
cp "$SCRIPT_DIR/$PRODUCT_NAME_LOWER" "$USER_BIN/"
chmod +x "$USER_BIN/$PRODUCT_NAME_LOWER"
echo "  Installed executable to $USER_BIN/$PRODUCT_NAME_LOWER"

# Copy icons
if [ -f "$SCRIPT_DIR/${PRODUCT_NAME_LOWER}_128.png" ]; then
    cp "$SCRIPT_DIR/${PRODUCT_NAME_LOWER}_128.png" "$USER_ICONS/128x128/apps/$PRODUCT_NAME_LOWER.png"
fi
if [ -f "$SCRIPT_DIR/$PRODUCT_NAME_LOWER.png" ]; then
    cp "$SCRIPT_DIR/$PRODUCT_NAME_LOWER.png" "$USER_ICONS/512x512/apps/$PRODUCT_NAME_LOWER.png"
fi
echo "  Installed icons to $USER_ICONS"

# Create desktop entry with correct paths
cat > "$USER_APPS/$PRODUCT_NAME_LOWER.desktop" << EOF
[Desktop Entry]
Name=XhinkingTodo
Comment=A modern desktop todo application
Exec=$USER_BIN/$PRODUCT_NAME_LOWER
Icon=$PRODUCT_NAME_LOWER
Terminal=false
Type=Application
Categories=Office;TextEditor;Utility;
Keywords=todo;task;productivity;
StartupWMClass=$PRODUCT_NAME_LOWER
EOF
chmod +x "$USER_APPS/$PRODUCT_NAME_LOWER.desktop"
echo "  Installed desktop entry to $USER_APPS/$PRODUCT_NAME_LOWER.desktop"

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t "$USER_ICONS" 2>/dev/null || true
fi

# Ensure ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$USER_BIN:"* ]]; then
    echo ""
    echo "NOTE: Please add $USER_BIN to your PATH:"
    echo "  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.bashrc"
    echo "  source ~/.bashrc"
fi

echo ""
echo "Installation completed successfully!"
echo "You can now run XhinkingTodo from your application menu or by typing '$PRODUCT_NAME_LOWER'"
INSTALL_SCRIPT
chmod +x "$TARBALL_DIR/install.sh"

# Create uninstall script
cat > "$TARBALL_DIR/uninstall.sh" << 'UNINSTALL_SCRIPT'
#!/bin/bash
#
# Uninstall script for XhinkingTodo
# Removes executable, icons, and desktop entry
#

set -e

PRODUCT_NAME_LOWER="xhinkingtodo"

# Directories
USER_BIN="$HOME/.local/bin"
USER_APPS="$HOME/.local/share/applications"
USER_ICONS="$HOME/.local/share/icons/hicolor"

echo "Uninstalling XhinkingTodo..."

# Remove executable
if [ -f "$USER_BIN/$PRODUCT_NAME_LOWER" ]; then
    rm -f "$USER_BIN/$PRODUCT_NAME_LOWER"
    echo "  Removed $USER_BIN/$PRODUCT_NAME_LOWER"
fi

# Remove icons
rm -f "$USER_ICONS/128x128/apps/$PRODUCT_NAME_LOWER.png"
rm -f "$USER_ICONS/512x512/apps/$PRODUCT_NAME_LOWER.png"
echo "  Removed icons from $USER_ICONS"

# Remove desktop entry
if [ -f "$USER_APPS/$PRODUCT_NAME_LOWER.desktop" ]; then
    rm -f "$USER_APPS/$PRODUCT_NAME_LOWER.desktop"
    echo "  Removed $USER_APPS/$PRODUCT_NAME_LOWER.desktop"
fi

# Update icon cache
if command -v gtk-update-icon-cache &> /dev/null; then
    gtk-update-icon-cache -f -t "$USER_ICONS" 2>/dev/null || true
fi

echo ""
echo "Uninstallation completed successfully!"
UNINSTALL_SCRIPT
chmod +x "$TARBALL_DIR/uninstall.sh"

# Create README
cat > "$TARBALL_DIR/README.txt" << EOF
XhinkingTodo v$VERSION
=======================

A modern desktop todo application.

Installation:
  ./install.sh     - Install to user directory (~/.local/bin)

Uninstallation:
  ./uninstall.sh   - Remove XhinkingTodo from your system

Manual Installation:
  1. Copy '$PRODUCT_NAME_LOWER' to a directory in your PATH
  2. Copy '$PRODUCT_NAME_LOWER.desktop' to ~/.local/share/applications/
  3. Copy icons to ~/.local/share/icons/hicolor/

Requirements:
  - libwebkit2gtk-4.0
  - libgtk-3
  - libappindicator3 (optional, for system tray)

Website: https://github.com/your-repo/XhinkingTodo
EOF

# Create tarball
TARBALL_NAME="${PRODUCT_NAME_LOWER}_${VERSION}_${ARCH_NAME}.tar.gz"
cd "$OUTPUT_DIR"
tar -czf "$TARBALL_NAME" "$(basename $TARBALL_DIR)"
rm -rf "$(basename $TARBALL_DIR)"
cd - > /dev/null
echo "  Created: $TARBALL_NAME"

echo ""
echo "========================================"
echo "Build completed!"
echo "Output directory: $OUTPUT_DIR"
echo "========================================"

# List output files
echo -e "\nGenerated files:"
for file in "$OUTPUT_DIR"/*; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "  - $(basename $file) ($size)"
    fi
done
