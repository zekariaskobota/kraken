# Client Environment Variables Setup

Create a `.env` file in the `client` directory with the following variables:

## Required Environment Variables

```env
# Backend API URL
# For local development, use: http://localhost:5000
# For production, use your production backend URL
VITE_BACKEND_URL=http://localhost:5000

# Google OAuth Client ID
# Get this from Google Cloud Console: https://console.cloud.google.com/
# Create OAuth 2.0 Client ID in APIs & Services > Credentials
# Use the same Client ID for both frontend and backend
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

## Setup Instructions

1. Copy this template to create your `.env` file:
   ```bash
   cd client
   cp ENV_SETUP.md .env
   # Then edit .env and replace the placeholder values
   ```

2. **VITE_BACKEND_URL**: 
   - For local development: `http://localhost:5000`
   - For production: Your production backend URL (e.g., `https://api.yourdomain.com`)

3. **VITE_GOOGLE_CLIENT_ID**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Application type: **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for local development)
     - Your production domain
   - Copy the Client ID and paste it here

## Important Notes

- All environment variables in Vite must be prefixed with `VITE_` to be accessible in the browser
- Never commit your `.env` file to version control (it's already in `.gitignore`)
- Restart your development server after changing environment variables
- For production, set these variables in your hosting platform's environment settings

## Verification

After setting up your `.env` file, verify it's working:

1. Restart your development server: `npm run dev`
2. Check the browser console - there should be no errors about missing environment variables
3. Try logging in with Google - it should work if the Client ID is correct

