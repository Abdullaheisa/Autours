<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('integration_type')->nullable()->after('webhook_url')
                  ->comment('API integration type: kolaycar, webhook, or null');
            $table->string('api_key')->nullable()->after('integration_type');
            $table->string('api_password')->nullable()->after('api_key');
        });

        // Seed existing Kolaycar-synced suppliers with their API credentials
        $kolaycarSuppliers = [
            [
                'email'        => 'info@arscar.com.tr',
                'api_key'      => 'U512MCczch8mDe9c3x/Ekw==',
                'api_password' => 'KzzZZ894tH84.!Eu',
            ],
            [
                'email'        => 'info@allmeetrentacar.com',
                'api_key'      => 'pQX1iJ70I9eKepswD8dsAw==',
                'api_password' => '!Cu89.!Wi4691',
            ],
            [
                'email'        => 'info@movigocarental.com',
                'api_key'      => 'rBBj07xzP9Fd8pSAFIdjbQ==',
                'api_password' => 'MolC.!8695gF1',
            ],
            [
                'email'        => 'gokhan@badgerrentacar.com',
                'api_key'      => 'fOrOHHTvohRaeS71S+buqw==',
                'api_password' => 'Au.!87934.!!34FgTt',
            ],
            [
                'email'        => 'info@famousrentacar.com',
                'api_key'      => 'C0mMA5z64gqWPu5qs8MUjg==',
                'api_password' => 'G.!369niS.!76',
            ],
            [
                'email'        => 'info@driveandsmile.com.tr',
                'api_key'      => 'l1lmfb285d97knJUlxIlUA==',
                'api_password' => 'autours2323',
            ],
            [
                'email'        => 'info@autofixrental.com',
                'api_key'      => 'eff6LWe8plkb2ewqpRMkLQ==',
                'api_password' => '2962AA3',
            ],
        ];

        foreach ($kolaycarSuppliers as $supplier) {
            DB::table('users')
                ->where('email', $supplier['email'])
                ->update([
                    'integration'      => true,
                    'integration_type' => 'kolaycar',
                    'api_key'          => $supplier['api_key'],
                    'api_password'     => $supplier['api_password'],
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset all Kolaycar suppliers back to no integration type
        DB::table('users')
            ->where('integration_type', 'kolaycar')
            ->update([
                'integration_type' => null,
                'api_key'          => null,
                'api_password'     => null,
            ]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['integration_type', 'api_key', 'api_password']);
        });
    }
};
