<?php

namespace Database\Seeders;

use App\Models\BackgroundSetting;
use Illuminate\Database\Seeder;

class BackgroundSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $sections = [
            [
                'section_key' => 'banner',
                'section_name' => 'Main Banner',
                'default_image_path' => '/img/banner-bk.jpg',
            ],
            [
                'section_key' => 'our_fleet',
                'section_name' => 'Our Fleet Section',
                'default_image_path' => '/images/background/our_fleet.png',
            ],
            [
                'section_key' => 'be_supplier',
                'section_name' => 'Be a Supplier Section',
                'default_image_path' => '/images/background/be-supplier-background.png',
            ],
            [
                'section_key' => 'offers',
                'section_name' => 'Offers Section',
                'default_image_path' => '/images/background/offers.jpeg',
            ],
            [
                'section_key' => 'login',
                'section_name' => 'Login Page Background',
                'default_image_path' => '/images/background/2.jpg',
            ],
            [
                'section_key' => 'manage_booking',
                'section_name' => 'Manage Booking Form',
                'default_image_path' => '/images/background/manage-booking-form.png',
            ],
        ];

        foreach ($sections as $section) {
            BackgroundSetting::updateOrCreate(
                ['section_key' => $section['section_key']],
                $section
            );
        }
    }
}

