"""
Authentication routes: register, login, Google OAuth, refresh, forgot/reset password,
profile retrieval, and profile updates. Email verification uses a signed token logged to mock_emails.txt.
"""
from datetime import datetime
import os
from pathlib import Path
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    decode_token,
)
from app.db.mongodb import users_collection
from app.models.user import UserModel
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    GoogleAuthRequest,
    ProfileUpdateRequest,
    ChangePasswordRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def log_mock_email(email_type: str, recipient: str, content: str):
    """Helper to log mock email alerts to a local workspace file for easy testing."""
    workspace_dir = Path(__file__).resolve().parent.parent.parent.parent
    mock_email_file = workspace_dir / "mock_emails.txt"
    try:
        with open(mock_email_file, "a", encoding="utf-8") as f:
            f.write(f"=== MOCK EMAIL SENT AT {datetime.now().isoformat()} ===\n")
            f.write(f"Type: {email_type}\n")
            f.write(f"To: {recipient}\n")
            f.write(f"Content: {content}\n")
            f.write("=" * 60 + "\n\n")
    except Exception as e:
        print(f"Error logging mock email: {e}")


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    email_lower = payload.email.lower().strip()
    existing = await users_collection.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "An account with this email already exists.")

    total_users = await users_collection.count_documents({})
    assigned_role = "admin" if total_users == 0 else "user"

    user = UserModel(
        full_name=payload.full_name,
        email=email_lower,
        hashed_password=hash_password(payload.password),
        role=assigned_role,
        preferred_language=payload.preferred_language,
        auth_provider="local",
    )
    result = await users_collection.insert_one(user.to_dict())
    user_id = str(result.inserted_id)

    verify_token = create_access_token(user_id)
    verify_link = f"{settings.frontend_origin}/verify-email?token={verify_token}"
    log_mock_email(
        "Email Verification",
        user.email,
        f"Hi {user.full_name},\n\nThank you for registering at Darma AI. Please click the link below to verify your email:\n{verify_link}"
    )

    return UserOut(
        id=user_id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        preferred_language=user.preferred_language,
        is_verified=user.is_verified,
        avatar_url=user.avatar_url,
        auth_provider=user.auth_provider,
    )


@router.post("/verify-email")
async def verify_email(token: str):
    decoded = decode_token(token)
    if not decoded:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired verification token.")
    
    sub = decoded.get("sub")
    query = {"_id": ObjectId(sub)} if ObjectId.is_valid(sub) else {"_id": sub}
    result = await users_collection.update_one(
        query,
        {"$set": {"is_verified": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found.")
        
    return {"message": "Email has been verified successfully."}


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    email_lower = payload.email.lower().strip()
    user = await users_collection.find_one({"email": email_lower})
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")

    hashed_password = user.get("hashed_password")
    if not hashed_password and user.get("auth_provider") == "google":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "This account was registered using Google. Please use 'Continue with Google' to sign in.",
        )

    if not hashed_password or not verify_password(payload.password, hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Incorrect email or password.")

    user_id = str(user["_id"])
    return TokenResponse(
        access_token=create_access_token(user_id, role=user.get("role", "user")),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(payload: GoogleAuthRequest):
    """
    Authenticate a user using Google OAuth.
    Accepts an ID token credential (from Google Identity Services),
    an access token (from Google OAuth2 token client),
    or a demo credential for local development testing.
    """
    google_id = None
    email = None
    name = None
    picture = None

    # 1. Check for Demo development credential
    if payload.credential == "demo-google-credential" or payload.access_token == "demo-google-token":
        google_id = "google_demo_1082736491"
        email = "demo.google.user@gmail.com"
        name = "Google User (Demo)"
        picture = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"

    # 2. Check for real Google ID Token
    elif payload.credential:
        id_info = None
        if settings.google_client_id:
            try:
                id_info = id_token.verify_oauth2_token(
                    payload.credential,
                    google_requests.Request(),
                    settings.google_client_id,
                )
            except Exception:
                id_info = None

        if not id_info:
            try:
                id_info = id_token.verify_oauth2_token(
                    payload.credential,
                    google_requests.Request(),
                )
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Failed to verify Google credential: {str(e)}",
                )

        google_id = id_info.get("sub")
        email = (id_info.get("email") or "").lower().strip()
        name = id_info.get("name") or id_info.get("given_name")
        picture = id_info.get("picture")

    # 3. Check for real Google Access Token
    elif payload.access_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {payload.access_token}"},
                )
                if res.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Failed to retrieve profile from Google UserInfo API.",
                    )
                info = res.json()
                google_id = info.get("sub")
                email = (info.get("email") or "").lower().strip()
                name = info.get("name") or info.get("given_name")
                picture = info.get("picture")
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to contact Google: {str(e)}",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either 'credential' (ID token) or 'access_token' must be provided.",
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide an email address.",
        )

    if not name:
        name = email.split("@")[0].capitalize()

    # Search for existing user by Google ID or email
    user = await users_collection.find_one({"$or": [{"google_id": google_id}, {"email": email}]})

    if user:
        updates = {}
        if not user.get("google_id") and google_id:
            updates["google_id"] = google_id
        if not user.get("avatar_url") and picture:
            updates["avatar_url"] = picture
        if not user.get("is_verified"):
            updates["is_verified"] = True

        if updates:
            await users_collection.update_one({"_id": user["_id"]}, {"$set": updates})
            user.update(updates)
    else:
        total_users = await users_collection.count_documents({})
        assigned_role = "admin" if total_users == 0 else "user"

        new_user = UserModel(
            full_name=name,
            email=email,
            hashed_password="",
            role=assigned_role,
            preferred_language="en",
            is_verified=True,
            avatar_url=picture,
            auth_provider="google",
            google_id=google_id,
        )
        insert_result = await users_collection.insert_one(new_user.to_dict())
        user = new_user.to_dict()
        user["_id"] = insert_result.inserted_id

    user_id = str(user["_id"])
    return TokenResponse(
        access_token=create_access_token(user_id, role=user.get("role", "user")),
        refresh_token=create_refresh_token(user_id),
    )


@router.patch("/profile", response_model=UserOut)
async def update_profile(payload: ProfileUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Update profile details such as full name, preferred language, and avatar."""
    updates = {}
    if payload.full_name is not None and payload.full_name.strip():
        updates["full_name"] = payload.full_name.strip()
    if payload.preferred_language is not None:
        updates["preferred_language"] = payload.preferred_language
    if payload.avatar_url is not None:
        updates["avatar_url"] = payload.avatar_url

    if updates:
        await users_collection.update_one({"_id": current_user["_id"]}, {"$set": updates})
        current_user.update(updates)

    return UserOut(
        id=str(current_user["_id"]),
        full_name=current_user["full_name"],
        email=current_user["email"],
        role=current_user.get("role", "user"),
        preferred_language=current_user.get("preferred_language", "en"),
        is_verified=current_user.get("is_verified", False),
        avatar_url=current_user.get("avatar_url"),
        auth_provider=current_user.get("auth_provider", "local"),
    )


@router.post("/change-password")
async def change_password(payload: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Change user password. Requires current password if set."""
    hashed_password = current_user.get("hashed_password")
    if hashed_password:
        if not verify_password(payload.current_password, hashed_password):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password does not match.")

    new_hash = hash_password(payload.new_password)
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": new_hash}},
    )
    return {"message": "Password changed successfully."}


@router.post("/refresh", response_model=TokenResponse)
async def refresh(refresh_token: str):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token.")

    sub = payload["sub"]
    query = {"_id": ObjectId(sub)} if ObjectId.is_valid(sub) else {"_id": sub}
    user = await users_collection.find_one(query)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found.")

    user_id = str(user["_id"])
    return TokenResponse(
        access_token=create_access_token(user_id, role=user.get("role", "user")),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    email_lower = payload.email.lower().strip()
    user = await users_collection.find_one({"email": email_lower})
    if user:
        reset_token = create_access_token(str(user["_id"]))
        reset_link = f"{settings.frontend_origin}/reset-password?token={reset_token}"
        log_mock_email(
            "Password Reset Request",
            user["email"],
            f"Hi {user['full_name']},\n\nWe received a request to reset your password. Please click the link below to set a new password:\n{reset_link}"
        )
    return {"message": "If that email is registered, a password reset link has been sent."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    decoded = decode_token(payload.token)
    if not decoded:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid or expired reset token.")
    
    sub = decoded.get("sub")
    query = {"_id": ObjectId(sub)} if ObjectId.is_valid(sub) else {"_id": sub}
    await users_collection.update_one(
        query,
        {"$set": {"hashed_password": hash_password(payload.new_password)}},
    )
    return {"message": "Password has been reset successfully."}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=str(current_user["_id"]),
        full_name=current_user["full_name"],
        email=current_user["email"],
        role=current_user.get("role", "user"),
        preferred_language=current_user.get("preferred_language", "en"),
        is_verified=current_user.get("is_verified", False),
        avatar_url=current_user.get("avatar_url"),
        auth_provider=current_user.get("auth_provider", "local"),
    )
