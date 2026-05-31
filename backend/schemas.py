from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class ProductCreate(BaseModel):
	name: str
	sku: str
	price: float
	quantity: int = 0


class ProductUpdate(BaseModel):
	name: Optional[str] = None
	sku: Optional[str] = None
	price: Optional[float] = None
	quantity: Optional[int] = None


class ProductResponse(BaseModel):
	id: int
	name: str
	sku: str
	price: float
	quantity: int
	created_at: datetime

	model_config = ConfigDict(from_attributes=True)


class CustomerCreate(BaseModel):
	full_name: str
	email: str
	phone: Optional[str] = None


class CustomerResponse(BaseModel):
	id: int
	full_name: str
	email: str
	phone: Optional[str]
	created_at: datetime

	model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
	customer_id: int
	product_id: int
	quantity: int

	@field_validator("quantity")
	@classmethod
	def validate_quantity(cls, value: int) -> int:
		if value < 1:
			raise ValueError("Order quantity must be at least 1")
		return value


class OrderResponse(BaseModel):
	id: int
	customer_id: int
	product_id: int
	quantity: int
	total_amount: float
	status: str
	created_at: datetime

	model_config = ConfigDict(from_attributes=True)
