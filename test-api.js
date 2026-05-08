async function testLocations() {
  const res = await fetch('https://www.autours.net/get/locations');
  const data = await res.json();
  console.log(Object.values(data).slice(0, 3));
}
testLocations();
