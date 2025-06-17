# Akashic Campaign Console - Beta Testing Instructions

## Overview
The Akashic Campaign Console is ready for beta testing. The application provides AI-powered campaign management with version control for different audience segments.

## Access Information

### Application URL
- Local Development: http://localhost:3000
- Production: [To be deployed]

### Demo Login Credentials
- **Email:** admin@akashic.com
- **Password:** admin123

## Key Features to Test

### 1. Authentication
- Login with the demo credentials
- Test logout functionality
- Verify session persistence

### 2. Campaign Management
- Create a new campaign
- Fill in candidate profile information
- Add team members with different roles
- View campaign dashboard

### 3. Version Control System (Core Feature)
- The system supports 6 audience profiles:
  - Union Workers
  - Chamber of Commerce
  - Youth Voters
  - Senior Citizens
  - Rural Communities
  - Urban Professionals
- Test creating messages with different versions for different audiences

### 4. AI Integration
- Test AI-powered content generation
- Verify that generated content adapts to selected audience profiles
- Check platform-specific formatting (Twitter, Facebook, Email, etc.)

## Current Status

✅ **Completed:**
- Database setup and seeding
- Authentication system
- Campaign creation and management
- Team member management
- Basic UI/UX implementation
- Version control engine
- AI integration setup

🚧 **In Progress:**
- Message creation interface with rich text editor
- Approval workflow system
- Publishing system
- Analytics dashboard

## Known Limitations
- Redis caching is optional (not configured)
- Email notifications not yet implemented
- Social media direct publishing APIs not configured
- Some features are UI-only without full backend implementation

## Testing Focus Areas

1. **User Flow:** Can you create a campaign and add team members smoothly?
2. **Data Persistence:** Does information save correctly and persist between sessions?
3. **UI/UX:** Is the interface intuitive and responsive?
4. **Error Handling:** Do you see helpful error messages when something goes wrong?
5. **Performance:** Does the application feel responsive?

## Reporting Issues

Please report any issues with:
1. Steps to reproduce the problem
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser and device information

## Technical Notes

- Built with Next.js 14, TypeScript, and Prisma
- PostgreSQL database hosted on Supabase
- OpenAI GPT-4 integration for AI features
- Tailwind CSS for styling

## Next Steps

After beta testing feedback, we'll prioritize:
1. Implementing the message creation interface
2. Building the approval workflow
3. Adding publishing capabilities
4. Creating the analytics dashboard

Thank you for testing! Your feedback is invaluable for improving the platform.