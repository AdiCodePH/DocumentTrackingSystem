<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_files', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_no')->unique();
            $table->string('title');
            $table->string('origin');
            $table->string('requested_by')->nullable();
            $table->date('date_received');
            $table->string('status')->default('received');
            $table->string('destination')->nullable();
            $table->date('outgoing_date')->nullable();
            $table->text('remarks')->nullable();
            $table->json('timeline')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_files');
    }
};
