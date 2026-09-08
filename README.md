# Book Recommendation System with Vector Search

A full-stack application for semantic book search and recommendations powered by vector embeddings and Milvus vector database. The system supports semantic search, full-text search, and hybrid search combining both approaches.

## Architecture

```
.
├── frontend/        # Angular 20 SPA
├── backend/         # FastAPI REST API (Python)
├── Podaci/          # Data ingestion scripts (TypeScript/Node.js)
└── Podaci/docker-compose.yml  # Milvus infrastructure
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 20, TypeScript |
| Backend | FastAPI, Python, SQLAlchemy |
| Relational DB | PostgreSQL |
| Vector DB | Milvus (standalone) |
| Embeddings | `nomic-ai/nomic-embed-text-v1.5` (via sentence-transformers) |
| Object Storage | MinIO |
| Coordination | etcd |
| Containerization | Docker Compose |

---

## Features

- **Semantic Search** — vector similarity search using cosine distance in Milvus
- **Full-Text Search** — keyword-based scoring across title, author, description, and categories
- **Hybrid Search** — combined ranking of semantic and full-text scores
- **Book CRUD** — create, retrieve, and list books via PostgreSQL
- **Collection Management** — create, describe, and drop Milvus collections via API
- **Index Management** — create and drop vector indexes
- **Angular UI** — interactive frontend with dedicated views for each search mode

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- Git

---

## Getting Started

### 1. Start Infrastructure (Milvus, MinIO, etcd)

```bash
cd Podaci
docker compose up -d
```

This starts:
- **Milvus** on port `19530`
- **MinIO** on ports `9000` / `9001`
- **Milvus Insight** (UI) on port `8081`
- **etcd** (internal coordination)

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/app/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/books
MILVUS_HOST=localhost
MILVUS_PORT=19530
```

Download the embedding model (first run only):

```bash
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('nomic-ai/nomic-embed-text-v1.5', trust_remote_code=True)"
```

Seed the Milvus collection:

```bash
python -m app.scripts.seed_milvus
```

Start the API server:

```bash
uvicorn app.main:app --reload --port 8001
```

API docs available at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:4200`

---

## API Endpoints

### Books

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books/` | List all books |
| GET | `/api/books/top-rated` | Get top-rated books |
| GET | `/api/books/{id}` | Get book by ID |
| POST | `/api/books/` | Create a new book |

### Search (Milvus)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/milvus/semantic` | Semantic vector search |
| POST | `/api/milvus/fulltext` | Full-text keyword search |
| POST | `/api/milvus/hybrid` | Hybrid search (semantic + full-text) |

**Search request body:**
```json
{
  "text": "science fiction space exploration",
  "topK": 5
}
```

### Collections & Indexes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/milvus/collections` | List all collections |
| GET | `/api/milvus/collection/{name}` | Describe a collection |
| DELETE | `/api/milvus/collection/{name}` | Drop a collection |
| POST | `/api/milvus/indexes` | List indexes |
| DELETE | `/api/milvus/index/{collection}/{index}` | Drop an index |
| POST | `/api/milvus/query` | Query with filter expression |
| POST | `/api/milvus/getById` | Get vector by ID |
| DELETE | `/api/milvus/delete/{collection}/{id}` | Delete a vector |

---

## Data Ingestion (TypeScript Scripts)

Scripts located in `Podaci/src/scripts/`:

```bash
cd Podaci
npm install
```

| Script | Description |
|---|---|
| `popunipg.ts` | Seed PostgreSQL with book data |
| `popuniMilvus.ts` | Populate Milvus collection with embeddings |
| `kolekcija.ts` | Create/configure Milvus collection |
| `embedding.ts` | Generate embeddings locally |
| `translateOpenAI.ts` | Translate book data via OpenAI API |
| `prikazMilvuse.ts` | Display Milvus collection contents |

Run a script:

```bash
npx tsx src/scripts/<script-name>.ts
```

---

## Project Structure

```
backend/
├── app/
│   ├── api/routes/
│   │   ├── books.py              # Book CRUD routes
│   │   └── milvus.py             # Search & collection routes
│   ├── core/
│   │   ├── config.py             # Environment configuration
│   │   └── database.py           # SQLAlchemy session
│   ├── models/book.py            # SQLAlchemy ORM model
│   ├── schemas/book.py           # Pydantic schemas
│   ├── services/
│   │   ├── book_service.py       # Book business logic
│   │   ├── embedding_service.py  # nomic-embed-text wrapper
│   │   ├── milvus_service.py     # Semantic/fulltext/hybrid search
│   │   └── csv_service.py        # CSV data loading
│   ├── scripts/
│   │   ├── seed_milvus.py        # Milvus seeding script
│   │   └── download_dataset.py   # Dataset download
│   └── main.py                   # FastAPI application entry point

frontend/
├── src/app/
│   ├── component/
│   │   ├── home.component/           # Landing page
│   │   ├── search.component/         # Semantic search UI
│   │   ├── hybridsearch.component/   # Hybrid search UI
│   │   ├── query.component/          # Query builder UI
│   │   ├── collection.component/     # Collection management UI
│   │   ├── vector.component/         # Vector management UI
│   │   ├── index.component/          # Index management UI
│   │   ├── navbar.component/         # Navigation bar
│   │   └── about.component/          # About page
│   ├── app.routes.ts                 # Angular routing
│   └── app.config.ts                 # App configuration
└── src/services/services.ts          # HTTP service layer
```

---

## How Hybrid Search Works

1. **Semantic search** — the query is encoded using `nomic-embed-text-v1.5` into a 384-dimensional vector, then compared against stored book vectors in Milvus using cosine similarity.
2. **Full-text search** — keyword matching across book fields (title, author, description, categories) with simple scoring.
3. **Hybrid scoring** — results from both methods are merged and ranked by a combined score:

```
hybrid_score = semantic_score + fulltext_score
```

---

## Health Check

```bash
curl http://localhost:8000/health
# {"status": "ok"}
```
