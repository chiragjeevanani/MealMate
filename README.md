# 🍴 MealMate – Your Interactive Cooking Companion

**MealMate** is a modern and vibrant cooking web app that makes recipes simple and interactive. From beginners to families, MealMate helps everyone cook confidently with **step-by-step recipes, cook-along timers, and animated checkpoints**.

## ✨ Features
- 📖 **Recipe Library** – Browse recipes across categories (veg, non-veg, quick meals, desserts)
- ⏱️ **Cook-Along Mode** – Follow recipes step by step with interactive timers and checkpoints
- 🔍 **Smart Search** – Quickly find dishes you want to cook
- ❤️ **Favorites** – Save and revisit your favorite recipes
- 👤 **User Accounts + Guest Mode** – Sign up with Google/email or start as a guest
- 🗄️ **Supabase Integration** – Authentication & database for storing recipes and user data
- 🤖 **Gemini AI Integration** – Powering smart suggestions and interactions
- 📱 **Responsive Design** – Works on desktop, tablet, and mobile
- 🎨 **Modern Vibrant UI** – Smooth animations and a cooking-inspired theme

## 🛠 Tech Stack
- **Frontend:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** CSS/React Components (custom)
- **Backend/Database:** Supabase
- **Authentication:** Supabase Auth (Google, Email/Password)
- **AI Integration:** Gemini API
- **Deployment:** Vercel / Firebase Hosting

## 🚀 Getting Started

### Prerequisites
- Node.js (>=16)
- npm or yarn
- Supabase project + API keys
- Gemini API key

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mealmate.git
   cd mealmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root and add your keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment
- **Frontend:** Deploy easily on [Vercel](https://vercel.com) or [Firebase Hosting](https://firebase.google.com/products/hosting)
- **Database/Auth:** Managed by [Supabase](https://supabase.com)

## 📂 Project Structure
- `App.tsx` – Main app component
- `pages/` – All page-level components (Home, Categories, RecipeDetail, Favorites, About, Login, Signup, Profile)
- `components/` – Reusable UI components (Header, Footer, RecipeCard, etc.)
- `contexts/` – React contexts for Auth and Favorites
- `services/` – Gemini API integration
- `data/` – Recipe data (static or fetched)

## 🤝 Contributing
Contributions are welcome! Feel free to open issues and pull requests.

## 📜 License
This project is licensed under the MIT License.
