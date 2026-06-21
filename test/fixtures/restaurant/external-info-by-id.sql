INSERT INTO external_restaurant_informations (external_uuid, location, address, phone, reference_link, name, created_at, updated_at)
VALUES (1000, ST_GeogFromText('SRID=4326;POINT(127.047377408384 37.517331925853)'), 'test', '010-1234-5678', 'https://www.naver.com', 'test', NOW(), NOW())
