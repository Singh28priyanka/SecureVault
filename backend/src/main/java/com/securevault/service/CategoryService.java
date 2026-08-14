package com.securevault.service;

import com.securevault.dto.CommonDtos.CategoryRequest;
import com.securevault.dto.CommonDtos.CategoryResponse;
import com.securevault.entity.Category;
import com.securevault.exception.ApiException;
import com.securevault.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/** Manages user vault categories (Vault organisation). */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    public List<CategoryResponse> list(Long userId) {
        return repository.findByOwnerId(userId).stream().map(CategoryResponse::from).toList();
    }

    public CategoryResponse create(Long userId, CategoryRequest req) {
        Category c = Category.builder()
                .ownerId(userId)
                .name(req.name())
                .color(req.color() == null ? "#22d3ee" : req.color())
                .icon(req.icon())
                .build();
        return CategoryResponse.from(repository.save(c));
    }

    public void delete(Long userId, Long id) {
        Category c = repository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Category not found"));
        if (!c.getOwnerId().equals(userId)) throw ApiException.forbidden("Not your category");
        repository.delete(c);
    }
}
