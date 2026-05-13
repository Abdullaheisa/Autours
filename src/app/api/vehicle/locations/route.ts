import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const locations = [
      { id: 1, location: 'Dubai', name: 'Dubai', country: 'UAE' },
      { id: 2, location: 'Abu Dhabi', name: 'Abu Dhabi', country: 'UAE' },
      { id: 3, location: 'Kuwait City', name: 'Kuwait City', country: 'Kuwait' },
      { id: 4, location: 'Cairo', name: 'Cairo', country: 'Egypt' },
      { id: 5, location: 'Riyadh', name: 'Riyadh', country: 'Saudi Arabia' },
      { id: 6, location: 'Doha', name: 'Doha', country: 'Qatar' },
      { id: 7, location: 'Amman', name: 'Amman', country: 'Jordan' },
      { id: 8, location: 'Muscat', name: 'Muscat', country: 'Oman' },
    ];

    return NextResponse.json(locations, { status: 200 });
  } catch (error: any) {
    console.error('Proxy Locations Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
