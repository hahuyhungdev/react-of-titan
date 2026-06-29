# 🔐 Security

## Authentication

- Auth tokens stored in `localStorage` (key: `auth_token`)
- `apiClient` auto-injects the token into request headers
- Auth feature manages login, register, logout flows

For production, consider:

- **HttpOnly cookies** for tokens (more secure than localStorage)
- **Token refresh** logic for expired tokens
- **Secure flag** and **SameSite** cookie attributes

## Authorization

- Client-side authorization for UX (show/hide based on auth state)
- Always validate permissions server-side — client-side checks are for UX only

## XSS Prevention

- React escapes JSX content by default
- Never use `dangerouslySetInnerHTML` without sanitization
- Validate and sanitize user input at boundaries
- Use DOMPurify for HTML content when needed

## API Security

- All API requests go through the shared `apiClient`
- Auth token is injected automatically — never hardcode tokens
- API base URL is configured via environment variables

## Environment Variables

- `.env.example` documents required variables
- Never commit `.env` files with real values
- Vite exposes only `VITE_` prefixed variables to the client

## Content Security Policy

For production, configure a CSP header:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
```

## AI Assistance

When using AI assistants, ask for a focused security review before changes that touch auth, API calls, token handling, or user input.
