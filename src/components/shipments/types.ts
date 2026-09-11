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

/* =========================================================
   RIDER
========================================================= */

export type Rider = {
  id: number;

  phone?: string | null;

  isAvailable?: boolean;

  vehicleNumber?: string | null;

  latitude?: number | null;

  longitude?: number | null;

  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
};

/* =========================================================
   TRACKING
========================================================= */

export type ReturnTracking = {
  id: string;

  status: string;

  location?: string | null;

  message?: string | null;

  createdAt: string;
};

/* =========================================================
   SHIPMENT LOCATION
========================================================= */

export type ShipmentLocation = {
  id?: number;

  name?: string | null;

  zone?: string | null;
};

/* =========================================================
   SHIPMENT DELIVERY TYPE
========================================================= */

export type ShipmentDeliveryType = {
  id?: number;

  name?: string | null;
};

/* =========================================================
   LOCATION RATE
========================================================= */

export type ShipmentLocationRate = {
  location?: ShipmentLocation | null;

  deliveryType?: ShipmentDeliveryType | null;
};

/* =========================================================
   VENDOR
========================================================= */

export type ShipmentVendor = {
  id?: number;

  name?: string | null;

  companyName?: string | null;

  location?: string | null;

  address?: string | null;
};

/* =========================================================
   NORMAL SHIPMENT
========================================================= */

export type Shipment = {
  /* -------------------------------------------------------
     BASIC
  ------------------------------------------------------- */

  id: string;

  trackingNumber: string;

  status: string;

  origin?: string | null;

  zone?: string | null;

  deliveryZone?: string | null;

  deliveryType?: string | null;

  /* -------------------------------------------------------
     PACKAGE
  ------------------------------------------------------- */

  weight?: number | null;

  shippingCharge?: number | null;

  packageType?: string | null;

  /* -------------------------------------------------------
     PAYMENT
  ------------------------------------------------------- */

  paymentType?: string | null;

  codAmount?: number | null;

  /* -------------------------------------------------------
     RECEIVER
  ------------------------------------------------------- */

  receiverName?: string | null;

  receiverPhone?: string | null;

  receiverAddress?: string | null;

  /* -------------------------------------------------------
     NOTES
  ------------------------------------------------------- */

  notes?: string | null;

  /* -------------------------------------------------------
     RIDER
  ------------------------------------------------------- */

  riderId?: number | null;

  rider?: Rider | null;

  /* -------------------------------------------------------
     VENDOR
  ------------------------------------------------------- */

  vendor?: ShipmentVendor | null;

  /* -------------------------------------------------------
     LOCATION RATE
  ------------------------------------------------------- */

  locationRate?: ShipmentLocationRate | null;

  /* -------------------------------------------------------
     TRACKINGS
  ------------------------------------------------------- */

  trackings?: ReturnTracking[];

  /* -------------------------------------------------------
     DATES
  ------------------------------------------------------- */

  createdAt?: string | null;

  updatedAt?: string | null;
};

/* =========================================================
   RETURN REQUEST
========================================================= */

export type ReturnRequest = {
  /* -------------------------------------------------------
     BASIC
  ------------------------------------------------------- */

  id: string;

  shipmentId: string;

  status: ReturnStatus;

  reason: ReturnReason;

  description?: string | null;

  /* -------------------------------------------------------
     ORIGINAL PICKUP RIDER
  ------------------------------------------------------- */

  riderId?: number | null;

  rider?: Rider | null;

  /* -------------------------------------------------------
     WAREHOUSE -> VENDOR RIDER
  ------------------------------------------------------- */

  returnDeliveryRiderId?: number | null;

  returnDeliveryRider?: Rider | null;

  /* -------------------------------------------------------
     DELIVERY OPTION
  ------------------------------------------------------- */

  deliveryOption?: ReturnDeliveryOption | null;

  /* -------------------------------------------------------
     DATES
  ------------------------------------------------------- */

  requestedAt?: string | null;

  pickedUpAt?: string | null;

  completedAt?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;

  /* -------------------------------------------------------
     SHIPMENT
  ------------------------------------------------------- */

  shipment: {
    /* -----------------------------------------------------
       BASIC
    ----------------------------------------------------- */

    id: string;

    trackingNumber: string;

    status: string;

    origin?: string | null;

    zone?: string | null;

    deliveryType?: string | null;

    /* -----------------------------------------------------
       PACKAGE
    ----------------------------------------------------- */

    weight?: number | null;

    shippingCharge?: number | null;

    packageType?: string | null;

    /* -----------------------------------------------------
       PAYMENT
    ----------------------------------------------------- */

    paymentType?: string | null;

    /* -----------------------------------------------------
       VENDOR
    ----------------------------------------------------- */

    vendor?: {
      id?: number;

      name?: string | null;

      companyName?: string | null;

      location?: string | null;

      address?: string | null;
    } | null;

    /* -----------------------------------------------------
       CUSTOMER
    ----------------------------------------------------- */

    customer?: {
      id?: number;

      name?: string | null;

      phone?: string | null;

      address?: string | null;
    } | null;

    /* -----------------------------------------------------
       TRACKINGS
    ----------------------------------------------------- */

    trackings?: ReturnTracking[];
  };
};