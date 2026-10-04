<?php

namespace App\Services;

use App\Models\Rental;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

trait BeraIntegrationTrait
{
    public function sendViaBera(Rental $rental, User $supplier, string $eventType): bool
    {
        try {
            $service = new \App\Services\BeraRestApiService($supplier->api_key, $supplier->api_password);
            
            if ($eventType === 'new_rental') {
                return $this->createBeraReservation($service, $rental, $supplier);
            } elseif ($eventType === 'cancel_rental') {
                return $this->cancelBeraReservation($service, $rental, $supplier);
            }
            return false;
        } catch (\Exception $e) {
            Log::error("Bera Integration Error [{$eventType}]: " . $e->getMessage());
            return false;
        }
    }

    private function createBeraReservation(\App\Services\BeraRestApiService $service, Rental $rental, User $supplier): bool
    {
        $pickupDate = Carbon::parse($rental->start_date)->format('d.m.Y');
        $returnDate = Carbon::parse($rental->end_date)->format('d.m.Y');
        $pickupTime = Carbon::parse($rental->start_time)->format('H:i');
        $returnTime = Carbon::parse($rental->end_time)->format('H:i');
        
        $pickupLoc = $rental->vehicle->branch->abriviation ?? '';
        $returnLoc = $pickupLoc; // Can be adapted if dropoff is different
        
        $vehicles = $service->getVehicles($pickupLoc, $returnLoc, $pickupDate, $returnDate, $pickupTime, $returnTime);
        if (!$vehicles) {
            throw new \Exception("Could not fetch vehicles from Bera API");
        }
        
        // Find vehicle by ID or md5(name)
        $targetId = '';
        if (preg_match('/\[bera:(.+?)\]/', $rental->vehicle->description, $matches)) {
            $targetId = $matches[1];
        } else {
            throw new \Exception("Vehicle description does not contain bera tag");
        }
        
        $reservationToken = '';
        $vehicleId = '';
        foreach ($vehicles as $v) {
            $vId = !empty($v['vehicleId']) ? (string)$v['vehicleId'] : md5($v['vehicleName'] ?? '');
            $groupId = !empty($v['carGroupId']) ? (string)$v['carGroupId'] : $vId;
            if ($vId === $targetId || $groupId === $targetId) {
                $reservationToken = $v['reservationToken'] ?? '';
                $vehicleId = !empty($v['vehicleId']) ? $v['vehicleId'] : 0;
                break;
            }
        }
        
        if (empty($reservationToken)) {
            throw new \Exception("Could not find reservationToken for vehicle in live search");
        }
        
        $customer = current(explode(' ', $rental->customer->name));
        $lastName = substr($rental->customer->name, strlen($customer)) ?: $customer;
        
        $phone = $rental->customer->phone_num ?? '0000000000';
        $email = $rental->customer->email ?? 'no-reply@example.com';
        
        $payload = [
            'reservationToken' => $reservationToken,
            'vehicleId' => $vehicleId,
            'campaignId' => 0,
            'customerDetail' => [
                'firstName' => trim($customer),
                'lastName' => trim($lastName),
                'email' => $email,
                'phone' => $phone,
                'birthDate' => '1990-01-01',
                'tcNumber' => '11111111111',
            ],
            'flightNumber' => $rental->flight_number ?? '',
            'extras' => []
        ];
        
        $response = $service->createReservation($payload);
        
        if (!empty($response['reservationId']) || !empty($response['pnr'])) {
            $rental->external_reservation_no = (string) ($response['pnr'] ?? $response['reservationId']);
            $rental->save();
            return true;
        }
        
        throw new \Exception("Failed to create Bera reservation");
    }

    private function cancelBeraReservation(\App\Services\BeraRestApiService $service, Rental $rental, User $supplier): bool
    {
        if (empty($rental->external_reservation_no)) {
            return true;
        }
        $email = $rental->customer->email ?? 'no-reply@example.com';
        $response = $service->cancelReservation($rental->external_reservation_no, $email, 'Customer cancelled');
        return true;
    }
}
