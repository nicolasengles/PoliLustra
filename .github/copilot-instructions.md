# PoliLustra AI Development Guide

This document provides essential context for AI agents working with the PoliLustra codebase.

## System Overview

PoliLustra is an educational image generation platform that:
- Generates AI images tailored for educational content using Stability AI
- Translates prompts between Portuguese and English
- Stores image history per user
- Requires authentication for core features

### Key Components

1. **Main Express Server** (`server.js`)
   - Handles user auth, image generation, and web routes
   - Uses EJS templating for views
   - Integrates with Cloudinary for image storage

2. **Translation Microservice** (`servico-traducao/app.py`)
   - Flask server running on port 5001
   - Translates prompts from Portuguese to English before sending to Stability AI

3. **Database Models**
   - `User.js`: Handles user accounts and auth
   - `Image.js`: Stores generated image metadata and URLs

## Development Workflow

### Environment Setup

1. Required environment variables (in `.env`):
   ```
   MONGO_URI=mongodb://...
   STABILITY_API_KEY=...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   EMAIL_USER=...
   EMAIL_PASS=...
   ```

2. Run development servers:
   ```
   npm run dev  # Main Express server on port 3000
   cd servico-traducao && python app.py  # Translation service on port 5001
   ```

### Key Integration Points

1. **Image Generation Flow**:
   - Frontend sends prompt in Portuguese to `/api/ia/generate`
   - Server translates via microservice
   - Translated prompt sent to Stability AI
   - Result uploaded to Cloudinary
   - Image metadata saved to MongoDB

2. **Authentication**:
   - Uses session-based auth (express-session)
   - Protected routes use `protect` middleware from `authMiddleware.js`
   - Email domain validation ready but commented out (see `User.js`)

## Project Conventions

1. **Route Organization**:
   - Web routes render EJS views
   - API routes under `/api` prefix
   - Protected routes use `protect` middleware

2. **Error Handling**:
   - API routes use try/catch blocks
   - Detailed error messages sent in JSON responses
   - Translation service errors logged via Flask logger

3. **File Structure**:
   - `Models/` - Mongoose schemas
   - `views/` - EJS templates
   - `public/` - Static assets
   - `middleware/` - Express middlewares

## Common Tasks

1. **Adding New Image Generation Features**:
   - Update prompt construction in `/api/ia/generate`
   - Add new fields to `Image.js` schema if needed
   - Update corresponding frontend in `public/js/gerador.js`

2. **Modifying Auth Logic**:
   - User model in `Models/User.js`
   - Auth routes in `server.js`
   - Protected route middleware in `middleware/authMiddleware.js`

3. **Translation Service Changes**:
   - Modify `servico-traducao/app.py`
   - Update error handling and logging as needed
   - Test with both Portuguese and English inputs