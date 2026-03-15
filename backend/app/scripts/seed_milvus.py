# test_search.py - stavi ga u root backend foldera i pokreni: python test_search.py

from app.services.milvus_service import search_semantic_books, search_fulltext_books, search_hybrid_books

query = "love and friendship"

print("=" * 50)
print("SEMANTIC SEARCH")
print("=" * 50)
try:
    results = search_semantic_books(query, limit=3)
    for r in results:
        print(f"  [{r['semantic_score']:.4f}] {r['title']} - {r['author']}")
except Exception as e:
    print(f"  GREŠKA: {e}")

print()
print("=" * 50)
print("FULLTEXT SEARCH")
print("=" * 50)
try:
    results = search_fulltext_books(query, limit=3)
    for r in results:
        print(f"  [{r.get('fulltext_score', 0)}] {r.get('title')} - {r.get('author')}")
except Exception as e:
    print(f"  GREŠKA: {e}")

print()
print("=" * 50)
print("HYBRID SEARCH")
print("=" * 50)
try:
    results = search_hybrid_books(query, limit=3)
    for r in results:
        print(f"  [hybrid={r['hybrid_score']:.4f}] {r['title']} - {r['author']}")
except Exception as e:
    print(f"  GREŠKA: {e}")