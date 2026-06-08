<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
         $schedule->command('app:rating')->dailyAt("10:00");
         $schedule->command('sitemap:generate')->cron('0 0 */2 * *');

         // Refresh Jimpisoft vehicle prices every 4 hours
         $schedule->command('jimpisoft:sync-vehicles --prices-only')->everyFourHours();

         // Sync EMR branches daily and vehicle prices every 4 hours
         $schedule->command('emr:sync-branches')->dailyAt('03:00');
         $schedule->command('emr:sync-vehicles --prices-only')->everyFourHours();

         // Sync Surprice branches daily and vehicle prices every 4 hours
         $schedule->command('surprice:sync-branches')->dailyAt('03:30');
         $schedule->command('surprice:sync-vehicles --prices-only')->everyFourHours();

         // Sync Rently branches daily and vehicle prices every 4 hours
         $schedule->command('rently:sync-branches --countries="Jordan,Morocco"')->dailyAt('04:00');
         $schedule->command('rently:sync-vehicles --prices-only --countries="Jordan,Morocco"')->everyFourHours();

         // Sync exchange rates daily
         $schedule->command('sync:exchange-rates')->dailyAt('06:00');
    }   

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
