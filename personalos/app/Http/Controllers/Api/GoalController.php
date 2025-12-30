<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GoalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $goals = $request->user()->goals()->orderBy('created_at', 'desc')->get();
        return response()->json($goals);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_value' => 'required|integer|min:1',
            'unit' => 'required|string|max:50',
            'timeframe' => 'required|string|max:100',
            'color' => 'required|string|max:7',
            'current_value' => 'integer|min:0',
            'trend' => 'in:up,down,neutral',
        ]);

        $goal = $request->user()->goals()->create($validated);
        return response()->json($goal, 201);
    }

    public function show(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json($goal);
    }

    public function update(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'current_value' => 'integer|min:0',
            'target_value' => 'integer|min:1',
            'unit' => 'string|max:50',
            'timeframe' => 'string|max:100',
            'color' => 'string|max:7',
            'trend' => 'in:up,down,neutral',
        ]);

        $goal->update($validated);
        return response()->json($goal);
    }

    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $goal->delete();
        return response()->json(null, 204);
    }
}
