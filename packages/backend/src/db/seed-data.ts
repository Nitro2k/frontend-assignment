/**
 * Seed reference data lifted from the Figma category page: the ten colour
 * swatches, the nine size pills, and the garment vocabulary the product cards
 * use ("Gradient Graphic T-shirt", "Loose Fit Bermuda Shorts", ...).
 */

export const SEED_COLORS = [
  { id: "green", name: "Green", hex: "#00c12b" },
  { id: "red", name: "Red", hex: "#f50606" },
  { id: "yellow", name: "Yellow", hex: "#f5dd06" },
  { id: "orange", name: "Orange", hex: "#f57906" },
  { id: "cyan", name: "Cyan", hex: "#06caf5" },
  { id: "blue", name: "Blue", hex: "#063af5" },
  { id: "purple", name: "Purple", hex: "#7d06f5" },
  { id: "pink", name: "Pink", hex: "#f506a4" },
  { id: "white", name: "White", hex: "#ffffff" },
  { id: "black", name: "Black", hex: "#000000" },
] as const;

/** Ordered smallest to largest, as the filter panel lays them out. */
export const SEED_SIZES = [
  { id: "xx-small", name: "XX-Small", value: "XXS" },
  { id: "x-small", name: "X-Small", value: "XS" },
  { id: "small", name: "Small", value: "S" },
  { id: "medium", name: "Medium", value: "M" },
  { id: "large", name: "Large", value: "L" },
  { id: "x-large", name: "X-Large", value: "XL" },
  { id: "xx-large", name: "XX-Large", value: "XXL" },
  { id: "3x-large", name: "3X-Large", value: "3XL" },
  { id: "4x-large", name: "4X-Large", value: "4XL" },
] as const;

/**
 * Unsplash CDN ids for portrait clothing shots, resolved from
 * https://unsplash.com/s/photos/product-clothes?orientation=portrait and
 * verified to return an image at the card's 3:4 crop.
 */
export const UNSPLASH_PHOTO_IDS = [
  "photo-1416339698674-4f118dd3388b",
  "photo-1453486030486-0a5ffcd82cd9",
  "photo-1467043237213-65f2da53396f",
  "photo-1495121605193-b116b5b9c5fe",
  "photo-1509319117193-57bab727e09d",
  "photo-1513521712264-512ceb91a940",
  "photo-1516762689617-e1cffcef479d",
  "photo-1520923179278-ee25e25e09e4",
  "photo-1532453288672-3a27e9be9efd",
  "photo-1571945153237-4929e783af4a",
  "photo-1574180566232-aaad1b5b8450",
  "photo-1576566588028-4147f3842f27",
  "photo-1578932750294-f5075e85f44a",
  "photo-1578932750355-5eb30ece487a",
  "photo-1580682312385-e94d8de1cf3c",
  "photo-1581655353564-df123a1eb820",
  "photo-1582719188393-bb71ca45dbb9",
  "photo-1583743814966-8936f5b7be1a",
  "photo-1586790170083-2f9ceadc732d",
  "photo-1603400521630-9f2de124b33b",
  "photo-1604506847073-4a8e18e07d92",
  "photo-1605450081927-6b40c11c661f",
  "photo-1608739872166-3ba1787f57e3",
  "photo-1611858447638-1113f15f7177",
  "photo-1614231125961-38323d6c485b",
  "photo-1614676471928-2ed0ad1061a4",
  "photo-1615315673153-895a368f10eb",
  "photo-1618354691373-d851c5c3a990",
  "photo-1618453292459-53424b66bb6a",
  "photo-1622445275463-afa2ab738c34",
  "photo-1622470953794-aa9c70b0fb9d",
  "photo-1625698311031-f0dd15be5144",
  "photo-1627225924765-552d49cf47ad",
  "photo-1633966887768-64f9a867bdba",
  "photo-1716541424893-734612ddcabb",
  "photo-1781779675056-24f37ab16f3f",
  "photo-1781779777051-931daafa3879",
  "photo-1781782320719-ab9bda21679d",
  "photo-1781782333004-7487a66d0f83",
] as const;

const CARD_WIDTH = 600;
const CARD_HEIGHT = 800;

/** Portrait crop matching the 3:4 product cards in the design. */
export const productImageUrl = (index: number): string => {
  const id = UNSPLASH_PHOTO_IDS[index % UNSPLASH_PHOTO_IDS.length];

  return `https://images.unsplash.com/${id}?w=${CARD_WIDTH}&h=${CARD_HEIGHT}&fit=crop&auto=format&q=80`;
};

/** Garment nouns, taken from and extended around the cards in the design. */
export const GARMENTS = [
  "T-shirt",
  "Polo",
  "Shirt",
  "Jeans",
  "Shorts",
  "Hoodie",
  "Jacket",
  "Sweater",
  "Sweatshirt",
  "Trousers",
  "Chinos",
  "Tank Top",
  "Cardigan",
  "Blazer",
  "Skirt",
  "Dress",
  "Jumpsuit",
  "Coat",
] as const;

/** Leading descriptors: "Skinny Fit" Jeans, "Loose Fit" Bermuda Shorts. */
export const FITS = [
  "Skinny Fit",
  "Loose Fit",
  "Slim Fit",
  "Relaxed Fit",
  "Regular Fit",
  "Oversized",
  "Tailored",
  "Cropped",
] as const;

/** Pattern/detail words: "Gradient Graphic", "Vertical Striped", "Checkered". */
export const PATTERNS = [
  "Gradient Graphic",
  "Vertical Striped",
  "Black Striped",
  "Checkered",
  "Sleeve Striped",
  "Courage Graphic",
  "Colour Block",
  "Plain",
  "Washed",
  "Embroidered",
  "Ribbed",
  "Textured",
] as const;

/** Trailing detail: Polo "with Tipping Details". */
export const DETAILS = [
  "with Tipping Details",
  "with Contrast Trim",
  "with Chest Pocket",
  "with Ribbed Cuffs",
  "with Raw Hem",
  "",
  "",
  "",
] as const;
