"use client";

import { useRef } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Printer } from "lucide-react";

export default function StaffIdCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Example data
  const person = {
    id: "Emp-0012",
    name: "Himesh Shakya",
    role: "Full stack developer",
    phone: "9843646045",
    email: "Himesh@gmail.com",

    // Put your actual profile picture here
    profilePicture: "/himesh.png",

    // This can be the rider/staff profile URL
    qrValue: "https://rocketshippingcargo.vercel.app/rider/1",
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* =====================================================
          PAGE
      ====================================================== */}

      <div className="min-h-screen bg-gray-100 px-4 py-10">

        {/* PRINT BUTTON */}

        <div className="mb-6 flex justify-center print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Printer size={18} />
            Print ID Card
          </button>
        </div>

        {/* =====================================================
            ID CARD
        ====================================================== */}

        <div
          ref={cardRef}
          className="id-card relative mx-auto h-[600px] w-[380px] overflow-hidden rounded-xl bg-white shadow-2xl"
        >

          {/* =================================================
              NAVY TOP SECTION
          ================================================= */}

          <div className="absolute left-0 top-0 h-[230px] w-full bg-[#001437]">

            {/* LOGO */}

            <div className="absolute left-0 right-0 top-7 flex justify-center">
              <Image
                src="/icon.png"
                alt="Rocket Shipping"
                width={180}
                height={70}
                className="h-auto w-[180px] object-contain"
              />
            </div>

            {/* COMPANY TEXT */}

            <div className="absolute left-0 right-0 top-[105px] text-center">

              <h1 className="text-[22px] font-extrabold tracking-wide text-white">
                ROCKET SHIPPING
              </h1>

              <p className="mt-1 text-[10px] font-medium tracking-[3px] text-gray-300">
                CARGO & LOGISTICS
              </p>

            </div>

          </div>

          {/* =================================================
              TEAL CURVE
          ================================================= */}

          <div
            className="absolute left-[-60px] top-[170px] h-[125px] w-[500px] rounded-[50%] border-[8px] border-[#28a6a8] bg-white"
          />

          {/* =================================================
              PROFILE IMAGE
          ================================================= */}

          <div className="absolute left-1/2 top-[155px] z-20 -translate-x-1/2">

            <div className="flex h-[135px] w-[135px] items-center justify-center rounded-full border-[7px] border-[#28a6a8] bg-white p-[4px]">

              <div className="relative h-full w-full overflow-hidden rounded-full bg-gray-200">

                <Image
                  src={person.profilePicture}
                  alt={person.name}
                  fill
                  className="object-cover"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              WHITE BODY
          ================================================= */}

          <div className="absolute bottom-0 left-0 right-0 top-[245px] bg-white">

            {/* NAME */}

            <div className="absolute left-0 right-0 top-[55px] text-center">

              <h2 className="text-[25px] font-extrabold uppercase tracking-wide text-[#001437]">
                {person.name}
              </h2>

              <p className="mt-1 text-[15px] font-bold tracking-wider text-[#28a6a8]">
                {person.role}
              </p>

            </div>

            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="absolute left-[48px] right-[30px] top-[135px] space-y-2">

              <InfoRow
                label="ID NO"
                value={person.id}
              />

              <InfoRow
                label="PHONE"
                value={person.phone}
              />

              <InfoRow
                label="E-MAIL"
                value={person.email}
              />

            </div>

            {/* =================================================
                QR CODE
            ================================================= */}

            <div className="absolute bottom-[28px] left-0 right-0 flex justify-center">

              <div className="rounded-lg border-2 border-[#001437] bg-white p-2">

                <QRCode
                  value={person.qrValue}
                  size={82}
                  bgColor="#ffffff"
                  fgColor="#001437"
                />

              </div>

            </div>

            {/* =================================================
                BOTTOM CURVE
            ================================================= */}

           

          </div>

        </div>
      </div>

      {/* =====================================================
          PRINT CSS
      ====================================================== */}

      <style jsx global>{`
        @media print {
          @page {
            size: auto;
            margin: 0;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: white;
          }

          body * {
            visibility: hidden;
          }

          .id-card,
          .id-card * {
            visibility: visible;
          }

          .id-card {
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}

/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[75px_15px_1fr] items-center text-[11px]">

      <span className="font-extrabold text-[#28a6a8]">
        {label}
      </span>

      <span className="font-bold text-gray-500">
        :
      </span>

      <span className="truncate font-semibold text-[#001437]">
        {value}
      </span>

    </div>
  );
}