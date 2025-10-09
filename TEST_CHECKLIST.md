# 🧪 Test Checklist - SIH Alumni Management System

**Date:** October 1, 2025  
**Tester:** Sailesh  
**Version:** 1.0

---

## ✅ 1. Sidebar Consistency Test

### Test Alumni Pages
| Page | Sidebar Present | Three-Dot Menu | Notification Bell | Theme Toggle | Status |
|------|----------------|----------------|-------------------|--------------|--------|
| Dashboard | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Announcements | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Events | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Jobs | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Leaderboard | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Marketplace | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Mentorship | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Network | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Connect | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Donations | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Feedback | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Profile | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Edit Profile | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**Instructions:**
1. Login as alumni user
2. Visit each page listed above
3. Check if sidebar looks identical (same colors, spacing, fonts)
4. Verify three-dot menu appears in bottom-left
5. Verify notification bell appears in top-right of sidebar
6. Click theme toggle and verify it works

---

## ✅ 2. Theme Toggle Test

### Admin Dashboard
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Click three-dot menu | Menu opens | ⬜ | ⬜ |
| Click "Theme" option | Theme switches | ⬜ | ⬜ |
| Refresh page | Theme persists | ⬜ | ⬜ |
| Dark mode colors | All elements readable | ⬜ | ⬜ |
| Light mode colors | All elements readable | ⬜ | ⬜ |

### Alumni Dashboard
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Click three-dot menu | Menu opens | ⬜ | ⬜ |
| Click "Toggle Theme" | Theme switches | ⬜ | ⬜ |
| Navigate to Events page | Theme consistent | ⬜ | ⬜ |
| Navigate to Jobs page | Theme consistent | ⬜ | ⬜ |
| Refresh any page | Theme persists | ⬜ | ⬜ |

### Student Dashboard
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Click three-dot menu | Menu opens | ⬜ | ⬜ |
| Click theme toggle | Theme switches | ⬜ | ⬜ |
| Refresh page | Theme persists | ⬜ | ⬜ |

---

## ✅ 3. Dark Theme Color Consistency

### Pages to Test in Dark Mode
| Page | Background Color | Text Color | Cards | Buttons | Status |
|------|-----------------|------------|-------|---------|--------|
| Alumni Mentorship | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Alumni Network | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Alumni Connect | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Alumni Donations | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Alumni Feedback | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

**Instructions:**
1. Switch to dark mode
2. Visit each page
3. Check if:
   - Background is dark (#0d1117)
   - Text is light (#e6edf3)
   - Cards have proper contrast (#161b22)
   - Buttons are visible and readable
   - No white flashes on page load

---

## ✅ 4. Notification System Test

### Backend API Tests

**Test 1: Get Notifications**
```javascript
fetch('/api/notifications')
  .then(r => r.json())
  .then(console.log)
```
- [ ] Returns JSON array
- [ ] Contains notification objects
- [ ] Shows correct user's notifications

**Test 2: Mark Single as Read**
```javascript
fetch('/api/notifications/NOTIFICATION_ID/read', { method: 'PATCH' })
  .then(r => r.json())
  .then(console.log)
```
- [ ] Updates notification read status
- [ ] Returns updated notification object

**Test 3: Mark All as Read**
```javascript
fetch('/api/notifications/mark-all-read', { method: 'PATCH' })
  .then(r => r.json())
  .then(console.log)
```
- [ ] Marks all notifications as read
- [ ] Returns count of updated notifications

**Test 4: Create Notification (Testing)**
```javascript
// First get your user ID from console: Alumini.findOne({email: 'your@email.com'})
fetch('/api/notifications/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'YOUR_USER_ID',
    userModel: 'alumini',
    title: 'Test Notification',
    message: 'This is a test message',
    icon: 'bell',
    type: 'general'
  })
})
```
- [ ] Creates new notification
- [ ] Returns created notification object

### Frontend UI Tests
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Bell icon visible | Shows in sidebar top | ⬜ | ⬜ |
| Badge shows count | Red badge with number | ⬜ | ⬜ |
| Click bell | Dropdown opens | ⬜ | ⬜ |
| No notifications | Shows "No notifications" | ⬜ | ⬜ |
| Has notifications | Shows list of notifications | ⬜ | ⬜ |
| Click notification | Marks as read | ⬜ | ⬜ |
| Click "Mark all read" | All marked as read | ⬜ | ⬜ |
| Unread count | Badge updates correctly | ⬜ | ⬜ |
| Auto-refresh | Fetches every 60 seconds | ⬜ | ⬜ |

---

## ✅ 5. File Organization Test

### Check Folder Structure
- [ ] `views/pages/alumni/` exists with 13 files
- [ ] `views/pages/student/` exists with 13 files
- [ ] `views/pages/admin/` exists with 3 files
- [ ] `views/common/` exists with partials and login/signup
- [ ] Original files still in `views/` root

### Verify Easy Access
- [ ] Can easily find alumni pages in one folder
- [ ] Can easily find student pages in one folder
- [ ] Can easily find admin pages in one folder
- [ ] Partials clearly separated in common folder

---

## ✅ 6. Backend Functionality Test

### Forms & Inputs
| Feature | Page | Works | Notes |
|---------|------|-------|-------|
| Search mentors | Alumni Mentorship | ⬜ | ⬜ |
| Filter jobs | Alumni Jobs | ⬜ | ⬜ |
| Search connections | Alumni Network | ⬜ | ⬜ |
| Send message | Alumni Connect | ⬜ | ⬜ |
| Submit donation | Alumni Donations | ⬜ | ⬜ |
| Submit feedback | Alumni Feedback | ⬜ | ⬜ |
| RSVP event | Alumni Events | ⬜ | ⬜ |
| Apply to job | Alumni Jobs | ⬜ | ⬜ |

### Database Operations
- [ ] Notifications saved to MongoDB
- [ ] Read status persists after refresh
- [ ] User-specific notifications work correctly
- [ ] Alumni/student/admin models separate correctly

---

## ✅ 7. Edge Cases & Error Handling

| Test | Expected Behavior | Status |
|------|------------------|--------|
| Not logged in | Notification API returns 401 | ⬜ |
| Invalid notification ID | Returns 404 error | ⬜ |
| Network offline | Shows error message | ⬜ |
| Theme toggle spam-click | No visual glitches | ⬜ |
| Sidebar on mobile | Responsive and works | ⬜ |
| Long notification message | Truncates properly | ⬜ |
| 100+ notifications | Pagination works | ⬜ |

---

## ✅ 8. Performance Test

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Page load time | < 2s | ⬜ | ⬜ |
| Theme switch time | < 100ms | ⬜ | ⬜ |
| Notification fetch | < 500ms | ⬜ | ⬜ |
| Database query time | < 200ms | ⬜ | ⬜ |
| CSS file size | < 100KB | ⬜ | ⬜ |

---

## ✅ 9. Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## ✅ 10. Accessibility Test

- [ ] All buttons have aria-labels
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus states visible
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Forms have proper labels

---

## 📝 Notes & Issues

### Issues Found:
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Recommendations:
1. _______________________________________
2. _______________________________________
3. _______________________________________

---

## ✅ Final Sign-off

- [ ] All critical tests passed
- [ ] Known issues documented
- [ ] Performance acceptable
- [ ] Ready for production

**Tested by:** _________________  
**Date:** _________________  
**Sign-off:** _________________

---

## 🚀 Next Steps After Testing

1. **If tests pass:**
   - Commit all changes
   - Create git tag for this version
   - Deploy to staging environment
   - Notify team of successful deployment

2. **If issues found:**
   - Document all issues in detail
   - Prioritize by severity (Critical/High/Medium/Low)
   - Assign to appropriate developer
   - Retest after fixes

3. **Future enhancements:**
   - Add email notifications
   - Implement notification preferences
   - Add notification categories
   - Create admin panel for bulk notifications
   - Add notification search/filter
