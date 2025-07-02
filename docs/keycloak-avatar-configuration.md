# Keycloak Avatar Configuration Guide

Configure Keycloak to fetch and include avatar URLs from OAuth providers (Google, GitHub, LinkedIn) in JWT tokens.

## Configuration Steps

For each provider, you need to configure two mappers:

1. **Identity Provider Mapper** - extracts avatar from provider's response
2. **Client Scope Mapper** - includes avatar in JWT tokens

## 1. Google OAuth Configuration

### Step 1: Configure Identity Provider

1. Go to **Realm Settings** → **Identity Providers** → **Google**
2. In **Settings** tab, set **Scopes** to: `openid profile email`
3. Click on the **Mappers** tab
4. Create a new mapper:
   - **Name**: `google-avatar`
   - **Mapper Type**: `Attribute Importer`
   - **Social Profile JSON Field Path**: `picture`
   - **User Attribute Name**: `avatar_url`

### Step 2: Configure Client Scope

1. Go to **Client Scopes** → **profile** (or **Clients** → **[Your Client]** → **Client scopes** → **[client-name]-dedicated**)
2. Click on the **Mappers** tab
3. Create a new mapper:
   - **Name**: `avatar_url`
   - **Mapper Type**: `User Attribute`
   - **User Attribute**: `avatar_url`
   - **Token Claim Name**: `avatar_url`
   - **Claim JSON Type**: `String`
   - **Add to ID token**: ON
   - **Add to access token**: ON

## 2. GitHub OAuth Configuration

### Step 1: Configure Identity Provider

1. Go to **Realm Settings** → **Identity Providers** → **GitHub**
2. In **Settings** tab, set **Scopes** to: `user:email read:user`
3. Click on the **Mappers** tab
4. Create a new mapper:
   - **Name**: `github-avatar`
   - **Mapper Type**: `Attribute Importer`
   - **Social Profile JSON Field Path**: `avatar_url`
   - **User Attribute Name**: `avatar_url`

### Step 2: Configure Client Scope

1. Go to **Client Scopes** → **profile** (or **Clients** → **[Your Client]** → **Client scopes** → **[client-name]-dedicated**)
2. Click on the **Mappers** tab
3. Create a new mapper:
   - **Name**: `avatar_url`
   - **Mapper Type**: `User Attribute`
   - **User Attribute**: `avatar_url`
   - **Token Claim Name**: `avatar_url`
   - **Claim JSON Type**: `String`
   - **Add to ID token**: ON
   - **Add to access token**: ON

## 3. LinkedIn OAuth Configuration

### Step 1: Configure Identity Provider

1. Go to **Realm Settings** → **Identity Providers** → **LinkedIn**
2. In **Settings** tab, set **Scopes** to: `openid profile email`
3. Click on the **Mappers** tab
4. Create a new mapper:
   - **Name**: `linkedin-avatar`
   - **Mapper Type**: `Attribute Importer`
   - **Social Profile JSON Field Path**: `picture`
   - **User Attribute Name**: `avatar_url`

### Step 2: Configure Client Scope

1. Go to **Client Scopes** → **profile** (or **Clients** → **[Your Client]** → **Client scopes** → **[client-name]-dedicated**)
2. Click on the **Mappers** tab
3. Create a new mapper:
   - **Name**: `avatar_url`
   - **Mapper Type**: `User Attribute`
   - **User Attribute**: `avatar_url`
   - **Token Claim Name**: `avatar_url`
   - **Claim JSON Type**: `String`
   - **Add to ID token**: ON
   - **Add to access token**: ON

**Note**: LinkedIn requires "Sign In with LinkedIn using OpenID Connect" product and a Company Page.

## 4. Client Configuration

### Ensure Profile Scope Access

1. Go to **Clients** → **[Your Client]** → **Client Scopes**
2. Verify `profile` is in **Assigned Default Client Scopes**
