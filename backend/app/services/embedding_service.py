from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

def build_book_text(book: dict) -> str:
    return " ".join([
        str(book.get("title", "")),
        str(book.get("author", "")),
        str(book.get("categories", "")),
        str(book.get("description", ""))
    ])

def get_embedding(text: str) -> list[float]:
    return model.encode(text).tolist()