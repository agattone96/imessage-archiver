#!/bin/bash
set -e

APP_NAME="iMessage Archiver"
DIST_DIR="dist"
APP_BUNDLE="$DIST_DIR/$APP_NAME.app"
CONTENTS="$APP_BUNDLE/Contents"
RESOURCES="$CONTENTS/Resources"
MACOS="$CONTENTS/MacOS"
SRC_DIR="$RESOURCES/app"
VENV_DIR="$RESOURCES/venv"

echo "🏗️  Starting Transparent Bundle Build..."

# 1. Clean
rm -rf "$DIST_DIR"
mkdir -p "$MACOS"
mkdir -p "$SRC_DIR"

# 2. Icon
echo "🎨 Processing Icon..."
if [ -f "app_icon.png" ]; then
    mkdir -p build/icon.iconset
    sips -z 16 16     -s format png app_icon.png --out build/icon.iconset/icon_16x16.png
    sips -z 32 32     -s format png app_icon.png --out build/icon.iconset/icon_16x16@2x.png
    sips -z 32 32     -s format png app_icon.png --out build/icon.iconset/icon_32x32.png
    sips -z 64 64     -s format png app_icon.png --out build/icon.iconset/icon_32x32@2x.png
    sips -z 128 128   -s format png app_icon.png --out build/icon.iconset/icon_128x128.png
    sips -z 256 256   -s format png app_icon.png --out build/icon.iconset/icon_128x128@2x.png
    sips -z 512 512   -s format png app_icon.png --out build/icon.iconset/icon_512x512.png
    sips -z 1024 1024 -s format png app_icon.png --out build/icon.iconset/icon_512x512@2x.png
    iconutil -c icns build/icon.iconset -o "$RESOURCES/AppIcon.icns"
fi

# 3. Create Info.plist
echo "📝 Generating Info.plist..."
cat > "$CONTENTS/Info.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.antigravity.imessagearchiver</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>12.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

# 4. Copy Source Code
echo "📂 Copying Source..."
cp bootstrap.py "$SRC_DIR/"
cp -r backend "$SRC_DIR/"
cp dashboard.py "$SRC_DIR/"
cp -r bin "$SRC_DIR/"
cp requirements.txt "$SRC_DIR/"
# Copy asset files if they exist
[ -f metadata.json ] && cp metadata.json "$SRC_DIR/"

# 5. Create Embedded Environment
echo "🐍 Creating Embedded Python Engine..."
# Use --copies to try to make it isolated, though hardlinks are default on mac
python3 -m venv --copies "$VENV_DIR"

echo "📦 Installing Dependencies into Bundle..."
"$VENV_DIR/bin/pip" install --upgrade pip --quiet
"$VENV_DIR/bin/pip" install -r requirements.txt --quiet
"$VENV_DIR/bin/pip" install pyobjc --quiet

# 6. Create Launcher
echo "🚀 Creating Launcher Script..."
cat > "$MACOS/launcher" <<EOF
#!/bin/bash
DIR="\$( cd "\$( dirname "\${BASH_SOURCE[0]}" )" && pwd )"
CONTENTS="\$(dirname "\$DIR")"
RESOURCES="\$CONTENTS/Resources"
APP_DIR="\$RESOURCES/app"
VENV_PYTHON="\$RESOURCES/venv/bin/python"

# Set running directory to app source
cd "\$APP_DIR"

# Run Bootstrap using embedded python
exec "\$VENV_PYTHON" bootstrap.py
EOF

chmod +x "$MACOS/launcher"

# 7. Sign
echo "🔐 Signing App..."
codesign --force --deep --sign - "$APP_BUNDLE"

echo "
✅ Build Complete!
------------------
App: $APP_BUNDLE
Size: $(du -sh "$APP_BUNDLE" | cut -f1)

To install:
mv "$APP_BUNDLE" /Applications/
"
