"use client";

import { useParams } from "next/navigation";
import RentalDetailSection from "../../sections/rentals/RentalDetailSection";

export default function RentalDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <RentalDetailSection id={id} />;
}
