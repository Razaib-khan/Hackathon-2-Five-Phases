#!/usr/bin/env python3
"""
Test script to verify the bcrypt password length validation fix.
This test verifies that passwords longer than 72 bytes are properly rejected
before reaching the bcrypt hashing function.
"""

import sys
import os

# Add the backend src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend', 'src'))

from auth.auth_handler import auth_handler


def test_password_length_validation():
    """Test that passwords longer than 72 bytes are rejected."""

    print("Testing password length validation...")

    # Test case 1: Valid password (under 72 bytes)
    short_password = "shortpassword123"  # Length: 16 characters, 16 bytes
    print(f"Testing short password ({len(short_password)} chars, {len(short_password.encode('utf-8'))} bytes)...")
    try:
        hash_result = auth_handler.get_password_hash(short_password)
        print("✓ Short password hashing succeeded as expected")
    except Exception as e:
        print(f"✗ Unexpected error with short password: {e}")
        return False

    # Test case 2: Exactly 72-byte password (should work)
    # Using ASCII characters, 72 characters = 72 bytes
    exactly_72_bytes = "a" * 72
    print(f"Testing 72-byte password ({len(exactly_72_bytes)} chars, {len(exactly_72_bytes.encode('utf-8'))} bytes)...")
    try:
        hash_result = auth_handler.get_password_hash(exactly_72_bytes)
        print("✓ 72-byte password hashing succeeded as expected")
    except Exception as e:
        print(f"✗ Unexpected error with 72-byte password: {e}")
        return False

    # Test case 3: Exactly 73-byte password (should fail)
    seventy_three_bytes = "a" * 73
    print(f"Testing 73-byte password ({len(seventy_three_bytes)} chars, {len(seventy_three_bytes.encode('utf-8'))} bytes)...")
    try:
        hash_result = auth_handler.get_password_hash(seventy_three_bytes)
        print("✗ 73-byte password hashing unexpectedly succeeded - this is a bug!")
        return False
    except ValueError as e:
        if "Password must be 72 characters or fewer" in str(e):
            print("✓ 73-byte password properly rejected with correct error message")
        else:
            print(f"✗ 73-byte password rejected with wrong error message: {e}")
            return False
    except Exception as e:
        print(f"✗ 73-byte password caused unexpected error: {e}")
        return False

    # Test case 4: Very long password (should fail)
    very_long_password = "This is a very long password that definitely exceeds 72 bytes in length!"  # More than 72 bytes
    print(f"Testing very long password ({len(very_long_password)} chars, {len(very_long_password.encode('utf-8'))} bytes)...")
    try:
        hash_result = auth_handler.get_password_hash(very_long_password)
        print("✗ Very long password hashing unexpectedly succeeded - this is a bug!")
        return False
    except ValueError as e:
        if "Password must be 72 characters or fewer" in str(e):
            print("✓ Very long password properly rejected with correct error message")
        else:
            print(f"✗ Very long password rejected with wrong error message: {e}")
            return False
    except Exception as e:
        print(f"✗ Very long password caused unexpected error: {e}")
        return False

    # Test case 5: Password with Unicode characters that exceed 72 bytes
    unicode_password = "🚀" * 30  # Each emoji is 4 bytes, so 30 * 4 = 120 bytes
    print(f"Testing unicode password ({len(unicode_password)} chars, {len(unicode_password.encode('utf-8'))} bytes)...")
    try:
        hash_result = auth_handler.get_password_hash(unicode_password)
        print("✗ Unicode password hashing unexpectedly succeeded - this is a bug!")
        return False
    except ValueError as e:
        if "Password must be 72 characters or fewer" in str(e):
            print("✓ Unicode password properly rejected with correct error message")
        else:
            print(f"✗ Unicode password rejected with wrong error message: {e}")
            return False
    except Exception as e:
        print(f"✗ Unicode password caused unexpected error: {e}")
        return False

    print("\nAll tests passed! Password length validation is working correctly.")
    return True


if __name__ == "__main__":
    success = test_password_length_validation()
    if not success:
        print("\nSome tests failed. The bcrypt password length validation fix may not be working properly.")
        sys.exit(1)
    else:
        print("\nThe bcrypt password length validation fix is working correctly.")
        sys.exit(0)