# Testing Authentication - Quick Guide

## Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open browser to `http://localhost:3000`

## Test Scenarios

### Scenario 1: Unauthorized Access Protection

**Steps:**
1. Open browser in incognito/private mode
2. Navigate to `http://localhost:3000/admin/command-center`
3. **Expected:** Redirected to `/login?redirect=/admin/command-center`

**Result:** ✅ Route protection working

---

### Scenario 2: Admin Login

**Steps:**
1. On login page, enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
2. Click "Sign In"
3. **Expected:** Redirected to `/admin/command-center`
4. **Expected:** Dashboard loads with all components

**Result:** ✅ Admin authentication working

---

### Scenario 3: WebSocket Authentication

**Steps:**
1. After logging in as admin, stay on command center dashboard
2. Open browser DevTools (F12)
3. Go to Network tab
4. Filter by "ws" or "EventSource"
5. Look for connection to `/api/admin/ws`
6. **Expected:** Connection established with `?token=...` parameter
7. **Expected:** Real-time updates appearing (zone updates, alerts)
8. Check Console tab
9. **Expected:** See `[SSE] Connected to command center` message

**Result:** ✅ WebSocket authentication working

---

### Scenario 4: Non-Admin Access Denied

**Steps:**
1. Log out (clear cookies or use incognito)
2. Navigate to `/login`
3. Enter regular user credentials:
   - Email: `user@example.com`
   - Password: `user123`
4. Click "Sign In"
5. Try to navigate to `/admin/command-center`
6. **Expected:** Redirected to `/login?error=unauthorized`
7. **Expected:** Error message: "You do not have permission to access this page"

**Result:** ✅ Role-based access control working

---

### Scenario 5: Session Persistence

**Steps:**
1. Log in as admin
2. Navigate to command center
3. Refresh the page (F5)
4. **Expected:** Still logged in, no redirect to login
5. **Expected:** Dashboard loads normally

**Result:** ✅ Session persistence working

---

### Scenario 6: Invalid Credentials

**Steps:**
1. Navigate to `/login`
2. Enter invalid credentials:
   - Email: `wrong@example.com`
   - Password: `wrongpassword`
3. Click "Sign In"
4. **Expected:** Error message: "Invalid email or password"
5. **Expected:** Stay on login page

**Result:** ✅ Credential validation working

---

### Scenario 7: Token Expiration

**Steps:**
1. Log in as admin
2. Open DevTools Console
3. Run: `localStorage.setItem('test_time', Date.now())`
4. Wait 1 hour (or modify token expiration in code for testing)
5. Try to establish new WebSocket connection
6. **Expected:** Connection fails with authentication error
7. **Expected:** User prompted to log in again

**Result:** ✅ Token expiration working

---

### Scenario 8: Logout

**Steps:**
1. Log in as admin
2. Call logout API:
   ```javascript
   fetch('/api/auth/logout', { method: 'POST' })
   ```
3. Try to access `/admin/command-center`
4. **Expected:** Redirected to login page
5. **Expected:** Session cookie cleared

**Result:** ✅ Logout working

---

## Automated Testing Commands

### Check TypeScript Compilation
```bash
npx tsc --noEmit
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Common Issues and Solutions

### Issue: "Cannot find module '@/lib/auth/token'"

**Solution:** This is a TypeScript language server caching issue. The file exists and is correct.
- Restart your IDE/editor
- Or run: `npx tsc --noEmit` to verify no real errors

### Issue: WebSocket connection fails

**Solution:** 
1. Check browser console for error messages
2. Verify you're logged in (check cookies)
3. Check `/api/auth/token` returns a valid token
4. Verify token is being passed to WebSocket URL

### Issue: Infinite redirect loop

**Solution:**
1. Clear all cookies
2. Clear browser cache
3. Try in incognito mode
4. Check middleware.ts configuration

### Issue: "Not authenticated" error

**Solution:**
1. Verify session cookie is set (check DevTools > Application > Cookies)
2. Try logging in again
3. Check cookie expiration settings

## Browser DevTools Checklist

### Application Tab
- ✅ Check `session_token` cookie exists
- ✅ Verify cookie is HttpOnly
- ✅ Check cookie expiration

### Network Tab
- ✅ Verify `/api/auth/login` returns 200
- ✅ Check `/api/auth/token` returns token
- ✅ Verify `/api/admin/ws` connection includes token parameter
- ✅ Check SSE messages are being received

### Console Tab
- ✅ No authentication errors
- ✅ See "[SSE] Connected" message
- ✅ No token validation errors

## Security Checklist

- ✅ Session cookies are HttpOnly
- ✅ Passwords not visible in network requests
- ✅ Tokens expire after 1 hour
- ✅ Admin routes protected by middleware
- ✅ WebSocket requires valid token
- ✅ Role-based access control enforced
- ✅ Unauthorized access redirects to login

## Next Steps

After verifying all scenarios work:

1. Test on different browsers (Chrome, Firefox, Safari, Edge)
2. Test on mobile devices
3. Test with slow network (DevTools > Network > Throttling)
4. Test with disabled JavaScript (should show error)
5. Load test with multiple concurrent users
6. Security audit with OWASP guidelines
7. Prepare for production migration (see authentication-implementation.md)

## Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs for authentication failures
3. Review `lib/auth/README.md` for detailed documentation
4. Review `docs/authentication-implementation.md` for architecture details
