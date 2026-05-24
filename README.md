# Silver Savings Scheme

A modern, lightweight, and beautiful web application for managing silver/jewelry savings schemes. Built with Next.js, Tailwind CSS, and Supabase.

![Silver Savings Scheme](https://via.placeholder.com/1200x600/102a43/718096?text=Silver+Savings+Scheme)

## ✨ Features

- **Customer Management**: Add, edit, delete, and search customers
- **Scheme Tracking**: Track monthly payments, progress, and maturity dates
- **Payment Management**: Record payments, track pending/overdue payments
- **Inventory Management**: Monitor silver rates and calculate liability
- **Export Data**: Export to CSV or generate PDF reports
- **Real-time Sync**: Cloud-based data synchronization with Supabase
- **Beautiful UI**: BMW-inspired premium minimal design with dark navy + silver theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account (free tier works)

### Installation

1. **Clone or download this repository**

```bash
cd silver
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

   a. Go to [Supabase](https://supabase.com) and create a new project
   
   b. Once your project is created, go to **Settings > API**
   
   c. Copy your **Project URL** and **anon public key**

4. **Configure environment variables**

   a. Copy the example env file:
   
   ```bash
   cp .env.example .env.local
   ```
   
   b. Edit `.env.local` and add your Supabase credentials:
   
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Set up the database**

   a. In your Supabase project, go to **SQL Editor**
   
   b. Copy the contents of `supabase/schema.sql`
   
   c. Paste and run the SQL script in the Supabase SQL Editor
   
   d. (Optional) Uncomment the sample data section in the SQL to add demo data

6. **Start the development server**

```bash
npm run dev
```

7. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
silver/
├── app/                      # Next.js App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard
│   ├── customers/           # Customers page
│   ├── schemes/             # Schemes page
│   ├── payments/            # Payments page
│   ├── inventory/           # Inventory page
│   ├── export/              # Export page
│   └── settings/            # Settings page
├── components/              # React components
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── DashboardLayout.tsx  # Layout wrapper
│   ├── StatCard.tsx         # Statistics card
│   └── Modal.tsx            # Modal dialog
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Supabase client
│   │   └── database.types.ts # TypeScript types
│   ├── hooks/
│   │   └── useData.ts       # Custom data hooks
│   └── utils.ts             # Utility functions
├── supabase/
│   └── schema.sql           # Database schema
├── public/                  # Static assets
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Design System

### Colors

- **Navy**: Primary background color (#102a43, #0a1f35)
- **Silver**: Accent and text colors (#718096, #cbd5e0)
- **Gold**: Highlight color (#f59e0b)
- **Emerald**: Success states (#10b981)
- **Rose**: Warning/error states (#f43f5e)

### Typography

- **Font Family**: Inter (Google Fonts)
- **Base Size**: 16px
- **Headings**: Bold, with gradient text effects

## 📊 Database Schema

### Tables

1. **customers**: Store customer information
   - id, name, phone, email, address, aadhaar, notes, status

2. **schemes**: Track silver savings schemes
   - id, customer_id, monthly_amount, total_months, months_paid
   - start_date, maturity_date, silver_rate_at_start, total_silver_grams, status

3. **payments**: Record payment transactions
   - id, scheme_id, due_date, paid_date, amount, status
   - payment_method, receipt_number, notes

4. **settings**: Application configuration
   - id, key, value, description

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | No |

### Tailwind Configuration

The app uses a custom Tailwind configuration with extended colors for the navy/silver theme. See `tailwind.config.js` for details.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository to Vercel
3. Add environment variables in Vercel settings
4. Deploy!

### Self-hosting

```bash
npm run build
npm start
```

Or use Docker:

```bash
docker build -t silver-savings .
docker run -p 3000:3000 silver-savings
```

## 📱 Features in Detail

### Dashboard
- Overview statistics (customers, schemes, collections)
- Monthly collection trend chart
- Recent payments list
- Active schemes table

### Customers
- Add/edit/delete customers
- Search and filter
- Customer status management
- Contact information storage

### Schemes
- Create new savings schemes
- Track progress (months paid vs total)
- Calculate silver entitlement
- Manage scheme status

### Payments
- Record payments
- Mark as paid/pending/overdue
- Payment method tracking
- Receipt number management

### Inventory
- Update current silver rate
- Calculate total liability
- View collected vs liability difference
- Per-scheme breakdown

### Export
- Export customers to CSV
- Export schemes to CSV
- Export payments to CSV
- Generate PDF reports

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Backend as a Service (PostgreSQL)
- **Recharts**: Charting library
- **Lucide React**: Icon library
- **date-fns**: Date formatting

## 📄 License

MIT License - feel free to use this for personal or commercial projects.

## 🤝 Support

If you encounter any issues:

1. Check that your Supabase environment variables are set correctly
2. Ensure the database schema has been created
3. Check the browser console for error messages
4. Verify your Supabase project is active

## 🙏 Credits

Built with ❤️ using modern web technologies.

---

**Silver Savings Scheme** - Simple, Fast, Clean, Beautiful, Lightweight