<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiUsage extends Model
{
    protected $table = 'api_usage';

    protected $fillable = [
        'timestamp',
        'model',
        'endpoint',
        'input_tokens',
        'output_tokens',
        'cost_usd',
        'user_id',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'cost_usd' => 'decimal:6',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
