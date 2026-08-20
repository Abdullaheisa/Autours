import { ContestRegistrationDTO } from "@/services/contest/contest.types";

export const mockContestRegistrations: ContestRegistrationDTO[] = [
  {
    id: "m_1",
    name: "Ahmed Youssef",
    phone: "+201012345678",
    email: "ahmed.youssef@example.eg",
    country: "Egypt",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: "m_2",
    name: "Fatima Al-Mansouri",
    phone: "+971501234567",
    email: "fatima.mansouri@example.ae",
    country: "UAE",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: "m_3",
    name: "Khalid Al-Dossari",
    phone: "+966501234567",
    email: "khalid.dossari@example.sa",
    country: "Saudi Arabia",
    date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: "m_4",
    name: "Nour Al-Sabah",
    phone: "+96590123456",
    email: "nour.sabah@example.kw",
    country: "Kuwait",
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: "m_5",
    name: "Yasmine Mahmoud",
    phone: "+201223456789",
    email: "yasmine.mahmoud@example.eg",
    country: "Egypt",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  },
];
