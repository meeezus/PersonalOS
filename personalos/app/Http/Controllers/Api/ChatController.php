<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    /**
     * Get chat messages for current session
     */
    public function index(Request $request): JsonResponse
    {
        $sessionId = $request->query('session_id');

        $query = ChatMessage::where('user_id', $request->user()->id);

        if ($sessionId) {
            $query->forSession($sessionId);
        }

        $messages = $query->chronological()->get();

        return response()->json([
            'messages' => $messages,
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Send a message to Iori and get response
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => 'required|string|max:10000',
            'session_id' => 'nullable|string',
        ]);

        $user = $request->user();
        $sessionId = $validated['session_id'] ?? Str::uuid()->toString();

        // Store user message
        $userMessage = ChatMessage::create([
            'user_id' => $user->id,
            'role' => 'user',
            'content' => $validated['content'],
            'session_id' => $sessionId,
        ]);

        // Get conversation history for context
        $history = ChatMessage::where('user_id', $user->id)
            ->forSession($sessionId)
            ->chronological()
            ->get()
            ->map(fn($msg) => [
                'role' => $msg->role,
                'content' => $msg->content,
            ])
            ->toArray();

        // Get user's current data for context
        $goals = $user->goals()->get(['id', 'title', 'target', 'current', 'unit']);
        $tasks = $user->tasks()->whereNull('completed_at')->get(['id', 'title', 'priority', 'due_date']);
        $contacts = $user->contacts()->orderBy('last_contact', 'desc')->limit(10)->get(['id', 'name', 'last_contact']);

        try {
            // Call Iori agent
            $response = Http::timeout(120)->post(
                env('IORI_URL', 'http://localhost:3002') . '/chat',
                [
                    'message' => $validated['content'],
                    'history' => $history,
                    'context' => [
                        'goals' => $goals,
                        'tasks' => $tasks,
                        'contacts' => $contacts,
                        'user_name' => $user->name,
                    ],
                ]
            );

            if (!$response->successful()) {
                throw new \Exception('Iori agent returned error: ' . $response->status());
            }

            $data = $response->json();
            $assistantContent = $data['response'] ?? 'I apologize, but I encountered an issue processing your request.';
            $actions = $data['actions'] ?? [];

            // Execute any actions Iori requested
            $actionResults = $this->executeActions($actions, $user);

            // Store assistant message
            $assistantMessage = ChatMessage::create([
                'user_id' => $user->id,
                'role' => 'assistant',
                'content' => $assistantContent,
                'session_id' => $sessionId,
                'metadata' => [
                    'actions' => $actions,
                    'action_results' => $actionResults,
                ],
            ]);

            return response()->json([
                'message' => $assistantMessage,
                'session_id' => $sessionId,
                'actions' => $actionResults,
            ]);

        } catch (\Exception $e) {
            // Store error as assistant message
            $errorMessage = ChatMessage::create([
                'user_id' => $user->id,
                'role' => 'assistant',
                'content' => 'I apologize, but I encountered a connection issue. Please try again.',
                'session_id' => $sessionId,
                'metadata' => ['error' => $e->getMessage()],
            ]);

            return response()->json([
                'message' => $errorMessage,
                'session_id' => $sessionId,
                'error' => true,
            ], 500);
        }
    }

    /**
     * Clear chat history for a session
     */
    public function clear(Request $request): JsonResponse
    {
        $sessionId = $request->input('session_id');

        $query = ChatMessage::where('user_id', $request->user()->id);

        if ($sessionId) {
            $query->forSession($sessionId);
        }

        $deleted = $query->delete();

        return response()->json([
            'deleted' => $deleted,
            'message' => 'Chat history cleared',
        ]);
    }

    /**
     * Get list of chat sessions
     */
    public function sessions(Request $request): JsonResponse
    {
        $sessions = ChatMessage::where('user_id', $request->user()->id)
            ->selectRaw('session_id, MIN(created_at) as started_at, MAX(created_at) as last_message_at, COUNT(*) as message_count')
            ->groupBy('session_id')
            ->orderBy('last_message_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    /**
     * Execute actions requested by Iori
     */
    private function executeActions(array $actions, $user): array
    {
        $results = [];

        foreach ($actions as $action) {
            $type = $action['type'] ?? null;
            $data = $action['data'] ?? [];

            switch ($type) {
                case 'add_task':
                    $task = $user->tasks()->create([
                        'title' => $data['title'] ?? 'New Task',
                        'description' => $data['description'] ?? null,
                        'priority' => $data['priority'] ?? 'medium',
                        'due_date' => $data['due_date'] ?? null,
                    ]);
                    $results[] = ['type' => 'add_task', 'success' => true, 'task_id' => $task->id];
                    break;

                case 'complete_task':
                    $task = $user->tasks()->find($data['task_id']);
                    if ($task) {
                        $task->update(['completed_at' => now()]);
                        $results[] = ['type' => 'complete_task', 'success' => true, 'task_id' => $task->id];
                    }
                    break;

                case 'update_goal':
                    $goal = $user->goals()->find($data['goal_id']);
                    if ($goal) {
                        $goal->update(['current' => $data['current'] ?? $goal->current]);
                        $results[] = ['type' => 'update_goal', 'success' => true, 'goal_id' => $goal->id];
                    }
                    break;

                case 'add_contact':
                    $contact = $user->contacts()->create([
                        'name' => $data['name'],
                        'email' => $data['email'] ?? null,
                        'notes' => $data['notes'] ?? null,
                        'last_contact' => now(),
                    ]);
                    $results[] = ['type' => 'add_contact', 'success' => true, 'contact_id' => $contact->id];
                    break;

                default:
                    $results[] = ['type' => $type, 'success' => false, 'error' => 'Unknown action type'];
            }
        }

        return $results;
    }
}
