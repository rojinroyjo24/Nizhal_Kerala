# Hidden Kerala – Hyperlocal Travel Explorer

> A full-stack community platform where users discover and share underrated travel destinations in Kerala 🌿

## Tech Stack
- **Backend**: Python · Django · Django REST Framework · SQLite · Pillow
- **Frontend**: Angular 17 · TypeScript · Bootstrap 5 · AOS animations

## Quick Start

### 1. Backend Setup

```bash
# Activate virtual environment (already created)
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r backend/requirements.txt

# Run database migrations
cd backend
python manage.py migrate

# Seed sample data (10 Kerala places + demo user)
python manage.py seed_data

# Create admin superuser
python manage.py createsuperuser

# Start the Django server
python manage.py runserver
# → http://localhost:8000
# → Admin panel: http://localhost:8000/admin/
```

### 2. Frontend Setup

```bash
# Install Node dependencies
cd frontend
npm install

# Start Angular dev server
npm start
# → http://localhost:4200
```

## Project Structure

```
NIZHAL_KERALA/
├── venv/                    # Python virtual environment
├── backend/
│   ├── config/              # Django project settings & URLs
│   ├── users/               # Custom user model + auth API
│   ├── places/              # Travel places CRUD API
│   │   └── management/commands/seed_data.py
│   ├── reviews/             # Place reviews API
│   ├── media/               # Uploaded images
│   └── manage.py
└── frontend/
    └── src/app/
        ├── components/      # navbar, footer, place-card, star-rating, toast
        ├── pages/           # home, explore, place-detail, add-place, login, register
        ├── services/        # auth, place, review, toast services
        ├── models/          # TypeScript interfaces
        ├── guards/          # auth guard
        └── interceptors/    # HTTP auth interceptor
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Register new user |
| POST | `/api/auth/login/` | No | Login, returns token |
| POST | `/api/auth/logout/` | Yes | Logout |
| GET | `/api/auth/profile/` | Yes | Get current user |
| GET | `/api/places/` | No | List places (filterable) |
| POST | `/api/places/` | Yes | Create a place |
| GET | `/api/places/:id/` | No | Get place details |
| PATCH | `/api/places/:id/` | Owner | Update place |
| DELETE | `/api/places/:id/` | Owner | Delete place |
| GET | `/api/places/:id/reviews/` | No | Get reviews |
| POST | `/api/places/:id/reviews/` | Yes | Submit review |
| GET | `/api/districts/` | No | List all districts |
| GET | `/api/categories/` | No | List categories |

### Query Parameters for `/api/places/`
- `?district=Wayanad` — Filter by district
- `?category=Waterfall` — Filter by category
- `?difficulty=Hard` — Filter by difficulty
- `?search=athirappilly` — Full-text search
- `?sort=latest` — Sort order (latest/oldest)
- `?page=2` — Pagination

## Demo Credentials

After running `seed_data`:
- **Email**: `explorer@example.com`
- **Password**: `password123`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — Hero, featured places, categories |
| `/explore` | Browse & filter all places |
| `/place/:id` | Place details + reviews |
| `/add-place` | Submit a new hidden gem (auth required) |
| `/login` | User login |
| `/register` | New user registration |

## Design Highlights

- 🎨 Deep Forest Green + Warm Sunset Orange color palette
- 🌊 Glassmorphism cards with backdrop blur
- ✨ AOS scroll animations throughout
- 📱 Fully responsive mobile-first design
- 🔒 Token-based auth with HTTP interceptor
- 💫 Skeleton loading states
- 🍞 Toast notifications
- 📸 Drag-and-drop image upload
