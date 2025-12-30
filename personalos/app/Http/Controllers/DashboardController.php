<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'goals' => $user->goals()->get(),
            'tasks' => $user->tasks()
                ->where(function ($query) {
                    $query->whereDate('due_date', today())
                          ->orWhereNull('due_date');
                })
                ->whereNull('completed_at')
                ->orderByRaw("CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END")
                ->get(),
            'contacts' => $user->contacts()->limit(5)->get(),
        ]);
    }
}
