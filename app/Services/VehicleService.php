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

        $perDayProfit   = $selectedVehicle->profit->per_day_profit   ?? 0;
        $perWeekProfit  = $selectedVehicle->profit->per_week_profit  ?? 0;
        $perMonthProfit = $selectedVehicle->profit->per_month_profit ?? 0;

        if ($diffInDays >= '1' && $diffInDays < '3') {
            $selectedVehicle->final_price = ($selectedVehicle->price + (($selectedVehicle->price * $perDayProfit) / 100)) * $diffInDays;
            $selectedVehicle->supplier_price = ($selectedVehicle->price) * $diffInDays;
            $selectedVehicle->rate = $perDayProfit;

        } else if ($diffInDays >= '3' && $diffInDays <= '7') {
            $selectedVehicle->final_price = ($selectedVehicle->week_price + (($selectedVehicle->week_price * $perWeekProfit) / 100)) * $diffInDays;
            $selectedVehicle->supplier_price = ($selectedVehicle->week_price) * $diffInDays;
            $selectedVehicle->rate = $perWeekProfit;

        } else if ($diffInDays >= '8' && $diffInDays <= '30') {
            $selectedVehicle->final_price = ($selectedVehicle->month_price + (($selectedVehicle->month_price * $perMonthProfit) / 100)) * $diffInDays;
            $selectedVehicle->supplier_price = ($selectedVehicle->month_price) * $diffInDays;
            $selectedVehicle->rate = $perMonthProfit;

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
