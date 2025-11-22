# Testing Guide - Backend Candidate Loading

## Pre-Testing Checklist

- [ ] Node.js and npm installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Database connection working
- [ ] Backend API running

## Test Scenarios

### Test 1: Initial Page Load with Empty Database

**Setup:**
1. Ensure database has NO candidates
2. Start development server: `npm run dev`

**Expected Behavior:**
- Page loads
- "Toutes les Catégories" section shows loading spinner
- Spinner displays: "Chargement des candidats depuis le serveur..."
- After 2-3 seconds, shows: "Aucun candidat disponible"

**Verification:**
- [ ] Loading spinner appears
- [ ] Spinner disappears after backend responds
- [ ] Empty state message is displayed
- [ ] No errors in browser console

---

### Test 2: Page Load with Candidates in Database

**Setup:**
1. Seed database with candidates: `npx ts-node scripts/seedViaAPI.ts`
2. Refresh page: `http://localhost:3000`

**Expected Behavior:**
- Page loads
- Loading spinner appears briefly
- All candidates appear grouped by category
- Each candidate shows:
  - Profile image
  - Name
  - Vote count
  - Vote percentage
  - Progress bar

**Verification:**
- [ ] Loading spinner appears
- [ ] Candidates load within 3 seconds
- [ ] All categories are displayed
- [ ] Images load correctly
- [ ] Vote counts are visible
- [ ] Percentages are calculated correctly
- [ ] Progress bars animate smoothly

---

### Test 3: Category Expansion

**Setup:**
1. Page has loaded with candidates
2. Find a category with more than 5 candidates

**Expected Behavior:**
- "Voir Plus" button appears below first 5 candidates
- Clicking "Voir Plus" expands to show all candidates
- Button text changes to "Voir Moins"
- Clicking "Voir Moins" collapses back to 5 candidates

**Verification:**
- [ ] "Voir Plus" button appears
- [ ] All candidates display when expanded
- [ ] Button text toggles correctly
- [ ] Collapse works as expected

---

### Test 4: Error Handling

**Setup:**
1. Start development server
2. Stop the backend/database
3. Refresh page

**Expected Behavior:**
- Loading spinner appears
- After timeout, error message displays
- Error message shows: "Erreur de chargement"
- Specific error details are shown

**Verification:**
- [ ] Error state is displayed
- [ ] Error message is readable
- [ ] No blank page or frozen spinner
- [ ] User can still navigate

---

### Test 5: Network Request Verification

**Setup:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Load page: `http://localhost:3000`

**Expected Behavior:**
- Request to `/api/candidates` appears
- Request method: GET
- Response status: 200
- Response body contains: `{ success: true, candidates: [...] }`

**Verification:**
- [ ] `/api/candidates` request appears
- [ ] Status is 200 (success)
- [ ] Response format is correct
- [ ] Response time is reasonable (<1s)

---

### Test 6: Voting Functionality

**Setup:**
1. Page has loaded with candidates
2. Click on any candidate

**Expected Behavior:**
- Voting modal opens
- Candidate details are displayed
- Vote count selector works
- Payment method selection works
- Phone number input works
- Submit button is functional

**Verification:**
- [ ] Modal opens with correct candidate
- [ ] Vote count can be increased/decreased
- [ ] Payment methods can be selected
- [ ] Phone number input accepts input
- [ ] Submit button is clickable

---

### Test 7: Mobile Responsiveness

**Setup:**
1. Open page on mobile device or use DevTools mobile emulation
2. Test on different screen sizes (320px, 768px, 1024px)

**Expected Behavior:**
- Layout adapts to screen size
- Candidates display in correct grid (2 columns on mobile, 5 on desktop)
- Images are properly sized
- Text is readable
- Buttons are clickable

**Verification:**
- [ ] Mobile layout (320px): 2 columns
- [ ] Tablet layout (768px): 3 columns
- [ ] Desktop layout (1024px): 5 columns
- [ ] All text is readable
- [ ] Images load correctly
- [ ] Buttons are accessible

---

### Test 8: Performance

**Setup:**
1. Open DevTools Performance tab
2. Record page load
3. Load page with candidates

**Expected Behavior:**
- Page loads in <3 seconds
- First Contentful Paint (FCP) <2 seconds
- Largest Contentful Paint (LCP) <3 seconds
- No layout shifts
- Smooth animations

**Verification:**
- [ ] Page load time <3s
- [ ] FCP <2s
- [ ] LCP <3s
- [ ] No layout shifts
- [ ] Animations are smooth

---

### Test 9: Data Consistency

**Setup:**
1. Load page multiple times
2. Check if data is consistent

**Expected Behavior:**
- Same candidates appear each time
- Vote counts are consistent
- Percentages are calculated correctly
- Order is consistent

**Verification:**
- [ ] Same candidates appear
- [ ] Vote counts match
- [ ] Percentages are accurate
- [ ] Order is consistent

---

### Test 10: Browser Compatibility

**Setup:**
1. Test on different browsers:
   - Chrome/Chromium
   - Firefox
   - Safari
   - Edge

**Expected Behavior:**
- Page loads correctly
- All features work
- Styling is consistent
- No console errors

**Verification:**
- [ ] Chrome: Works correctly
- [ ] Firefox: Works correctly
- [ ] Safari: Works correctly
- [ ] Edge: Works correctly

---

## Automated Testing

### Unit Tests (Optional)

```bash
npm run test
```

### E2E Tests (Optional)

```bash
npm run test:e2e
```

---

## Performance Benchmarks

### Expected Metrics

| Metric | Target | Acceptable |
|--------|--------|-----------|
| Page Load Time | <2s | <3s |
| First Contentful Paint | <1.5s | <2s |
| Largest Contentful Paint | <2.5s | <3s |
| API Response Time | <500ms | <1s |
| Image Load Time | <1s | <2s |

---

## Debugging Tips

### Check Network Requests
```javascript
// In browser console
fetch('/api/candidates')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Check Component State
```javascript
// React DevTools
// Inspect NBDanceAwardPage component
// Check: candidates, loading, error states
```

### Check Browser Console
- Look for error messages
- Check for network errors
- Check for React warnings

### Check Server Logs
```bash
# Terminal where npm run dev is running
# Look for API request logs
# Look for database errors
```

---

## Common Issues & Solutions

### Issue: Loading spinner never disappears

**Cause:** Backend not responding

**Solution:**
1. Check if backend is running
2. Check if database is accessible
3. Check network tab for failed requests
4. Check server logs for errors

### Issue: Error message appears

**Cause:** Backend error or network issue

**Solution:**
1. Read error message carefully
2. Check backend logs
3. Verify database connection
4. Verify API endpoint is correct

### Issue: Candidates don't load

**Cause:** Database is empty

**Solution:**
1. Run seed script: `npx ts-node scripts/seedViaAPI.ts`
2. Verify candidates were added
3. Refresh page

### Issue: Images don't load

**Cause:** Image paths are incorrect

**Solution:**
1. Check image paths in database
2. Verify images exist in `/public/dancers/`
3. Check browser console for 404 errors

### Issue: Vote counts are wrong

**Cause:** Data not synced with backend

**Solution:**
1. Refresh page
2. Check database values
3. Verify calculations are correct

---

## Test Report Template

```markdown
# Test Report - [Date]

## Environment
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/Mac/Linux]
- Node Version: [version]
- Database: [Firebase/PostgreSQL/MongoDB]

## Tests Passed
- [ ] Test 1: Initial Load
- [ ] Test 2: With Candidates
- [ ] Test 3: Category Expansion
- [ ] Test 4: Error Handling
- [ ] Test 5: Network Requests
- [ ] Test 6: Voting
- [ ] Test 7: Mobile
- [ ] Test 8: Performance
- [ ] Test 9: Data Consistency
- [ ] Test 10: Browser Compatibility

## Issues Found
1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [steps]
   - Expected: [expected behavior]
   - Actual: [actual behavior]

## Performance Metrics
- Page Load Time: [time]
- FCP: [time]
- LCP: [time]
- API Response Time: [time]

## Recommendations
1. [Recommendation]
2. [Recommendation]

## Sign-off
- Tester: [Name]
- Date: [Date]
- Status: [Pass/Fail]
```

---

## Continuous Testing

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] Performance meets targets
- [ ] Mobile responsive
- [ ] Cross-browser compatible
- [ ] Error handling works
- [ ] Data is consistent

### Post-Deployment Checklist
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify user feedback
- [ ] Monitor API response times
- [ ] Check database performance

---

**Last Updated:** November 22, 2025
**Status:** ✅ Ready for testing
