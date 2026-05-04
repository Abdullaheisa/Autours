<?php

namespace App\Services;

use App\Models\CurrencyRate;
use App\Models\Vehicle;
use Carbon\Carbon;

class VehicleService
{
    public function calculatePrice($currency, $vehicleId, $numOfDays)
    {
        $selectedVehicle = Vehicle::query()->where('id', $vehicleId)->lockForUpdate()->first();

        $diffInDays = $numOfDays;

        if ($diffInDays >= '1' && $diffInDays < '3') {
            $selectedVehicle->final_price = ($selectedVehicle->price + (($selectedVehicle->price * $selectedVehicle->profit->per_day_profit) / 100)) * $diffInDays;
            $selectedVehicle->supplier_price = ($selectedVehicle->price) * $diffInDays;
            $selectedVehicle->rate = $selectedVehicle->profit->per_day_profit;

        } else if ($diffInDays >= '3' && $diffInDays <= '7') {
            $selectedVehicle->final_price = ($selectedVehicle->week_price + (($selectedVehicle->week_price * $selectedVehicle->profit->per_week_profit) / 100)) * $diffInDays;
            $selectedVehicle->supplier_price = ($selectedVehicle->week_price) * $diffInDays;
            $selectedVehicle->rate = $selectedVehicle->profit->per_week_profit;

        } else if ($diffInDays >= '8' && $diffInDays <= '30') {
            $selectedVehicle->final_price = ($selectedVehicle->month_price + (($selectedVehicle->month_price * $selectedVehicle->profit->per_month_profit) / 100)) * $diffInDays;
            $selectedVehicle->supplier_price = ($selectedVehicle->month_price) * $diffInDays;
            $selectedVehicle->rate = $selectedVehicle->profit->per_month_profit;

        }


        if ($currency != $selectedVehicle->branch->currency) {
            $rate = CurrencyRate::query()->where('currency_from', $selectedVehicle->branch->currency)->where('currency_to', $currency)->first();
            if ($rate != null) {
                $selectedVehicle->final_price *= $rate->rate;
            }
        }
        $selectedVehicle->final_price = round($selectedVehicle->final_price, 2);

        return $selectedVehicle;

    }


}
