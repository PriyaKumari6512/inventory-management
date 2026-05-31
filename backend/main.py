from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from models import Customer, Order, Product
from routes.customers import router as customers_router
from routes.orders import router as orders_router
from routes.products import router as products_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)


@app.get("/")
def health_check():
	return {"status": "ok", "message": "Inventory API is running"}
