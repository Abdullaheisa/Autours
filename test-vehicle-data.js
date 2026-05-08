async function testFilter() {
  const payload = {
    pickupLoc: "Dubai",
    date_from: "2026-05-10",
    date_to: "2026-05-15",
    currency: "AED"
  };
  
  try {
    const res = await fetch('https://www.autours.net/api/vehicle/filter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Full Data Keys:", Object.keys(data));
    if (data.filteredVehicles) {
      console.log("Vehicle 0 keys:", Object.keys(data.filteredVehicles[0]));
      console.log("Vehicle 0 photo/image:", data.filteredVehicles[0].photo, data.filteredVehicles[0].image);
    }
  } catch (e) {
    console.error(e);
  }
}
testFilter();
