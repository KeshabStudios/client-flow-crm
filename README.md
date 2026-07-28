# CRM Pro

A modern, full-featured **Customer Relationship Management (CRM)** application built with React, TypeScript, and Supabase. Manage customers, leads, tasks, and your sales pipeline with a clean, intuitive drag-and-drop Kanban board.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

---

## ✨ Features

### 📊 Dashboard
- Real-time business overview with key performance metrics
- Quick-glance **stats cards** (customers, leads, tasks)
- **Welcome card** with team snapshot, tasks due today, and new additions
- **Recent activities** feed — latest leads, tasks, and customer additions
- **Upcoming tasks** card with priority badges
- **Lead status pie chart** — see your pipeline distribution at a glance
- **Monthly leads bar chart** — track lead generation trends over time

### 👥 Customers
- Full customer directory with search, filter, and pagination
- Quick-create customer modal
- Rich customer details (name, company, email, phone, status)
- Active/inactive/lead status management

### 📈 Leads (Pipeline)
- Complete **leads table** with sortable columns, search, and pagination
- Lead stages: **New → Qualified → Proposal → Negotiation → Won → Lost**
- Track deal value, source, expected close date
- Quick stage updates, inline editing
- Lead detail view with full information

### 🎯 Kanban Board
- **Drag and drop** leads between pipeline stages
- Stage-colored cards with accent borders
- Optimistic updates for instant drag feedback
- Empty state drop zones for each column
- Visual stage indicators and lead count badges

### ✅ Tasks
- Create, edit, complete, and delete tasks
- Priority levels (low, medium, high)
- Status tracking (todo, in-progress, completed)
- Due date management

### 👤 Profile & Settings
- User profile with avatar, name, phone
- App settings: theme, language, currency, notifications
- Multi-language support (English, Bengali)
- Light/dark theme toggle

### 🔐 Authentication
- Email/password sign-up and login
- Password reset flow
- Supabase Auth integration
- Protected routes with automatic redirects

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19 with TypeScript |
| **Build Tool** | Vite 8 |
| **Routing** | React Router v6 |
| **Backend & Auth** | Supabase |
| **Styling** | Tailwind CSS 3 |
| **UI Library** | shadcn/ui (Radix primitives) |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |
| **Drag & Drop** | @dnd-kit |
| **Charts** | Recharts |
| **Date Handling** | date-fns |
| **State Management** | React Context + TanStack Query |
| **Theming** | next-themes |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- A **Supabase** project (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/crm-pro.git
cd crm-pro

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:8080**

### Environment Setup

The app comes pre-configured with a Supabase project. If you want to use your own:

1. Create a new project on [supabase.com](https://supabase.com)
2. Update the credentials in `src/integrations/supabase/client.ts`
3. Run the database migrations (see tables below)

### Database Schema

The app uses the following Supabase tables:

- **profiles** — User profiles (auto-created on signup)
- **customers** — Customer records
- **leads** — Sales pipeline leads with stages
- **tasks** — User tasks with priorities and due dates
- **user_settings** — Per-user app preferences

Row-Level Security (RLS) is enabled on all tables to ensure users can only access their own data.

---

## 📁 Project Structure

```
src/
├── App.tsx                       # Route definitions
├── main.tsx                      # Entry point
├── components/
│   ├── dashboard/                # Dashboard widgets
│   │   ├── WelcomeCard.tsx
│   │   ├── RecentActivities.tsx
│   │   ├── UpcomingTasksCard.tsx
│   │   ├── LeadStatusChart.tsx
│   │   └── MonthlyLeadsChart.tsx
│   ├── layout/                   # App shell
│   │   ├── AppLayout.tsx
│   │   ├── AppSidebar.tsx
│   │   ├── AppNavbar.tsx
│   │   └── SearchCommand.tsx
│   ├── leads/                    # Leads & Kanban
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── KanbanCard.tsx
│   │   ├── LeadForm.tsx
│   │   ├── LeadDetail.tsx
│   │   └── LeadDeleteDialog.tsx
│   ├── shared/                   # Shared UI components
│   │   ├── PageHeader.tsx
│   │   ├── StatsCard.tsx
│   │   ├── ErrorState.tsx
│   │   ├── TableSkeleton.tsx
│   │   └── SeoHead.tsx
│   └── ui/                       # shadcn/ui components
├── contexts/                     # React Contexts (Auth, Currency, Language)
├── hooks/                        # Custom hooks
│   ├── useDashboard.ts
│   ├── useCustomers.ts
│   └── useLeads.ts
├── integrations/
│   └── supabase/
│       └── client.ts             # Supabase client
├── lib/                          # Utilities
│   └── utils.ts
├── pages/                        # Route pages
│   ├── Index.tsx                 # Dashboard
│   ├── Customers.tsx
│   ├── Leads.tsx
│   ├── Kanban.tsx
│   ├── Tasks.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Logout.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── ForgotPassword.tsx
│   └── NotFound.tsx
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## 📸 Screenshots

### Dashboard
> *Track key metrics, recent activities, upcoming tasks, lead distribution, and monthly trends — all in one place.*

### Leads Table
> *Sort, search, filter, and paginate through your entire sales pipeline.*

### Kanban Board
> *Drag and drop leads across stages with visual stage indicators and instant updates.*

---

## 💡 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 8080) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development mode |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🌍 Internationalization

The app supports English and Bengali (`bn`). Language is toggled from the Settings page or can be configured per user.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🧪 Demo Account

You can use the following demo account to explore the app with pre-loaded dummy data (Indian business scenarios):

| Field | Value |
|-------|-------|
| **Email** | `demo@bizmanager.in` |
| **Password** | `demo@1234` |
| **Currency** | ₹ (INR) |
| **Language** | বাংলা (Bengali) |

### What's included in the demo:
- 👥 **15 Customers** — Indian businesses (Sharma Enterprises, Patel Industries, Reddy Constructions, Mishra Jewellers, etc.)
- 💼 **24 Leads** — Across all stages (new, qualified, proposal, closed_won)
- 📋 **26 Tasks** — With priority levels and status tracking
- 🔔 **Recent notifications** — In Bengali language

---

## 📄 License

This project is **MIT licensed**.

---

<p align="center">Built with ❤️ using React, Supabase & shadcn/ui</p>
