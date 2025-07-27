# Voice Translator Backend

FastAPI-based backend server for multilingual voice translation application.

## Features

- 🌍 **Multi-language Translation**: Support for 50+ languages
- 🔄 **Multiple Translation Engines**: Google Translate, OpenAI GPT
- 🗣️ **Language Detection**: Automatic language detection
- 🔐 **User Authentication**: JWT-based auth system
- 📊 **Translation History**: Store and retrieve translation history
- ⚡ **Redis Caching**: Fast response with Redis caching
- 🐘 **PostgreSQL Database**: Reliable data storage
- 📝 **API Documentation**: Auto-generated OpenAPI docs

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Cache**: Redis
- **Authentication**: JWT + OAuth2
- **Translation**: Google Translate API, OpenAI API
- **Language Detection**: langdetect
- **Deployment**: Uvicorn ASGI server

## Quick Start

### 1. Setup

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh
```

### 2. Environment Configuration

Update `.env` file with your configurations:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/translation_db

# Redis
REDIS_URL=redis://localhost:6379/0

# API Keys
GOOGLE_TRANSLATE_API_KEY=your_google_api_key
OPENAI_API_KEY=your_openai_api_key

# JWT
SECRET_KEY=your_super_secret_key
```

### 3. Database Setup

```bash
# Install PostgreSQL and Redis
sudo apt-get install postgresql postgresql-contrib redis-server

# Create database
sudo -u postgres createdb translation_db
sudo -u postgres createuser username --pwprompt

# Run migrations
source venv/bin/activate
alembic upgrade head
```

### 4. Run Server

```bash
# Activate virtual environment
source venv/bin/activate

# Start development server
python main.py

# Or with uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

### Translation

- `POST /api/v1/translate/translate` - Translate text
- `POST /api/v1/translate/detect-language` - Detect language
- `GET /api/v1/translate/languages` - Get supported languages
- `GET /api/v1/translate/history` - Get translation history

### Authentication

- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Health

- `GET /health` - Health check
- `GET /` - API information

## API Usage Examples

### Translate Text

```bash
curl -X POST "http://localhost:8000/api/v1/translate/translate" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "source_language": "en",
    "target_language": "vi",
    "engine": "google"
  }'
```

### Detect Language

```bash
curl -X POST "http://localhost:8000/api/v1/translate/detect-language" \
  -H "Content-Type: application/json" \
  -d '{"text": "Xin chào thế giới"}'
```

### Register User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

## Supported Languages

The API supports translation between 50+ languages including:

- English (en)
- Vietnamese (vi)
- French (fr)
- German (de)
- Spanish (es)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Thai (th)
- Arabic (ar)

## Development

### Project Structure

```
backend/
├── app/
│   ├── api/v1/
│   │   ├── endpoints/
│   │   │   ├── auth.py
│   │   │   └── translation.py
│   │   └── api.py
│   ├── services/
│   │   ├── auth.py
│   │   └── translation.py
│   ├── database.py
│   ├── models.py
│   └── schemas.py
├── alembic/
├── main.py
├── requirements.txt
└── .env.example
```

### Adding New Translation Engine

1. Create new method in `TranslationService`
2. Add engine option to `TranslationRequest` schema
3. Update translation endpoint to handle new engine

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## Production Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables for Production

```env
DATABASE_URL=postgresql://user:pass@db:5432/translation_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=super-secret-production-key
DEBUG=False
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License
