package com.securevault.controller;

import com.securevault.dto.CommonDtos.CategoryRequest;
import com.securevault.dto.CommonDtos.CategoryResponse;
import com.securevault.security.CurrentUser;
import com.securevault.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Vault organisation — user categories. */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @GetMapping
    public List<CategoryResponse> list() {
        return service.list(CurrentUser.id());
    }

    @PostMapping
    public CategoryResponse create(@RequestBody CategoryRequest req) {
        return service.create(CurrentUser.id(), req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(CurrentUser.id(), id);
        return ResponseEntity.noContent().build();
    }
}
