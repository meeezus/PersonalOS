<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'role',
        'company',
        'last_contact',
        'freshness',
        'is_vip',
        'notes',
        'avatar_url',
        'user_id',
    ];

    protected $casts = [
        'last_contact' => 'date',
        'is_vip' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
