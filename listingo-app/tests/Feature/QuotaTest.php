<?php

namespace Tests\Feature;

use Tests\TestCase;

class QuotaTest extends TestCase
{
    public function test_guest_token_and_quota(): void
    {
        $res = $this->postJson('/api/auth/guest');
        $res->assertOk();
        $token = $res->json('token');

        $r2 = $this->withHeaders([
            'Authorization' => 'Bearer '.$token,
        ])->getJson('/api/quota');

        $r2->assertOk()->assertJsonStructure(['plan','remaining']);
    }

    public function test_consumes_usage(): void
    {
        $res = $this->postJson('/api/auth/guest');
        $token = $res->json('token');

        $before = $this->withHeaders(['Authorization' => 'Bearer '.$token])->getJson('/api/quota')->json('remaining');
        $this->withHeaders(['Authorization' => 'Bearer '.$token])->postJson('/api/usage')->assertOk();
        $after  = $this->withHeaders(['Authorization' => 'Bearer '.$token])->getJson('/api/quota')->json('remaining');

        $this->assertSame($before - 1, $after);
    }
}


