from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String

from database import Base


class Product(Base):
	__tablename__ = "products"

	id = Column(Integer, primary_key=True, autoincrement=True)
	name = Column(String, nullable=False)
	sku = Column(String, unique=True, nullable=False)
	price = Column(Float, nullable=False)
	quantity = Column(Integer, default=0)
	created_at = Column(DateTime, default=datetime.utcnow)


class Customer(Base):
	__tablename__ = "customers"

	id = Column(Integer, primary_key=True, autoincrement=True)
	full_name = Column(String, nullable=False)
	email = Column(String, unique=True, nullable=False)
	phone = Column(String, nullable=True)
	created_at = Column(DateTime, default=datetime.utcnow)


class Order(Base):
	__tablename__ = "orders"

	id = Column(Integer, primary_key=True, autoincrement=True)
	customer_id = Column(Integer, ForeignKey("customers.id"))
	product_id = Column(Integer, ForeignKey("products.id"))
	quantity = Column(Integer, nullable=False)
	total_amount = Column(Float, nullable=True)
	status = Column(String, default="pending")
	created_at = Column(DateTime, default=datetime.utcnow)
