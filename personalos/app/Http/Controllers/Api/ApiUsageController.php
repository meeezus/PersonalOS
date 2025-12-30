<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiUsage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApiUsageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->apiUsage()->orderBy('timestamp', 'desc');

        // Filter by date_from if provided
        if ($request->has('date_from')) {
            $query->where('timestamp', '>=', $request->date_from);
        }

        // Filter by date_to if provided
        if ($request->has('date_to')) {
            $query->where('timestamp', '<=', $request->date_to);
        }

        // Filter by model if provided
        if ($request->has('model')) {
            $query->where('model', $request->model);
        }

        $usage = $query->get();

        // Calculate totals
        $totals = [
            'total_requests' => $usage->count(),
            'total_input_tokens' => $usage->sum('input_tokens'),
            'total_output_tokens' => $usage->sum('output_tokens'),
            'total_cost_usd' => $usage->sum('cost_usd'),
        ];

        return response()->json([
            'usage' => $usage,
            'totals' => $totals,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'timestamp' => 'required|date',
            'model' => 'required|string|max:100',
            'endpoint' => 'required|string|max:255',
            'input_tokens' => 'required|integer|min:0',
            'output_tokens' => 'required|integer|min:0',
            'cost_usd' => 'required|numeric|min:0',
        ]);

        $usage = $request->user()->apiUsage()->create($validated);
        return response()->json($usage, 201);
    }
}
