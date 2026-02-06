# Zenixa Product Import CSV Format

## Overview
This document describes the custom CSV format for importing products into Zenixa.

## Product Types

| Type | Description |
|------|-------------|
| `single` | Standalone product with no variants |
| `variable` | Parent product that has variants (different colors/sizes) |
| `variant` | A variation of a variable product |

---

## CSV Columns

| Column | Required | Description |
|--------|----------|-------------|
| type | Yes | `single`, `variable`, or `variant` |
| sku | Yes | Unique product/variant identifier |
| name | Yes | Product name |
| category | Yes for single/variable | Category name (auto-created if not exists) |
| description | No | Full product description |
| price | Yes | Product price (variants override parent) |
| compare_price | No | Original price for strikethrough display |
| image | No | Main product image URL |
| gallery | No | Additional images, separated by `|` (pipe) |
| stock | No | Stock quantity (default: 0) |
| featured | No | `1` = featured product, `0` = not |
| parent_sku | Required for variant | SKU of the parent variable product |
| color | No | Color attribute for variant |
| size | No | Size attribute for variant |
| is_default | No | `1` = default variant shown on product page |

---

## Example CSV

```csv
type,sku,name,category,description,price,compare_price,image,gallery,stock,featured,parent_sku,color,size,is_default
single,TB-SOLO-001,Classic Leather Wallet,Accessories,Premium leather wallet with RFID protection,45,59,https://example.com/wallet.jpg,https://example.com/wallet-2.jpg|https://example.com/wallet-3.jpg,25,1,,,,
variable,TB-TOTE-001,Leather Tote Bag,Bags,Spacious tote with premium leather finish,0,,https://example.com/tote-main.jpg,https://example.com/tote-2.jpg|https://example.com/tote-3.jpg,0,1,,,,
variant,TB-TOTE-BLK,Leather Tote Bag - Black,,,120,150,https://example.com/tote-black.jpg,https://example.com/tote-black-2.jpg,10,,TB-TOTE-001,Black,,1
variant,TB-TOTE-TAN,Leather Tote Bag - Tan,,,120,150,https://example.com/tote-tan.jpg,https://example.com/tote-tan-2.jpg|https://example.com/tote-tan-3.jpg,8,,TB-TOTE-001,Tan,,0
variant,TB-TOTE-RED,Leather Tote Bag - Red,,,130,160,https://example.com/tote-red.jpg,,5,,TB-TOTE-001,Red,,0
```

---

## How It Works

### Single Products
- Complete standalone products with their own images and stock

### Variable Products (Parents)
- Define the product name, category, description, and main gallery
- Price is usually `0` (variants have actual prices)
- The `featured` flag applies to the whole product

### Variants
- Must have `parent_sku` matching a variable product's `sku`
- Have their own price, image, gallery, and stock
- `is_default=1` makes this the variant shown by default
- When user selects this variant, its images replace the parent gallery

---

## Tips

1. **Images**: Use full URLs. External images are automatically cloned to local storage.
2. **Gallery**: Separate multiple images with `|` (pipe character)
3. **Categories**: Will be auto-created if they don't exist
4. **SKUs**: Must be unique across all products and variants
5. **Default Variant**: Set `is_default=1` on ONE variant per variable product
