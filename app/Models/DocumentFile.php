<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentFile extends Model
{
    protected $fillable = [
        'tracking_no',
        'title',
        'origin',
        'requested_by',
        'date_received',
        'status',
        'destination',
        'outgoing_date',
        'remarks',
        'timeline',
    ];

    protected function casts(): array
    {
        return [
            'date_received' => 'date',
            'outgoing_date' => 'date',
            'timeline' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'tracking_no';
    }
}
