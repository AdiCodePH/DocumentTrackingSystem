<?php

namespace App\Http\Controllers;

use App\Models\DocumentFile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class DocumentFileController extends Controller
{
    public function index(): JsonResponse
    {
        $files = DocumentFile::query()
            ->latest('date_received')
            ->latest()
            ->get()
            ->map(fn (DocumentFile $file) => $this->formatFile($file));

        return response()->json($files);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'origin' => ['required', 'string', 'max:255'],
            'dateReceived' => ['required', 'date'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $now = now();
        $file = DocumentFile::create([
            'tracking_no' => $this->nextTrackingNumber(),
            'title' => $validated['title'],
            'origin' => $validated['origin'],
            'requested_by' => '',
            'date_received' => $validated['dateReceived'],
            'status' => 'received',
            'destination' => '',
            'outgoing_date' => null,
            'remarks' => $validated['remarks'] ?? '',
            'timeline' => [
                ['Received', 'City Legal Office', $this->formatTimestamp($now)],
                ['Barcode Generated', 'Registry Desk', $this->formatTimestamp($now)],
            ],
        ]);

        return response()->json($this->formatFile($file), 201);
    }

    public function requestRelease(Request $request, DocumentFile $documentFile): JsonResponse
    {
        if ($documentFile->status === 'pending-approval') {
            return response()->json([
                'message' => "{$documentFile->tracking_no} is already marked outgoing and waiting for Super Admin approval.",
            ], 422);
        }

        if ($documentFile->status === 'outgoing') {
            return response()->json([
                'message' => "{$documentFile->tracking_no} is already authorized for release.",
            ], 422);
        }

        $validated = $request->validate([
            'destination' => ['required', 'string', 'max:255'],
            'requestedBy' => ['nullable', 'string', 'max:255'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $timeline = $documentFile->timeline ?: [];
        $timeline[] = ['Outgoing Requested', $validated['destination'], $this->formatTimestamp(now())];

        $documentFile->update([
            'status' => 'pending-approval',
            'destination' => $validated['destination'],
            'requested_by' => $validated['requestedBy'] ?: $documentFile->requested_by,
            'remarks' => $validated['remarks'] ?: $documentFile->remarks,
            'outgoing_date' => null,
            'timeline' => $timeline,
        ]);

        return response()->json($this->formatFile($documentFile->fresh()));
    }

    public function approveRelease(DocumentFile $documentFile): JsonResponse
    {
        abort_unless(Auth::user()->role === 'super-admin', 403, 'Only super-admin accounts can approve releases.');

        $timeline = $documentFile->timeline ?: [];
        $timeline[] = ['Approved by Super Admin', $documentFile->destination ?: 'Release approved', $this->formatTimestamp(now())];
        $timeline[] = ['Marked Outgoing', $documentFile->destination ?: 'Released', $this->formatTimestamp(now())];

        $documentFile->update([
            'status' => 'outgoing',
            'outgoing_date' => now()->toDateString(),
            'timeline' => $timeline,
        ]);

        return response()->json($this->formatFile($documentFile->fresh()));
    }

    public function returnToReceived(DocumentFile $documentFile): JsonResponse
    {
        abort_unless(Auth::user()->role === 'super-admin', 403, 'Only super-admin accounts can return releases.');

        $timeline = $documentFile->timeline ?: [];
        $timeline[] = ['Release Returned', 'Super Admin', $this->formatTimestamp(now())];

        $documentFile->update([
            'status' => 'received',
            'outgoing_date' => null,
            'timeline' => $timeline,
        ]);

        return response()->json($this->formatFile($documentFile->fresh()));
    }

    public function release(DocumentFile $documentFile): JsonResponse
    {
        if ($documentFile->status === 'pending-approval') {
            return response()->json([
                'message' => "{$documentFile->tracking_no} still needs Super Admin approval before release.",
            ], 422);
        }

        if ($documentFile->status === 'released') {
            return response()->json([
                'message' => "{$documentFile->tracking_no} is already released.",
            ], 422);
        }

        if ($documentFile->status !== 'outgoing') {
            return response()->json([
                'message' => "{$documentFile->tracking_no} is not authorized for release yet.",
            ], 422);
        }

        $timeline = $documentFile->timeline ?: [];
        $timeline[] = ['Released', $documentFile->destination ?: 'Released', $this->formatTimestamp(now())];

        $documentFile->update([
            'status' => 'released',
            'outgoing_date' => $documentFile->outgoing_date ?: now()->toDateString(),
            'timeline' => $timeline,
        ]);

        return response()->json($this->formatFile($documentFile->fresh()));
    }

    private function nextTrackingNumber(): string
    {
        $year = now()->year;
        $prefix = "CLO-{$year}-";
        $lastNumber = DocumentFile::query()
            ->where('tracking_no', 'like', "{$prefix}%")
            ->get()
            ->map(fn (DocumentFile $file) => (int) str_replace($prefix, '', $file->tracking_no))
            ->max() ?: 0;

        return $prefix.str_pad((string) ($lastNumber + 1), 4, '0', STR_PAD_LEFT);
    }

    private function formatFile(DocumentFile $file): array
    {
        return [
            'id' => $file->tracking_no,
            'title' => $file->title,
            'origin' => $file->origin,
            'requestedBy' => $file->requested_by ?: '',
            'dateReceived' => optional($file->date_received)->toDateString(),
            'status' => $file->status,
            'destination' => $file->destination ?: '',
            'outgoingDate' => optional($file->outgoing_date)->toDateString() ?: '',
            'remarks' => $file->remarks ?: '',
            'timeline' => $file->timeline ?: [],
        ];
    }

    private function formatTimestamp(Carbon $date): string
    {
        return $date->timezone(config('app.timezone'))->format('F j, Y - g:i A');
    }
}
