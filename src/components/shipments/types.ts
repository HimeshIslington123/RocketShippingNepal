export type ReturnStatus =
  | "REQUESTED"
  | "ASSIGNED_TO_RIDER"
  | "PICKED_UP_FROM_CUSTOMER"
  | "IN_WAREHOUSE"
  | "OUT_FOR_RETURN"
  | "RETURNED_TO_VENDOR"
  | "CANCELLED";

export type ReturnReason =
  | "DAMAGED"
  | "WRONG_ITEM"
  | "WRONG_SIZE"
  | "DEFECTIVE"
  | "CUSTOMER_CHANGED_MIND"
  | "OTHER";

export type ReturnDeliveryOption =
  | "VENDOR_PICKUP"
  | "DELIVER_TO_VENDOR";

export type Rider = {
  id: number;

  phone?: string | null;

  isAvailable?: boolean;

  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

export type ReturnTracking = {
  id: string;
  status: string;
  location?: string | null;
  message?: string | null;
  createdAt: string;
};

export type ReturnRequest = {
  id: string;

  shipmentId: string;

  status: ReturnStatus;

  reason: ReturnReason;

  description?: string | null;

  // ORIGINAL PICKUP RIDER
  riderId?: number | null;
  rider?: Rider | null;

  // NEW WAREHOUSE -> VENDOR RIDER
  returnDeliveryRiderId?: number | null;
  returnDeliveryRider?: Rider | null;

  deliveryOption?: ReturnDeliveryOption | null;

  requestedAt?: string | null;

  pickedUpAt?: string | null;

  completedAt?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;

  shipment: {
    id: string;

    trackingNumber: string;

    status: string;

    origin?: string | null;

    zone?: string | null;

    deliveryType?: string | null;

    weight?: number | null;

    shippingCharge?: number | null;

    packageType?: string | null;

    paymentType?: string | null;

    vendor?: {
      id?: number;
      name?: string | null;
      location?: string | null;
      address?: string | null;
    } | null;

    customer?: {
      id?: number;
      name?: string | null;
      phone?: string | null;
      address?: string | null;
    } | null;

    trackings?: ReturnTracking[];
  };
};