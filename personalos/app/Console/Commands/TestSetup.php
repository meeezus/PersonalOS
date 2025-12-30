<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Goal;
use App\Models\Task;
use App\Models\Contact;
use App\Models\Project;
use App\Models\Phase;
use App\Models\Event;
use App\Models\Reminder;
use App\Models\ApiUsage;
use App\Models\User;

class TestSetup extends Command
{
    protected $signature = 'test:setup';
    protected $description = 'Verify database connection and count records in all tables';

    public function handle(): int
    {
        $this->info('Testing PersonalOS setup...');
        $this->newLine();

        // Test database connection
        try {
            DB::connection()->getPdo();
            $this->line('✓ Database connected (' . config('database.default') . ')');
        } catch (\Exception $e) {
            $this->error('✗ Database connection failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        $this->newLine();
        $this->info('Record counts:');

        // Count records in each table
        $counts = [
            'users' => User::count(),
            'goals' => Goal::count(),
            'tasks' => Task::count(),
            'contacts' => Contact::count(),
            'projects' => Project::count(),
            'phases' => Phase::count(),
            'events' => Event::count(),
            'reminders' => Reminder::count(),
            'api_usage' => ApiUsage::count(),
        ];

        foreach ($counts as $table => $count) {
            $this->line("  • {$table}: {$count}");
        }

        $this->newLine();
        $this->info("✓ Setup complete! {$counts['goals']} goals, {$counts['tasks']} tasks, {$counts['contacts']} contacts");

        return Command::SUCCESS;
    }
}
