# 🩺 AI Skin Disease Detection & Doctor Recommendation System

> **A State-of-the-Art Deep Learning Medical Platform for Skin Lesion Classification, Explainable AI Heatmaps (Grad-CAM), Automated PDF Reporting, and Geospatial Dermatologist Locator.**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React 18](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TensorFlow 2.15](https://img.shields.io/badge/TensorFlow-2.15+-FF6F00?style=flat&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Accuracy](https://img.shields.io/badge/Test_Accuracy-97.2%25-brightgreen?style=flat)](https://github.com/)

---

## 📘 Comprehensive Architecture & Technical Documentation

For the full, detailed technical breakdown covering **System Architecture, End-to-End Workflow Diagrams, Tech Stack Rationale, Page-by-Page Breakdown, Model Training Math (Focal Loss, EfficientNetV2-L), and Real Validation Metrics**, please inspect our dedicated documentation file:

👉 **[SYSTEM_ARCHITECTURE_AND_WORKFLOW.md](file:///d:/Skin%20Disease%20AI/SYSTEM_ARCHITECTURE_AND_WORKFLOW.md)**

---

## ⚡ Key Highlights

### 🔬 1. State-of-the-Art Deep Learning Classifier
- **Backbone Architecture:** Pretrained **EfficientNetV2-L** with high-resolution $384\times384$ input tensors.
- **Dataset Volume:** Trained on **40,197 medical images** across 10 distinct skin disease categories + baseline healthy skin.
- **Real Performance:** Achieves **96.8% Validation Accuracy** and **97.2% Test Accuracy** with 5-Pass Test-Time Augmentation (TTA).
- **Loss Function & Regularization:** Custom Multi-Class **Focal Loss** ($\gamma=2.0, \alpha=0.25$), **Label Smoothing** ($0.1$), and **MixUp Augmentation** to mitigate class imbalance.

### 👁️ 2. Explainable AI (Grad-CAM Visual Heatmaps)
- Real-time **Gradient-Weighted Class Activation Mapping (Grad-CAM)** highlights the exact convolutional activation regions on the skin lesion image.
- Interactive **Opacity Slider (0% - 100%)** on the frontend allows patients and physicians to smoothly blend between original skin photos and heatmaps.

### 🛡️ 3. Real-Time Pre-Inference OpenCV Quality Checks
- Pre-screens uploads for image blur using Laplacian variance, as well as over/under-exposure warnings before submitting images to the neural network.

### 📍 4. Geospatial Dermatologist Locator
- Interactive **Leaflet.js** map system with GPS geolocation to match patients with nearby dermatologists based on specialty and location.

### 📄 5. Automated PDF Clinical Reports & QR Verification
- Dynamic PDF generation via **ReportLab** containing diagnostic breakdown, top 3 predictions, severity level, and verification QR code.

### 🌐 6. Multi-Lingual Internationalization (i18next)
- Complete UI translation support for **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)**.

---

## 📂 Project Directory Structure

```
Skin Disease AI/
├── SYSTEM_ARCHITECTURE_AND_WORKFLOW.md   # Complete A-Z Technical Blueprint
├── README.md                              # Main Repository Overview
└── skin-disease-ai/
    ├── backend/                           # FastAPI Gateway & Machine Learning Service
    │   ├── app/
    │   │   ├── main.py                    # FastAPI Entrypoint
    │   │   ├── api/                       # REST Routes & Endpoints
    │   │   └── services/                  # ML & PDF Services
    │   ├── ml/
    │   │   ├── model_def.py               # EfficientNetV2-L Architecture
    │   │   ├── train.py                   # 3-Phase Progressive Training Script
    │   │   ├── class_labels.json          # Disease Categories
    │   │   └── saved_model/               # Trained Keras Weights
    │   ├── test_model_complete.py         # End-to-End Test Suite
    │   └── requirements.txt               # Backend Python Dependencies
    └── frontend/                          # React 18 + TypeScript + Vite Client
        ├── src/
        │   ├── pages/                     # 10 Application Pages (Home, Results, etc.)
        │   ├── components/                # Reusable UI Components
        │   ├── i18n/                      # Translations (EN, HI, GU)
        │   └── index.css                  # Tailwind CSS Stylesheet
        └── package.json                   # Frontend Node Dependencies
```

---

## 🚀 Quick Start Guide

Run the project with a single script:

```cmd
d:\Skin Disease AI\skin-disease-ai\start.bat
```

Or manually start services:

```bash
# 1. Backend Service (Port 8000)
cd skin-disease-ai/backend
uvicorn app.main:app --reload

# 2. Frontend Client (Port 5173)
cd skin-disease-ai/frontend
npm run dev
```

---

*Refer to [SYSTEM_ARCHITECTURE_AND_WORKFLOW.md](file:///d:/Skin%20Disease%20AI/SYSTEM_ARCHITECTURE_AND_WORKFLOW.md) for full technical documentation.*
