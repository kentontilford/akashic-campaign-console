# Akashic Intelligence Campaign Console - Beta Testing Guide

## Welcome Beta Testers! 🚀

Thank you for helping us test the Akashic Intelligence Campaign Console. This guide will walk you through the key features and help you provide valuable feedback.

## Your Login Credentials

### Simon Demo
- **Email**: simon@akashic.com
- **Password**: SimonBeta2024!

### Eric Demo
- **Email**: eric@akashic.com
- **Password**: EricBeta2024!

### Hossein Demo
- **Email**: hossein@akashic.com
- **Password**: HosseinBeta2024!

## Getting Started

1. **Login**: Visit `/login` and use your credentials
2. **Dashboard**: After login, you'll see your campaign dashboard
3. **Demo Campaign**: You have a pre-created campaign with sample data

## Key Features to Test

### 1. 🗺️ Election Mapping (NEW!)
**URL**: `/mapping`

This is our flagship feature showcasing 132 years of election data.

**What to test:**
- Switch between "Election Results" and "Demographics" views
- Compare different election years (try 2016 → 2020, or 2020 → 2024)
- Hover over counties to see detailed information
- Click on counties to view comprehensive profiles
- Test the "State Only" view with different states
- Export maps as PNG for social sharing

**Check for:**
- Map loads quickly and smoothly
- Colors clearly show Democratic (blue) vs Republican (red) shifts
- County tooltips display accurate information
- Export creates high-quality images with Akashic branding

### 2. 📝 Message Creation with Version Control
**URL**: `/messages/new`

Our unique Version Control system adapts messages for different audiences.

**What to test:**
- Create a new message
- Select different "Version Profiles" (Union, Chamber, Youth, Senior, Rural, Urban)
- Use AI assistance to generate content
- Compare versions side-by-side
- Save multiple versions of the same message

**Check for:**
- AI generates appropriate content for each audience
- Version comparisons clearly show differences
- All platforms work (Email, Facebook, Twitter, etc.)

### 3. 🎯 Campaign Management
**URL**: `/campaigns/[your-campaign-id]`

**What to test:**
- View your campaign overview
- Edit campaign settings
- Add team members (use test emails)
- Review campaign activity feed

**Check for:**
- All data displays correctly
- Settings save properly
- Activity tracking works

### 4. 📊 Comprehensive Onboarding
**URL**: `/onboarding` (for new users)

If you want to test the full onboarding:
1. Register a new account at `/register`
2. Complete all 9 onboarding steps
3. Verify the candidate profile is saved correctly

**Check for:**
- All form fields work properly
- Progress is saved between steps
- Final review shows all entered data

### 5. 📅 Message Scheduling
**URL**: `/scheduled`

**What to test:**
- Schedule a message for future publishing
- View scheduled messages calendar
- Edit or cancel scheduled messages

### 6. ✅ Approval Workflow
**URL**: `/approvals`

**What to test:**
- Submit a message for approval
- Review and approve/reject messages
- Add comments to approval decisions

## Performance Testing

Please note:
- Page load times (should be under 3 seconds)
- Any slow operations
- Error messages or crashes
- Mobile responsiveness (test on phone/tablet if possible)

## Known Limitations

1. **Redis Cache**: May not be configured in beta, so some operations might be slower
2. **Email Sending**: Disabled in beta environment
3. **Real Publishing**: Social media publishing is simulated
4. **County Data**: Limited to sample counties in beta

## Providing Feedback

### What We Need:

1. **Bug Reports**:
   - What you were doing
   - What happened
   - What you expected to happen
   - Browser/device used
   - Screenshots if possible

2. **Feature Feedback**:
   - Is the feature intuitive?
   - What's missing?
   - What could be improved?

3. **Performance Issues**:
   - Which pages are slow?
   - Any timeouts or errors?

4. **UI/UX Feedback**:
   - Confusing elements
   - Missing information
   - Workflow improvements

### How to Report:

Email your feedback to: [development-team-email]

Use this format:
```
Subject: Beta Feedback - [Feature Name]

Tester: [Your Name]
Date: [Date]
Feature: [What you were testing]
Issue Type: [Bug/Suggestion/Performance]

Description:
[Detailed description]

Steps to Reproduce (for bugs):
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots:
[Attach if relevant]
```

## Priority Testing Areas

Based on your expertise:

### For Simon:
- Focus on the Election Mapping visualization
- Test data accuracy and performance
- Evaluate the export functionality

### For Eric:
- Test the Version Control system thoroughly
- Evaluate AI-generated content quality
- Check message workflow from creation to approval

### For Hossein:
- Stress test with multiple operations
- Check mobile responsiveness
- Evaluate overall system performance

## Quick Test Checklist

- [ ] Login works smoothly
- [ ] Dashboard loads with correct data
- [ ] Election mapping displays properly
- [ ] Can create and save messages
- [ ] Version control generates different versions
- [ ] County profiles load when clicked
- [ ] Export creates downloadable PNG
- [ ] Navigation between sections works
- [ ] No JavaScript errors in console
- [ ] Responsive on mobile devices

## Technical Notes

- **Browser Console**: Press F12 to check for errors
- **Network Tab**: Monitor for slow API calls
- **Best Browsers**: Chrome, Firefox, Safari (latest versions)
- **Screen Sizes**: Test at 1920x1080, 1366x768, and mobile

## Thank You!

Your feedback is invaluable in making Akashic Intelligence the best political campaign platform. We appreciate your time and insights!

If you have any questions during testing, please don't hesitate to reach out.

Happy Testing! 🎉