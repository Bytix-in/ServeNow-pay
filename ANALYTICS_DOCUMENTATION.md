# Admin Analytics Dashboard Documentation

## Overview

The Admin Analytics Dashboard provides comprehensive insights into the restaurant network performance, including real-time data visualization, detailed restaurant metrics, and system health monitoring.

## Features

### 1. Key Metrics Overview
- **Total Restaurants**: Count of all registered restaurants
- **Total Revenue**: Aggregate revenue across all restaurants
- **Total Orders**: Sum of all orders placed
- **Active Restaurants**: Currently logged-in restaurants

### 2. Visual Analytics
- **Restaurant Status Distribution**: Pie chart showing active vs inactive restaurants
- **Top Revenue Restaurants**: Bar chart of highest earning restaurants
- **Top Orders by Restaurant**: Bar chart of restaurants with most orders

### 3. Detailed Restaurant Table
- Complete restaurant performance data
- Real-time status indicators
- Payment configuration status
- Staff and menu item counts
- Last activity tracking

### 4. System Health Monitoring
- Active restaurant percentage
- Payment coverage metrics
- Online restaurant tracking
- Staff and menu item totals

### 5. Contact Directory
- Quick access to restaurant owner information
- Contact details and location data
- Restaurant capacity information

## Data Sources

### Restaurant Data
- **Source**: `restaurants` table in Supabase
- **Key Fields**: 
  - `id`, `name`, `slug`, `status`
  - `owner_name`, `phone_number`, `email`, `address`
  - `cuisine_tags`, `seating_capacity`
  - `is_logged_in`, `last_login_at`
  - `created_at`, `updated_at`

### Orders Data
- **Source**: `orders` table in Supabase
- **Key Fields**:
  - `restaurant_id`, `total_amount`, `status`
  - `payment_status`, `created_at`

### Menu Items Data
- **Source**: `menu_items` table in Supabase
- **Key Fields**:
  - `restaurant_id`, `name`, `price`
  - `dish_type`, `created_at`

### Staff Data
- **Source**: `staff` table in Supabase
- **Key Fields**:
  - `restaurant_id`, `name`, `role`
  - `status`, `is_active`

### Payment Settings Data
- **Source**: `payment_settings` table in Supabase
- **Key Fields**:
  - `restaurant_id`, `is_payment_enabled`
  - `cashfree_environment`

## API Endpoints

### Core Analytics APIs
1. **GET /api/admin/analytics/orders**
   - Returns order analytics data
   - Includes revenue metrics and order counts

2. **GET /api/admin/analytics/menu-items**
   - Returns menu item statistics
   - Includes pricing and category data

3. **GET /api/admin/analytics/staff**
   - Returns staff analytics
   - Includes role distribution and activity

4. **GET /api/admin/analytics/payment-settings**
   - Returns payment configuration data
   - Includes coverage and environment stats

### Existing APIs Used
- **GET /api/admin/restaurants** - Restaurant data
- **GET /api/admin/active-sessions** - Live session tracking

## Components Structure

### Main Components
- `src/app/admin/analytics/page.tsx` - Main analytics page
- `src/components/admin/AnalyticsSummary.tsx` - Metrics summary cards
- `src/components/ui/Chart.tsx` - Chart components (Bar, Pie, Line)

### Chart Components
- **BarChart**: Displays comparative data across restaurants
- **PieChart**: Shows distribution data with percentages
- **LineChart**: Trends over time (future enhancement)

## Features in Detail

### Real-time Updates
- Data refreshes every 30 seconds for active sessions
- Manual refresh button for immediate updates
- Last updated timestamp display

### Export Functionality
- CSV export of all restaurant analytics data
- Includes performance metrics and contact information
- Filename includes current date

### Responsive Design
- Mobile-friendly layout
- Adaptive grid system
- Touch-friendly interactions

### Security
- Admin-only access with role verification
- JWT token authentication for all API calls
- Secure data handling and sanitization

## Usage Instructions

### Accessing Analytics
1. Log in as an admin user
2. Navigate to Admin Dashboard
3. Click "Analytics" in the sidebar
4. View comprehensive dashboard

### Interpreting Data
- **Green indicators**: Positive metrics (active, online, enabled)
- **Red indicators**: Issues requiring attention
- **Blue indicators**: Neutral information
- **Animated elements**: Real-time or recently updated data

### Exporting Data
1. Click "Export CSV" button in header
2. File downloads automatically
3. Open in spreadsheet application for further analysis

## Technical Implementation

### State Management
- React hooks for local state
- Real-time data fetching with error handling
- Loading states for better UX

### Performance Optimizations
- Lazy loading of chart components
- Efficient data processing
- Minimal re-renders with proper dependencies

### Error Handling
- Graceful fallbacks for missing data
- User-friendly error messages
- Retry mechanisms for failed requests

## Future Enhancements

### Planned Features
1. **Time-based Filtering**
   - Date range selectors
   - Historical trend analysis
   - Comparative period views

2. **Advanced Charts**
   - Line charts for trends
   - Heatmaps for activity patterns
   - Geographic distribution maps

3. **Alerts and Notifications**
   - Performance threshold alerts
   - Inactive restaurant notifications
   - Revenue milestone tracking

4. **Detailed Drill-downs**
   - Individual restaurant analytics
   - Order-level analysis
   - Customer behavior insights

5. **Automated Reports**
   - Scheduled email reports
   - PDF generation
   - Custom report builder

### Technical Improvements
- Real-time WebSocket updates
- Advanced caching strategies
- Data warehouse integration
- Machine learning insights

## Troubleshooting

### Common Issues
1. **Data Not Loading**
   - Check admin authentication
   - Verify API endpoint availability
   - Check network connectivity

2. **Charts Not Displaying**
   - Ensure data is available
   - Check browser compatibility
   - Verify chart component imports

3. **Export Not Working**
   - Check browser download permissions
   - Verify data availability
   - Try manual refresh first

### Support
For technical support or feature requests, contact the development team or create an issue in the project repository.

## Changelog

### Version 1.0.0 (Current)
- Initial analytics dashboard implementation
- Basic charts and metrics
- Restaurant performance tracking
- CSV export functionality
- Real-time session monitoring

---

*Last updated: [Current Date]*
*Documentation version: 1.0.0*