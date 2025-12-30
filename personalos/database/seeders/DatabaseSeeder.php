<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Goal;
use App\Models\Task;
use App\Models\Contact;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create test user
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@personalos.dev',
            'password' => Hash::make('password'),
            'timezone' => 'America/Chicago',
        ]);

        // Create goals for Week 1
        Goal::create([
            'name' => 'Decopon Emails Sent',
            'current_value' => 0,
            'target_value' => 90,
            'unit' => 'emails',
            'timeframe' => 'Week 1',
            'color' => '#10b981',
            'trend' => 'neutral',
            'user_id' => $user->id,
        ]);

        Goal::create([
            'name' => 'Musha Shugyo Tweets',
            'current_value' => 0,
            'target_value' => 15,
            'unit' => 'tweets',
            'timeframe' => 'Week 1',
            'color' => '#f59e0b',
            'trend' => 'neutral',
            'user_id' => $user->id,
        ]);

        Goal::create([
            'name' => 'BJJ Training Sessions',
            'current_value' => 0,
            'target_value' => 2,
            'unit' => 'sessions',
            'timeframe' => 'Week 1',
            'color' => '#ef4444',
            'trend' => 'neutral',
            'user_id' => $user->id,
        ]);

        // Create sample tasks
        Task::create([
            'title' => 'Send first batch of Decopon emails',
            'due_date' => now(),
            'priority' => 'high',
            'user_id' => $user->id,
        ]);

        Task::create([
            'title' => 'Write 3 tweets about white belt journey',
            'due_date' => now(),
            'priority' => 'medium',
            'user_id' => $user->id,
        ]);

        Task::create([
            'title' => 'Attend BJJ class at Six Blades',
            'due_date' => now()->addDay(),
            'priority' => 'high',
            'user_id' => $user->id,
        ]);

        Task::create([
            'title' => 'Follow up with Google contact',
            'due_date' => now()->addWeek(),
            'priority' => 'low',
            'user_id' => $user->id,
        ]);

        Task::create([
            'title' => 'Review Week 1 progress',
            'due_date' => now()->endOfWeek(),
            'priority' => 'medium',
            'user_id' => $user->id,
        ]);

        // Create sample contacts
        Contact::create([
            'name' => 'Sarah Chen',
            'role' => 'Event Manager',
            'company' => 'Austin Events Co',
            'freshness' => 'warm',
            'user_id' => $user->id,
        ]);

        Contact::create([
            'name' => 'Marcus Johnson',
            'role' => 'Designer',
            'company' => 'Freelance',
            'freshness' => 'cold',
            'user_id' => $user->id,
        ]);

        Contact::create([
            'name' => 'Alex Kim',
            'role' => 'Developer',
            'company' => 'TechStartup',
            'freshness' => 'hot',
            'is_vip' => true,
            'user_id' => $user->id,
        ]);
    }
}
