import sys
from pathlib import Path
import os
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parent.parent))
    from backend import models, schemas  # type: ignore
    from backend.database import Base, engine, get_db  # type: ignore
else:
    from . import models, schemas
    from .database import Base, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI CRUD Example")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_ORIGINS"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/items", response_model=schemas.Item, status_code=201)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    db_item = models.Item(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@app.get("/items", response_model=list[schemas.Item])
def list_items(db: Session = Depends(get_db)):
    return db.query(models.Item).all()


@app.get("/items/{item_id}", response_model=schemas.Item)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: int, payload: schemas.ItemUpdate, db: Session = Depends(get_db)
):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in payload.dict().items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(item)
    db.commit()
    return None


if __name__ == "__main__":
    import uvicorn

    # When running as a script, avoid reload (needs import string). For reload,
    # prefer: `uvicorn backend.main:app --reload`.
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)

