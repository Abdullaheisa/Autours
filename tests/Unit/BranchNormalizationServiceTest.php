<?php

namespace Tests\Unit;

use App\Services\BranchNormalizationService;
use Tests\TestCase;

class BranchNormalizationServiceTest extends TestCase
{
    public function test_normalization_with_name_variations(): void
    {
        $service = new BranchNormalizationService();

        // Let's test Dubai International Airport (DXB) variations
        $result = $service->normalize('dubai airport', 'Dubai', 'UAE');
        $this->assertEquals(11, $result['airport_id']);
        $this->assertEquals('Dubai International Airport', $result['normalized_name']);

        $result = $service->normalize('dubai international airbort', 'Dubai', 'UAE');
        $this->assertEquals(11, $result['airport_id']);
        $this->assertEquals('Dubai International Airport', $result['normalized_name']);

        $result = $service->normalize('dubai airbort', 'Dubai', 'UAE');
        $this->assertEquals(11, $result['airport_id']);
        $this->assertEquals('Dubai International Airport', $result['normalized_name']);

        // Let's test Al Maktoum (DWC) variations
        $result = $service->normalize('al maktoum airbort', 'Dubai', 'UAE');
        $this->assertEquals(12, $result['airport_id']);
        $this->assertEquals('Al Maktoum International Airport', $result['normalized_name']);

        // Let's test Sabiha Gökçen (SAW) variations
        $result = $service->normalize('sabiha gokcen airbort', 'Istanbul', 'Turkey');
        $this->assertEquals(2, $result['airport_id']);
        $this->assertEquals('Sabiha Gökçen International Airport', $result['normalized_name']);

        $result = $service->normalize('sabiha airport', 'Istanbul', 'Turkey');
        $this->assertEquals(2, $result['airport_id']);
        $this->assertEquals('Sabiha Gökçen International Airport', $result['normalized_name']);

        // Let's test Istanbul Airport (IST) variations
        $result = $service->normalize('istanbul airport', 'Istanbul', 'Turkey');
        $this->assertEquals(1, $result['airport_id']);
        $this->assertEquals('Istanbul Airport', $result['normalized_name']);

        $result = $service->normalize('istanbul airbort', 'Istanbul', 'Turkey');
        $this->assertEquals(1, $result['airport_id']);
        $this->assertEquals('Istanbul Airport', $result['normalized_name']);
        
        // Let's test Antalya (AYT) variations with different city
        $result = $service->normalize('Antalya Airport', 'Aksu', 'Turkey');
        $this->assertEquals(3, $result['airport_id']);
        $this->assertEquals('Antalya Airport', $result['normalized_name']);
    }

    public function test_non_airport_branch_is_not_matched(): void
    {
        $service = new BranchNormalizationService();

        // When city is provided, it uses normalized city
        $result = $service->normalize('Dubai Marina Mall', 'Dubai', 'UAE');
        $this->assertNull($result['airport_id']);
        $this->assertNull($result['normalized_name']);
        $this->assertEquals('Dubai', $result['location']);

        // When city is empty, it uses normalized name
        $result = $service->normalize('Dubai Marina Mall', '', 'UAE');
        $this->assertNull($result['airport_id']);
        $this->assertNull($result['normalized_name']);
        $this->assertEquals('Dubai Marina Mall', $result['location']);
    }

    public function test_vehicle_filtering_groups_airports(): void
    {
        // Call the filter endpoint for pickupLoc = 10 (Dubai International Airport)
        $response1 = $this->postJson('/filter/vehicles', [
            'date_from' => now()->addDay()->format('Y-m-d'),
            'date_to' => now()->addDays(3)->format('Y-m-d'),
            'currency' => 'AED',
            'pickupLoc' => 10,
            'time_from' => '10:00',
            'time_to' => '10:00',
        ]);

        $response1->assertOk();
        $data1 = $response1->json();
        
        // Call the filter endpoint for pickupLoc = 2821 (Dubai Airport)
        $response2 = $this->postJson('/filter/vehicles', [
            'date_from' => now()->addDay()->format('Y-m-d'),
            'date_to' => now()->addDays(3)->format('Y-m-d'),
            'currency' => 'AED',
            'pickupLoc' => 2821,
            'time_from' => '10:00',
            'time_to' => '10:00',
        ]);

        $response2->assertOk();
        $data2 = $response2->json();

        // Both should return the exact same count and same set of vehicles
        $this->assertEquals(count($data1['filteredVehicles']), count($data2['filteredVehicles']));
        $this->assertGreaterThan(0, count($data1['filteredVehicles']));
    }

    public function test_get_locations_deduplicates_airports(): void
    {
        $response = $this->getJson('/get/locations');
        $response->assertOk();
        $locations = $response->json();

        $dubaiAirportCount = 0;
        foreach ($locations as $loc) {
            if ($loc['name'] === 'Dubai International Airport') {
                $dubaiAirportCount++;
            }
        }

        $this->assertEquals(1, $dubaiAirportCount);
    }
}
