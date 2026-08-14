package com.securevault.entity;

import jakarta.persistence.*;
import lombok.*;

/** User-defined folder for organising credentials in the vault. */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /** Hex accent colour used by the UI chip, e.g. "#22d3ee". */
    private String color;

    private String icon;

    @Column(nullable = false)
    private Long ownerId;
}
