export const categories = [
  { id: 'all', name: 'All pieces', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85', count: '12 pieces' },
  { id: 'dresses', name: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85', count: '04 pieces' },
  { id: 'abayas', name: 'Abayas', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=85', count: '03 pieces' },
  { id: 'sets', name: 'Matching sets', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85', count: '03 pieces' },
  { id: 'scarves', name: 'Scarves', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85', count: '02 pieces' },
  { id: 'swimwear', name: 'Swimwear', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85', count: 'Coming soon' },
  { id: 'winter-collection', name: 'Winter Collection', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85', count: '01 piece' },
  { id: 'gift-items', name: 'Gift Items', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85', count: '02 pieces' },
  { id: 'sale', name: 'SALE', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85', count: '01 piece' },
];

const baseProducts = [
  { id: 'sahar-evening-dress', name: 'Sahar Evening Dress', category: 'dresses', price: 168, compareAt: 198, label: 'New arrival', color: 'Olive', colors: ['Olive', 'Ink'], sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85', description: 'A softly tailored silhouette with fluid movement, thoughtful coverage, and a little evening elegance.' },
  { id: 'layla-flow-abaya', name: 'Layla Flow Abaya', category: 'abayas', price: 142, label: 'Bestseller', color: 'Sand', colors: ['Sand', 'Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=85', description: 'Easy, graceful drape and clean lines make this an effortless layer from day to evening.' },
  { id: 'noor-knit-set', name: 'Noor Knit Set', category: 'sets', price: 124, label: '', color: 'Oat', colors: ['Oat', 'Moss'], sizes: ['XS', 'S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85', description: 'A considered two-piece set in a soft textured knit, designed for comfort without losing its polish.' },
  { id: 'amira-satin-maxi', name: 'Amira Satin Maxi', category: 'dresses', price: 186, label: 'Limited', color: 'Rosewood', colors: ['Rosewood', 'Midnight'], sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85', description: 'A fluid satin finish and understated detail bring quiet occasion dressing to life.' },
  { id: 'safa-open-abaya', name: 'Safa Open Abaya', category: 'abayas', price: 154, label: '', color: 'Midnight', colors: ['Midnight', 'Stone'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1000&q=85', description: 'A versatile open-front layer with a relaxed silhouette and a refined, minimal finish.' },
  { id: 'mira-soft-scarf', name: 'Mira Soft Scarf', category: 'scarves', price: 38, label: 'Everyday', color: 'Clay', colors: ['Clay', 'Cream', 'Olive'], sizes: ['One size'], image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1000&q=85', description: 'A lightweight, softly textured scarf with generous coverage and an easy drape.' },
  { id: 'hana-linen-coord', name: 'Hana Linen Co-ord', category: 'sets', price: 136, label: 'New arrival', color: 'Natural', colors: ['Natural', 'Sage'], sizes: ['XS', 'S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85', description: 'Breathable linen-blend separates with a relaxed fit that works beautifully together or apart.' },
  { id: 'zara-occasion-gown', name: 'Zara Occasion Gown', category: 'dresses', price: 218, label: 'Occasion', color: 'Plum', colors: ['Plum', 'Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85', description: 'A flowing full-length dress made for meaningful gatherings and long, lovely evenings.' },
  { id: 'dalia-drape-abaya', name: 'Dalia Drape Abaya', category: 'abayas', price: 172, label: '', color: 'Espresso', colors: ['Espresso', 'Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=1000&q=85', description: 'A modern draped layer with graceful volume, finished with subtle tonal detailing.' },
  { id: 'aya-everyday-tunic-set', name: 'Aya Everyday Set', category: 'sets', price: 112, label: '', color: 'Soft Blue', colors: ['Soft Blue', 'Sand'], sizes: ['XS', 'S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85', description: 'An easy tunic and trouser pairing with a relaxed cut for everyday plans.' },
  { id: 'sama-texture-scarf', name: 'Sama Texture Scarf', category: 'scarves', price: 42, label: 'New arrival', color: 'Moss', colors: ['Moss', 'Rose', 'Sand'], sizes: ['One size'], image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?auto=format&fit=crop&w=1000&q=85', description: 'A softly textured finish adds dimension to this light, easy-to-style scarf.' },
  { id: 'nour-pleated-dress', name: 'Nour Pleated Dress', category: 'dresses', price: 178, label: '', color: 'Forest', colors: ['Forest', 'Black'], sizes: ['XS', 'S', 'M', 'L'], image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85', description: 'Fine pleats and a fluid skirt create an elegant shape with comfortable, easy movement.' },
];

// Explicit preview-only metadata powers deterministic collection sorting until real commerce data is connected.
const previewMetadata = {
  'sahar-evening-dress': { arrivalDate: '2026-09-16', bestSellerRank: 4, relevanceRank: 1 },
  'layla-flow-abaya': { arrivalDate: '2026-06-10', bestSellerRank: 1, relevanceRank: 2 },
  'noor-knit-set': { arrivalDate: '2026-07-22', bestSellerRank: 5, relevanceRank: 3, collectionIds: ['winter-collection'] },
  'amira-satin-maxi': { arrivalDate: '2026-05-07', bestSellerRank: 7, relevanceRank: 4 },
  'safa-open-abaya': { arrivalDate: '2026-04-15', bestSellerRank: 6, relevanceRank: 5 },
  'mira-soft-scarf': { arrivalDate: '2026-08-03', bestSellerRank: 2, relevanceRank: 6, collectionIds: ['gift-items'] },
  'hana-linen-coord': { arrivalDate: '2026-10-02', bestSellerRank: 8, relevanceRank: 7 },
  'zara-occasion-gown': { arrivalDate: '2026-03-11', bestSellerRank: 9, relevanceRank: 8 },
  'dalia-drape-abaya': { arrivalDate: '2026-02-17', bestSellerRank: 10, relevanceRank: 9 },
  'aya-everyday-tunic-set': { arrivalDate: '2026-01-12', bestSellerRank: 3, relevanceRank: 10 },
  'sama-texture-scarf': { arrivalDate: '2026-10-09', bestSellerRank: 11, relevanceRank: 11, collectionIds: ['gift-items'] },
  'nour-pleated-dress': { arrivalDate: '2026-01-28', bestSellerRank: 12, relevanceRank: 12 },
};

export const products = baseProducts.map((product) => ({
  ...product,
  ...previewMetadata[product.id],
  collectionIds: previewMetadata[product.id].collectionIds || [],
  isNewArrival: product.label === 'New arrival',
}));

export const findProduct = (id) => products.find((product) => product.id === id);
export const formatCategory = (id, collections = []) => collections.find((collection) => collection.id === id)?.title || (id === 'new-arrivals' ? 'New Arrivals' : categories.find((category) => category.id === id)?.name || 'Collection');
