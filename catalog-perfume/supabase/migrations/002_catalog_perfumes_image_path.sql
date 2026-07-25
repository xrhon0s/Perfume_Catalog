create or replace view public.catalog_perfumes as
select
  p.id,
  p.legacy_id,
  p.name,
  b.name as brand,
  p.primary_image_url as image,
  p.primary_image_path as image_path,
  p.family,
  p.concentration,
  p.gender,
  p.year,
  p.description,
  p.tags,
  p.notes,
  p.is_active,
  p.created_at,
  p.updated_at
from public.perfumes p
join public.brands b on b.id = p.brand_id;
