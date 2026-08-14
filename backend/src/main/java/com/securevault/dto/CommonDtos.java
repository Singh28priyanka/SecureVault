package com.securevault.dto;

import com.securevault.entity.Category;

/** Small shared DTOs (categories, generic messages). */
public final class CommonDtos {

    private CommonDtos() {}

    public record MessageResponse(String message) {}

    public record CategoryRequest(String name, String color, String icon) {}

    public record CategoryResponse(Long id, String name, String color, String icon) {
        public static CategoryResponse from(Category c) {
            return new CategoryResponse(c.getId(), c.getName(), c.getColor(), c.getIcon());
        }
    }
}
