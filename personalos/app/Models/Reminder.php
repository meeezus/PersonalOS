<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $fillable = [
        'content',
        'due_date',
        'status',
        'snooze_until',
        'user_id',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'snooze_until' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
