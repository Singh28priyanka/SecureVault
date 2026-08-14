package com.securevault.security;

import com.securevault.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;

/** Issues and validates stateless JWT access/refresh tokens. */
@Service
public class JwtService {

    private final SecretKey key;
    private final long accessExpMs;
    private final long refreshExpMs;

    public JwtService(
            @Value("${securevault.jwt.secret}") String secret,
            @Value("${securevault.jwt.access-token-expiration-ms}") long accessExpMs,
            @Value("${securevault.jwt.refresh-token-expiration-ms}") long refreshExpMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessExpMs = accessExpMs;
        this.refreshExpMs = refreshExpMs;
    }

    public String generateAccessToken(User user) {
        return build(user, accessExpMs, "access");
    }

    public String generateRefreshToken(User user) {
        return build(user, refreshExpMs, "refresh");
    }

    private String build(User user, long ttlMs, String type) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())
                .claims(Map.of(
                        "uid", user.getId(),
                        "role", user.getRole().name(),
                        "type", type))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMs))
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(parse(token));
    }

    public boolean isValid(String token, String username) {
        try {
            Claims c = parse(token);
            return c.getSubject().equals(username) && c.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public long getAccessExpMs() {
        return accessExpMs;
    }
}
