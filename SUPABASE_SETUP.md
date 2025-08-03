# Supabase Setup Guide for BabyAssist AI

This guide will help you set up Supabase for the BabyAssist AI project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `babyassist-ai`
   - Database Password: Choose a strong password
   - Region: Select closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings → API in your Supabase dashboard
2. Copy the following values:
   - Project URL
   - Anon (public) key

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Set Up Database Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql`
3. Click "Run" to execute the schema

This will create:
- Users table
- Mothers table
- Children table
- Visits table
- Row Level Security policies
- Sample data

## 5. Configure Authentication

1. Go to Authentication → Settings in your Supabase dashboard
2. Enable "Email" provider
3. Configure additional settings as needed

## 6. Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try logging in with the sample user:
   - Email: `priya@babyassist.local`
   - Password: Any 4+ characters

## 7. Database Structure

### Users Table
- `id`: UUID (Primary Key)
- `name`: Text
- `email`: Text (Unique)
- `mobile`: Text
- `area`: Text
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Mothers Table
- `id`: UUID (Primary Key)
- `name`: Text
- `age`: Integer (12-60)
- `mobile`: Text
- `address`: Text
- `risk_level`: Text ('high', 'medium', 'low')
- `pregnancy_week`: Integer (1-42, nullable)
- `last_visit`: Date
- `children_count`: Integer
- `user_id`: UUID (Foreign Key to users)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Children Table
- `id`: UUID (Primary Key)
- `name`: Text
- `age_in_months`: Integer (0-60)
- `mother_id`: UUID (Foreign Key to mothers)
- `health_status`: Text ('good', 'needs_attention', 'critical')
- `last_screening`: Date
- `vaccinations_completed`: Integer
- `vaccinations_total`: Integer
- `has_photo`: Boolean
- `user_id`: UUID (Foreign Key to users)
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Visits Table
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to users)
- `mother_id`: UUID (Foreign Key to mothers, nullable)
- `child_id`: UUID (Foreign Key to children, nullable)
- `visit_date`: Date
- `visit_type`: Text ('prenatal', 'postnatal', 'child', 'screening')
- `status`: Text ('scheduled', 'completed', 'cancelled')
- `notes`: Text (nullable)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## 8. Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Data Validation**: Check constraints ensure data integrity
- **Automatic Timestamps**: Created and updated timestamps are managed automatically
- **Cascade Deletes**: Deleting a user deletes all associated data

## 9. API Usage

The project uses the following Supabase features:

- **Authentication**: Email/password with mobile number mapping
- **Real-time subscriptions**: For live data updates
- **Row Level Security**: Automatic data isolation
- **Database triggers**: Automatic timestamp updates

## 10. Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Restart your development server
   - Check that `.env.local` is in the project root

2. **Authentication errors**
   - Verify your Supabase URL and keys
   - Check that email authentication is enabled

3. **Database connection errors**
   - Ensure the schema has been created
   - Check that RLS policies are in place

4. **Data not loading**
   - Verify that sample data was inserted
   - Check browser console for errors

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Review the [Next.js documentation](https://nextjs.org/docs)
- Check the browser console for detailed error messages

## 11. Production Deployment

When deploying to production:

1. Create a new Supabase project for production
2. Set up environment variables in your hosting platform
3. Run the schema migration
4. Update authentication settings for production
5. Configure custom domains if needed

## 12. Sample Data

The schema includes sample data for testing:

- **Users**: 3 ASHA workers
- **Mothers**: 3 mothers with different risk levels
- **Children**: 3 children of different ages
- **Visits**: 2 scheduled visits

You can modify or add more sample data as needed for your testing. 