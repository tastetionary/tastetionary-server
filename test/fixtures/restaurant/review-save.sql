INSERT INTO restaurant_reviews (user_id, keywords, category, prices, summary, opinion, external_restaurant_information_id, created_at, updated_at)
VALUES (1, ARRAY['clean'], 'ASIAN', ARRAY['UNDER_10000','UNDER_13000'], 'never come again', 'no', 1, NOW(), NOW())
