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

         // Refresh Jimpisoft vehicle prices every 2 hours
      //   $schedule->command('jimpisoft:sync-branches')->dailyAt('02:00');
         $schedule->command('jimpisoft:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync EMR branches daily and vehicle prices every 2 hours
      //   $schedule->command('emr:sync-branches')->dailyAt('03:00');
         $schedule->command('emr:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Surprice branches daily and vehicle prices every 2 hours
      //   $schedule->command('surprice:sync-branches')->dailyAt('03:30');
         $schedule->command('surprice:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Rently branches daily and vehicle prices every 2 hours
      //   $schedule->command('rently:sync-branches')->dailyAt('04:00');
         $schedule->command('rently:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Wheelsys branches daily and vehicle prices every 2 hours
      //   $schedule->command('wheelsys:sync-branches')->dailyAt('04:30');
         $schedule->command('wheelsys:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Renteon branches daily and vehicles every 2 hours
       //  $schedule->command('renteon:sync-branches')->dailyAt('05:00');
         $schedule->command('renteon:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Xdrive branches daily and vehicle prices every 2 hours
       //  $schedule->command('xdrive:sync-branches --real')->dailyAt('05:30');
         $schedule->command('xdrive:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Nissa branches daily and vehicle prices every 2 hours
       //  $schedule->command('nissa:sync-branches --real')->dailyAt('06:00');
         $schedule->command('nissa:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Routes branches daily and vehicle prices every 2 hours
       //  $schedule->command('routes:sync-branches')->dailyAt('06:30');
         $schedule->command('routes:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Allmeet branches daily and vehicles every 2 hours
       //  $schedule->command('allmeet:sync-branches --real')->dailyAt('07:00');
         $schedule->command('allmeet:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Badger branches daily and vehicles every 2 hours
       //  $schedule->command('badger:sync-branches --real')->dailyAt('07:30');
         $schedule->command('badger:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Kolaycar branches daily and vehicles every 2 hours
       //  $schedule->command('kolaycar:sync-branches --real')->dailyAt('08:00');
         $schedule->command('kolaycar:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Movigo branches daily and vehicles every 2 hours
       //  $schedule->command('movigo:sync-branches --real')->dailyAt('08:30');
         $schedule->command('movigo:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Drive and Smile branches daily and vehicles every 2 hours
       //  $schedule->command('driveandsmile:sync-branches --real')->dailyAt('09:00');
         $schedule->command('driveandsmile:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync exchange rates every 4 hours without overlapping
         $schedule->command('sync:exchange-rates')->everyFourHours()->withoutOverlapping();
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
