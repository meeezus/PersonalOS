<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    protected $fillable = [
        'name',
        'current_value',
        'target_value',
        'unit',
        'timeframe',
        'color',
        'trend',
        'user_id',
    ];

    protected $casts = [
        'current_value' => 'integer',
        'target_value' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
