import { NextResponse } from 'next/server';
import { cars } from '@/data/cars';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log('--- FILTER PROXY PAYLOAD (MOCKED) ---');
    console.log(JSON.stringify(body, null, 2));

    // Calculate dynamic dates difference or default to 3 days
    const dateFrom = body.date_from ? new Date(body.date_from) : new Date();
    const dateTo = body.date_to ? new Date(body.date_to) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const diffTime = Math.abs(dateTo.getTime() - dateFrom.getTime());
    let daysNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (daysNumber === 0) daysNumber = 1;

    const mockData = {
      location: body.pickupLoc || 'Dubai',
      date_from: body.date_from,
      date_to: body.date_to,
      count: cars.length,
      daysNumber: daysNumber,
      min: 15,
      max: 1500,
      priceTax: 10,
      filteredVehicles: cars.map(c => ({
        ...c,
        id: c.id,
        name: c.name,
        photo: c.image, // Map image to photo for Vehicle type
        price_in_usd: c.price_in_usd,
        supplier: {
          company: c.supplierName || c.supplier?.name || 'Test Supplier',
          logo: c.supplier?.logo,
          rating: c.rating || c.supplier?.rating,
          reviews_count: c.reviewsCount || c.supplier?.reviewsCount,
          rentalTerms: c.supplier?.rentalTerms,
          lat: c.supplier?.lat,
          lng: c.supplier?.lng,
          address: c.supplier?.address,
          instant_confirmation: c.supplier?.instantConfirmation,
        },
        specifications: [
          { name: 'seats', option: String(c.seats || c.passengers) },
          { name: 'doors', option: String(c.doors) },
          { name: 'transmission', option: c.transmission },
          { name: 'fuel', option: c.fuelType },
          { name: 'bags', option: String(c.suitcases) },
          { name: 'type', option: c.type || c.category }
        ],
        included: c.inclusions?.map((inc, i) => ({ id: i, what_is_included: inc })) || [],
        fuelPolicy: c.fuelPolicy,
        locationType: c.locationType,
        freeCancellation: c.freeCancellation
      })),
      filteredCategories: [
        { id: 1, name: 'Sedan', vehicle_count: 2 },
        { id: 2, name: 'SUV', vehicle_count: 2 },
        { id: 3, name: 'Luxury', vehicle_count: 2 }
      ],
      filteredSuppliers: [
        { id: 1, name: 'MAHD Rent', vehicle_count: 1 },
        { id: 2, name: 'Highway', vehicle_count: 1 },
        { id: 3, name: 'Royal Star', vehicle_count: 1 }
      ],
      filteredLocationTypes: [
        { id: 1, name: 'Airport', vehicle_count: 3 },
        { id: 2, name: 'City Center', vehicle_count: 3 }
      ],
      paymentMethods: [
        { id: 1, name: 'Credit Card', vehicle_count: 6 },
        { id: 2, name: 'Cash', vehicle_count: 4 }
      ]
    };

    return NextResponse.json(mockData, { status: 200 });

  } catch (error: any) {
    console.error('Proxy Filter Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
