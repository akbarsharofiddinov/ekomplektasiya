interface IRegion {
  id: string;
  name: string;
  number: number;
}

interface IDistrict {
  id: string;
  number: number;
  name: string;
  region: string;
}

interface IWarehouse {
  id: string;
  number: number;
  name: string;
  region: string;
  district: string;
  for_district: boolean;
  for_central: boolean;
}

interface ICounterparty {
  id: string;
  name: string;
  idd: string;
  type: string;
  leader_name: string;
  accountant_name: string;
}

interface Product {
  row_number: number;
  bar_code: string;
  product_code: string;
  product: string;
  model: string;
  product_type: string;
  size: string;
  date_party: string; // ISO date string (e.g. "2024-09-27T00:00:00")
  price: number;
  quantity: number;
  unit: string;
  summa: number;
}

interface ITypeOfGoods {
  id: string;
  name: string;
}

interface IReponsiblePerson {
  id: string;
  name: string;
  number: number;
  region: string;
  district: string;
}

interface IProductList {
  id: string;
  name: string;
  product_code: string;
  created_at: string; // ISO date string
}

// Dimension for product and size types
interface IDimension {
  id: string;
  name: string;
  number: number;
}

interface ProductInputData {
  id: string;
  date: string;
  region: string;
  warehouse: string;
  type_goods: string;
  user: string;
  responsible_person: string;
  is_approved: boolean;
  number: number;
}

interface OrderPayload {
  region: string;
  date: string; // ISO date string (e.g. "2024-11-25T00:00:12")
  warehouse: string;
  counterparty: string;
  type_goods: string;
  responsible_person: string;
  is_approved: boolean;
  products: Product[];
}

interface CounterParty {
  name: string;
  inn: string;
  type: string;
  leader_name: string;
  accountant_name: string;
  id?: string;
}

interface OutputProductType {
  product: string;
  model: string;
  product_type: string;
  size: string;
  price: number;
  quantity: number;
  remaining_quantity: number;
  unit: string;
  summa: number;
  description?: string;
}

interface WarehouseOutput {
  date: string; // ISO datetime string
  warehouse: string;
  product_status: string;
  type_output: string;
  responsible_person: string;
  region: string;
  district: string;
  products: OutputProductType[];
}

interface NamedEntity {
  id: string;
  name: string;
}

interface ProductRemainder {
  bar_code: string;
  remaining_quantity: number;
  remaining_summa: number;
  product_code: string;
  price: number;
  product: NamedEntity;
  mxi_code: NamedEntity;
  unit: NamedEntity;
  product_type: NamedEntity;
  model: NamedEntity;
  size: NamedEntity;
  last_delivery_date: string; // ISO datetime string
  interval_between: string;
}

// Transfer types
interface Transfer {
  id: string;
  number: string;
  date: string; // ISO datetime string
  user: string;
  from_warehouse: string;
  to_warehouse: string;
  from_responsible_person: string;
  to_responsible_person: string;
  transfer_type: string;
  is_approved: boolean;
  is_accepted: boolean;
  sent_for_approval: boolean;
}

interface CurrentUserInfo {
  id: string;
  name: string;
  type_user: string;
  employee: {
    id: string;
    name: string;
    phone_number: string;
  };
  region: NamedEntity;
  district: NamedEntity;
  warehouse: NamedEntity;
}

interface test {
  row_number: number;
  bar_code: string;
  product: NamedEntity;
  product_type: string;
  size: string;
  unit: string;
  price: number;
  quantity: number;
  remaining_quantity: number;
  summa: number;
  description: string;
}

interface TransferProduct {
  row_number: number;
  bar_code: string;
  product: NamedEntity;
  product_type: string;
  size: string;
  unit: string;
  price: number;
  quantity: number;
  remaining_quantity: number;
  summa: number;
  description: string;
}

interface CreateTransferPayload {
  date: string; // ISO datetime string
  transfer_type: string;
  from_region: string;
  from_district: string;
  from_warehouse: string;
  from_responsible_person: string;
  to_region: string;
  to_district: string;
  to_warehouse: string;
  to_responsible_person: string;
  is_approved: boolean;
  products: TransferProduct[];
}

interface SpecialProductFieldType {
  id: string;
  number: number;
  name: string;
  name_uz: string;
}