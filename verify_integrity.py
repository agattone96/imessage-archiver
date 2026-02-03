import sys
import os
import shutil

print("--- iMessage Archiver Self-Test ---")

# 1. Check Python Dependencies
print("[1/5] Checking Dependencies...")
try:
    import streamlit
    import pandas
    import altair
    import plistlib
    import sqlite3
    print("  ✅ All libraries imported successfully.")
except ImportError as e:
    print(f"  ❌ Missing Dependency: {e}")
    sys.exit(1)

# 2. Check Backend Import
print("[2/5] Checking Backend Logic...")
try:
    import backend
    print("  ✅ Backend module loaded.")
except Exception as e:
    print(f"  ❌ Backend failed to load: {e}")
    sys.exit(1)

# 3. Check Database Access (Safe Mode)
print("[3/5] Checking Database Permissions...")
try:
    # Attempt to connection (this triggers the Safe Discovery logic)
    conn = backend.get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM message")
    count = cur.fetchone()[0]
    conn.close()
    print(f"  ✅ Database Connected. Found {count} messages.")
except Exception as e:
    print(f"  ❌ Database Error: {e}")
    print("  -> Ensure Terminal has Full Disk Access.")
    sys.exit(1)

# 4. Check Export Paths
print("[4/5] Checking Export Directory...")
try:
    test_path = backend.OUT_DIR
    if not os.path.exists(test_path):
        os.makedirs(test_path)
    test_file = os.path.join(test_path, ".write_test")
    with open(test_file, "w") as f: f.write("ok")
    os.remove(test_file)
    print(f"  ✅ Write access confirmed: {test_path}")
except Exception as e:
    print(f"  ❌ Export Path Error: {e}")
    sys.exit(1)

# 5. Check Helper Binaries
print("[5/5] Checking Helper Binaries...")
ocr_ok = os.path.exists(backend.OCR_BIN)
trans_ok = os.path.exists(backend.TRANSCRIBE_BIN)
print(f"  OCR Binary: {'✅ Found' if ocr_ok else '⚠️ Missing (Feature Disabled)'}")
print(f"  Transcribe Binary: {'✅ Found' if trans_ok else '⚠️ Missing (Feature Disabled)'}")

print("\n🎉 ALL SYSTEMS GO. The application is ready to run.")
