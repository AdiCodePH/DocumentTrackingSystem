<?php

namespace Database\Seeders;

use App\Models\DocumentFile;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Registry Admin',
                'role' => 'admin',
                'password' => Hash::make('admin123'),
            ],
        );

        User::updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'role' => 'super-admin',
                'password' => Hash::make('super123'),
            ],
        );

        $files = [
            [
                'tracking_no' => 'CLO-2026-0142',
                'title' => "Legal Opinion Request from Mayor's Office",
                'origin' => 'City Administrator',
                'requested_by' => "Mayor's Office",
                'date_received' => '2026-06-01',
                'status' => 'received',
                'destination' => '',
                'outgoing_date' => null,
                'remarks' => '',
                'timeline' => [
                    ['Received', 'City Legal Office', 'June 1, 2026 - 8:14 AM'],
                    ['Barcode Generated', 'Registry Desk', 'June 1, 2026 - 8:30 AM'],
                ],
            ],
            [
                'tracking_no' => 'CLO-2026-0139',
                'title' => 'Notice of Hearing Response',
                'origin' => 'City Legal Office',
                'requested_by' => 'Regional Trial Court',
                'date_received' => '2026-05-31',
                'status' => 'outgoing',
                'destination' => 'Regional Trial Court',
                'outgoing_date' => '2026-06-01',
                'remarks' => 'Released to court receiving desk.',
                'timeline' => [
                    ['Barcode Generated', 'Registry Desk', 'May 31, 2026 - 4:18 PM'],
                    ['Marked Outgoing', 'Regional Trial Court', 'June 1, 2026 - 10:45 AM'],
                ],
            ],
            [
                'tracking_no' => 'CLO-2026-0136',
                'title' => 'Barangay Mediation Opinion Request',
                'origin' => 'Barangay Gredu',
                'requested_by' => 'Barangay Secretary',
                'date_received' => '2026-05-30',
                'status' => 'received',
                'destination' => '',
                'outgoing_date' => null,
                'remarks' => '',
                'timeline' => [
                    ['Received', 'City Legal Office', 'May 30, 2026 - 2:05 PM'],
                    ['Barcode Generated', 'Registry Desk', 'May 30, 2026 - 2:10 PM'],
                ],
            ],
        ];

        foreach ($files as $file) {
            DocumentFile::firstOrCreate(
                ['tracking_no' => $file['tracking_no']],
                $file,
            );
        }
    }
}
