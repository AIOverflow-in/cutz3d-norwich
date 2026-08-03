export type Service = {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: "Hair" | "Beard" | "Kids";
  popular?: boolean;
};

export const services: Service[] = [
  { id: "skin-fade", name: "Skin Fade", description: "Seamless, close finish with a sharp line-up.", duration: 45, price: 22, category: "Hair", popular: true },
  { id: "taper-fade", name: "Taper Fade", description: "Clean temple and neckline taper, styled on top.", duration: 40, price: 21, category: "Hair" },
  { id: "classic-cut", name: "Classic Cut", description: "Consultation, precision cut and finished style.", duration: 30, price: 18, category: "Hair" },
  { id: "cut-beard", name: "Cut & Beard", description: "A complete cut, beard sculpt and detail finish.", duration: 60, price: 30, category: "Hair", popular: true },
  { id: "restyle", name: "Restyle", description: "A fresh direction with extra time for the transformation.", duration: 55, price: 25, category: "Hair" },
  { id: "beard-sculpt", name: "Beard Sculpt", description: "Shape, line-up and finish tailored to your face.", duration: 25, price: 13, category: "Beard" },
  { id: "kids-cut", name: "Kids' Cut", description: "A calm, comfortable cut for clients aged 12 and under.", duration: 30, price: 15, category: "Kids" },
  { id: "hot-towel", name: "Hot Towel & Razor Detail", description: "A standalone hot-towel treatment with precise razor detailing.", duration: 20, price: 12, category: "Beard" },
];

export const faqs = [
  { q: "Where is 3D Cutz in Norwich?", a: "You’ll find us at 19 Prince of Wales Road, Norwich, NR1 1BD, a short walk from Norwich railway station and the city centre." },
  { q: "Can I book a skin fade online?", a: "Yes. Choose Skin Fade in the booking flow, pick an available date and time, and you’ll receive an instant booking reference." },
  { q: "Can I change or cancel a booking?", a: "Yes. Open Manage booking, enter your booking reference and email, then choose a new slot or cancel your appointment." },
  { q: "Do you cut children’s hair?", a: "Yes. Select Kids’ Cut when booking. It is designed for children aged 12 and under." },
];

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type Booking = {
  id: string;
  reference: string;
  customerName: string;
  email: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  date: string;
  time: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
};

export const demoBookings: Booking[] = [
  { id: "demo-1", reference: "3D-2408", customerName: "Alex Morgan", email: "alex@example.com", phone: "07700 900123", serviceId: "skin-fade", serviceName: "Skin Fade", price: 22, duration: 45, date: "2026-08-05", time: "10:30", status: "Confirmed", createdAt: "2026-08-01T11:20:00Z" },
  { id: "demo-2", reference: "3D-7214", customerName: "Jamie Reed", email: "jamie@example.com", phone: "07700 900234", serviceId: "cut-beard", serviceName: "Cut & Beard", price: 30, duration: 60, date: "2026-08-05", time: "12:00", status: "Pending", createdAt: "2026-08-02T15:10:00Z" },
  { id: "demo-3", reference: "3D-6182", customerName: "Sam Taylor", email: "sam@example.com", phone: "07700 900345", serviceId: "taper-fade", serviceName: "Taper Fade", price: 21, duration: 40, date: "2026-08-05", time: "14:30", status: "Confirmed", createdAt: "2026-08-02T18:40:00Z" },
  { id: "demo-4", reference: "3D-3951", customerName: "Noah Williams", email: "noah@example.com", phone: "07700 900456", serviceId: "kids-cut", serviceName: "Kids' Cut", price: 15, duration: 30, date: "2026-08-06", time: "11:00", status: "Confirmed", createdAt: "2026-08-03T08:25:00Z" },
  { id: "demo-5", reference: "3D-1846", customerName: "Charlie Wood", email: "charlie@example.com", phone: "07700 900567", serviceId: "beard-sculpt", serviceName: "Beard Sculpt", price: 13, duration: 25, date: "2026-08-06", time: "13:30", status: "Completed", createdAt: "2026-07-31T16:05:00Z" },
];
