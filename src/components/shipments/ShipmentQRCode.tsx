"use client";

import QRCode from "react-qr-code";

type ShipmentQRCodeProps = {
  trackingNumber: string;
  size?: number;
};

export default function ShipmentQRCode({
  trackingNumber,
  size = 150,
}: ShipmentQRCodeProps) {
  const trackingUrl =
    `${process.env.NEXT_PUBLIC_APP_URL}/track/${trackingNumber}`;

  return (
    <div className="rounded-xl border bg-white p-3">
      <QRCode
        value={trackingUrl}
        size={size}
      />
    </div>
  );
}