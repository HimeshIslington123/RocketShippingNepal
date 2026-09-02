export type Vendor = {
  id: number;
  companyName: string;
  contactId: string;
  location: string;
  userId: number;
};

export type Location = {
  id: number;
  name: string;
  zone?: string | null;
};

export type DeliveryType = {
  id: number;
  name: string;
};

export type LocationRate = {
  id: number;
  price: number;
  location: Location;
  deliveryType: DeliveryType;
};

export type Rider = {
  id: number;

  phone: string;

  latitude?: number | null;

  longitude?: number | null;

  vehicleNumber?: string | null;

  isAvailable?: boolean;

  userId: number;

  user?: {
    id: number;
    name: string;
    email: string;
  };
};

export type Tracking = {
  id: string;

  status: string;

  createdAt: string;

  location?: string | null;

  message?: string | null;

  createdBy?: string | null;
};

export type ReturnStatus =
  | "REQUESTED"
  | "ASSIGNED_TO_RIDER"
  | "PICKED_UP_FROM_CUSTOMER"
  | "IN_WAREHOUSE"
  | "OUT_FOR_RETURN"
  | "RETURNED_TO_VENDOR"
  | "CANCELLED";

export type ReturnReason =
  | "CUSTOMER_CHANGED_MIND"
  | "WRONG_PRODUCT"
  | "DAMAGED_PRODUCT"
  | "DEFECTIVE_PRODUCT"
  | "WRONG_SIZE"
  | "WRONG_COLOR"
  | "PRODUCT_NOT_AS_DESCRIBED"
  | "OTHER";

export type ReturnRequest = {
  id: string;

  shipmentId: string;

  status: ReturnStatus;

  reason: ReturnReason;

  description?: string | null;

  riderId?: number | null;

  returnCharge?: number | null;

  requestedAt: string;

  pickedUpAt?: string | null;

  completedAt?: string | null;

  notes?: string | null;

  createdAt: string;

  updatedAt: string;

  rider?: Rider | null;

  shipment?: Shipment | null;
};

export type Shipment = {
  id: string;

  trackingNumber: string;

  qrCode?: string | null;

  receiverName: string;

  receiverPhone: string;

  receiverAddress: string;

  packageType: string;

  weight: number;

  paymentType: "PREPAID" | "COD";

  codAmount: number;

  shippingCharge: number;

  notes?: string | null;

  vendorId?: number | null;

  status: string;

  origin?: string;

  deliveryZone?: string | null;

  locationRateId?: number;

  createdAt: string;

  updatedAt?: string;

  vendor?: Vendor;

  createdByStaff?: {
    id: number;

    user?: {
      id: number;

      name: string;

      email: string;
    };
  };

  locationRate?: LocationRate | null;

  rider?: Rider | null;

  riderId?: number | null;

  trackings?: Tracking[];

  returnRequest?: ReturnRequest | null;
};