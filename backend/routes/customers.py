from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models import Customer
from schemas import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerResponse)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
	try:
		existing = db.query(Customer).filter(Customer.email == payload.email).first()
		if existing:
			raise HTTPException(status_code=400, detail="Email already exists")

		customer = Customer(
			full_name=payload.full_name,
			email=payload.email,
			phone=payload.phone,
		)
		db.add(customer)
		db.commit()
		db.refresh(customer)
		return customer
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise


@router.get("", response_model=List[CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
	try:
		return db.query(Customer).all()
	except Exception:
		db.rollback()
		raise


@router.get("/{id}", response_model=CustomerResponse)
def get_customer(id: int, db: Session = Depends(get_db)):
	try:
		customer = db.query(Customer).filter(Customer.id == id).first()
		if not customer:
			raise HTTPException(status_code=404, detail="Customer not found")
		return customer
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise


@router.delete("/{id}")
def delete_customer(id: int, db: Session = Depends(get_db)):
	try:
		customer = db.query(Customer).filter(Customer.id == id).first()
		if not customer:
			raise HTTPException(status_code=404, detail="Customer not found")

		db.delete(customer)
		db.commit()
		return {"message": "Customer deleted successfully"}
	except IntegrityError:
		db.rollback()
		raise HTTPException(
			status_code=400, detail="Customer has existing orders"
		)
	except HTTPException:
		db.rollback()
		raise
	except Exception:
		db.rollback()
		raise
