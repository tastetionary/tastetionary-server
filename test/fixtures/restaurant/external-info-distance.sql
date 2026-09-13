INSERT INTO external_restaurant_informations (external_uuid, location, address, phone, reference_link, name, created_at, updated_at)
VALUES (1000, ST_GeogFromText('SRID=4326;POINT(127.047377408384 37.517331925853)'), '', '010-1234-5678', 'https://www.naver.com', 'test', NOW(), NOW());
INSERT INTO external_restaurant_informations (external_uuid, location, address, phone, reference_link, name, created_at, updated_at)
VALUES (1001, ST_GeogFromText('SRID=4326;POINT(127.047377408384 37.517331925853)'), 'test', '00-0000-0000', 'https://www.naver.com', 'test', NOW(), NOW());
INSERT INTO external_restaurant_informations (external_uuid, location, address, phone, reference_link, name, created_at, updated_at)
VALUES (1002, ST_GeogFromText('SRID=4326;POINT(127.047377408384 37.517331925853)'), 'unreviewed', '00-0000-0000', 'https://www.naver.com', 'test', NOW(), NOW());
INSERT INTO external_restaurant_informations (external_uuid, location, address, phone, reference_link, name, created_at, updated_at)
VALUES (1003, ST_GeogFromText('SRID=4326;POINT(127.047377408384 37.517331925853)'), 'deleted review', '00-0000-0000', 'https://www.naver.com', 'test', NOW(), NOW());
INSERT INTO restaurant_reviews (user_id, keywords, category, prices, summary, opinion, external_restaurant_information_id, created_at, updated_at)
VALUES (1, ARRAY['clean'], '한식', ARRAY['10,000원 미만'], 'good', 'Y', 1, NOW(), NOW());
INSERT INTO restaurant_reviews (user_id, keywords, category, prices, summary, opinion, external_restaurant_information_id, created_at, updated_at)
VALUES (1, ARRAY['clean'], '한식', ARRAY['10,000원 미만'], 'good', 'Y', 2, NOW(), NOW());
INSERT INTO restaurant_reviews (user_id, keywords, category, prices, summary, opinion, external_restaurant_information_id, created_at, updated_at, deleted_at)
VALUES (1, ARRAY['clean'], '한식', ARRAY['10,000원 미만'], 'good', 'Y', 4, NOW(), NOW(), NOW())
