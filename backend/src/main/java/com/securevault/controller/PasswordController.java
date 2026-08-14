package com.securevault.controller;

import com.securevault.dto.PasswordDtos.*;
import com.securevault.service.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** Password Generator module endpoints (public — no secrets involved). */
@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    @PostMapping("/generate")
    public GenerateResponse generate(@RequestBody GenerateRequest req) {
        String pwd = passwordService.generate(req);
        return new GenerateResponse(pwd, passwordService.analyse(pwd));
    }

    @PostMapping("/strength")
    public StrengthResult strength(@RequestBody StrengthRequest req) {
        return passwordService.analyse(req.password());
    }
}
