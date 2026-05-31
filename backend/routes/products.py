from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Order, Product
from schemas import ProductCreate, ProductResponse, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("", response_model=ProductResponse)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
	try:
		existing = db.query(Product).filter(Product.sku == payload.sku).first()
		if existing:
			raise HTTPException(status_code=400, detail="SKU already exists")

		if payload.quantity < 0:
			raise HTTPException(status_code=400, detail="Quantity cannot be negative")

		product = Product(
			name=payload.name,
			sku=payload.sku,
			price=payload.price,
			quantity=payload.quantity,
		)
		db.add(product)
		db.commit()
		db.refresh(product)
		return product
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise


@router.get("", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
	try:
		return db.query(Product).all()
	except Exception:
		db.rollback()
		raise


@router.get("/{id}", response_model=ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
	try:
		product = db.query(Product).filter(Product.id == id).first()
		if not product:
			raise HTTPException(status_code=404, detail="Product not found")
		return product
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise


@router.put("/{id}", response_model=ProductResponse)
def update_product(id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
	try:
		product = db.query(Product).filter(Product.id == id).first()
		if not product:
			raise HTTPException(status_code=404, detail="Product not found")

		update_data = payload.model_dump(exclude_unset=True)
		if "quantity" in update_data and update_data["quantity"] is not None:
			if update_data["quantity"] < 0:
				raise HTTPException(
					status_code=400, detail="Quantity cannot be negative"
				)
		for field, value in update_data.items():
			if value is not None:
				setattr(product, field, value)

		db.commit()
		db.refresh(product)
		return product
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise


@router.delete("/{id}")
def delete_product(id: int, db: Session = Depends(get_db)):
	try:
		product = db.query(Product).filter(Product.id == id).first()
		if not product:
			raise HTTPException(status_code=404, detail="Product not found")

		order_exists = db.query(Order).filter(Order.product_id == id).first()
		if order_exists:
			raise HTTPException(
				status_code=400,
				detail=(
					"Cannot delete product because it has existing orders. "
					"Cancel all orders for this product first."
				),
			)

		db.delete(product)
		db.commit()
		return {"message": "Product deleted successfully"}
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise
