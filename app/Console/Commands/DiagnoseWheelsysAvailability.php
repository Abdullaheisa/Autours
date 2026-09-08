<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DiagnoseWheelsysAvailability extends Command
{
    protected $signature = 'wheelsys:diagnose-availability';

    protected $description = 'Test all Wheelsys airport stations across multiple date ranges, capture raw XML, and email a diagnostic report for stations returning 0 vehicles.';

    private const BASE_URL = 'https://endpoint.wheelsys.io/10421/link/v3';
    private const LINK_CODE = 'WL0AT';
    private const AGENT_CODE = 'AU0WL';

    public function handle(): int
    {
        $this->info('Starting Wheelsys availability diagnostics...');

        // 1. Fetch all stations from the API
        $stationsUrl = self::BASE_URL . '/stations_' . self::LINK_CODE . '.html';
        $stationsResponse = Http::timeout(30)
            ->withOptions(['verify' => false])
            ->get($stationsUrl, ['agent' => self::AGENT_CODE]);

        if (! $stationsResponse->successful()) {
            $this->error('Failed to fetch stations from Wheelsys API (HTTP ' . $stationsResponse->status() . ')');
            return self::FAILURE;
        }

        $stationsXml = $stationsResponse->body();
        $xml = simplexml_load_string($stationsXml);

        if ($xml === false) {
            $this->error('Failed to parse stations XML');
            return self::FAILURE;
        }

        // 2. Filter airport-only stations
        $airportStations = [];
        foreach ($xml->station as $stationNode) {
            $code = (string) $stationNode['code'];
            $name = (string) $stationNode['name'];

            if (stripos($name, 'AIRPORT') !== false || stripos($name, 'APT') !== false) {
                $info = $stationNode->StationInformation;
                $airportStations[] = [
                    'code'    => $code,
                    'name'    => $name,
                    'country' => (string) $stationNode['country'],
                    'city'    => $info ? (string) $info['City'] : '',
                ];
            }
        }

        $this->info('Found ' . count($airportStations) . ' airport stations out of ' . count($xml->station) . ' total.');

        // 3. Define test date offsets
        $now = Carbon::now();
        $dateOffsets = [
            '+1 day (tomorrow)'  => 1,
            '+3 days'            => 3,
            '+7 days'            => 7,
            '+14 days'           => 14,
            '+30 days'           => 30,
            '+60 days'           => 60,
        ];

        // 4. Test each airport station with each date
        $results = [];         // All results for summary
        $zeroStationLogs = []; // Raw XML for stations with 0 vehicles

        $progress = $this->output->createProgressBar(count($airportStations) * count($dateOffsets));
        $progress->start();

        foreach ($airportStations as $station) {
            $code = $station['code'];
            $results[$code] = [
                'name'    => $station['name'],
                'country' => $station['country'],
                'dates'   => [],
            ];

            foreach ($dateOffsets as $label => $offset) {
                $pickupDate  = $now->copy()->addDays($offset);
                $dropoffDate = $pickupDate->copy()->addDay();

                $pickupStr  = $pickupDate->format('d/m/Y');
                $dropoffStr = $dropoffDate->format('d/m/Y');

                $url = self::BASE_URL . '/price-quote_' . self::LINK_CODE . '.html';
                $params = [
                    'agent'          => self::AGENT_CODE,
                    'DATE_FROM'      => $pickupStr,
                    'TIME_FROM'      => '10:00',
                    'DATE_TO'        => $dropoffStr,
                    'TIME_TO'        => '10:00',
                    'PICKUP_STATION' => $code,
                    'RETURN_STATION' => $code,
                    'TRACING'        => 'ON',
                ];

                try {
                    $response = Http::timeout(30)
                        ->withOptions(['verify' => false])
                        ->get($url, $params);

                    $rawXml      = $response->body();
                    $httpStatus   = $response->status();
                    $vehicleCount = 0;

                    if ($response->successful()) {
                        libxml_use_internal_errors(true);
                        $parsed = simplexml_load_string($rawXml);
                        if ($parsed !== false && isset($parsed->rates->category)) {
                            foreach ($parsed->rates->category as $cat) {
                                if ((string) $cat['availability'] === 'AVAILABLE') {
                                    $vehicleCount++;
                                }
                            }
                        }
                        libxml_clear_errors();
                    }

                    $results[$code]['dates'][$label] = [
                        'pickup'        => $pickupStr,
                        'dropoff'       => $dropoffStr,
                        'http_status'   => $httpStatus,
                        'vehicle_count' => $vehicleCount,
                    ];

                    // Capture raw XML for 0-vehicle airport stations
                    if ($vehicleCount === 0) {
                        $zeroStationLogs[$code]['name'] = $station['name'];
                        $zeroStationLogs[$code]['logs'][$label] = [
                            'pickup'      => $pickupStr,
                            'dropoff'     => $dropoffStr,
                            'http_status' => $httpStatus,
                            'request_url' => $url . '?' . http_build_query($params),
                            'raw_xml'     => $rawXml,
                        ];
                    }
                } catch (\Exception $e) {
                    $results[$code]['dates'][$label] = [
                        'pickup'        => $pickupStr,
                        'dropoff'       => $dropoffStr,
                        'http_status'   => 'ERROR',
                        'vehicle_count' => 'EXCEPTION: ' . $e->getMessage(),
                    ];

                    $zeroStationLogs[$code]['name'] = $station['name'];
                    $zeroStationLogs[$code]['logs'][$label] = [
                        'pickup'      => $pickupStr,
                        'dropoff'     => $dropoffStr,
                        'http_status' => 'ERROR',
                        'request_url' => $url . '?' . http_build_query($params),
                        'raw_xml'     => 'EXCEPTION: ' . $e->getMessage(),
                    ];
                }

                $progress->advance();
            }
        }

        $progress->finish();
        $this->newLine(2);

        // 5. Identify stations that returned 0 vehicles for ALL dates
        $allZeroStations = [];
        $partialStations = [];
        $okStations = [];

        foreach ($results as $code => $data) {
            $totalVehicles = 0;
            $hasAnyVehicles = false;
            foreach ($data['dates'] as $dateResult) {
                if (is_int($dateResult['vehicle_count']) && $dateResult['vehicle_count'] > 0) {
                    $hasAnyVehicles = true;
                    $totalVehicles += $dateResult['vehicle_count'];
                }
            }

            if (! $hasAnyVehicles) {
                $allZeroStations[$code] = $data;
            } elseif ($totalVehicles < count($dateOffsets)) {
                $partialStations[$code] = $data;
            } else {
                $okStations[$code] = $data;
            }
        }

        // 6. Build the email body
        $emailBody = $this->buildEmailBody($results, $allZeroStations, $partialStations, $okStations, $zeroStationLogs, $dateOffsets);

        // 7. Print summary to console
        $this->info('=== DIAGNOSTICS SUMMARY ===');
        $this->info('Total airport stations tested: ' . count($airportStations));
        $this->info('Stations with vehicles on ALL dates: ' . count($okStations));
        $this->info('Stations with vehicles on SOME dates: ' . count($partialStations));
        $this->info('Stations with 0 vehicles on ALL dates: ' . count($allZeroStations));

        if (! empty($allZeroStations)) {
            $this->warn('Zero-vehicle airport stations:');
            foreach ($allZeroStations as $code => $data) {
                $this->warn("  - {$code} ({$data['name']})");
            }
        }

        // 7b. Save report to file
        $reportPath = storage_path('logs/wheelsys_diagnostic_report.txt');
        file_put_contents($reportPath, $emailBody);
        $this->info("Report saved to: {$reportPath}");

        // 8. Send the email
        try {
            Mail::raw($emailBody, function ($message) use ($allZeroStations) {
                $zeroCount = count($allZeroStations);
                $message->to(['admin@autours.net', 'contact@autours.net'])
                        ->subject("Wheelsys Diagnostics: {$zeroCount} Airport Station(s) Returning 0 Vehicles");
            });
            $this->info('Diagnostic email sent successfully.');
        } catch (\Exception $e) {
            $this->error('Failed to send diagnostic email: ' . $e->getMessage());
            Log::error('Wheelsys diagnostics email failed', ['exception' => $e->getMessage()]);
        }

        return self::SUCCESS;
    }

    private function buildEmailBody(
        array $results,
        array $allZeroStations,
        array $partialStations,
        array $okStations,
        array $zeroStationLogs,
        array $dateOffsets
    ): string {
        $now = Carbon::now()->toDateTimeString();
        $body = "WHEELSYS AVAILABILITY DIAGNOSTIC REPORT\n";
        $body .= "Generated: {$now}\n";
        $body .= str_repeat('=', 70) . "\n\n";

        // Overview
        $body .= "SUMMARY\n";
        $body .= str_repeat('-', 70) . "\n";
        $body .= "Total airport stations tested:              " . count($results) . "\n";
        $body .= "Stations with vehicles on ALL dates:        " . count($okStations) . "\n";
        $body .= "Stations with vehicles on SOME dates:       " . count($partialStations) . "\n";
        $body .= "Stations with 0 vehicles on ALL dates:      " . count($allZeroStations) . "\n";
        $body .= "Date ranges tested:                         " . implode(', ', array_keys($dateOffsets)) . "\n\n";

        // Results table
        $body .= "RESULTS PER STATION & DATE\n";
        $body .= str_repeat('-', 70) . "\n\n";

        foreach ($results as $code => $data) {
            $body .= "Station: {$code} — {$data['name']} ({$data['country']})\n";

            foreach ($data['dates'] as $label => $dateResult) {
                $count  = $dateResult['vehicle_count'];
                $pickup = $dateResult['pickup'];
                $drop   = $dateResult['dropoff'];
                $http   = $dateResult['http_status'];
                $status = ($count === 0 || ! is_int($count)) ? '*** 0 VEHICLES ***' : "{$count} vehicles";
                $body  .= "  {$label}: pickup={$pickup} dropoff={$drop} HTTP={$http} => {$status}\n";
            }

            $body .= "\n";
        }

        // Raw XML logs for 0-vehicle stations
        if (! empty($zeroStationLogs)) {
            $body .= str_repeat('=', 70) . "\n";
            $body .= "RAW XML RESPONSES FOR 0-VEHICLE AIRPORT STATIONS\n";
            $body .= str_repeat('=', 70) . "\n\n";

            foreach ($zeroStationLogs as $code => $stationData) {
                $body .= str_repeat('*', 70) . "\n";
                $body .= "STATION: {$code} — {$stationData['name']}\n";
                $body .= str_repeat('*', 70) . "\n\n";

                foreach ($stationData['logs'] as $label => $log) {
                    $body .= "--- {$label} (pickup={$log['pickup']}, dropoff={$log['dropoff']}, HTTP={$log['http_status']}) ---\n";
                    $body .= "Request: {$log['request_url']}\n\n";
                    $body .= "Response XML:\n";
                    $body .= $log['raw_xml'] . "\n\n";
                }
            }
        }

        $body .= str_repeat('=', 70) . "\n";
        $body .= "END OF DIAGNOSTIC REPORT\n";

        return $body;
    }
}
