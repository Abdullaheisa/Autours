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

         // Sync Jimpisoft branches and full vehicles daily, prices every 2 hours
         $schedule->command('jimpisoft:sync-branches')->dailyAt('02:00');
         $schedule->command('jimpisoft:sync-vehicles')->dailyAt('02:15')->withoutOverlapping();
         $schedule->command('jimpisoft:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync EMR branches and full vehicles daily, prices every 2 hours
         $schedule->command('emr:sync-branches')->dailyAt('03:00');
         $schedule->command('emr:sync-vehicles')->dailyAt('03:15')->withoutOverlapping();
         $schedule->command('emr:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Surprice branches and full vehicles daily, prices every 2 hours
         $schedule->command('surprice:sync-branches')->dailyAt('03:30');
         $schedule->command('surprice:sync-vehicles')->dailyAt('03:45')->withoutOverlapping();
         $schedule->command('surprice:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Rently branches and full vehicles daily, prices every 2 hours
         $schedule->command('rently:sync-branches')->dailyAt('04:00');
         $schedule->command('rently:sync-vehicles')->dailyAt('04:15')->withoutOverlapping();
         $schedule->command('rently:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Wheelsys branches and full vehicles daily, prices every 2 hours
         $schedule->command('wheelsys:sync-branches')->dailyAt('04:30');
         $schedule->command('wheelsys:sync-vehicles')->dailyAt('04:45')->withoutOverlapping();
         $schedule->command('wheelsys:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Renteon branches and full vehicles daily, prices every 2 hours
         $schedule->command('renteon:sync-branches')->dailyAt('05:00');
         $schedule->command('renteon:sync-vehicles')->dailyAt('05:15')->withoutOverlapping();
         $schedule->command('renteon:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Xdrive branches and full vehicles daily, prices every 2 hours
         $schedule->command('xdrive:sync-branches --real')->dailyAt('05:30');
         $schedule->command('xdrive:sync-vehicles --real')->dailyAt('05:45')->withoutOverlapping();
         $schedule->command('xdrive:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Nissa branches and full vehicles daily, prices every 2 hours
         $schedule->command('nissa:sync-branches --real')->dailyAt('06:00');
         $schedule->command('nissa:sync-vehicles --real')->dailyAt('06:15')->withoutOverlapping();
         $schedule->command('nissa:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Routes branches and full vehicles daily, prices every 2 hours
         $schedule->command('routes:sync-branches')->dailyAt('06:30');
         $schedule->command('routes:sync-vehicles')->dailyAt('06:45')->withoutOverlapping();
         $schedule->command('routes:sync-vehicles --prices-only')->everyTwoHours()->withoutOverlapping();

         // Sync Allmeet branches and full vehicles daily, prices every 2 hours
         $schedule->command('allmeet:sync-branches --real')->dailyAt('07:00');
         $schedule->command('allmeet:sync-vehicles --real')->dailyAt('07:15')->withoutOverlapping();
         $schedule->command('allmeet:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Badger branches and full vehicles daily, prices every 2 hours
         $schedule->command('badger:sync-branches --real')->dailyAt('07:30');
         $schedule->command('badger:sync-vehicles --real')->dailyAt('07:45')->withoutOverlapping();
         $schedule->command('badger:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Kolaycar branches and full vehicles daily, prices every 2 hours
         $schedule->command('kolaycar:sync-branches --real')->dailyAt('08:00');
         $schedule->command('kolaycar:sync-vehicles --real')->dailyAt('08:15')->withoutOverlapping();
         $schedule->command('kolaycar:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Famous branches and full vehicles daily, prices every 2 hours
         $schedule->command('famous:sync-branches --real')->dailyAt('08:15');
         $schedule->command('famous:sync-vehicles --real')->dailyAt('08:25')->withoutOverlapping();
         $schedule->command('famous:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Movigo branches and full vehicles daily, prices every 2 hours
         $schedule->command('movigo:sync-branches --real')->dailyAt('08:30');
         $schedule->command('movigo:sync-vehicles --real')->dailyAt('08:45')->withoutOverlapping();
         $schedule->command('movigo:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Drive and Smile branches and full vehicles daily, prices every 2 hours
         $schedule->command('driveandsmile:sync-branches --real')->dailyAt('09:00');
         $schedule->command('driveandsmile:sync-vehicles --real')->dailyAt('09:15')->withoutOverlapping();
         $schedule->command('driveandsmile:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

         // Sync Autofix branches and full vehicles daily, prices every 2 hours
         $schedule->command('autofix:sync-branches --real')->dailyAt('09:30');
         $schedule->command('autofix:sync-vehicles --real')->dailyAt('09:45')->withoutOverlapping();
         $schedule->command('autofix:sync-vehicles --prices-only --real')->everyTwoHours()->withoutOverlapping();

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
