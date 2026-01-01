# Rumfor Market Tracker - Complete Application Audit & Documentation

## Executive Summary

**Application Name:** Rumfor Market Tracker
**Purpose:** Community-driven platform for tracking and connecting artisans with local markets
**Technology Stack:** PHP 7.4+, PostgreSQL, Bootstrap 5, JavaScript
**Target Platform:** Mobile-first web application (planned rebuild)

---

## 1. Application Overview

### Core Purpose
Rumfor Market Tracker is a community-driven platform that connects artisans, vendors, and crafters with local markets and fairs. It serves as a comprehensive marketplace intelligence tool that helps vendors discover opportunities, track their participation, and build community around artisan market events.

### Problem Solved
The application addresses several key challenges faced by artisan vendors:
- **Market Discovery:** Difficulty finding relevant markets and fairs in their area
- **Opportunity Tracking:** No centralized way to track market applications and participation
- **Community Building:** Lack of connection between vendors and market promoters
- **Planning Complexity:** Managing multiple market participations with varying requirements
- **Information Asymmetry:** Promoters struggling to find qualified vendors

### Key Value Propositions

#### For Vendors/Artisans:
- **Comprehensive Market Database:** Access to hundreds of markets with detailed information
- **Intelligent Tracking:** Track interest, applications, bookings, and participation history
- **Community Intelligence:** See what other vendors are saying about markets
- **Planning Tools:** Todo lists and expense tracking for market preparation
- **Application Management:** Streamlined process for applying to markets

#### For Market Promoters:
- **Vendor Recruitment:** Access to pool of qualified, interested artisans
- **Application Management:** Review and manage vendor applications
- **Market Intelligence:** Understand vendor preferences and market trends
- **Community Engagement:** Build relationships with regular participants

#### For the Artisan Community:
- **Knowledge Sharing:** Photo galleries, reviews, and discussions about markets
- **Quality Assurance:** Verified promoters and moderated content
- **Sustainability:** Supporting local, handmade economies

---

## 2. User Personas & Use Cases

### Primary User Personas

#### 1. Artisan Vendor (Primary Persona)
**Background:** Small business owner or independent artisan selling handmade goods at markets
**Goals:**
- Discover new market opportunities
- Track application status across multiple markets
- Plan and prepare for market participation
- Connect with other vendors and promoters
- Share experiences and photos

**Pain Points Addressed:**
- Scattered information about market opportunities
- Manual tracking of applications and follow-ups
- Difficulty coordinating booth setup and logistics
- Lack of community support and advice

#### 2. Market Promoter (Power User)
**Background:** Event organizer, market manager, or community coordinator
**Goals:**
- Attract qualified vendors to their markets
- Streamline the vendor application and approval process
- Build a community around their market events
- Gather intelligence about vendor preferences

**Pain Points Addressed:**
- Time-consuming vendor recruitment process
- Managing applications from unqualified vendors
- Lack of vendor community engagement
- Difficulty tracking market success metrics

#### 3. Artisan Community Member (Secondary Persona)
**Background:** Craft enthusiast, buyer, or supporter of local artisans
**Goals:**
- Discover markets to attend as customers
- Learn about local artisan communities
- Support local handmade businesses
- Share market experiences and photos

### Primary Use Cases

#### Market Discovery & Browsing
- Search for markets by location, date, category
- Filter by market type, recurring status, accessibility features
- View market details, photos, and community discussions
- Browse trending hashtags and popular market types

#### Vendor Market Participation
- Track markets of interest with status management
- Apply to markets with promoter-defined requirements
- Manage todo lists for market preparation
- Track expenses and revenue for each market event
- Share photos and experiences from market participation

#### Promoter Market Management
- Claim and manage market listings
- Define custom application fields and requirements
- Review and approve/reject vendor applications
- Communicate with applicants via email
- Manage market information and updates

#### Community Engagement
- Participate in market discussions with threaded comments
- React to comments with emoji reactions
- Vote on market hashtags and characteristics
- Upload and vote on market photos
- Share market experiences and advice

---

## 3. Complete User Flows

### 3.1 Market Discovery Flow

#### Entry Points
- **Homepage visit** (anonymous or authenticated)
- **Direct URL** to specific market
- **Search results** from external search engines
- **Social media sharing** of market links

#### Step-by-Step Journey

1. **Landing Page (index.php)**
   - User arrives at homepage
   - Sees hero section with:
     - Quick category browsing (Farmers Market, Arts & Crafts, etc.)
     - Popular hashtags trending across platform
     - Statistics (active cities, upcoming markets, total available)
   - Can immediately browse markets or use search

2. **Browsing Markets**
   - Grid view of market cards showing:
     - Market photo (highest voted or default)
     - Market name and location
     - Rating and review count
     - Tracking count ("X interested")
   - Each card is clickable to go to market detail

3. **Filtering & Search**
   - **Basic Search:** Text search across market names, locations, descriptions
   - **Location Filters:** City, state/province
   - **Category Filters:** Farmers Market, Arts & Crafts, etc.
   - **Hashtag Filters:** #FarmersMarket, #WheelchairAccessible, etc.
   - **Advanced Filters:**
     - Market Type (recurring vs one-time)
     - Date Range (next week, next month, etc.)
     - Accessibility features

4. **Market Detail View (market_detail.php)**
   - **Hero Section:** Large photo gallery with market info overlay
   - **Market Information:** Name, location, description, contact details, fees
   - **Promoter Status:** Shows if market is claimed by verified promoter
   - **Action Buttons:** Track/Apply/Manage (context-dependent)
   - **Community Features:** Hashtag voting, photo gallery, comments

5. **Decision Points**
   - **Not Interested:** User can leave or continue browsing
   - **Interested:** Click "Track Market" → status becomes "interested"
   - **Want to Apply:** If promoter-defined market, click "Apply" → application flow
   - **Promoter Actions:** If verified promoter, can claim market

6. **Success States**
   - Market successfully tracked → appears in "My Markets"
   - Application submitted → status changes to "applied"
   - Market claimed → promoter gains management rights

7. **Error/Edge Cases**
   - Market not found → Redirect to homepage with error message
   - Search yields no results → Show helpful empty state with suggestions
   - User not logged in → Show login prompts for restricted actions
   - Network errors → Graceful degradation with retry options

8. **Exit Points**
   - User finds desired market(s) and takes action (track/apply)
   - User decides to create their own market listing
   - User loses interest and navigates away

### 3.2 Vendor Application Flow

#### Entry Points
- From market detail page → "Apply" button
- From "My Markets" → "Update Application" for applied markets
- Email notifications about application status changes

#### Step-by-Step Journey

1. **Initiate Application**
   - User clicks "Apply" on market detail page
   - System checks if user is logged in (redirects to login if not)
   - Shows application modal with promoter-defined fields

2. **Application Form**
   - **Standard Fields:** Application notes (textarea)
   - **Custom Fields:** Promoter-defined questions/requirements
     - Text fields, textareas, dropdowns, checkboxes
   - **Validation:** Required fields marked, real-time validation

3. **Submit Application**
   - Form submission with CSRF protection
   - Status changes from "interested" to "applied"
   - Success notification shown
   - Email sent to promoter (if configured)

4. **Application Management**
   - Application appears in promoter's dashboard
   - User can update application details while pending
   - Status tracking: pending → approved/rejected

5. **Status Updates**
   - Promoter reviews → status changes to "booked" or stays "applied"
   - If rejected → status changes to "cancelled"
   - User receives notifications of status changes

6. **Post-Application Actions**
   - If approved: Status becomes "booked", can create todo list
   - If rejected: Can reapply or move to different market
   - Can archive completed or cancelled applications

### 3.3 Promoter Management Flow

#### Entry Points
- From market detail page → "Claim Market" (verified promoters only)
- From promoter dashboard → "Manage Applications"
- From email notifications about new applications

#### Step-by-Step Journey

1. **Market Claiming**
   - Verified promoter sees "Claim Market" option
   - Confirms claim → becomes market promoter
   - Gains access to management features

2. **Application Review**
   - Access promoter dashboard (promoter_applications.php)
   - Filter applications by status (pending, approved, rejected)
   - Review individual applications (applicant_details.php)

3. **Application Processing**
   - View complete application details
   - Approve/reject with optional review notes
   - Email notifications sent to applicants

4. **Custom Application Setup**
   - Define custom fields for applications
   - Set field types, requirements, validation
   - Configure email templates and notifications

5. **Market Management**
   - Update market information
   - Moderate photos and content
   - View analytics and engagement metrics

### 3.4 Community Engagement Flow

#### Photo Sharing Flow
1. **Upload Photo:** From market detail → camera icon → file selection
2. **Add Caption:** Optional description of the photo
3. **Review & Submit:** Preview before upload
4. **Community Voting:** Others can like/unlike photos
5. **Photo Gallery:** Highest voted photo becomes market hero image

#### Comment Discussion Flow
1. **Start Discussion:** Click comment box → type message
2. **Post Comment:** Submit with CSRF protection
3. **Threaded Replies:** Click "Reply" on any comment
4. **Emoji Reactions:** Click emoji buttons to react
5. **Comment Management:** Users can delete their own comments

#### Hashtag Voting Flow
1. **View Hashtags:** Market detail shows top-voted hashtags
2. **Vote on Existing:** Upvote/downvote displayed hashtags
3. **Suggest New:** Add custom hashtags (limit 3 per user per market)
4. **Predefined Voting:** Vote on suggested predefined hashtags
5. **Community Consensus:** Highest voted hashtags represent market characteristics

---

## 4. Feature Inventory

### Core Features

#### 1. User Authentication & Profiles
**Capabilities:**
- User registration with email verification
- Secure login/logout with session management
- Password reset functionality
- Profile management (username, email, settings)
- Role-based access (user, promoter, admin)

**User-Facing Actions:**
- Register new account
- Login to existing account
- Update profile information
- Change password
- View account settings

**Data Inputs:** Username, email, password, notification preferences
**Data Outputs:** User profile data, authentication status
**Dependencies:** None (foundational feature)

#### 2. Market Discovery & Search
**Capabilities:**
- Browse all available markets
- Advanced search and filtering
- Market categorization and tagging
- Location-based discovery
- Date-based filtering (upcoming, recurring, etc.)

**User-Facing Actions:**
- Search by keywords, location, category
- Filter by multiple criteria simultaneously
- Sort results by relevance, date, popularity
- View search results in grid or list format
- Save and share search results

**Data Inputs:** Search terms, filter selections, sort preferences
**Data Outputs:** Filtered market listings, search result counts
**Dependencies:** Market database, user authentication (for personalized results)

#### 3. Market Tracking & Status Management
**Capabilities:**
- Track markets of interest
- Manage application status through workflow
- Personal market dashboard
- Status progression tracking
- Archive completed markets

**User-Facing Actions:**
- Add market to tracking list
- Update tracking status (interested→applied→booked→completed)
- View all tracked markets with status overview
- Archive/unarchive markets
- Bulk status updates

**Data Inputs:** Market selections, status updates, personal notes
**Data Outputs:** Personalized market lists, status summaries, progress tracking
**Dependencies:** User authentication, market database

#### 4. Promoter Application System
**Capabilities:**
- Custom application forms with promoter-defined fields
- Application status management
- Email notifications for applicants
- Application analytics and reporting
- External applicant support (non-registered users)

**User-Facing Actions:**
- Create custom application fields
- Review and process applications
- Send bulk communications to applicants
- View application analytics
- Manage applicant communications

**Data Inputs:** Field definitions, application responses, review decisions
**Data Outputs:** Application data, review statuses, communication logs
**Dependencies:** Promoter verification system, email system, user management

#### 5. Photo Sharing & Gallery System
**Capabilities:**
- Upload market photos with captions
- Community voting on photos (like/unlike)
- Photo moderation and approval workflow
- Hero photo selection based on votes
- Photo gallery with lightbox viewing

**User-Facing Actions:**
- Upload photos to markets
- Add captions and descriptions
- Vote on community photos
- View photo galleries
- Report inappropriate content

**Data Inputs:** Photo files, captions, vote actions
**Data Outputs:** Photo galleries, vote counts, hero images
**Dependencies:** File upload system, user authentication, moderation system

#### 6. Hashtag & Tagging System
**Capabilities:**
- User-generated hashtags with voting
- Predefined hashtag library (70+ categories)
- Community consensus on market characteristics
- Hashtag trending and popularity tracking
- Smart hashtag suggestions

**User-Facing Actions:**
- Add custom hashtags to markets
- Vote on existing hashtags
- Browse markets by hashtag filters
- View hashtag popularity statistics
- Discover markets through hashtag exploration

**Data Inputs:** Hashtag text, vote actions, category selections
**Data Outputs:** Hashtag rankings, market categorizations, trending topics
**Dependencies:** Voting system, market database

#### 7. Comment & Discussion System
**Capabilities:**
- Threaded comment discussions
- Emoji reaction system (6 reaction types)
- Comment moderation and approval
- Nested reply structure (3 levels max)
- Real-time comment updates

**User-Facing Actions:**
- Post comments on markets
- Reply to existing comments
- React to comments with emojis
- Edit/delete own comments
- Report inappropriate comments

**Data Inputs:** Comment text, reaction selections, reply relationships
**Data Outputs:** Discussion threads, reaction counts, user engagement metrics
**Dependencies:** User authentication, moderation system

#### 8. Todo List & Planning System
**Capabilities:**
- Market-specific todo lists
- Task completion tracking
- Priority levels and due dates
- Todo templates and presets
- Progress visualization

**User-Facing Actions:**
- Create todo items for markets
- Mark tasks complete/incomplete
- Set priorities and due dates
- Use predefined task templates
- View completion progress

**Data Inputs:** Task descriptions, priorities, due dates, completion status
**Data Outputs:** Todo lists, completion statistics, progress indicators
**Dependencies:** Market tracking system, user authentication

#### 9. Expense Tracking System
**Capabilities:**
- Market event expense logging
- Revenue tracking for sales
- Category-based expense organization
- Profit/loss calculations
- Historical expense analysis

**User-Facing Actions:**
- Log expenses by category
- Record sales revenue
- View expense summaries
- Export expense reports
- Analyze profitability by market

**Data Inputs:** Expense amounts, categories, dates, descriptions
**Data Outputs:** Expense reports, profit calculations, financial summaries
**Dependencies:** Market event system, user authentication

#### 10. Notification System
**Capabilities:**
- Real-time user notifications
- Email notification preferences
- In-app notification center
- Notification types (system, market updates, applications)
- Notification history and management

**User-Facing Actions:**
- View notification feed
- Mark notifications as read/unread
- Configure notification preferences
- Receive email notifications
- Clear notification history

**Data Inputs:** Notification preferences, read status updates
**Data Outputs:** Notification feeds, email alerts, engagement metrics
**Dependencies:** User authentication, email system

### Advanced Features

#### Admin Moderation System
**Capabilities:**
- Content moderation across all user-generated content
- User management and role assignment
- System analytics and reporting
- Bulk content operations
- Emergency content removal

**User-Facing Actions:**
- Moderate comments, photos, hashtags
- Manage user accounts and roles
- View system-wide analytics
- Handle reported content
- Perform bulk operations

**Data Inputs:** Moderation decisions, user role changes, content reports
**Data Outputs:** Moderation logs, system reports, user statistics
**Dependencies:** All content systems, user management

---

## 5. Data & State Management Concepts

### Data Entity Relationships

#### Core Entities
- **Users:** Authentication, profiles, preferences
- **Markets:** Event listings with metadata
- **User_Market_Tracking:** Many-to-many relationship with status
- **Comments:** Threaded discussions linked to markets
- **Photos:** User-uploaded images with voting
- **Hashtags:** Community tagging system (custom + predefined)
- **Todo_Items:** Task management per user-market combination
- **Expenses:** Financial tracking for market events
- **Applications:** Vendor applications to markets (extended tracking)
- **Notifications:** User notification system

#### Key Relationships
- Users ↔ Markets (through User_Market_Tracking)
- Markets → Comments (one-to-many)
- Markets → Photos (one-to-many)
- Markets → Hashtags (many-to-many through voting)
- Users → Todo_Items → Markets
- Markets → Expenses (through Market_Events)
- Markets → Applications (promoter management)

### Data Persistence Strategy

#### Persistent Data (Database)
- User accounts and authentication data
- Market listings and metadata
- User tracking relationships and statuses
- Comments and discussion threads
- Photo metadata and voting data
- Hashtag definitions and votes
- Todo items and completion status
- Expense records and financial data
- Application data and review history
- Notification history and preferences

#### Session-Based Data
- User authentication state
- Form data during multi-step processes
- Search filters and preferences
- Shopping cart/checkout state (if implemented)

#### Temporary/Cached Data
- Search results (can be cached for performance)
- Notification counts (real-time updates)
- Vote counts (aggregated from database)
- Photo galleries (file system with database metadata)

### Data Transformation & Calculations

#### Real-Time Calculations
- **Vote Counts:** Sum of up/down votes for photos, hashtags
- **Comment Counts:** Count of approved comments per market
- **Tracking Counts:** Number of users tracking each market
- **Average Ratings:** Calculated from user ratings
- **Progress Metrics:** Completion rates for todo items

#### Business Logic Calculations
- **Application Status Workflow:** interested → applied → booked → completed
- **Promoter Verification:** Based on application volume and community feedback
- **Market Popularity:** Based on tracking count, comments, photos
- **User Engagement Scores:** Based on activity across features

#### Financial Calculations
- **Market Profit/Loss:** Revenue - expenses for each market event
- **Expense Categories:** Grouped by type (booth fees, supplies, etc.)
- **Budget Tracking:** Planned vs actual expenses

### Data Validation Rules

#### User Input Validation
- **Email Format:** RFC compliant email validation
- **Username:** Alphanumeric + underscores, 3-50 characters
- **Passwords:** Minimum 8 characters, complexity requirements
- **Hashtags:** No spaces, max 30 characters, alphanumeric + underscores
- **Comments:** Max 2000 characters, basic HTML filtering
- **Photo Captions:** Max 500 characters

#### Business Rule Validation
- **Hashtag Limits:** Max 3 hashtags per user per market
- **Application Limits:** One active application per user per market
- **Photo Upload Limits:** File size (5MB), format restrictions (JPG/PNG/GIF)
- **Comment Depth:** Maximum 3 levels of nested replies
- **Expense Amounts:** Positive values, reasonable upper limits

#### Security Validation
- **CSRF Protection:** Tokens on all forms and AJAX requests
- **SQL Injection Prevention:** Prepared statements throughout
- **XSS Protection:** Input sanitization and output escaping
- **File Upload Security:** Type validation, size limits, malware scanning

---

## 6. UI/UX Patterns & Navigation

### Main Navigation Structure

#### Global Navigation (Header)
```
[Logo] [Markets] [My Markets] [Profile] [Login/Register]
```

#### User-Specific Navigation (Authenticated)
```
[Logo] [Discover] [My Markets] [Profile] [Notifications] [Logout]
```

#### Promoter Navigation (Additional)
```
[Logo] [Discover] [My Markets] [Promoter Dashboard] [Profile] [Notifications]
```

### Screen Hierarchy

#### Level 1: Core Screens
- **Homepage (index.php):** Market discovery and browsing
- **Market Detail (market_detail.php):** Comprehensive market view
- **My Markets (my_markets.php):** Personal dashboard
- **Login/Register:** Authentication flows

#### Level 2: Feature Screens
- **Market Planning (market_planning.php):** Todo management
- **Promoter Applications (promoter_applications.php):** Application management
- **Applicant Details (applicant_details.php):** Individual application review
- **Profile:** User account management
- **Settings:** User preferences

#### Level 3: Utility Screens
- **Create Market:** Market listing creation
- **Upload Photo:** Photo upload modal
- **Status Modal:** Status change interface
- **Application Modal:** Application submission

### Information Architecture

#### Homepage Organization
```
Hero Section
├── Browse by Category (puzzle pieces)
├── Popular Hashtags (trending)
├── Statistics Bar (metrics)
└── Quick Actions (search, register)

Market Grid
├── Filters Sidebar
├── Search Results Header
├── Market Cards (paginated)
└── Pagination Controls
```

#### Market Detail Organization
```
Hero Section (Full-width photo)
├── Market Info Overlay
├── Action Buttons
└── Photo Thumbnails

Content Sections
├── Market Details (description, fees, contact)
├── Hashtag Voting
├── Photo Gallery
├── Comments Section
└── Related Markets
```

#### My Markets Organization
```
Header with Progress
├── Status Filter Badges
├── Sort Controls
└── View Toggle (List/Calendar)

Content Views
├── List View: Market cards grid
└── Calendar View: Monthly calendar with market dates
```

### UI Patterns Used

#### 1. Card-Based Layout
- **Market Cards:** Photo, title, metadata, actions
- **Comment Cards:** Author, content, reactions, replies
- **Application Cards:** Applicant info, status, actions
- **Notification Cards:** Type, message, timestamp

#### 2. Modal Overlays
- **Photo Viewer:** Large image with navigation
- **Application Form:** Multi-field application submission
- **Status Selection:** Quick status updates
- **Confirmation Dialogs:** Action confirmations

#### 3. Progressive Disclosure
- **Collapsed Sections:** Expandable content areas
- **Paged Results:** Pagination for large datasets
- **Lazy Loading:** Content loaded as needed
- **Accordion Menus:** Collapsible navigation sections

#### 4. Status-Based Interfaces
- **Color Coding:** Status badges (success=green, warning=yellow, etc.)
- **Progress Indicators:** Visual progress bars
- **State Changes:** Clear before/after states for actions
- **Conditional Actions:** Buttons appear based on permissions/status

#### 5. Filter & Search Patterns
- **Facet Filters:** Multiple filter categories
- **Quick Filters:** Predefined filter buttons
- **Search Suggestions:** Autocomplete and recommendations
- **Filter Persistence:** Remember user preferences

### Mobile-First Considerations

#### Touch-Friendly Design
- **Button Sizes:** Minimum 44px touch targets
- **Spacing:** Generous padding between interactive elements
- **Swipe Gestures:** Photo gallery swiping, card swiping
- **Pull-to-Refresh:** Update content with gesture

#### Responsive Breakpoints
- **Mobile:** Default (320px+)
- **Tablet:** 769px+
- **Desktop:** 1025px+

#### Mobile Navigation Patterns
- **Sticky Header:** Always accessible navigation
- **Bottom Navigation:** Alternative navigation on mobile
- **Slide-out Menu:** Hamburger menu for secondary navigation
- **Tab Bar:** For main sections (Discover, My Markets, Profile)

#### Content Adaptation
- **Single Column:** Stack content vertically on mobile
- **Card Stacking:** Market cards in single column
- **Condensed Info:** Show essential info, hide secondary details
- **Thumb-Friendly Actions:** Larger buttons, swipe actions

---

## 7. Business Logic & Rules

### User Role & Permission System

#### User Roles
- **Standard User:** Basic platform access
- **Verified Promoter:** Can claim markets and manage applications
- **Administrator:** Full system access and moderation

#### Permission Matrix
| Feature | Standard User | Verified Promoter | Administrator |
|---------|---------------|-------------------|---------------|
| Browse Markets | ✓ | ✓ | ✓ |
| Track Markets | ✓ | ✓ | ✓ |
| Apply to Markets | ✓ | ✓ | ✓ |
| Comment on Markets | ✓ | ✓ | ✓ |
| Upload Photos | ✓ | ✓ | ✓ |
| Vote on Content | ✓ | ✓ | ✓ |
| Claim Markets | ✗ | ✓ | ✓ |
| Manage Applications | ✗ | ✓ | ✓ |
| Moderate Content | ✗ | ✗ | ✓ |
| Admin Functions | ✗ | ✗ | ✓ |

### Market Status Workflow

#### Status Definitions
- **interested:** User is considering the market
- **applied:** User has submitted an application
- **booked:** Application approved, user is confirmed
- **completed:** User has participated in the market
- **cancelled:** Application rejected or user withdrew

#### Status Transition Rules
- interested → applied (user submits application)
- applied → booked (promoter approves)
- applied → cancelled (promoter rejects)
- booked → completed (user marks as completed)
- booked → cancelled (user cancels participation)
- Any status → cancelled (user withdraws interest)

### Promoter Verification Process

#### Verification Criteria
- **Account Age:** Minimum 30 days active
- **Activity Level:** Consistent platform engagement
- **Community Standing:** Positive feedback from vendors
- **Market Management:** Successfully managed previous markets

#### Verification Workflow
1. User applies for promoter status
2. Admin reviews application
3. Verification granted or denied with feedback
4. Verified promoters gain claiming rights

### Content Moderation Rules

#### Automated Moderation
- **Spam Detection:** Pattern matching for spam content
- **Inappropriate Content:** Keyword filtering
- **Duplicate Detection:** Prevent duplicate submissions

#### Human Moderation
- **Reported Content:** User reports trigger review
- **Community Guidelines:** Violators receive warnings
- **Content Removal:** Serious violations lead to deletion
- **Account Suspension:** Repeated violations

### Application Review Process

#### Review Workflow
1. **Application Submitted:** Status = applied, promoter notified
2. **Promoter Review:** Within 7 days (configurable)
3. **Decision Made:** Approved → booked, Rejected → cancelled
4. **Notification Sent:** Email to applicant
5. **Follow-up Available:** Applicants can reapply if rejected

#### Review Criteria
- **Vendor Qualifications:** Experience, product fit
- **Booth Availability:** Space constraints
- **Application Completeness:** Required information provided
- **Promoter Preferences:** Custom criteria per market

### Financial Validation Rules

#### Expense Tracking
- **Positive Values:** All amounts must be positive
- **Reasonable Limits:** Maximum $10,000 per expense
- **Category Requirements:** All expenses must be categorized
- **Date Validation:** Expenses must be dated within market timeframe

#### Revenue Tracking
- **Sales Reporting:** Optional but encouraged
- **Profit Calculations:** Automatic revenue - expenses
- **Tax Reporting:** Data exportable for tax purposes

### Notification Rules

#### Notification Types
- **System Notifications:** Account changes, security alerts
- **Market Updates:** Status changes, new opportunities
- **Application Updates:** Review decisions, follow-ups
- **Community Activity:** Comments on tracked markets

#### Delivery Rules
- **Email Notifications:** Configurable by user preference
- **In-App Notifications:** Always available, auto-cleanup after 30 days
- **Push Notifications:** Future implementation for mobile app
- **Frequency Limits:** Maximum 10 notifications per hour per user

---

## 8. Integration Points

### External Services

#### Email System
- **Purpose:** User notifications, application communications
- **Integration:** SMTP server configuration
- **Features:** HTML templates, bulk sending, delivery tracking

#### File Storage
- **Purpose:** Photo uploads and storage
- **Integration:** Local file system with database metadata
- **Features:** Multiple format support, size limits, security scanning

#### Social Sharing
- **Purpose:** Market sharing across social platforms
- **Integration:** Native Web Share API, fallback URL copying
- **Features:** Share URLs, market previews, hashtags

### Third-Party Functionality

#### Bootstrap 5 Framework
- **Purpose:** UI components and responsive design
- **Integration:** CDN delivery with custom theme overrides
- **Customization:** Black & white design system implementation

#### Font System
- **Purpose:** Typography and readability
- **Integration:** Google Fonts or system font stack
- **Fallback:** Cross-platform font compatibility

#### Icon System
- **Purpose:** Visual indicators and navigation
- **Integration:** Bootstrap Icons via CDN
- **Customization:** Consistent icon usage patterns

### API Endpoints (Internal)

#### AJAX Endpoints
- **Photo Voting:** `/vote_on_photo.php`
- **Hashtag Voting:** `/vote_on_hashtag.php`
- **Status Updates:** `/update_market_status.php`
- **Comment Reactions:** `/vote_on_comment.php`
- **Application Processing:** `/review_application.php`
- **Notification Fetching:** `/get_notifications.php`

#### Data Fetching Endpoints
- **Market Photos:** `/get_market_photos.php`
- **Hashtag Voting:** `/get_hashtag_voting.php`
- **Top Hashtags:** `/get_top_hashtags.php`
- **Application Data:** `/get_application.php`

### Authentication & Security

#### Session Management
- **Framework:** Native PHP sessions
- **Security:** CSRF tokens, session regeneration
- **Persistence:** Configurable session lifetime

#### Data Validation
- **Input Sanitization:** Built-in PHP functions
- **SQL Injection Prevention:** Prepared statements
- **XSS Protection:** Output escaping
- **File Security:** Upload validation and scanning

---

## 9. Pain Points & Improvement Opportunities

### Current Implementation Issues

#### Technical Debt
- **Mixed Architecture:** PHP procedural with some OOP elements
- **Database Schema:** Complex with many migrations, potential normalization issues
- **CSS Organization:** 7 separate CSS files, inconsistent patterns
- **JavaScript:** Inline scripts mixed with external files
- **Performance:** No caching layer, N+1 query issues
- **Security:** Some areas lack comprehensive input validation

#### User Experience Issues
- **Mobile Experience:** Current design not truly mobile-first
- **Information Overload:** Market detail pages have too much information
- **Status Confusion:** Unclear status progression for new users
- **Onboarding:** No guided introduction for new users
- **Search/Filter Complexity:** Too many filter options overwhelm users

#### Business Logic Issues
- **Promoter Onboarding:** No clear path to becoming a verified promoter
- **Application Process:** Generic application forms don't capture market-specific needs
- **Community Engagement:** Limited ways to build vendor relationships
- **Analytics:** No insights for promoters about market performance

### Mobile-First Rethink Opportunities

#### Navigation Simplification
- **Bottom Tab Bar:** iOS/Android style navigation
- **Swipe Gestures:** Natural mobile interactions
- **Pull-to-Refresh:** Modern mobile patterns
- **Infinite Scroll:** Replace pagination with continuous loading

#### Content Prioritization
- **Progressive Loading:** Essential info first, details on demand
- **Card Stacking:** Single column layout for mobile
- **Thumb Navigation:** Large, touch-friendly buttons
- **Context Menus:** Long-press actions for secondary options

#### Form Optimization
- **Input Types:** Proper mobile keyboard types (email, phone, etc.)
- **Autocomplete:** Smart suggestions for locations, categories
- **Validation:** Real-time feedback, clear error messages
- **Save Drafts:** Prevent form abandonment

#### Performance Optimization
- **Lazy Loading:** Images and content load as needed
- **Caching:** Service worker for offline capabilities
- **Bundle Optimization:** Minimize JavaScript and CSS delivery
- **CDN Usage:** Fast asset delivery globally

### Feature Simplifications

#### Streamlined Workflows
- **One-Click Actions:** Quick track, quick apply, quick share
- **Status Automation:** Smart status suggestions based on actions
- **Bulk Operations:** Multi-select actions for power users
- **Template System:** Reusable application templates

#### Content Organization
- **Smart Defaults:** Pre-fill forms with user preferences
- **Auto-Categorization:** AI-assisted market categorization
- **Related Content:** Show similar markets, related vendors
- **Personalization:** Learning-based recommendations

#### Community Features
- **Vendor Networks:** Connect related vendors
- **Market Groups:** Geographic or categorical groupings
- **Mentorship Program:** Experienced vendors help newcomers
- **Success Stories:** Showcase successful market participations

### Technical Improvements

#### Architecture Modernization
- **API-First Design:** RESTful API backend
- **Component System:** Reusable UI components
- **State Management:** Centralized application state
- **Progressive Web App:** Offline functionality and app-like experience

#### Data Optimization
- **Database Indexing:** Optimize query performance
- **Caching Layer:** Redis or similar for session/data caching
- **Data Denormalization:** Pre-computed aggregations
- **Real-time Updates:** WebSocket connections for live features

#### Security Enhancements
- **Rate Limiting:** API rate limiting and abuse prevention
- **Audit Logging:** Comprehensive security event logging
- **Data Encryption:** Encrypt sensitive user data at rest
- **Two-Factor Authentication:** Additional security layer

---

## 10. Recommendations for Mobile Web Rebuild

### Phase 1: Foundation (MVP - 3 months)
**Priority Features:**
- User authentication (login/register/profile)
- Market discovery with search and filters
- Basic market tracking (interested/booked/completed)
- Simple commenting system
- Photo upload and gallery

**Technical Stack:**
- Next.js or React for component-based architecture
- Tailwind CSS for utility-first styling
- Supabase or Firebase for backend-as-a-service
- Progressive Web App capabilities

### Phase 2: Core Features (6 months)
**Additional Features:**
- Advanced application system with custom fields
- Promoter verification and market claiming
- Hashtag voting and community features
- Todo list and planning tools
- Notification system

**Enhancements:**
- Offline functionality
- Push notifications
- Advanced search and filtering
- User onboarding flow

### Phase 3: Advanced Features (9 months)
**Premium Features:**
- Expense tracking and financial reporting
- Advanced analytics for promoters
- Vendor networking and community building
- Integration with external calendars
- Advanced moderation tools

**Scalability:**
- Multi-tenant architecture
- Advanced caching and performance optimization
- Internationalization support
- API marketplace for integrations

### Mobile-Specific Design Principles

#### Touch-First Interactions
- **44px Minimum:** All interactive elements
- **Swipe Actions:** Natural mobile gestures
- **Haptic Feedback:** Visual and tactile responses
- **Context Menus:** Long-press for secondary actions

#### Content Hierarchy
- **Above the Fold:** Essential information visible without scrolling
- **Progressive Disclosure:** Details revealed on demand
- **Thumb Zone:** Important actions in easy reach
- **Single-Handed Use:** Design for one-handed operation

#### Performance Optimization
- **Core Web Vitals:** Fast loading, smooth interactions
- **Lazy Loading:** Images and content as needed
- **Service Worker:** Offline functionality and caching
- **Bundle Splitting:** Load only necessary code

#### Native Mobile Patterns
- **Bottom Sheets:** Instead of modals for mobile
- **Tab Navigation:** Bottom tab bar for main sections
- **Pull-to-Refresh:** Standard mobile refresh pattern
- **Infinite Scroll:** Continuous content loading

### Technical Architecture Recommendations

#### Frontend Architecture
- **Component Library:** Design system with consistent components
- **State Management:** Context API or Redux for complex state
- **Routing:** Next.js App Router for modern routing
- **Styling:** Tailwind with custom design tokens

#### Backend Architecture
- **API Design:** RESTful API with GraphQL for complex queries
- **Authentication:** JWT tokens with refresh mechanism
- **Database:** PostgreSQL with optimized schemas
- **File Storage:** Cloud storage (AWS S3, Cloudflare R2)

#### Performance & Scalability
- **CDN:** Global content delivery
- **Caching:** Multi-layer caching strategy
- **Monitoring:** Real-time performance monitoring
- **Analytics:** User behavior and performance analytics

---

## Conclusion

This comprehensive audit reveals that Rumfor Market Tracker is a feature-rich platform with strong community-building potential. The current implementation demonstrates solid business logic and user engagement features, but would benefit from a mobile-first redesign to better serve its primary user base of artisan vendors.

**Key Strengths:**
- Comprehensive feature set covering the full vendor journey
- Strong community engagement through comments, photos, and hashtags
- Flexible application system for market promoters
- Well-structured data relationships

**Key Opportunities:**
- Mobile-first redesign with modern UX patterns
- Technical architecture modernization
- Enhanced community-building features
- Scalability improvements for growth

The recommended rebuild prioritizes mobile experience while maintaining all core functionality, positioning the platform for significant user growth and market expansion.

---

**Audit Completed:** December 2025
**Prepared for:** Mobile-first web application rebuild
**Contact:** Development team for implementation planning