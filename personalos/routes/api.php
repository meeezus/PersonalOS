<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ApiUsageController;

// Public route to get current user
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// All API routes require authentication
Route::middleware('auth:sanctum')->group(function () {
    // Goals
    Route::apiResource('goals', GoalController::class);

    // Tasks
    Route::apiResource('tasks', TaskController::class);

    // Contacts
    Route::apiResource('contacts', ContactController::class);

    // API Usage
    Route::get('api-usage', [ApiUsageController::class, 'index']);
    Route::post('api-usage', [ApiUsageController::class, 'store']);
});
