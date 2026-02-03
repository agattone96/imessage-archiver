import sys
import os
import hashlib
import plistlib

# Add parent directory to path to reach backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.helpers import decode_body
from backend.engine import verify_binary

def test_decoding():
    print("Testing F-001: Message Decoding...")
    
    # Simple text
    assert decode_body("Hello", None) == "Hello"
    
    # 1. NSKeyedArchiver blob (Simulated with plistlib)
    objects = ["NSAttributedString", "NSString", "NSDictionary", "Actual Message"]
    fake_data = {
        "$version": 100000,
        "$archiver": "NSKeyedArchiver",
        "$top": {"root": 3},
        "$objects": objects
    }
    fake_bplist = plistlib.dumps(fake_data, fmt=plistlib.FMT_BINARY)
    
    res = decode_body(None, fake_bplist)
    print(f"Decoded bplist: {res}")
    assert res == "Actual Message"
    
    # 2. Hex Fallback
    res = decode_body(None, b"\x00\x01\x02\x03")
    print(f"Decoded partial: {res}")
    assert "Decryption/Decode Failed" in res
    print("F-001: PASSED")

def test_temp_file_security():
    print("\nTesting F-002: Temp File Security...")
    # This requires running archiver.sh. We will check it manually or via a separate subshell test.
    print("F-002: Manual verification required via archiver.sh run.")

def test_binary_pinning():
    print("\nTesting T-006: Binary Hash Pinning...")
    # Create a dummy binary
    dummy_path = "/tmp/dummy_bin"
    with open(dummy_path, "wb") as f:
        f.write(b"malicious code")
    
    # It should fail because hash doesn't match
    res = verify_binary(dummy_path, "some-other-hash")
    assert res == False
    
    # Should work if hash matches
    h = hashlib.sha256(b"malicious code").hexdigest()
    res = verify_binary(dummy_path, h)
    assert res == True
    
    os.remove(dummy_path)
    print("T-006: PASSED")

if __name__ == "__main__":
    try:
        test_decoding()
        test_binary_pinning()
        print("\nAll automated verification tests PASSED.")
    except Exception as e:
        print(f"\nVerification FAILED: {e}")
        sys.exit(1)
