<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Currency;
use App\Models\CurrencyRate;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncExchangeRates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'sync:exchange-rates
                            {--base=USD : Base currency used by the free API}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch latest exchange rates from a free API (open.er-api.com) and update the currency_rates table dynamically.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting exchange-rate sync...');

        $currencies = Currency::query()->pluck('name')->toArray();

        if (empty($currencies)) {
            $this->warn('No currencies found in the database.');
            return self::FAILURE;
        }

        $this->info('Currencies in DB: ' . implode(', ', $currencies));

        try {
            $base = $this->option('base');
            $url = "https://open.er-api.com/v6/latest/{$base}";

            $this->info("Fetching rates from: {$url}");

            $response = Http::timeout(30)->withOptions(['verify' => false])->get($url);

            if (! $response->successful()) {
                $this->error("API request failed (HTTP {$response->status()}).");
                Log::error('Exchange-rate sync failed', [
                    'url' => $url,
                    'status' => $response->status(),
                ]);
                return self::FAILURE;
            }

            $data = $response->json();
            $apiRates = $data['rates'] ?? [];

            if (empty($apiRates)) {
                $this->error('No rates returned by the API.');
                return self::FAILURE;
            }

            $updated = 0;
            $skipped = 0;
            $now = now();

            foreach ($currencies as $from) {
                foreach ($currencies as $to) {
                    if ($from === $to) {
                        continue;
                    }

                    $rate = $this->calculateCrossRate($from, $to, $apiRates, $base);

                    if ($rate === null) {
                        $this->warn("Skipping {$from} -> {$to} (missing API data)");
                        $skipped++;
                        continue;
                    }

                    CurrencyRate::query()->updateOrInsert(
                        [
                            'currency_from' => $from,
                            'currency_to' => $to,
                        ],
                        [
                            'rate' => $rate,
                            'updated_at' => $now,
                        ]
                    );

                    $updated++;
                }
            }

            $this->newLine();
            $this->info('========== Sync Complete ==========');
            $this->info("Updated/Inserted: {$updated}");
            $this->info("Skipped         : {$skipped}");
            $this->info('===================================');

            return self::SUCCESS;
        } catch (\Exception $e) {
            Log::error('Exchange-rate sync exception: ' . $e->getMessage());
            $this->error('Exception: ' . $e->getMessage());
            return self::FAILURE;
        }
    }

    /**
     * Calculate a cross-rate from USD-based API data.
     *
     * Formula: rate(A -> B) = rate(USD -> B) / rate(USD -> A)
     */
    private function calculateCrossRate(string $from, string $to, array $apiRates, string $base): ?float
    {
        // If the API base matches one of our currencies, use it directly
        $fromRate = $apiRates[$from] ?? null;
        $toRate   = $apiRates[$to]   ?? null;

        if ($fromRate === null || $toRate === null) {
            return null;
        }

        return round($toRate / $fromRate, 6);
    }
}
