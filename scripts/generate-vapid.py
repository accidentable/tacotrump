"""VAPID 키 쌍 생성 스크립트 — 한 번만 실행
Usage: pip install pywebpush && python scripts/generate-vapid.py
"""

import base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend


def generate():
    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    priv_numbers = private_key.private_numbers()
    pub_numbers = priv_numbers.public_numbers

    # Raw 32-byte private key
    priv_bytes = priv_numbers.private_value.to_bytes(32, byteorder="big")
    # Uncompressed 65-byte public key (0x04 + x + y)
    pub_bytes = (
        b"\x04"
        + pub_numbers.x.to_bytes(32, byteorder="big")
        + pub_numbers.y.to_bytes(32, byteorder="big")
    )

    priv_b64 = base64.urlsafe_b64encode(priv_bytes).rstrip(b"=").decode()
    pub_b64 = base64.urlsafe_b64encode(pub_bytes).rstrip(b"=").decode()

    print("=== VAPID Keys ===\n")
    print("Vercel 환경변수에 설정:")
    print(f"  VAPID_PRIVATE_KEY={priv_b64}")
    print(f"  VAPID_PUBLIC_KEY={pub_b64}")
    print(f"  VAPID_SUBJECT=mailto:admin@tacotrump.space")
    print(f"\n프론트엔드 .env (또는 Vercel 환경변수):")
    print(f"  VITE_VAPID_PUBLIC_KEY={pub_b64}")


if __name__ == "__main__":
    generate()
