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

/* =========================
   RIDER
========================= */

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

/* =========================
   TRACKING
========================= */

export type ReturnTracking = {
  id: string;
  status: string;
  location?: string | null;
  message?: string | null;
  createdAt: string;
};

/* =========================
   NORMAL SHIPMENT
========================= */

export type Shipment = {
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

  codAmount?: number | null;

  createdAt?: string | null;

  /* =========================
     RECEIVER
  ========================= */

  receiverName?: string | null;

  receiverPhone?: string | null;

  receiverAddress?: string | null;

  /* =========================
     RIDER
  ========================= */

  riderId?: number | null;

  rider?: Rider | null;

  /* =========================
     VENDOR
  ========================= */

  vendor?: {
    id?: number;

    name?: string | null;

    companyName?: string | null;

    location?: string | null;

    address?: string | null;
  } | null;

  /* =========================
     LOCATION RATE
  ========================= */

  locationRate?: {
    location?: {
      id?: number;

      name?: string | null;
    } | null;

    deliveryType?: {
      id?: number;

      name?: string | null;
    } | null;
  } | null;

  /* =========================
     TRACKINGS
  ========================= */

  trackings?: ReturnTracking[];
};

/* =========================
   RETURN REQUEST
========================= */

export type ReturnRequest = {
  id: string;

  shipmentId: string;

  status: ReturnStatus;

  reason: ReturnReason;

  description?: string | null;

  /* =========================
     ORIGINAL PICKUP RIDER
  ========================= */

  riderId?: number | null;

  rider?: Rider | null;

  /* =========================
     WAREHOUSE -> VENDOR RIDER
  ========================= */

  returnDeliveryRiderId?: number | null;

  returnDeliveryRider?: Rider | null;

  /* =========================
     DELIVERY OPTION
  ========================= */

  deliveryOption?: ReturnDeliveryOption | null;

  /* =========================
     DATES
  ========================= */

  requestedAt?: string | null;

  pickedUpAt?: string | null;

  completedAt?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;

  /* =========================
     SHIPMENT
  ========================= */

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

    /* =========================
       VENDOR
    ========================= */

    vendor?: {
      id?: number;

      name?: string | null;

      companyName?: string | null;

      location?: string | null;

      address?: string | null;
    } | null;

    /* =========================
       CUSTOMER
    ========================= */

    customer?: {
      id?: number;

      name?: string | null;

      phone?: string | null;

      address?: string | null;
    } | null;

    /* =========================
       TRACKINGS
    ========================= */

    trackings?: ReturnTracking[];
  };
};