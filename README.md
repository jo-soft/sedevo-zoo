# Project Overview

This project is a full-stack application for managing animals, including their details, file uploads, and API interactions. It consists of a **frontend** built with Angular and a **backend** built with Django.

## Requirements

### General
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Python** (v3.9 or higher)
- **pip** (latest version)
- **Django** (v5.2.1)
- **Angular CLI** (v15 or higher)
- **Virtualenv** (for Python environment)

### Backend Dependencies
- Django
- Django REST Framework
- Other dependencies listed in `backend/requirements.txt`

### Frontend Dependencies
- Angular (v19 or higher)
- Three.js (v0.153.0)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone git@github.com:jo-soft/sedevo-zoo.git
cd sedevo-zoo
```

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Apply migrations:
   ```bash
   python manage.py migrate
   ```
5. Load initial data (optional):
   ```bash
   python manage.py loaddata animals.json
   ```
6. Start the backend server:
   ```bash
   python manage.py runserver
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests (optional):
   ```bash
   npm test
   ```
4. Start the frontend development server:
   ```bash
   ng serve
   ```

### 4. Running Tests
- **Frontend Tests**: Run the following command in the `frontend` directory:
  ```bash
  npm test
  ```
- **Backend Tests**: Run the following command in the `backend` directory:
  ```bash
  python manage.py test
  ```

### 5. Git Hooks
This project uses Git hooks to ensure code quality and prevent errors before committing or pushing code. The hooks are enabled by default.

#### Pre-Commit Hook
The pre-commit hook runs linting and formatting checks on the frontend code. It ensures that all staged files meet the project's coding standards before committing.

#### Pre-Push Hook
The pre-push hook runs tests for both the frontend and backend. It executes the following steps:
1. Runs frontend tests using `ng test --watch=false`.
2. Activates the Python virtual environment and runs backend tests using `./manage.py test`.

### 6. Proxy Logic in the Frontend
The frontend uses a proxy configuration to route API requests to the backend during development. This avoids cross-origin issues and simplifies API calls. The proxies are enabled by default, as the application depends on them to function correctly.

The proxy configuration is defined in `frontend/src/proxy.conf.json`:

- **`/api/**`**: Routes API requests to the backend server at `http://localhost:8000`. The `/api` prefix is removed from the request path.
- **`/model/**`**: Routes model-related requests to `http://localhost:8000/model`. The `/model` prefix is removed to avoid duplicated `model` in the request path.

Without this configuration, the application will not work as expected due to cross-origin restrictions.

### 7. Accessing the Application
- **Frontend**: Open `http://localhost:4200` in your browser.
- **Backend API**: Access `http://localhost:8000` for API endpoints.

## Notes
- Ensure the backend and frontend servers are running simultaneously.
- Update `.env` files for environment-specific configurations if required.
