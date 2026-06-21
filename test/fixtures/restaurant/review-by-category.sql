INSERT INTO restaurant_reviews (user_id, keywords, category, prices, summary, opinion, external_restaurant_information_id, created_at, updated_at)
VALUES (1, ARRAY['clean','good','test','abc'], '아시아식', ARRAY['10,000원 미만'], 'never come again', 'no', 1, NOW(), NOW())
