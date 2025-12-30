<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ApiUsageController;
use App\Http\Controllers\Api\OuraController;

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

    // Oura Ring
    Route::get('oura/latest', [OuraController::class, 'latest']);
    Route::get('oura/date/{date}', [OuraController::class, 'forDate']);
    Route::get('oura/range', [OuraController::class, 'range']);
    Route::get('oura/insights', [OuraController::class, 'insights']);
    Route::post('oura/sync', [OuraController::class, 'sync']);
});
