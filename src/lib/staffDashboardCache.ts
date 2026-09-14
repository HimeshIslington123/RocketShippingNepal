// ======================================================
// STAFF DASHBOARD CACHE
// ======================================================

export interface Shipment {
  id: string;
  trackingNumber: string;

  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;

  packageType: string;
  weight: number;

  paymentType: string;
  codAmount: number;
  shippingCharge: number;

  status: ShipmentStatus;

  createdAt: string;

  vendor?: {
    id: number;
    companyName: string;
  } | null;

  rider?: {
    id: number;
    phone: string;

    user?: {
      id: number;
      name: string;
    } | null;
  } | null;
}

export type ShipmentStatus =
  | "CREATED"
  | "IN_WAREHOUSE"
  | "ASSIGNED_TO_RIDER"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURN_ASSIGNED_TO_RIDER"
  | "RETURN_PICKED_UP_FROM_CUSTOMER"
  | "RETURN_IN_WAREHOUSE"
  | "OUT_FOR_RETURN"
  | "RETURNED_TO_VENDOR";

export interface DashboardData {
  shipments: {
    total: number;
    created: number;
    inWarehouse: number;
    assignedToRider: number;
    outForDelivery: number;
    delivered: number;
    returned: number;
    cancelled: number;
  };

  pickups: {
    requested: number;
  };

  recentShipments: Shipment[];
}

// ======================================================
// IN-MEMORY CACHE
// ======================================================

let dashboardCache: DashboardData | null = null;

// ======================================================
// GET CACHE
// ======================================================

export function getStaffDashboardCache(): DashboardData | null {
  return dashboardCache;
}

// ======================================================
// SET CACHE
// ======================================================

export function setStaffDashboardCache(
  data: DashboardData
): void {
  dashboardCache = data;
}

// ======================================================
// CLEAR CACHE
// ======================================================

export function clearStaffDashboardCache(): void {
  dashboardCache = null;
}