<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\User;
use App\Services\BranchNormalizationService;
use Illuminate\Console\Command;

class NormalizeBranches extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'branches:normalize
                            {--dry-run : Show what would change without actually updating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Normalize branch names and locations using the canonical airports table.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $isDryRun = $this->option('dry-run');

        if ($isDryRun) {
            $this->warn('DRY RUN — no changes will be made.');
            $this->newLine();
        }

        $service = new BranchNormalizationService();

        // Show per-supplier breakdown
        $suppliers = User::whereIn('role', ['active_supplier', 'supplier', 'under_review'])->get();

        $this->info('========== Branch Normalization ==========');
        $this->newLine();

        $totalMatched = 0;
        $totalUnmatched = 0;
        $totalUpdated = 0;
        $totalBranches = 0;

        foreach ($suppliers as $supplier) {
            $branches = Branch::where('company_id', $supplier->id)->get();

            if ($branches->isEmpty()) {
                continue;
            }

            $this->info("Supplier: {$supplier->name} (ID: {$supplier->id}, {$supplier->email})");
            $this->info("  Branches: {$branches->count()}");

            $matched = 0;
            $unmatched = 0;
            $updated = 0;

            foreach ($branches as $branch) {
                $result = $service->normalize(
                    $branch->name ?? '',
                    $branch->city ?? '',
                    $branch->country ?? '',
                    $branch->station_id,
                    $branch->abriviation
                );

                if ($result['airport_id'] !== null) {
                    $matched++;
                } else {
                    $unmatched++;
                }

                // Check if anything changed
                $changed = false;
                if ($branch->airport_id !== $result['airport_id']) {
                    $changed = true;
                }
                if ($branch->normalized_name !== $result['normalized_name']) {
                    $changed = true;
                }
                if ($branch->location !== $result['location']) {
                    $changed = true;
                }

                if ($changed) {
                    if ($isDryRun) {
                        $airportInfo = $result['airport_id'] ? " → Airport #{$result['airport_id']}" : '';
                        $locChange = $branch->location !== $result['location']
                            ? " | location: '{$branch->location}' → '{$result['location']}'"
                            : '';
                        $normName = $result['normalized_name']
                            ? " | norm: '{$result['normalized_name']}'"
                            : '';
                        $this->line("    WOULD UPDATE: [{$branch->id}] {$branch->name}{$airportInfo}{$locChange}{$normName}");
                    } else {
                        $branch->update([
                            'airport_id' => $result['airport_id'],
                            'normalized_name' => $result['normalized_name'],
                            'location' => $result['location'],
                        ]);
                    }
                    $updated++;
                }
            }

            $this->info("  Matched: {$matched} | Unmatched: {$unmatched} | Updated: {$updated}");
            $this->newLine();

            $totalMatched += $matched;
            $totalUnmatched += $unmatched;
            $totalUpdated += $updated;
            $totalBranches += $branches->count();
        }

        $this->newLine();
        $this->info('========== Summary ==========');
        $this->info("Total branches : {$totalBranches}");
        $this->info("Matched        : {$totalMatched}");
        $this->info("Unmatched      : {$totalUnmatched}");
        $this->info("Updated        : {$totalUpdated}");

        if ($isDryRun) {
            $this->newLine();
            $this->warn('This was a dry run. Run without --dry-run to apply changes.');
        }

        $this->info('=============================');

        return self::SUCCESS;
    }
}
