import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Customer, Order, Product
from schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/orders", tags=["Orders"])
logger = logging.getLogger(__name__)


@router.post("", response_model=OrderResponse)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
	try:
		customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
		if not customer:
			raise HTTPException(status_code=404, detail="Customer not found")

		product = db.query(Product).filter(Product.id == payload.product_id).first()
		if not product:
			raise HTTPException(status_code=404, detail="Product not found")

		if payload.quantity < 1:
			raise HTTPException(
				status_code=400, detail="Order quantity must be at least 1"
			)

		available_quantity = product.quantity
		if available_quantity == 0:
			raise HTTPException(status_code=400, detail="Product is out of stock")
		if payload.quantity > available_quantity:
			raise HTTPException(
				status_code=400,
				detail=(
					"Insufficient stock. Only "
					f"{available_quantity} items available"
				),
			)

		total_amount = product.price * payload.quantity
		updated_quantity = available_quantity - payload.quantity
		if updated_quantity < 0:
			raise HTTPException(
				status_code=400,
				detail=(
					"Insufficient stock. Only "
					f"{available_quantity} items available"
				),
			)
		product.quantity = updated_quantity

		order = Order(
			customer_id=payload.customer_id,
			product_id=payload.product_id,
			quantity=payload.quantity,
			total_amount=total_amount,
			status="pending",
		)

		db.add(order)
		db.commit()
		db.refresh(order)
		return order
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise


@router.get("", response_model=List[OrderResponse])
def list_orders(db: Session = Depends(get_db)):
	try:
		return db.query(Order).all()
	except Exception:
		db.rollback()
		raise


@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, db: Session = Depends(get_db)):
	try:
		order = db.query(Order).filter(Order.id == id).first()
		if not order:
			raise HTTPException(status_code=404, detail="Order not found")
		return order
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise


@router.delete("/{id}")
def delete_order(id: int, db: Session = Depends(get_db)):
	try:
		order = db.query(Order).filter(Order.id == id).first()
		if not order:
			raise HTTPException(status_code=404, detail="Order not found")

		product = db.query(Product).filter(Product.id == order.product_id).first()
		if product:
			product.quantity += order.quantity
			db.add(product)
			db.flush()
		else:
			logger.warning(
				"Order %s references missing product %s",
				order.id,
				order.product_id,
			)

		db.delete(order)
		db.commit()
		return {"message": "Order cancelled and stock restored"}
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise
