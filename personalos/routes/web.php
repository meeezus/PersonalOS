<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Auth routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Placeholder routes
    Route::get('/projects', fn() => Inertia::render('Placeholder', ['title' => 'Projects']))->name('projects');
    Route::get('/calendar', fn() => Inertia::render('Placeholder', ['title' => 'Schedule']))->name('calendar');
    Route::get('/contacts', fn() => Inertia::render('Placeholder', ['title' => 'Relationships']))->name('contacts');
    Route::get('/training', fn() => Inertia::render('Placeholder', ['title' => 'Training Log']))->name('training');
    Route::get('/knowledge', fn() => Inertia::render('Placeholder', ['title' => 'Knowledge']))->name('knowledge');
    Route::get('/sparkfile', fn() => Inertia::render('Placeholder', ['title' => 'Sparkfile']))->name('sparkfile');
    Route::get('/chat', fn() => Inertia::render('Chat'))->name('chat');
    Route::get('/ai-test', fn() => Inertia::render('AITest'))->name('ai-test');
});
