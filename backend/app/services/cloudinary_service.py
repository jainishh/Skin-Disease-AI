"""
Cloudinary upload helper for storing user-uploaded skin images and generated
Grad-CAM overlays. Requires CLOUDINARY_* env vars to be set; in their absence
this falls back to local disk storage under the static/uploads folder inside
the workspace, allowing the local dev frontend to render them successfully.
"""
import os
import uuid
from pathlib import Path

import cloudinary
import cloudinary.uploader

from app.core.config import settings

_configured = False


def _ensure_configured() -> bool:
    global _configured
    if not settings.cloudinary_cloud_name:
        return False
    if not _configured:
        cloudinary.config(
            cloud_name=settings.cloudinary_cloud_name,
            api_key=settings.cloudinary_api_key,
            api_secret=settings.cloudinary_api_secret,
            secure=True,
        )
        _configured = True
    return True


def upload_image_bytes(image_bytes: bytes, folder: str = "skin-ai/uploads") -> str:
    if _ensure_configured():
        try:
            result = cloudinary.uploader.upload(image_bytes, folder=folder, resource_type="image")
            if result and "secure_url" in result:
                return result["secure_url"]
        except Exception as e:
            print(f"Cloudinary upload failed: {e}. Using fallback.")

    # Local disk backup inside static/uploads folder
    try:
        BASE_DIR = Path(__file__).resolve().parent.parent.parent
        local_dir = BASE_DIR / "static" / "uploads"
        os.makedirs(local_dir, exist_ok=True)
        filename = f"{uuid.uuid4().hex}.jpg"
        path = os.path.join(local_dir, filename)
        with open(path, "wb") as f:
            f.write(image_bytes)
    except Exception as e:
        print(f"Local disk write warning: {e}")

    # Base64 Data URI fallback: ensures scanned images render globally across BOTH local and deployed (Vercel/Render) sites
    try:
        import base64
        import io
        from PIL import Image

        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail((512, 512))
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=75)
        encoded = base64.b64encode(buf.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{encoded}"
    except Exception as e:
        print(f"Data URI generation failed: {e}")
        return f"{settings.backend_url}/static/uploads/{filename}"

