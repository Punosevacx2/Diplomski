from fastapi import APIRouter
from pydantic import BaseModel
from app.services.milvus_service import (
    search_semantic_books,
    search_fulltext_books,
    search_hybrid_books
)

router = APIRouter()

class SearchPayload(BaseModel):
    query: str
    limit: int = 5

@router.post("/search/semantic")
def semantic_search(payload: SearchPayload):
    return search_semantic_books(payload.query, payload.limit)

@router.post("/search/fulltext")
def fulltext_search(payload: SearchPayload):
    return search_fulltext_books(payload.query, payload.limit)

@router.post("/search/hybrid")
def hybrid_search(payload: SearchPayload):
    return search_hybrid_books(payload.query, payload.limit)