<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->contacts()->orderBy('name', 'asc');

        // Filter by freshness if provided
        if ($request->has('freshness')) {
            $query->where('freshness', $request->freshness);
        }

        // Filter VIPs only
        if ($request->has('vip') && $request->vip === 'true') {
            $query->where('is_vip', true);
        }

        return response()->json($query->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'role' => 'nullable|string|max:100',
            'company' => 'nullable|string|max:255',
            'last_contact' => 'nullable|date',
            'freshness' => 'in:hot,warm,cold',
            'is_vip' => 'boolean',
            'notes' => 'nullable|string',
            'avatar_url' => 'nullable|url',
        ]);

        $contact = $request->user()->contacts()->create($validated);
        return response()->json($contact, 201);
    }

    public function show(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        return response()->json($contact);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'role' => 'nullable|string|max:100',
            'company' => 'nullable|string|max:255',
            'last_contact' => 'nullable|date',
            'freshness' => 'in:hot,warm,cold',
            'is_vip' => 'boolean',
            'notes' => 'nullable|string',
            'avatar_url' => 'nullable|url',
        ]);

        $contact->update($validated);
        return response()->json($contact);
    }

    public function destroy(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $contact->delete();
        return response()->json(null, 204);
    }
}
