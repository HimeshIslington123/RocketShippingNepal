export const mainNavLinks = [
  { label: "Home", href: "#home" },
  { label: "Service", href: "#service" },
] as const;

export const pagesDropdown = [
  { label: "About Us", href: "#about" },
  { label: "Our Fleet", href: "#fleet" },
  { label: "Careers", href: "#careers" },
  { label: "Contact", href: "#contact" },
] as const;

export const freightLinks = [
  { label: "Ocean Freight", href: "#ocean-freight" },
  { label: "Air Freight", href: "#air-freight" },
  { label: "Land Freight", href: "#land-freight" },
  { label: "Rail Freight", href: "#rail-freight" },
  { label: "Warehousing", href: "#warehousing" },
  { label: "Supply Chain", href: "#supply-chain" },
] as const;
export const BUSINESS_TYPES = [
  "Sole Proprietorship",
  "Private Limited Company",
  "Partnership Firm",
  "Public Limited Company",
  "NGO / INGO",
  "Government Entity",
  "Other",
];

export const PROVINCE_DISTRICTS: Record<string, string[]> = {
  Koshi: ["Morang", "Sunsari", "Jhapa", "Ilam", "Dhankuta", "Taplejung"],
  Madhesh: ["Dhanusha", "Mahottari", "Parsa", "Bara", "Rautahat", "Siraha"],
  Bagmati: ["Kathmandu", "Lalitpur", "Bhaktapur", "Chitwan", "Makwanpur", "Kavrepalanchok"],
  Gandaki: ["Kaski", "Tanahun", "Syangja", "Baglung", "Lamjung", "Gorkha"],
  Lumbini: ["Rupandehi", "Dang", "Kapilvastu", "Banke", "Palpa", "Arghakhanchi"],
  Karnali: ["Surkhet", "Dailekh", "Jumla", "Kalikot", "Mugu", "Humla"],
  Sudurpashchim: ["Kailali", "Kanchanpur", "Dadeldhura", "Doti", "Baitadi", "Achham"],
};

export const PROVINCES = Object.keys(PROVINCE_DISTRICTS);

export const CARGO_TYPES = [
  "Documents",
  "Electronics",
  "Clothing",
  "Food",
  "Machinery",
  "Other",
];

export const SHIPMENT_VOLUMES = [
  "Under 50 shipments",
  "50 - 200 shipments",
  "200 - 500 shipments",
  "500 - 2,000 shipments",
  "2,000+ shipments",
];