import { cars } from "@/data/cars";
import { SupplierComparison } from "@/data/supplierAnalytics";

export const fetchSupplierAnalytics = async (filters: any) => {
  return new Promise<{ data: SupplierComparison[], stats: any }>((resolve) => {
    setTimeout(() => {
      // Create a larger mock dataset by mixing cars and suppliers to show multiple cars per supplier
      let baseCars = [...cars];
      
      // Let's duplicate some cars to different suppliers for realistic mock
      if (baseCars.length > 0) {
        const extraCar1 = { ...baseCars[0], id: 'ex1', name: 'Kia Carnival', category: 'Family', price: { amount: 80, currency: 'KWD', totalDays: 1 } };
        const extraCar2 = { ...baseCars[1], id: 'ex2', name: 'Hyundai Staria', category: 'Family', price: { amount: 90, currency: 'KWD', totalDays: 1 }, supplier: baseCars[0].supplier };
        const extraCar3 = { ...baseCars[2], id: 'ex3', name: 'Toyota Innova', category: 'Family', price: { amount: 100, currency: 'KWD', totalDays: 1 }, supplier: baseCars[0].supplier };
        const extraCar4 = { ...baseCars[3], id: 'ex4', name: 'Toyota Innova', category: 'Family', price: { amount: 110, currency: 'KWD', totalDays: 1 }, supplier: baseCars[1].supplier };
        baseCars = [...baseCars, extraCar1, extraCar2, extraCar3, extraCar4];
      }

      // Apply filters
      let filteredCars = baseCars;
      if (filters?.country && filters.country !== "All") {
        // filter logic if country was strictly mapped
      }
      
      if (filters?.category && filters.category !== "All") {
        filteredCars = filteredCars.filter(car => car.category.toLowerCase() === filters.category.toLowerCase());
      }
      
      if (filters?.carType && filters.carType !== "All") {
        filteredCars = filteredCars.filter(car => car.fuelType.toLowerCase() === filters.carType.toLowerCase());
      }

      if (filters?.searchQuery && filters.searchQuery.trim() !== "") {
        const query = filters.searchQuery.toLowerCase().trim();
        filteredCars = filteredCars.filter(car => 
          car.supplier.name.toLowerCase().includes(query) ||
          car.name.toLowerCase().includes(query)
        );
      }

      const data: SupplierComparison[] = filteredCars.map(car => ({
        id: `sup-${car.id}`,
        name: car.supplier.name,
        logo: car.supplier.logo,
        carName: car.name,
        carImage: car.image,
        category: car.category,
        transmission: car.transmission,
        fuel: car.fuelType,
        seats: car.seats,
        dailyPrice: car.price.amount,
        weeklyPrice: car.price.amount * 7,
        monthlyPrice: car.price.amount * 30,
        rating: car.supplier.rating,
        availability: Math.floor(Math.random() * 20) + 1,
        marketPosition: car.price.amount > 1000 ? "Premium" : (car.price.amount > 400 ? "Expensive" : (car.price.amount < 200 ? "Cheapest" : "Competitive")),
        negotiationStatus: "none",
        lastUpdated: new Date().toISOString().split('T')[0],
        branchLocations: [car.supplier.address],
        fleetSize: car.supplier.reviewsCount,
        contactEmail: `contact@${car.supplier.name.replace(/\s+/g, '').toLowerCase()}.com`,
        contactPhone: "+971 0000000",
        notes: "",
        priority: "Medium",
      }));

      const prices = data.map(d => d.dailyPrice);
      const lowestPrice = prices.length ? Math.min(...prices) : 0;
      const highestPrice = prices.length ? Math.max(...prices) : 0;
      const averagePrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      
      const cheapestSupplier = data.find(d => d.dailyPrice === lowestPrice)?.name || "N/A";
      const expensiveSupplier = data.find(d => d.dailyPrice === highestPrice)?.name || "N/A";

      resolve({
        data,
        stats: {
          lowestPrice,
          highestPrice,
          averagePrice,
          cheapestSupplier,
          expensiveSupplier,
          totalSuppliers: new Set(data.map(d => d.name)).size,
          totalCars: data.length,
        }
      });
    }, 800);
  });
};

export const updateNegotiationStatusAPI = async (supplierId: string, payload: any) => {
  return new Promise<{ success: boolean, data: any }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: { supplierId, ...payload } });
    }, 500);
  });
};
