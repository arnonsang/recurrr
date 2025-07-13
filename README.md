# 🔄 Recurrr - Subscription Tracking

A prototype of subscription tracking application built with SvelteKit, designed to help you manage and monitor your recurring payments with ease.

> Recurrr is a **prototype for proof of concept and is not a production-ready application**. This project was created for demonstration purposes to showcase modern web development practices with SvelteKit.

>⚠️ No design and experience polish has been applied yet.

>⚠️ Zero security features have been implemented, and the app is not ready for real-world use.

![Recurrr Logo](static/recurrr-logo.jpg)


## 🛠️ Tech Stack

- **Frontend**: SvelteKit 5, TypeScript
- **Styling**: Tailwind CSS 4, DaisyUI
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Lucia Auth with Argon2 password hashing
- **Icons**: Lucide Svelte
- **Development**: Vite, ESLint, Prettier
- **Testing**: Vitest, Playwright

## 🚀 Getting Started

### Prerequisites

- Bun (recommended) or npm/pnpm/yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sv-subtrack
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up the database**
   ```bash
   bun run db:push
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable Svelte components
│   │   ├── CurrencyDisplay.svelte
│   │   ├── PaymentCalendar.svelte
│   │   └── SubscriptionCard.svelte
│   └── server/              # Server-side utilities
│       ├── auth.ts          # Authentication logic
│       ├── currency.ts      # Currency handling
│       ├── subscription.ts  # Subscription management
│       └── db/              # Database schema and config
├── routes/                  # SvelteKit routes
│   ├── api/                 # API endpoints
│   ├── dashboard/           # User dashboard
│   ├── login/               # Authentication pages
│   ├── register/
│   └── subscriptions/       # Subscription management
└── static/                  # Static assets
```

## 🗄️ Database Commands

- **Push schema changes**: `bun run db:push`
- **Run migrations**: `bun run db:migrate`
- **Open database studio**: `bun run db:studio`

## 📝 Development Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Type check
- `bun run lint` - Lint code
- `bun run format` - Format code with Prettier

## 🔧 Configuration

The project uses several configuration files:

- `svelte.config.js` - SvelteKit configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `drizzle.config.ts` - Database configuration
- `eslint.config.js` - ESLint rules

## 🚀 Deployment

The app is configured for Vercel deployment [@sveltejs/adapter-vercel](https://svelte.dev/docs/kit/adapter-vercel):

```bash
bun run build
```

The built application will be in the `build/` directory, ready for deployment.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---


**⚠️ Important Notice**: Recurrr is currently a **prototype for proof of concept** and is not a production-ready application. This project was created for demonstration purposes to showcase modern web development practices with SvelteKit for feedback or ideas, feel free to reach us at [hello@jlrlab.me](mailto:hello@jlrlab.me).


*Built with ❤️ using SvelteKit*