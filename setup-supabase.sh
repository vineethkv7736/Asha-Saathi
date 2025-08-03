#!/bin/bash

echo "🚀 BabyAssist AI - Supabase Setup"
echo "=================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file already exists"
else
    echo "📝 Creating .env.local file from template..."
    cp env.template .env.local
    echo "✅ .env.local file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local and add your Supabase credentials:"
    echo "   1. NEXT_PUBLIC_SUPABASE_URL"
    echo "   2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
fi

echo "📋 Next steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Copy your Project URL and Anon Key from Settings → API"
echo "3. Update .env.local with your actual values"
echo "4. Run the SQL schema in Supabase SQL Editor (copy supabase-schema.sql)"
echo "5. Start the development server: npm run dev"
echo ""
echo "🔗 Supabase Dashboard: https://supabase.com/dashboard"
echo "" 