export const SITE = {
  name: "3D Cutz Norwich",
  shortName: "3D Cutz",
  legalName: "3D CUTZ NORWICH LTD",
  description:
    "Modern barbering in the heart of Norwich. Book skin fades, taper fades, classic cuts, beard trims and kids' cuts online.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.3dcutznorwich.co.uk",
  address: {
    street: "19 Prince of Wales Road",
    city: "Norwich",
    county: "Norfolk",
    postcode: "NR1 1BD",
    country: "GB",
    lat: 52.629278,
    lng: 1.299848,
  },
  social: {
    instagram: "https://www.instagram.com/3d.cutz.norwich/",
    facebook: "https://www.facebook.com/p/3D-CUTZ-61564993418397/",
    google: "https://share.google/JY7sTvyhOGitebbw8",
  },
  companyNumber: "15807546",
} as const;

export const fullAddress = `${SITE.address.street}, ${SITE.address.city} ${SITE.address.postcode}`;
