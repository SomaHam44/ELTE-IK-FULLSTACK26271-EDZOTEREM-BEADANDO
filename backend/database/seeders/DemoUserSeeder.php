<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'id' => 1,
                'name' => 'Peak Form Admin',
                'email' => 'admin@peakform.test',
                'role' => 'admin',
            ],
            [
                'id' => 10,
                'name' => 'Teszt Edző',
                'email' => 'edzo@peakform.test',
                'role' => 'coach',
            ],
            [
                'id' => 20,
                'name' => 'Teszt Sportoló',
                'email' => 'sportolo@peakform.test',
                'role' => 'athlete',
            ],
        ];

        foreach ($users as $user) {
            $record = User::firstOrNew(['email' => $user['email']]);
            $record->forceFill([
                'id' => $user['id'],
                'name' => $user['name'],
                'password' => Hash::make('PeakForm123!'),
                'role' => $user['role'],
                'is_active' => true,
            ])->save();
        }
    }
}
